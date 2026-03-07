import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Briefcase, Trophy, GraduationCap, Play, FileCheck } from "lucide-react";

export default function Content() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground mt-1">
            Moderate and manage all platform content
          </p>
        </div>
        <Button>
          <FileCheck className="h-4 w-4 mr-2" />
          Review Queue
        </Button>
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="events">
            <Calendar className="h-4 w-4 mr-2 hidden sm:inline" />
            Events
          </TabsTrigger>
          <TabsTrigger value="jobs">
            <Briefcase className="h-4 w-4 mr-2 hidden sm:inline" />
            Jobs
          </TabsTrigger>
          <TabsTrigger value="blogs">
            <FileText className="h-4 w-4 mr-2 hidden sm:inline" />
            Blogs
          </TabsTrigger>
          <TabsTrigger value="bounties">
            <Trophy className="h-4 w-4 mr-2 hidden sm:inline" />
            Bounties
          </TabsTrigger>
          <TabsTrigger value="scholarships">
            <GraduationCap className="h-4 w-4 mr-2 hidden sm:inline" />
            Scholarships
          </TabsTrigger>
          <TabsTrigger value="reels">
            <Play className="h-4 w-4 mr-2 hidden sm:inline" />
            Reels
          </TabsTrigger>
          <TabsTrigger value="pending">
            <FileCheck className="h-4 w-4 mr-2 hidden sm:inline" />
            Pending
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Events Management</CardTitle>
              <CardDescription>Manage and moderate events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Events management interface coming soon</p>
                <p className="text-sm mt-2">Use existing AdminDashboard for now</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Jobs Management</CardTitle>
              <CardDescription>Manage and moderate job postings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Jobs management interface coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Review</CardTitle>
              <CardDescription>Content waiting for approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileCheck className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Moderation queue coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
