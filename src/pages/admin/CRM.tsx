import { CRMDashboard } from "@/components/crm/CRMDashboard";

export default function CRM() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CRM Portal</h1>
        <p className="text-muted-foreground mt-1">
          Manage team, tasks, and operations
        </p>
      </div>
      
      <CRMDashboard />
    </div>
  );
}
