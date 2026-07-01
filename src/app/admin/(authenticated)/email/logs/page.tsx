import { EmailClient } from "@/components/admin/pages/email";
import type { EmailTab } from "@/components/admin/pages/email";

export default function EmailLogsPage() {
    return <EmailClient initialTab={"logs" as EmailTab} />;
}
