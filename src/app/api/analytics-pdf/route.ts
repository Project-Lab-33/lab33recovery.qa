import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { createAuthenticatedClient } from '@/lib/supabase/route';
import { createRateLimiter, getRequestIP } from '@/lib/rateLimit';

// Per-route rate limiter (5 requests/min)
const isRateLimited = createRateLimiter(5);

/**
 * POST /api/analytics-pdf
 * 
 * Accepts JSON analytics data and invokes the Python PDF generator.
 * Returns the generated PDF as binary.
 */
export async function POST(request: NextRequest) {
    try {
        // Rate limit check
        const ip = getRequestIP(request);
        if (await isRateLimited(ip)) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        // Auth check — admin only
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const supabase = createAuthenticatedClient(request);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();

        const scriptPath = path.join(process.cwd(), 'scripts', 'generate_analytics_pdf.py');
        const jsonInput = JSON.stringify(data);

        const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
            const proc = spawn('python', [scriptPath], {
                stdio: ['pipe', 'pipe', 'pipe'],
            });

            const chunks: Buffer[] = [];
            const errChunks: Buffer[] = [];

            proc.stdout.on('data', (chunk) => chunks.push(chunk));
            proc.stderr.on('data', (chunk) => errChunks.push(chunk));

            proc.on('close', (code) => {
                if (code !== 0) {
                    const stderr = Buffer.concat(errChunks).toString();
                    console.error('[analytics-pdf] Python error:', stderr);
                    reject(new Error(`Python exited with code ${code}: ${stderr.slice(0, 500)}`));
                } else {
                    resolve(Buffer.concat(chunks));
                }
            });

            proc.on('error', (err) => {
                reject(new Error(`Failed to spawn Python: ${err.message}`));
            });

            // Send JSON data to stdin
            proc.stdin.write(jsonInput);
            proc.stdin.end();
        });

        return new NextResponse(new Uint8Array(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="lab33-analytics-${new Date().toISOString().slice(0, 10)}.pdf"`,
                'Content-Length': String(pdfBuffer.length),
            },
        });
    } catch (error) {
        console.error('[analytics-pdf] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'PDF generation failed' },
            { status: 500 }
        );
    }
}
