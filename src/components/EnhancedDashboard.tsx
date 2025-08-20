import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Calculator, Receipt, TrendingUp, Users, Clock, DollarSign, LogOut, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/integrations/supabase/client';
import { ProposalCard } from './ProposalCard';
import { EngagementChart } from './EngagementChart';
import DocumentList from './DocumentList';
import EnhancedCustomerList from './EnhancedCustomerList';

const EnhancedDashboard = () => {
  const { user, signOut } = useAuth();
  const { userRole, isAdmin } = useRole();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalProposals: 0,
    totalEstimates: 0,
    totalInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalRevenue: 0,
    paidRevenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch customers count
      const { count: customersCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user!.id);

      // Fetch proposals count
      const { count: proposalsCount } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user!.id);

      // Fetch estimates count
      const { count: estimatesCount } = await supabase
        .from('estimates')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user!.id);

      // Fetch invoices data
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('created_by', user!.id);

      // Calculate invoice stats
      const totalInvoices = invoices?.length || 0;
      const pendingInvoices = invoices?.filter(inv => inv.status === 'sent' || inv.status === 'draft').length || 0;
      const overdueInvoices = invoices?.filter(inv => 
        inv.status !== 'paid' && inv.due_date && new Date(inv.due_date) < new Date()
      ).length || 0;
      const totalRevenue = invoices?.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0) || 0;
      const paidRevenue = invoices?.filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0) || 0;

      // Fetch recent activity
      const { data: activity } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setStats({
        totalCustomers: customersCount || 0,
        totalProposals: proposalsCount || 0,
        totalEstimates: estimatesCount || 0,
        totalInvoices,
        pendingInvoices,
        overdueInvoices,
        totalRevenue,
        paidRevenue,
      });

      setRecentActivity(activity || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const mockProposals = [
    {
      id: '1',
      title: 'Website Redesign Proposal',
      client: 'TechCorp Inc.',
      amount: 45000,
      status: 'viewed' as const,
      viewTime: 12,
      lastActivity: '2 hours ago',
      engagementScore: 85,
      sectionViews: [
        { section: 'Pricing', time: 5.2 },
        { section: 'Timeline', time: 3.8 },
        { section: 'Team', time: 2.1 }
      ]
    },
    {
      id: '2',
      title: 'Mobile App Development',
      client: 'StartupXYZ',
      amount: 75000,
      status: 'signed' as const,
      viewTime: 28,
      lastActivity: '1 day ago',
      engagementScore: 92,
      sectionViews: [
        { section: 'Features', time: 8.5 },
        { section: 'Pricing', time: 6.2 },
        { section: 'Timeline', time: 4.8 }
      ]
    }
  ];

  const statsCards = [
    { 
      title: 'Total Customers', 
      value: stats.totalCustomers.toString(), 
      icon: Users,
      color: 'text-blue-600'
    },
    { 
      title: 'Active Proposals', 
      value: stats.totalProposals.toString(), 
      icon: FileText,
      color: 'text-purple-600'
    },
    { 
      title: 'Total Revenue', 
      value: formatCurrency(stats.totalRevenue), 
      icon: DollarSign,
      color: 'text-green-600'
    },
    { 
      title: 'Paid Revenue', 
      value: formatCurrency(stats.paidRevenue), 
      icon: CheckCircle2,
      color: 'text-emerald-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">ProposalHub</h1>
                <p className="text-sm text-muted-foreground">Complete Business Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Welcome, {user?.email}</span>
                {userRole && (
                  <Badge variant="secondary" className="ml-2">
                    {userRole.role}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6">
          <Link to="/proposals">
            <Button className="gap-2">
              <FileText className="h-4 w-4" />
              Manage Proposals
            </Button>
          </Link>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="proposals">Proposals</TabsTrigger>
              <TabsTrigger value="estimates">Estimates</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat, index) => (
                  <Card key={index} className="border-2 hover:border-primary/20 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Alert Cards */}
              {(stats.overdueInvoices > 0 || stats.pendingInvoices > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stats.overdueInvoices > 0 && (
                    <Card className="border-destructive">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-destructive">
                          Overdue Invoices
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-destructive">{stats.overdueInvoices}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Require immediate attention
                        </p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {stats.pendingInvoices > 0 && (
                    <Card className="border-yellow-500">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-600">
                          Pending Invoices
                        </CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pendingInvoices}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Awaiting payment
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Analytics</CardTitle>
                    <CardDescription>Real-time document engagement tracking</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EngagementChart />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Business Overview</CardTitle>
                    <CardDescription>Key performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">Total Estimates</span>
                      <span className="text-lg font-bold">{stats.totalEstimates}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">Total Invoices</span>
                      <span className="text-lg font-bold">{stats.totalInvoices}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">Collection Rate</span>
                      <span className="text-lg font-bold">
                        {stats.totalRevenue > 0 
                          ? Math.round((stats.paidRevenue / stats.totalRevenue) * 100) 
                          : 0}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Proposals */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Proposals</CardTitle>
                  <CardDescription>Your latest proposal submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockProposals.map((proposal) => (
                      <ProposalCard key={proposal.id} {...proposal} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customers">
              <EnhancedCustomerList />
            </TabsContent>

            <TabsContent value="proposals">
              <DocumentList type="proposals" />
            </TabsContent>

            <TabsContent value="estimates">
              <DocumentList type="estimates" />
            </TabsContent>

            <TabsContent value="invoices">
              <DocumentList type="invoices" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;