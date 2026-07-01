// Contact Messages Module — Type Definitions

export type ContactMessageStatus = 'unread' | 'read' | 'replied' | 'archived';

export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    message: string;
    status: ContactMessageStatus;
    reply_text: string | null;
    replied_at: string | null;
    replied_by: string | null;
    created_at: string;
}
