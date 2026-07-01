import { Suspense } from "react";
import WaitlistSubscribersClient from "@/components/admin/pages/waitlist/WaitlistSubscribersClient";

export const metadata = {
    title: "Waitlist Subscribers | The Lab 33",
    description: "Manage and verify waitlist admissions for The Lab 33.",
};

export default function WaitlistSubscribersPage() {
    return (
        <Suspense>
            <WaitlistSubscribersClient />
        </Suspense>
    );
}
