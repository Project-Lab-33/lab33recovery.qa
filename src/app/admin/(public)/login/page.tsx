import AdminLoginClient from "@/components/admin/AdminLoginClient";

export const metadata = {
    title: "Admin Login | The Lab 33",
    description: "Administrator access portal for The Lab 33.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function AdminLoginPage() {
    return <AdminLoginClient />;
}
