import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CustomerInsightsProps {
  customerId: string;
  customer: any;
}

interface CustomerMetrics {
  totalRevenue: number;
  proposalCount: number;
  proposalWinRate: number;
  averageInvoiceValue: number;
  averagePaymentDelay: number;
  lastContactDate: string | null;
  riskScore: number;
  nextFollowUp: string | null;
}

const CustomerInsights = ({ customerId, customer }: CustomerInsightsProps) => {
  const [metrics, setMetrics] = useState<CustomerMetrics>({
    totalRevenue: 0,
    proposalCount: 0,
    proposalWinRate: 0,
    averageInvoiceValue: 0,
    averagePaymentDelay: 0,
    lastContactDate: null,
    riskScore: 0,
    nextFollowUp: null,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerMetrics();
    fetchRecentActivity();
  }, [customerId]);

  const fetchCustomerMetrics = async () => {
    try {
      // Fetch proposals
      const { data: proposals } = await supabase
        .from('proposals')
        .select('*')
        .eq('customer_id', customerId);

      // Fetch invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('customer_id', customerId);

      // Calculate metrics
      const totalRevenue = invoices?.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0) || 0;
      const proposalCount = proposals?.length || 0;
      const signedProposals = proposals?.filter(p => p.status === 'signed').length || 0;
      const proposalWinRate = proposalCount > 0 ? (signedProposals / proposalCount) * 100 : 0;
      const averageInvoiceValue = invoices && invoices.length > 0 ? totalRevenue / invoices.length : 0;

      // Calculate average payment delay
      const paidInvoices = invoices?.filter(inv => inv.status === 'paid' && inv.due_date && inv.paid_at) || [];
      const averagePaymentDelay = paidInvoices.length > 0 
        ? paidInvoices.reduce((sum, inv) => {
            const dueDate = new Date(inv.due_date);
            const paidDate = new Date(inv.paid_at);
            const delayDays = Math.max(0, Math.ceil((paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
            return sum + delayDays;
          }, 0) / paidInvoices.length
        : 0;

      // Calculate risk score (simple algorithm)
      let riskScore = 0;
      if (averagePaymentDelay > 30) riskScore += 30;
      if (proposalWinRate < 20) riskScore += 25;
      if (!customer.status || customer.status === 'inactive') riskScore += 45;
      
      // Get last contact date from activity logs
      const { data: lastActivity } = await supabase
        .from('activity_logs')
        .select('created_at')
        .eq('entity_id', customerId)
        .eq('entity_type', 'customer')
        .order('created_at', { ascending: false })
        .limit(1);

      setMetrics({
        totalRevenue,
        proposalCount,
        proposalWinRate,
        averageInvoiceValue,
        averagePaymentDelay,
        lastContactDate: lastActivity?.[0]?.created_at || null,
        riskScore: Math.min(100, riskScore),
        nextFollowUp: null, // Could be enhanced with actual follow-up logic
      });
    } catch (error) {
      console.error('Error fetching customer metrics:', error);
      toast.error('Failed to load customer insights');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data: activity } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('entity_id', customerId)
        .eq('entity_type', 'customer')
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentActivity(activity || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskLabel = (score: number) => {
    if (score < 30) return 'Low Risk';
    if (score < 70) return 'Medium Risk';
    return 'High Risk';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted rounded-lg animate-pulse" />
        <div className="h-48 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From {metrics.proposalCount} proposals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.proposalWinRate.toFixed(1)}%</div>
            <Progress value={metrics.proposalWinRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Invoice</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.averageInvoiceValue)}</div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Delay</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averagePaymentDelay.toFixed(0)} days</div>
            <p className="text-xs text-muted-foreground">
              Average delay
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessment & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
            <CardDescription>Customer relationship health score</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Risk Score</span>
              <Badge variant="secondary" className={getRiskColor(metrics.riskScore)}>
                {getRiskLabel(metrics.riskScore)}
              </Badge>
            </div>
            <Progress value={metrics.riskScore} className="w-full" />
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Last Contact: {metrics.lastContactDate 
                    ? new Date(metrics.lastContactDate).toLocaleDateString()
                    : 'Never'
                  }
                </span>
              </div>
              
              {metrics.riskScore > 50 && (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Requires attention</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Engage with this customer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Send Email Update
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Phone className="h-4 w-4 mr-2" />
              Schedule Call
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Create Proposal
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Set Follow-up Reminder
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest interactions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleDateString()} at{' '}
                      {new Date(activity.created_at).toLocaleTimeString()}
                    </p>
                    {activity.details && Object.keys(activity.details).length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {JSON.stringify(activity.details)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerInsights;