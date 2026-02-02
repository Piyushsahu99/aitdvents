import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Shuffle, Eye, Clock, Users } from "lucide-react";

interface QuizSettings {
  autoAdvance: boolean;
  countdownSeconds: number;
  answerRevealSeconds: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showLiveLeaderboard: boolean;
  allowLateJoin: boolean;
}

interface QuizSettingsProps {
  settings: QuizSettings;
  onChange: (settings: QuizSettings) => void;
}

export function QuizSettingsForm({ settings, onChange }: QuizSettingsProps) {
  const updateSetting = <K extends keyof QuizSettings>(key: K, value: QuizSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Timing Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Timing
          </CardTitle>
          <CardDescription>Configure quiz flow and timing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Auto-advance questions</Label>
              <p className="text-xs text-muted-foreground">
                Automatically move to next question after reveal
              </p>
            </div>
            <Switch
              checked={settings.autoAdvance}
              onCheckedChange={(checked) => updateSetting("autoAdvance", checked)}
            />
          </div>

          {settings.autoAdvance && (
            <>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-sm">Pre-question countdown</Label>
                  <Select
                    value={String(settings.countdownSeconds)}
                    onValueChange={(v) => updateSetting("countdownSeconds", parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 seconds</SelectItem>
                      <SelectItem value="5">5 seconds</SelectItem>
                      <SelectItem value="10">10 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Answer reveal time</Label>
                  <Select
                    value={String(settings.answerRevealSeconds)}
                    onValueChange={(v) => updateSetting("answerRevealSeconds", parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 seconds</SelectItem>
                      <SelectItem value="3">3 seconds</SelectItem>
                      <SelectItem value="5">5 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Randomization Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shuffle className="h-5 w-5 text-primary" />
            Randomization
          </CardTitle>
          <CardDescription>Prevent cheating with shuffle options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Shuffle questions</Label>
              <p className="text-xs text-muted-foreground">
                Randomize question order for each participant
              </p>
            </div>
            <Switch
              checked={settings.shuffleQuestions}
              onCheckedChange={(checked) => updateSetting("shuffleQuestions", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Shuffle options</Label>
              <p className="text-xs text-muted-foreground">
                Randomize answer options for each question
              </p>
            </div>
            <Switch
              checked={settings.shuffleOptions}
              onCheckedChange={(checked) => updateSetting("shuffleOptions", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Display
          </CardTitle>
          <CardDescription>Control what participants see</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Show live leaderboard</Label>
              <p className="text-xs text-muted-foreground">
                Display rankings between questions
              </p>
            </div>
            <Switch
              checked={settings.showLiveLeaderboard}
              onCheckedChange={(checked) => updateSetting("showLiveLeaderboard", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Access Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Access
          </CardTitle>
          <CardDescription>Control who can join</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Allow late joining</Label>
              <p className="text-xs text-muted-foreground">
                Let participants join after quiz starts
              </p>
            </div>
            <Switch
              checked={settings.allowLateJoin}
              onCheckedChange={(checked) => updateSetting("allowLateJoin", checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
