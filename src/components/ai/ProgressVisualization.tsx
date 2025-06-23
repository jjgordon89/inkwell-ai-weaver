
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Brain, Target, Calendar } from 'lucide-react';

interface WritingSession {
  date: string;
  wordsWritten: number;
  aiUsage: number;
  timeSpent: number; // minutes
  aiActions: {
    improvements: number;
    completions: number;
    suggestions: number;
  };
}

interface ProgressVisualizationProps {
  sessions: WritingSession[];
  totalWords: number;
  targetWords: number;
}

const ProgressVisualization: React.FC<ProgressVisualizationProps> = ({
  sessions = [],
  totalWords,
  targetWords
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  // Generate mock data if no sessions provided
  const mockSessions: WritingSession[] = useMemo(() => {
    if (sessions.length > 0) return sessions;
    
    const generateMockSessions = () => {
      const mockData: WritingSession[] = [];
      const today = new Date();
      
      for (let i = 13; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        mockData.push({
          date: date.toISOString().split('T')[0],
          wordsWritten: Math.floor(Math.random() * 800) + 200,
          aiUsage: Math.floor(Math.random() * 60) + 20,
          timeSpent: Math.floor(Math.random() * 120) + 30,
          aiActions: {
            improvements: Math.floor(Math.random() * 15) + 2,
            completions: Math.floor(Math.random() * 10) + 1,
            suggestions: Math.floor(Math.random() * 20) + 5
          }
        });
      }
      
      return mockData;
    };
    
    return generateMockSessions();
  }, [sessions]);

  const chartConfig = {
    wordsWritten: {
      label: "Words Written",
      color: "hsl(var(--primary))",
    },
    aiUsage: {
      label: "AI Usage %",
      color: "hsl(var(--secondary))",
    },
    timeSpent: {
      label: "Time (minutes)",
      color: "hsl(var(--accent))",
    },
  };

  const productivityData = mockSessions.map(session => ({
    date: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    wordsWritten: session.wordsWritten,
    aiUsage: session.aiUsage,
    timeSpent: session.timeSpent
  }));

  const aiUsageBreakdown = [
    { name: 'Improvements', value: mockSessions.reduce((sum, s) => sum + s.aiActions.improvements, 0), color: '#8884d8' },
    { name: 'Completions', value: mockSessions.reduce((sum, s) => sum + s.aiActions.completions, 0), color: '#82ca9d' },
    { name: 'Suggestions', value: mockSessions.reduce((sum, s) => sum + s.aiActions.suggestions, 0), color: '#ffc658' }
  ];

  const getProgressStats = () => {
    const totalWordsWritten = mockSessions.reduce((sum, session) => sum + session.wordsWritten, 0);
    const avgWordsPerDay = Math.round(totalWordsWritten / mockSessions.length);
    const avgAIUsage = Math.round(mockSessions.reduce((sum, session) => sum + session.aiUsage, 0) / mockSessions.length);
    const totalTimeSpent = mockSessions.reduce((sum, session) => sum + session.timeSpent, 0);
    
    return {
      totalWordsWritten,
      avgWordsPerDay,
      avgAIUsage,
      totalTimeSpent: Math.round(totalTimeSpent / 60), // convert to hours
      progressPercentage: Math.round((totalWords / targetWords) * 100)
    };
  };

  const stats = getProgressStats();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">Progress</span>
            </div>
            <div className="text-xl font-bold">{stats.progressPercentage}%</div>
            <div className="text-xs text-muted-foreground">
              {totalWords.toLocaleString()} / {targetWords.toLocaleString()} words
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium">Daily Avg</span>
            </div>
            <div className="text-xl font-bold">{stats.avgWordsPerDay}</div>
            <div className="text-xs text-muted-foreground">words per day</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium">AI Usage</span>
            </div>
            <div className="text-xl font-bold">{stats.avgAIUsage}%</div>
            <div className="text-xs text-muted-foreground">average usage</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-xs font-medium">Time Spent</span>
            </div>
            <div className="text-xl font-bold">{stats.totalTimeSpent}h</div>
            <div className="text-xs text-muted-foreground">total writing time</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="productivity" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="productivity">Writing Patterns</TabsTrigger>
          <TabsTrigger value="ai-usage">AI Usage</TabsTrigger>
          <TabsTrigger value="time-analysis">Time Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="productivity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4" />
                Daily Writing Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64">
                <LineChart data={productivityData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="wordsWritten" 
                    stroke="var(--color-wordsWritten)" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-usage" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Brain className="h-4 w-4" />
                  AI Actions Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-48">
                  <PieChart>
                    <Pie
                      data={aiUsageBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {aiUsageBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Brain className="h-4 w-4" />
                  AI Usage Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-48">
                  <BarChart data={productivityData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="aiUsage" fill="var(--color-aiUsage)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="time-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                Writing Time vs Output
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64">
                <LineChart data={productivityData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="timeSpent" 
                    stroke="var(--color-timeSpent)" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="wordsWritten" 
                    stroke="var(--color-wordsWritten)" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressVisualization;
