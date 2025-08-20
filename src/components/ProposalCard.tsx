import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button-enhanced"
import { Badge } from "@/components/ui/badge"
import { Eye, Clock, FileText, DollarSign, TrendingUp, Users } from "lucide-react"

interface ProposalCardProps {
  id: string
  title: string
  client: string
  amount: number
  status: 'draft' | 'sent' | 'viewed' | 'signed' | 'paid'
  viewTime: number
  lastActivity: string
  engagementScore: number
  sectionViews: { section: string; time: number }[]
}

const statusConfig = {
  draft: { color: 'bg-status-draft text-white', label: 'Draft' },
  sent: { color: 'bg-status-sent text-white', label: 'Sent' },
  viewed: { color: 'bg-status-viewed text-white', label: 'Viewed' },
  signed: { color: 'bg-status-signed text-white', label: 'Signed' },
  paid: { color: 'bg-status-paid text-white', label: 'Paid' }
}

export function ProposalCard({ 
  id, 
  title, 
  client, 
  amount, 
  status, 
  viewTime, 
  lastActivity, 
  engagementScore,
  sectionViews 
}: ProposalCardProps) {
  const config = statusConfig[status]
  const formattedAmount = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(amount)

  return (
    <Card className="p-6 bg-dashboard-card border border-dashboard-border hover:shadow-lg transition-all duration-300 hover:border-brand-primary/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{client}</p>
        </div>
        <Badge className={`${config.color} font-medium`}>
          {config.label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-success" />
          <span className="font-semibold text-success">{formattedAmount}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-info" />
          <span className="text-sm text-muted-foreground">{viewTime}min viewed</span>
        </div>
      </div>

      {/* Engagement Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Engagement Score</span>
          <span className="text-sm font-bold text-brand-primary">{engagementScore}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-brand-primary to-info h-2 rounded-full transition-all duration-500"
            style={{ width: `${engagementScore}%` }}
          />
        </div>
      </div>

      {/* Section Views Preview */}
      {sectionViews.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            Top Sections
          </h4>
          <div className="space-y-1">
            {sectionViews.slice(0, 2).map((section, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{section.section}</span>
                <span className="text-info font-medium">{section.time}min</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-dashboard-border">
        <p className="text-xs text-muted-foreground">
          Last activity: {lastActivity}
        </p>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button variant="brand" size="sm">
            <FileText className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </div>
    </Card>
  )
}