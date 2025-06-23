
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Clock, 
  Zap, 
  TrendingUp, 
  Server,
  RefreshCw 
} from 'lucide-react';
import { useAI } from '@/hooks/useAI';

interface PerformanceMetrics {
  averageResponseTime: number;
  successRate: number;
  totalRequests: number;
  errorCount: number;
  lastResponseTime: number;
  providerStatus: 'healthy' | 'degraded' | 'down';
}

const AIPerformanceMonitor = () => {
  const { selectedProvider, isProcessing, testConnection } = useAI();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    averageResponseTime: 0,
    successRate: 100,
    totalRequests: 0,
    errorCount: 0,
    lastResponseTime: 0,
    providerStatus: 'healthy'
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load metrics from localStorage
  useEffect(() => {
    const savedMetrics = localStorage.getItem(`ai-metrics-${selectedProvider}`);
    if (savedMetrics) {
      try {
        setMetrics(JSON.parse(savedMetrics));
      } catch (error) {
        console.error('Failed to load AI metrics:', error);
      }
    }
  }, [selectedProvider]);

  // Save metrics to localStorage
  const saveMetrics = (newMetrics: PerformanceMetrics) => {
    localStorage.setItem(`ai-metrics-${selectedProvider}`, JSON.stringify(newMetrics));
    setMetrics(newMetrics);
  };

  // Record a successful request
  const recordSuccess = (responseTime: number) => {
    const newMetrics = {
      ...metrics,
      totalRequests: metrics.totalRequests + 1,
      lastResponseTime: responseTime,
      averageResponseTime: metrics.totalRequests === 0 
        ? responseTime 
        : (metrics.averageResponseTime * metrics.totalRequests + responseTime) / (metrics.totalRequests + 1),
      successRate: ((metrics.totalRequests - metrics.errorCount) / (metrics.totalRequests + 1)) * 100,
      providerStatus: responseTime < 5000 ? 'healthy' : responseTime < 10000 ? 'degraded' : 'down' as const
    };
    saveMetrics(newMetrics);
  };

  // Record a failed request
  const recordError = () => {
    const newMetrics = {
      ...metrics,
      totalRequests: metrics.totalRequests + 1,
      errorCount: metrics.errorCount + 1,
      successRate: ((metrics.totalRequests - metrics.errorCount) / (metrics.totalRequests + 1)) * 100,
      providerStatus: 'degraded' as const
    };
    saveMetrics(newMetrics);
  };

  const refreshStatus = async () => {
    setIsRefreshing(true);
    const startTime = Date.now();
    
    try {
      const success = await testConnection(selectedProvider);
      const responseTime = Date.now() - startTime;
      
      if (success) {
        recordSuccess(responseTime);
      } else {
        recordError();
      }
    } catch (error) {
      recordError();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'down': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <Activity className="h-4 w-4 text-green-600" />;
      case 'degraded': return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      case 'down': return <Server className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            AI Performance Monitor
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshStatus}
            disabled={isRefreshing || isProcessing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Provider Status */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            {getStatusIcon(metrics.providerStatus)}
            <div>
              <p className="font-medium">{selectedProvider}</p>
              <p className="text-sm text-muted-foreground">Provider Status</p>
            </div>
          </div>
          <Badge className={getStatusColor(metrics.providerStatus)}>
            {metrics.providerStatus.toUpperCase()}
          </Badge>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Avg Response Time</span>
            </div>
            <div className="text-2xl font-bold">
              {formatTime(metrics.averageResponseTime)}
            </div>
            {metrics.lastResponseTime > 0 && (
              <p className="text-xs text-muted-foreground">
                Last: {formatTime(metrics.lastResponseTime)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span>Success Rate</span>
            </div>
            <div className="text-2xl font-bold">
              {metrics.successRate.toFixed(1)}%
            </div>
            <Progress value={metrics.successRate} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span>Total Requests</span>
            </div>
            <div className="text-2xl font-bold">
              {metrics.totalRequests.toLocaleString()}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Server className="h-4 w-4 text-muted-foreground" />
              <span>Error Count</span>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {metrics.errorCount}
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Performance Insights</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            {metrics.averageResponseTime < 2000 && (
              <p>✅ Excellent response times - optimal for real-time writing assistance</p>
            )}
            {metrics.averageResponseTime >= 2000 && metrics.averageResponseTime < 5000 && (
              <p>⚠️ Moderate response times - consider switching models for faster performance</p>
            )}
            {metrics.averageResponseTime >= 5000 && (
              <p>🔴 Slow response times - check connection or try a faster model</p>
            )}
            {metrics.successRate >= 95 && (
              <p>✅ High reliability - provider performing well</p>
            )}
            {metrics.successRate < 95 && metrics.successRate >= 85 && (
              <p>⚠️ Some reliability issues - monitor for patterns</p>
            )}
            {metrics.successRate < 85 && (
              <p>🔴 Low reliability - consider switching providers</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIPerformanceMonitor;
