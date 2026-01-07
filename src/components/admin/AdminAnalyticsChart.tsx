import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Activity, TrendingUp, PieChart as PieChartIcon } from "lucide-react";

interface AnalyticsData {
  events: number;
  bounties: number;
  jobs: number;
  hackathons: number;
  scholarships: number;
  users: number;
}

interface AdminAnalyticsChartProps {
  data: AnalyticsData;
  liveEvents: number;
  draftEvents: number;
  endedEvents: number;
}

const COLORS = [
  'hsl(262, 83%, 58%)', // primary violet
  'hsl(142, 76%, 36%)', // success green
  'hsl(38, 92%, 50%)',  // warning amber
  'hsl(217, 91%, 60%)', // info blue
  'hsl(339, 90%, 51%)', // accent pink
];

export function AdminAnalyticsChart({ data, liveEvents, draftEvents, endedEvents }: AdminAnalyticsChartProps) {
  const barChartData = [
    { name: 'Events', value: data.events, fill: 'hsl(262, 83%, 58%)' },
    { name: 'Jobs', value: data.jobs, fill: 'hsl(217, 91%, 60%)' },
    { name: 'Bounties', value: data.bounties, fill: 'hsl(38, 92%, 50%)' },
    { name: 'Hackathons', value: data.hackathons, fill: 'hsl(142, 76%, 36%)' },
    { name: 'Scholarships', value: data.scholarships, fill: 'hsl(339, 90%, 51%)' },
  ];

  const pieChartData = [
    { name: 'Live', value: liveEvents, color: 'hsl(142, 76%, 36%)' },
    { name: 'Draft', value: draftEvents, color: 'hsl(38, 92%, 50%)' },
    { name: 'Ended', value: endedEvents, color: 'hsl(220, 9%, 46%)' },
  ].filter(item => item.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Content Overview Bar Chart */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold">Content Overview</h4>
            <p className="text-xs text-muted-foreground">All content types</p>
          </div>
        </div>
        
        <div className="h-[200px] sm:h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} layout="vertical" margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 11 }} 
                stroke="hsl(var(--muted-foreground))"
                width={80}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
              />
              <Bar 
                dataKey="value" 
                radius={[0, 4, 4, 0]}
                fill="hsl(262, 83%, 58%)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Event Status Pie Chart */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <PieChartIcon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold">Event Status</h4>
            <p className="text-xs text-muted-foreground">Distribution by status</p>
          </div>
        </div>
        
        <div className="h-[200px] sm:h-[250px] flex items-center justify-center">
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span className="text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground">
              <PieChartIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No events to display</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
