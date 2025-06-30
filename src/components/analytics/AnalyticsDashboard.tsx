import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { 
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useDocument } from '@/hooks/useDocument';
import { AnalyticsData } from '@/types/document';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface AnalyticsDashboardProps {
  projectId: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function AnalyticsDashboard({ projectId }: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState('wordCount');
  const { isLoading, getProjectAnalytics } = useDocument();

  // Fetch analytics data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (projectId) {
        const data = await getProjectAnalytics(projectId);
        setAnalyticsData(data);
      }
    };

    fetchData();
  }, [projectId, getProjectAnalytics]);

  // Format the daily word count data for the chart
  const formatWordCountData = () => {
    if (!analyticsData) return [];

    return Object.entries(analyticsData.dailyWordCounts)
      .map(([date, count]) => ({
        date: format(new Date(date), 'MMM dd'),
        wordCount: count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  // Format the writing time data for the chart
  const formatTimeData = () => {
    if (!analyticsData) return [];

    return Object.entries(analyticsData.writingTime)
      .map(([date, seconds]) => ({
        date: format(new Date(date), 'MMM dd'),
        minutes: Math.round(seconds / 60)
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  // Format the session data for the pie chart
  const formatSessionData = () => {
    if (!analyticsData || !analyticsData.sessions.length) return [];
    
    // Group sessions by time of day (morning, afternoon, evening, night)
    const timeOfDayGroups: Record<string, number> = {
      'Morning (6am-12pm)': 0,
      'Afternoon (12pm-6pm)': 0,
      'Evening (6pm-12am)': 0,
      'Night (12am-6am)': 0
    };
    
    analyticsData.sessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      
      if (hour >= 6 && hour < 12) {
        timeOfDayGroups['Morning (6am-12pm)'] += session.wordCount;
      } else if (hour >= 12 && hour < 18) {
        timeOfDayGroups['Afternoon (12pm-6pm)'] += session.wordCount;
      } else if (hour >= 18 && hour < 24) {
        timeOfDayGroups['Evening (6pm-12am)'] += session.wordCount;
      } else {
        timeOfDayGroups['Night (12am-6am)'] += session.wordCount;
      }
    });
    
    return Object.entries(timeOfDayGroups)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No analytics data available yet. Start writing to track your progress!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Words</CardTitle>
            <CardDescription>Words written in this project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.stats.totalWordCount.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Writing Sessions</CardTitle>
            <CardDescription>Total writing sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.stats.totalSessions.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Days Active</CardTitle>
            <CardDescription>Days with writing activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.stats.daysWritten.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Averages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-muted-foreground">Words per day:</span>
              <span className="float-right font-medium">{Math.round(analyticsData.stats.averageWordsPerDay).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Words per session:</span>
              <span className="float-right font-medium">{Math.round(analyticsData.stats.averageWordsPerSession).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Session duration:</span>
              <span className="float-right font-medium">
                {Math.floor(analyticsData.stats.averageSessionDuration / 60)} minutes
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productivity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-muted-foreground">Most productive time:</span>
              <span className="float-right font-medium">
                {analyticsData.stats.mostProductiveTimeOfDay || 'Not enough data'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Most productive day:</span>
              <span className="float-right font-medium">
                {analyticsData.stats.mostProductiveDayOfWeek || 'Not enough data'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="wordCount">Word Count</TabsTrigger>
          <TabsTrigger value="writingTime">Writing Time</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="wordCount" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Word Count</CardTitle>
              <CardDescription>Words written per day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={formatWordCountData()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} words`, 'Word Count']} />
                    <Bar dataKey="wordCount" fill="#8884d8" name="Word Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="writingTime" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Writing Time</CardTitle>
              <CardDescription>Minutes spent writing per day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={formatTimeData()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} minutes`, 'Writing Time']} />
                    <Area type="monotone" dataKey="minutes" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="productivity" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Productivity by Time of Day</CardTitle>
              <CardDescription>When you write the most</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formatSessionData()}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {formatSessionData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} words`, 'Word Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Recent Writing Sessions</CardTitle>
          <CardDescription>Your most recent writing activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.sessions.slice(0, 5).map((session, index) => (
              <div key={index} className="border-b pb-3 last:border-0">
                <div className="flex justify-between">
                  <span className="font-medium">{format(new Date(session.startTime), 'MMM dd, yyyy')}</span>
                  <span>{session.wordCount} words</span>
                </div>
                <div className="text-sm text-muted-foreground flex justify-between">
                  <span>{format(new Date(session.startTime), 'h:mm a')} - {format(new Date(session.endTime), 'h:mm a')}</span>
                  <span>{Math.round(session.wordsPerMinute)} words/min</span>
                </div>
              </div>
            ))}
            
            {analyticsData.sessions.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No writing sessions recorded yet.
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Data based on your writing sessions since {analyticsData.sessions.length > 0 
            ? format(new Date(analyticsData.sessions[analyticsData.sessions.length - 1].startTime), 'MMMM dd, yyyy')
            : 'you started this project'
          }
        </CardFooter>
      </Card>
    </div>
  );
}
