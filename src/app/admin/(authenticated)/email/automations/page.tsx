import { EmailClient } from "@/components/admin/pages/email";
import type { EmailTab } from "@/components/admin/pages/email";

export default function EmailAutomationsPage() {
    return <EmailClient initialTab={"automations" as EmailTab} />;
}
