import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, Clock, Eye } from "lucide-react"

const sectionData = [
  { section: 'Executive Summary', time: 45, views: 12 },
  { section: 'Pricing', time: 62, views: 18 },
  { section: 'Timeline', time: 28, views: 8 },
  { section: 'Team', time: 35, views: 10 },
  { section: 'Case Studies', time: 52, views: 15 },
]

const pieData = [
  { name: 'High Engagement', value: 45, color: 'hsl(var(--success))' },
  { name: 'Medium Engagement', value: 35, color: 'hsl(var(--info))' },
  { name: 'Low Engagement', value: 20, color: 'hsl(var(--warning))' },
]

export function EngagementChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Section Engagement Bar Chart */}
      <Card className="p-6 bg-dashboard-card border border-dashboard-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-brand-primary" />
            Section Engagement
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sectionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--dashboard-border))" />
            <XAxis 
              dataKey="section" 
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--dashboard-card))',
                border: '1px solid hsl(var(--dashboard-border))',
                borderRadius: '8px'
              }}
            />
            <Bar 
              dataKey="time" 
              fill="hsl(var(--brand-primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Engagement Distribution Pie Chart */}
      <Card className="p-6 bg-dashboard-card border border-dashboard-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Users className="h-5 w-5 mr-2 text-brand-primary" />
            Engagement Distribution
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--dashboard-card))',
                border: '1px solid hsl(var(--dashboard-border))',
                borderRadius: '8px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center space-x-6 mt-4">
          {pieData.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Real-time Stats */}
      <Card className="p-6 bg-dashboard-card border border-dashboard-border lg:col-span-2">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-brand-primary" />
          Real-time Engagement Stats
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 p-4 rounded-lg border border-brand-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Viewers</p>
                <p className="text-2xl font-bold text-brand-primary">3</p>
              </div>
              <Eye className="h-8 w-8 text-brand-primary opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-success/10 to-success/5 p-4 rounded-lg border border-success/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Time</p>
                <p className="text-2xl font-bold text-success">4.2min</p>
              </div>
              <Clock className="h-8 w-8 text-success opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-info/10 to-info/5 p-4 rounded-lg border border-info/20">
            <div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-bold text-info">76%</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-warning/10 to-warning/5 p-4 rounded-lg border border-warning/20">
            <div>
              <p className="text-sm text-muted-foreground">Bounce Rate</p>
              <p className="text-2xl font-bold text-warning">24%</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}