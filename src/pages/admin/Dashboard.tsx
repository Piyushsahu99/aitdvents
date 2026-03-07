import { MetricsGrid } from "@/components/admin/dashboard/MetricsGrid";
import { ActivityFeed } from "@/components/admin/dashboard/ActivityFeed";
import { DashboardCharts } from "@/components/admin/dashboard/DashboardCharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileCheck, Bell, Download, Activity, RefreshCw } from "lucide-react";

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
      <section>
        <MetricsGrid />
      </section>

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

      {/* Charts */}
      <section>
        <DashboardCharts />
      </section>

      {/* Activity Feed and Quick Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityFeed />
        
        {/* Quick Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Platform Health</CardTitle>
              <CardDescription>System status and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium">API Status</span>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                    Operational
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-sm font-medium">Database</span>
                  </div>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                    Connected
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
                    <span className="text-sm font-medium">Real-time</span>
                  </div>
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Links</CardTitle>
              <CardDescription>Frequently accessed sections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                  <a href="/admin-portal/users">
                    <Activity className="h-5 w-5" />
                    <span className="text-xs">Users</span>
                  </a>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                  <a href="/admin-portal/content">
                    <FileCheck className="h-5 w-5" />
                    <span className="text-xs">Content</span>
                  </a>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                  <a href="/admin-portal/analytics">
                    <Activity className="h-5 w-5" />
                    <span className="text-xs">Analytics</span>
                  </a>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                  <a href="/admin-portal/crm">
                    <Activity className="h-5 w-5" />
                    <span className="text-xs">CRM</span>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
