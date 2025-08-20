import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button-enhanced"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ProposalCard } from "./ProposalCard"
import { EngagementChart } from "./EngagementChart"
import { 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Plus, 
  Search,
  Bell,
  Settings,
  Filter,
  Download,
  Mail
} from "lucide-react"

// Mock data
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
  },
  {
    id: '4',
    title: 'Brand Identity Package',
    client: 'BrandNew Ltd.',
    amount: 15000,
    status: 'paid' as const,
    viewTime: 18,
    lastActivity: '1 week ago',
    engagementScore: 78,
    sectionViews: [
      { section: 'Deliverables', time: 4.2 },
      { section: 'Process', time: 3.5 },
      { section: 'Pricing', time: 2.8 }
    ]
  }
]

const stats = [
  { 
    title: 'Active Proposals', 
    value: '12', 
    change: '+2', 
    icon: FileText, 
    color: 'text-brand-primary',
    bgColor: 'bg-brand-primary/10'
  },
  { 
    title: 'Total Revenue', 
    value: '$450K', 
    change: '+18%', 
    icon: DollarSign, 
    color: 'text-success',
    bgColor: 'bg-success/10'
  },
  { 
    title: 'Avg. Engagement', 
    value: '76%', 
    change: '+5%', 
    icon: TrendingUp, 
    color: 'text-info',
    bgColor: 'bg-info/10'
  },
  { 
    title: 'Active Clients', 
    value: '8', 
    change: '+1', 
    icon: Users, 
    color: 'text-warning',
    bgColor: 'bg-warning/10'
  }
]

export function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  const filteredProposals = mockProposals.filter(proposal =>
    proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proposal.client.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-dashboard-bg">
      {/* Header */}
      <header className="bg-dashboard-card border-b border-dashboard-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-foreground">ProposalFlow</h1>
            <Badge variant="secondary" className="bg-brand-primary/10 text-brand-primary">
              Professional
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="brand">
              <Plus className="h-4 w-4 mr-2" />
              New Proposal
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-dashboard-card border-r border-dashboard-border h-screen sticky top-0">
          <nav className="p-4 space-y-2">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'proposals', label: 'Proposals', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'clients', label: 'Clients', icon: Users },
            ].map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "brand" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <Card key={index} className="p-6 bg-dashboard-card border border-dashboard-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className={`text-sm ${stat.color} font-medium`}>{stat.change}</p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Engagement Analytics */}
              <EngagementChart />

              {/* Recent Proposals */}
              <Card className="p-6 bg-dashboard-card border border-dashboard-border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Recent Proposals</h2>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {mockProposals.slice(0, 4).map((proposal) => (
                    <ProposalCard key={proposal.id} {...proposal} />
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'proposals' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">All Proposals</h2>
                <div className="flex space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search proposals..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="brand">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Proposal
                  </Button>
                </div>
              </div>

              {/* Proposals Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProposals.map((proposal) => (
                  <ProposalCard key={proposal.id} {...proposal} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
              <EngagementChart />
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Client Management</h2>
              <Card className="p-8 bg-dashboard-card border border-dashboard-border text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Client Management</h3>
                <p className="text-muted-foreground mb-4">
                  Manage your clients and track their engagement with your proposals.
                </p>
                <Button variant="brand">
                  <Mail className="h-4 w-4 mr-2" />
                  Invite Client
                </Button>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}