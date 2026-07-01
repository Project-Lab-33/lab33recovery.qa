import { Suspense } from "react";
import ApplicantsContentClient from "@/components/admin/pages/applications/ApplicantsContentClient";

export const metadata = {
    title: "Job Applicants | The Lab 33",
    description: "Talent pipeline and recruitment management for The Lab 33.",
};

export default function JobApplicantsPage() {
    return (
        <Suspense>
            <ApplicantsContentClient />
        </Suspense>
    );
}
