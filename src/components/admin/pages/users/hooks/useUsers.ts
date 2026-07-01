import { useState, useMemo, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getRoleLabel } from "@/lib/permissions";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import type { UserWithMeta, SortField, SortDirection } from "../types";

export function useUsers() {
    const supabase = useMemo(() => createClient(), []);

    // State
    const [users, setUsers] = useState<UserWithMeta[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Filters & Sort
    const [roleFilter, setRoleFilter] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [sortField, setSortField] = useState<SortField>("created_at");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from("admin_users")
                .select("*")
                .order("created_at", { ascending: true });
            if (error) throw error;
            setUsers((data as UserWithMeta[]) || []);
        } catch (err) {
            console.error("Error fetching users:", err);
            toast.error("Failed to load users");
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const filteredUsers = useMemo(() => {
        let result = [...users];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (u) =>
                    u.name.toLowerCase().includes(q) ||
                    u.email.toLowerCase().includes(q)
            );
        }

        if (roleFilter.length > 0) {
            result = result.filter((u) => roleFilter.includes(u.role));
        }

        if (statusFilter.length > 0) {
            result = result.filter((u) => {
                if (statusFilter.includes("active") && u.is_active) return true;
                if (statusFilter.includes("inactive") && !u.is_active) return true;
                return false;
            });
        }

        result.sort((a, b) => {
            const dir = sortDirection === "asc" ? 1 : -1;
            switch (sortField) {
                case "name":
                    return dir * a.name.localeCompare(b.name);
                case "email":
                    return dir * a.email.localeCompare(b.email);
                case "created_at":
                    return (
                        dir *
                        (new Date(a.created_at).getTime() -
                            new Date(b.created_at).getTime())
                    );
                default:
                    return 0;
            }
        });

        return result;
    }, [users, searchQuery, roleFilter, statusFilter, sortField, sortDirection]);

    const activeFilterCount = roleFilter.length + statusFilter.length;

    const exportToCSV = () => {
        const headers = ["Name,Email,Role,Status,Joined"];
        const rows = filteredUsers.map(
            (u) =>
                `"${u.name}","${u.email}","${u.role}","${u.is_active ? "Active" : "Inactive"}","${format(parseISO(u.created_at), "yyyy-MM-dd")}"`
        );
        const csvContent =
            "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute(
            "download",
            `lab33-users-export-${format(new Date(), "yyyy-MM-dd")}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToExcel = async () => {
        const XLSX = await import("xlsx");
        const data = filteredUsers.map((u) => ({
            Name: u.name,
            Email: u.email,
            Role: getRoleLabel(u.role),
            Status: u.is_active ? "Active" : "Inactive",
            Joined: format(parseISO(u.created_at), "MMMM dd, yyyy"),
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Users");
        XLSX.writeFile(
            wb,
            `lab33-users-export-${format(new Date(), "yyyy-MM-dd")}.xlsx`
        );
    };

    const exportToPDF = async () => {
        const { createBrandedPDF } = await import("@/components/admin/shared/utils/exportPDF");
        const tableData = filteredUsers.map((u) => [
            u.name,
            u.email,
            getRoleLabel(u.role),
            u.is_active ? "Active" : "Inactive",
            format(parseISO(u.created_at), "MMM dd, yyyy"),
        ]);
        await createBrandedPDF({
            category: 'ADMINISTRATION',
            title: 'Admin Users',
            head: [["NAME", "EMAIL", "ROLE", "STATUS", "JOINED"]],
            body: tableData,
            filename: 'lab33-users-export',
        });
    };

    const toggleActive = async (user: UserWithMeta) => {
        // Guard: prevent deactivating the last admin
        if (user.is_active && user.role === 'admin') {
            const activeAdmins = users.filter(u => u.role === 'admin' && u.is_active);
            if (activeAdmins.length <= 1) {
                toast.error("Cannot deactivate the last active admin — at least one admin must remain active");
                return;
            }
        }

        try {
            const { error } = await supabase
                .from("admin_users")
                .update({
                    is_active: !user.is_active,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", user.id);
            if (error) throw error;
            toast.success(
                user.is_active ? "User deactivated" : "User activated"
            );
            fetchUsers();
        } catch {
            toast.error("Failed to update status");
        }
    };

    return {
        supabase,
        users,
        setUsers,
        isLoading,
        searchQuery,
        setSearchQuery,
        roleFilter,
        setRoleFilter,
        statusFilter,
        setStatusFilter,
        sortField,
        setSortField,
        sortDirection,
        setSortDirection,
        filteredUsers,
        activeFilterCount,
        fetchUsers,
        exportToCSV,
        exportToExcel,
        exportToPDF,
        toggleActive,
    };
}
