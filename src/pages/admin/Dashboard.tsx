import { MetricsGrid } from "@/components/admin/dashboard/MetricsGrid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileCheck, Bell, Download, Activity } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your platform.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <MetricsGrid />

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Plus className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg">Create Event</CardTitle>
            <CardDescription className="mt-1">
              Add a new event to the platform
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center group-hover:bg-info group-hover:text-info-foreground transition-colors">
                <Plus className="h-5 w-5 text-info group-hover:text-info-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg">Create Job</CardTitle>
            <CardDescription className="mt-1">
              Post a new job opportunity
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center group-hover:bg-warning group-hover:text-warning-foreground transition-colors">
                <FileCheck className="h-5 w-5 text-warning group-hover:text-warning-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg">Review Content</CardTitle>
            <CardDescription className="mt-1">
              Approve pending submissions
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center group-hover:bg-success group-hover:text-success-foreground transition-colors">
                <Bell className="h-5 w-5 text-success group-hover:text-success-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg">Send Announcement</CardTitle>
            <CardDescription className="mt-1">
              Broadcast message to users
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest platform activities and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Activity feed will be displayed here</p>
            <p className="text-sm mt-1">Real-time updates coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
