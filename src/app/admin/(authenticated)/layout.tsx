import AdminLayoutContent from "@/components/admin/AdminLayoutContent";
import { AdminUserProvider } from "@/hooks/useAdminUser";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

export default function AuthenticatedAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={`${inter.variable} font-[family-name:var(--font-inter)]`}>
            <AdminUserProvider>
                <AdminLayoutContent>{children}</AdminLayoutContent>
            </AdminUserProvider>
            <Toaster
                theme="dark"
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: 'rgba(30, 28, 26, 0.95)',
                        border: '1px solid rgba(212, 175, 119, 0.2)',
                        color: '#E8E0D4',
                        backdropFilter: 'blur(12px)',
                    },
                }}
                richColors
            />
        </div>
    );
}
