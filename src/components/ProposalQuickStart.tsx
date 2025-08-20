import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { 
  Plus, FileText, Users, Zap, Search, 
  Building, Mail, Calendar, DollarSign 
} from 'lucide-react';
import ProposalBuilder from './proposals/ProposalBuilder';

interface ProposalQuickStartProps {
  onProposalCreated?: () => void;
}

const ProposalQuickStart = ({ onProposalCreated }: ProposalQuickStartProps) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBuilder, setShowBuilder] = useState(false);
  const [mode, setMode] = useState<'select' | 'manual'>('select');

  useEffect(() => {
    fetchRecentCustomers();
  }, [user]);

  const fetchRecentCustomers = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('created_by', user.id)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    setShowBuilder(true);
  };

  const handleBuilderSuccess = () => {
    setShowBuilder(false);
    setSelectedCustomer(null);
    onProposalCreated?.();
    toast({
      title: "Success",
      description: "Proposal created successfully!",
    });
  };

  const quickStartOptions = [
    {
      icon: Users,
      title: 'From Existing Customer',
      description: 'Create a proposal for an existing customer',
      action: () => setMode('select'),
      color: 'text-blue-600'
    },
    {
      icon: FileText,
      title: 'Blank Proposal',
      description: 'Start with a fresh proposal template',
      action: () => {
        setSelectedCustomer(null);
        setShowBuilder(true);
      },
      color: 'text-green-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Start Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickStartOptions.map((option, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent 
              className="p-6 flex items-center space-x-4"
              onClick={option.action}
            >
              <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center ${option.color}`}>
                <option.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{option.title}</h3>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Customer Selection */}
      {mode === 'select' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Customer
            </CardTitle>
            <CardDescription>
              Choose an existing customer to create a proposal for
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Customer List */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map(customer => (
                  <div
                    key={customer.id}
                    onClick={() => handleCustomerSelect(customer)}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{customer.name}</span>
                          {customer.company && (
                            <Badge variant="secondary" className="text-xs">
                              {customer.company}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </span>
                          {customer.industry && (
                            <span className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {customer.industry}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Select
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>
                    {searchTerm ? 'No customers found matching your search' : 'No customers found'}
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setShowBuilder(true);
                    }}
                  >
                    Create Blank Proposal Instead
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="ghost" onClick={() => setMode('select')}>
                Back to Options
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedCustomer(null);
                  setShowBuilder(true);
                }}
              >
                Create Blank Proposal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Proposals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Your recent proposals will appear here</p>
          </div>
        </CardContent>
      </Card>

      {/* Proposal Builder Modal */}
      {showBuilder && (
        <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
          <DialogContent className="max-w-none w-[95vw] h-[95vh] p-0">
            <ProposalBuilder
              customerId={selectedCustomer?.id}
              onSuccess={handleBuilderSuccess}
              onCancel={() => {
                setShowBuilder(false);
                setSelectedCustomer(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProposalQuickStart;