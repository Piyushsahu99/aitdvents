import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ClipboardList, Users, UserCheck, Gift, PartyPopper, Award, TrendingUp } from "lucide-react";
import { AmbassadorCycleManager } from "./AmbassadorCycleManager";
import { AmbassadorTaskManager } from "./AmbassadorTaskManager";
import { AmbassadorSubmissionReview } from "./AmbassadorSubmissionReview";
import { AmbassadorTeamOverview } from "./AmbassadorTeamOverview";
import { AmbassadorMentorManager } from "./AmbassadorMentorManager";
import { AmbassadorRewardsManager } from "./AmbassadorRewardsManager";
import { AmbassadorEventsManager } from "./AmbassadorEventsManager";
import { AmbassadorLeaderboardAdmin } from "./AmbassadorLeaderboardAdmin";

export function AmbassadorProgramManager() {
  const [activeTab, setActiveTab] = useState("cycles");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Ambassador Program Management</h2>
        <p className="text-muted-foreground">
          Manage program cycles, tasks, submissions, teams, mentors, rewards, and events
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-1">
          <TabsTrigger value="cycles" className="flex items-center gap-1 text-xs">
            <Calendar className="h-3 w-3" />
            <span className="hidden sm:inline">Cycles</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-1 text-xs">
            <ClipboardList className="h-3 w-3" />
            <span className="hidden sm:inline">Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center gap-1 text-xs">
            <UserCheck className="h-3 w-3" />
            <span className="hidden sm:inline">Review</span>
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-1 text-xs">
            <Users className="h-3 w-3" />
            <span className="hidden sm:inline">Teams</span>
          </TabsTrigger>
          <TabsTrigger value="mentors" className="flex items-center gap-1 text-xs">
            <Award className="h-3 w-3" />
            <span className="hidden sm:inline">Mentors</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-1 text-xs">
            <TrendingUp className="h-3 w-3" />
            <span className="hidden sm:inline">Leaderboard</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-1 text-xs">
            <Gift className="h-3 w-3" />
            <span className="hidden sm:inline">Rewards</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-1 text-xs">
            <PartyPopper className="h-3 w-3" />
            <span className="hidden sm:inline">Events</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cycles">
          <AmbassadorCycleManager />
        </TabsContent>

        <TabsContent value="tasks">
          <AmbassadorTaskManager />
        </TabsContent>

        <TabsContent value="submissions">
          <AmbassadorSubmissionReview />
        </TabsContent>

        <TabsContent value="teams">
          <AmbassadorTeamOverview />
        </TabsContent>

        <TabsContent value="mentors">
          <AmbassadorMentorManager />
        </TabsContent>

        <TabsContent value="leaderboard">
          <AmbassadorLeaderboardAdmin />
        </TabsContent>

        <TabsContent value="rewards">
          <AmbassadorRewardsManager />
        </TabsContent>

        <TabsContent value="events">
          <AmbassadorEventsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
