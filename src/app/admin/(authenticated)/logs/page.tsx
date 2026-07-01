import LogsHubClient from "@/components/admin/pages/activity-logs/LogsHubClient";

export const metadata = {
    title: "Logs | The Lab 33 Admin",
    description: "Activity, authentication, and system logs in one place.",
};

export default function LogsPage() {
    return <LogsHubClient />;
}
