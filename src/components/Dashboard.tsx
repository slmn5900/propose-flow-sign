import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, Calculator, Receipt, TrendingUp, Users, Clock, DollarSign, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ProposalCard } from './ProposalCard';
import { EngagementChart } from './EngagementChart';
import DocumentList from './DocumentList';
import CustomerList from './CustomerList';

const Dashboard = () => {
  const { user, signOut } = useAuth();

  // Mock data for the overview
  const stats = [
    { title: 'Total Proposals', value: '12', change: 15, icon: FileText },
    { title: 'Total Revenue', value: '$45,200', change: 23, icon: DollarSign },
    { title: 'Avg. Engagement', value: '76%', change: 8, icon: TrendingUp },
    { title: 'Active Clients', value: '8', change: 12, icon: Users },
  ];

  const recentActivity = [
    { action: 'Proposal "Website Redesign" was viewed by client', time: '2 hours ago', color: 'bg-status-info' },
    { action: 'Estimate "Mobile App" was accepted', time: '4 hours ago', color: 'bg-status-success' },
    { action: 'Invoice INV-000001 payment received', time: '1 day ago', color: 'bg-status-success' },
    { action: 'New proposal "E-commerce Site" created', time: '2 days ago', color: 'bg-primary' },
  ];

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
    },
    {
      id: '3',
      title: 'E-commerce Platform',
      client: 'RetailCo',
      amount: 125000,
      status: 'sent' as const,
      viewTime: 0,
      lastActivity: '3 days ago',
      engagementScore: 0,
      sectionViews: []
    }
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
                <p className="text-sm text-muted-foreground">Proposal & Invoice Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Welcome, {user?.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
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
                {stats.map((stat, index) => (
                  <Card key={index} className="border-2 hover:border-primary/20 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="text-status-success">+{stat.change}%</span> from last month
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

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
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest proposal interactions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className={`w-2 h-2 rounded-full ${activity.color}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockProposals.map((proposal) => (
                      <ProposalCard key={proposal.id} {...proposal} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customers">
              <CustomerList />
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

export default Dashboard;