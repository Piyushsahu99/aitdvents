import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Crown, Medal, Trophy, Send, Award, Calendar, Download, Mail } from 'lucide-react';
import { LeaderboardCertificate } from '@/components/certificates/LeaderboardCertificate';
import html2canvas from 'html2canvas';

interface TopPerformer {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  monthlyPoints: number;
  college: string | null;
}

interface WinnerHistory {
  id: string;
  month: number;
  year: number;
  rank: number;
  pointsEarned: number;
  userId: string;
  certificateId: string | null;
  userName?: string;
  userEmail?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const LeaderboardCertificateManager = () => {
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [winnerHistory, setWinnerHistory] = useState<WinnerHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [previewRank, setPreviewRank] = useState<1 | 2 | 3 | null>(null);

  useEffect(() => {
    fetchTopPerformers();
    fetchWinnerHistory();
  }, [selectedMonth, selectedYear]);

  const fetchTopPerformers = async () => {
    try {
      const { data: pointsData, error: pointsError } = await supabase
        .from('user_points')
        .select('user_id, monthly_points')
        .order('monthly_points', { ascending: false })
        .limit(3);

      if (pointsError) throw pointsError;

      const performers: TopPerformer[] = [];
      
      for (const points of pointsData || []) {
        const { data: profile } = await supabase
          .from('student_profiles')
          .select('full_name, avatar_url, college')
          .eq('user_id', points.user_id)
          .single();

        const { data: { user } } = await supabase.auth.admin?.getUserById?.(points.user_id) || { data: { user: null } };

        performers.push({
          userId: points.user_id,
          fullName: profile?.full_name || 'Unknown User',
          email: user?.email || 'No email',
          avatarUrl: profile?.avatar_url,
          monthlyPoints: points.monthly_points || 0,
          college: profile?.college
        });
      }

      setTopPerformers(performers);
    } catch (error) {
      console.error('Error fetching top performers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWinnerHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('monthly_leaderboard_winners')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .order('rank', { ascending: true });

      if (error) throw error;

      const historyWithNames: WinnerHistory[] = [];
      
      for (const winner of data || []) {
        const { data: profile } = await supabase
          .from('student_profiles')
          .select('full_name')
          .eq('user_id', winner.user_id)
          .single();

        historyWithNames.push({
          id: winner.id,
          month: winner.month,
          year: winner.year,
          rank: winner.rank,
          pointsEarned: winner.points_earned,
          userId: winner.user_id,
          certificateId: winner.certificate_id,
          userName: profile?.full_name || 'Unknown',
          userEmail: ''
        });
      }

      setWinnerHistory(historyWithNames);
    } catch (error) {
      console.error('Error fetching winner history:', error);
    }
  };

  const generateCertificates = async () => {
    if (topPerformers.length === 0) {
      toast({ title: 'Error', description: 'No top performers found', variant: 'destructive' });
      return;
    }

    setGenerating(true);
    try {
      for (let i = 0; i < Math.min(topPerformers.length, 3); i++) {
        const performer = topPerformers[i];
        const rank = (i + 1) as 1 | 2 | 3;
        
        // Generate certificate number
        const certNumber = `AITD-LB-${selectedYear}${String(selectedMonth).padStart(2, '0')}-${rank}-${Date.now().toString(36).toUpperCase()}`;
        
        // Create certificate record
        const { data: cert, error: certError } = await supabase
          .from('issued_certificates')
          .insert({
            certificate_number: certNumber,
            recipient_name: performer.fullName,
            recipient_email: performer.email,
            user_id: performer.userId,
            certificate_type: 'leaderboard',
            achievement_details: {
              rank,
              month: MONTHS[selectedMonth - 1],
              year: selectedYear,
              pointsEarned: performer.monthlyPoints
            },
            issue_date: new Date().toISOString(),
            is_valid: true
          })
          .select()
          .single();

        if (certError) throw certError;

        // Record in leaderboard winners
        await supabase
          .from('monthly_leaderboard_winners')
          .upsert({
            month: selectedMonth,
            year: selectedYear,
            user_id: performer.userId,
            rank,
            points_earned: performer.monthlyPoints,
            certificate_id: cert.id
          }, { onConflict: 'month,year,rank' });
      }

      toast({ title: 'Success', description: 'Certificates generated successfully!' });
      fetchWinnerHistory();
    } catch (error: any) {
      console.error('Error generating certificates:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const sendCertificateEmails = async () => {
    setSendingEmails(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-certificate', {
        body: {
          month: selectedMonth,
          year: selectedYear,
          action: 'send_leaderboard_certificates'
        }
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Certificates sent to winners via email!' });
    } catch (error: any) {
      console.error('Error sending emails:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSendingEmails(false);
    }
  };

  const downloadCertificate = async (rank: 1 | 2 | 3) => {
    const performer = topPerformers[rank - 1];
    if (!performer) return;

    setPreviewRank(rank);
    
    // Wait for render
    setTimeout(async () => {
      const element = document.getElementById('leaderboard-certificate');
      if (element) {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const link = document.createElement('a');
        link.download = `AITD_Leaderboard_Certificate_${MONTHS[selectedMonth - 1]}_${selectedYear}_Rank${rank}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
      setPreviewRank(null);
    }, 500);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Trophy className="w-5 h-5 text-orange-500" />;
      default: return null;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-300';
      case 2: return 'bg-gradient-to-r from-gray-100 to-slate-100 border-gray-300';
      case 3: return 'bg-gradient-to-r from-orange-100 to-amber-100 border-orange-300';
      default: return 'bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">Current Month</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {/* Month/Year Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                Select Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month, index) => (
                      <SelectItem key={index} value={String(index + 1)}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2024, 2025, 2026].map((year) => (
                      <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Top 3 Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-500" />
                Top 3 Performers - {MONTHS[selectedMonth - 1]} {selectedYear}
              </CardTitle>
              <CardDescription>
                These users will receive leaderboard certificates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : topPerformers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No performers found</p>
              ) : (
                topPerformers.map((performer, index) => {
                  const rank = (index + 1) as 1 | 2 | 3;
                  return (
                    <div 
                      key={performer.userId}
                      className={`flex items-center justify-between p-4 rounded-lg border ${getRankBg(rank)}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow">
                          {getRankIcon(rank)}
                        </div>
                        <Avatar className="h-12 w-12 border-2 border-white shadow">
                          <AvatarImage src={performer.avatarUrl || ''} />
                          <AvatarFallback>{performer.fullName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{performer.fullName}</p>
                          <p className="text-sm text-muted-foreground">{performer.college || 'No college'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="text-lg px-4 py-1">
                          {performer.monthlyPoints.toLocaleString()} pts
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => downloadCertificate(rank)}>
                          <Download className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={generateCertificates} 
                  disabled={generating || topPerformers.length === 0}
                  className="flex-1"
                >
                  <Award className="w-4 h-4 mr-2" />
                  {generating ? 'Generating...' : 'Generate Certificates'}
                </Button>
                <Button 
                  onClick={sendCertificateEmails} 
                  disabled={sendingEmails}
                  variant="secondary"
                  className="flex-1"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {sendingEmails ? 'Sending...' : 'Email to Winners'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Winner History</CardTitle>
              <CardDescription>Past monthly leaderboard winners</CardDescription>
            </CardHeader>
            <CardContent>
              {winnerHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No history yet</p>
              ) : (
                <div className="space-y-2">
                  {winnerHistory.map((winner) => (
                    <div 
                      key={winner.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${getRankBg(winner.rank)}`}
                    >
                      <div className="flex items-center gap-3">
                        {getRankIcon(winner.rank)}
                        <div>
                          <p className="font-medium">{winner.userName}</p>
                          <p className="text-sm text-muted-foreground">
                            {MONTHS[winner.month - 1]} {winner.year}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">{winner.pointsEarned.toLocaleString()} pts</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Hidden Certificate Preview for Download */}
      {previewRank && topPerformers[previewRank - 1] && (
        <div className="fixed -left-[9999px] top-0">
          <LeaderboardCertificate
            recipientName={topPerformers[previewRank - 1].fullName}
            certificateNumber={`PREVIEW-${Date.now()}`}
            rank={previewRank}
            month={MONTHS[selectedMonth - 1]}
            year={selectedYear}
            pointsEarned={topPerformers[previewRank - 1].monthlyPoints}
            issueDate={new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          />
        </div>
      )}
    </div>
  );
};
