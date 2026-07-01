import UsersClient from "@/components/admin/pages/users/UsersClient";

export const metadata = {
    title: "Users | The Lab 33 Admin",
    description: "Manage admin users, roles, and access control for The Lab 33.",
};

export default function AdminUsersPage() {
    return <UsersClient />;
}
