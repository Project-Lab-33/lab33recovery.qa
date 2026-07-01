import { Suspense } from "react";
import type { Metadata } from "next";
import { ContactMessagesClient } from "@/components/admin/pages/contact";
import { AdminLoader } from "@/components/admin/shared";

export const metadata: Metadata = {
    title: "Contact Messages | The Lab 33 Admin",
};

export default function ContactPage() {
    return (
        <Suspense fallback={<AdminLoader title="Contact Messages" subtitle="Loading inbox…" page />}>
            <ContactMessagesClient />
        </Suspense>
    );
}
