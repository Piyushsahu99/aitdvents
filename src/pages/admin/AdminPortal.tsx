import { Outlet } from "react-router-dom";
import { AdminLayout } from "@/components/admin/shared/AdminLayout";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";
import { Loader2 } from "lucide-react";

export default function AdminPortal() {
  const { isLoading, userRoles } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout userRoles={userRoles}>
      <Outlet />
    </AdminLayout>
  );
}
