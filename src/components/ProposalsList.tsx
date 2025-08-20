import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { 
  Plus, Search, Filter, Eye, Edit, Copy, Trash2, Send, 
  FileText, Clock, CheckCircle, XCircle, AlertCircle, 
  MoreHorizontal, Calendar, DollarSign 
} from 'lucide-react';
import ProposalBuilder from './proposals/ProposalBuilder';
import ProposalPreview from './proposals/ProposalPreview';

interface Proposal {
  id: string;
  title: string;
  description: string | null;
  client_name: string;
  client_email: string;
  client_company: string | null;
  status: string;
  total_amount: number | null;
  currency: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  version: number | null;
  created_by: string;
}

const ProposalsList = () => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [builderMode, setBuilderMode] = useState<'create' | 'edit'>('create');

  // Fetch proposals
  const fetchProposals = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('created_by', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProposals(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [user]);

  // Delete proposal
  const deleteProposal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Proposal deleted successfully",
      });
      
      fetchProposals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Duplicate proposal
  const duplicateProposal = async (proposal: Proposal) => {
    if (!user) return;
    
    try {
      const { id, created_at, updated_at, ...proposalData } = proposal;
      
      const duplicateData = {
        ...proposalData,
        title: `${proposal.title} (Copy)`,
        status: 'draft',
        version: (proposal.version || 1) + 1,
        parent_id: proposal.id,
        created_by: user.id,
      };

      const { error } = await supabase
        .from('proposals')
        .insert(duplicateData);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Proposal duplicated successfully",
      });
      
      fetchProposals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Filter proposals
  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.client_company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Status configurations
  const statusConfig: Record<string, { icon: any, color: string, label: string }> = {
    draft: { icon: FileText, color: 'bg-gray-500', label: 'Draft' },
    sent: { icon: Send, color: 'bg-blue-500', label: 'Sent' },
    viewed: { icon: Eye, color: 'bg-yellow-500', label: 'Viewed' },
    signed: { icon: CheckCircle, color: 'bg-green-500', label: 'Signed' },
    rejected: { icon: XCircle, color: 'bg-red-500', label: 'Rejected' }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCreateNew = () => {
    setSelectedProposal(null);
    setBuilderMode('create');
    setShowBuilder(true);
  };

  const handleEdit = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setBuilderMode('edit');
    setShowBuilder(true);
  };

  const handlePreview = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setShowPreview(true);
  };

  const handleBuilderSuccess = () => {
    setShowBuilder(false);
    fetchProposals();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Proposals</h1>
          <p className="text-muted-foreground mt-1">
            Create, manage, and track your business proposals
          </p>
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          New Proposal
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
                <SelectItem value="signed">Signed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Proposals Grid */}
      {filteredProposals.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {proposals.length === 0 ? 'No proposals yet' : 'No matching proposals'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {proposals.length === 0 
                ? 'Create your first proposal to get started with professional client presentations.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {proposals.length === 0 && (
              <Button onClick={handleCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Proposal
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProposals.map((proposal) => {
            const StatusIcon = statusConfig[proposal.status]?.icon || FileText;
            
            return (
              <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{proposal.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {proposal.client_name}
                        {proposal.client_company && ` • ${proposal.client_company}`}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="gap-1 ml-2">
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig[proposal.status]?.label || proposal.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">
                        {formatCurrency(proposal.total_amount || 0, proposal.currency)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Updated:</span>
                      <span>{formatDate(proposal.updated_at)}</span>
                    </div>
                    
                    {proposal.expires_at && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Expires:</span>
                        <span className={new Date(proposal.expires_at) < new Date() ? 'text-red-500' : ''}>
                          {formatDate(proposal.expires_at)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {proposal.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {proposal.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(proposal)}
                      className="gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Preview
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(proposal)}
                      className="gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-64">
                        <DialogHeader>
                          <DialogTitle>Proposal Actions</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2">
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-2"
                            onClick={() => duplicateProposal(proposal)}
                          >
                            <Copy className="h-4 w-4" />
                            Duplicate
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" className="w-full justify-start gap-2 text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Proposal</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{proposal.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteProposal(proposal.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Proposal Builder Modal */}
      {showBuilder && (
        <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
          <DialogContent className="max-w-none w-[95vw] h-[95vh] p-0">
            <ProposalBuilder
              proposal={selectedProposal}
              onSuccess={handleBuilderSuccess}
              onCancel={() => setShowBuilder(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Proposal Preview Modal */}
      {showPreview && selectedProposal && (
        <ProposalPreview
          proposal={selectedProposal}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default ProposalsList;