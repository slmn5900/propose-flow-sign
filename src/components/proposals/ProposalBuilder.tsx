import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { 
  Loader2, Save, Send, Eye, Copy, FileText, 
  Settings, Palette, Layout, DollarSign, Clock, 
  Upload, Signature, Mail, Download, Users, Search
} from 'lucide-react';
import ProposalCoverPage from './ProposalCoverPage';
import ProposalSectionBuilder from './ProposalSectionBuilder';
import ProposalPricingTable from './ProposalPricingTable';
import ProposalPreview from './ProposalPreview';
import ProposalEmailSender from './ProposalEmailSender';

const proposalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  client_name: z.string().min(1, 'Client name is required'),
  client_email: z.string().email('Valid email is required'),
  client_company: z.string().optional(),
  total_amount: z.string().optional(),
  currency: z.string().default('USD'),
  expires_at: z.string().optional(),
  status: z.enum(['draft', 'sent', 'viewed', 'signed', 'rejected']).default('draft'),
  signature_required: z.boolean().default(true),
});

type ProposalFormData = z.infer<typeof proposalSchema>;

interface ProposalBuilderProps {
  proposal?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
  customerId?: string;
}

const ProposalBuilder = ({ proposal, onSuccess, onCancel, customerId }: ProposalBuilderProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [showPreview, setShowPreview] = useState(false);
  const [showEmailSender, setShowEmailSender] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');

  // Proposal content state
  const [coverPage, setCoverPage] = useState(proposal?.cover_page || {
    logo_url: '',
    company_name: '',
    about_us: '',
    custom_text: ''
  });
  
  const [sections, setSections] = useState(proposal?.sections || []);
  const [pricingTable, setPricingTable] = useState(proposal?.pricing_table || {
    items: [],
    variants: []
  });
  
  const [attachments, setAttachments] = useState(proposal?.attachments || []);
  const [notes, setNotes] = useState(proposal?.notes || '');
  const [signatureRequired, setSignatureRequired] = useState(proposal?.signature_required || true);

  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: proposal?.title || '',
      description: proposal?.description || '',
      client_name: proposal?.client_name || '',
      client_email: proposal?.client_email || '',
      client_company: proposal?.client_company || '',
      total_amount: proposal?.total_amount?.toString() || '',
      currency: proposal?.currency || 'USD',
      expires_at: proposal?.expires_at ? new Date(proposal.expires_at).toISOString().split('T')[0] : '',
      status: proposal?.status || 'draft',
      signature_required: proposal?.signature_required || true,
    },
  });

  // Fetch customers for selection
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('created_by', user.id)
          .order('name');

        if (error) throw error;
        setCustomers(data || []);

        // If editing a proposal with a customer_id, find and set the customer
        if (proposal?.customer_id) {
          const customer = data?.find(c => c.id === proposal.customer_id);
          if (customer) {
            setSelectedCustomer(customer);
          }
        }
        
        // If creating from a specific customer, pre-select them
        if (customerId && !proposal) {
          const customer = data?.find(c => c.id === customerId);
          if (customer) {
            setSelectedCustomer(customer);
            form.setValue('client_name', customer.name);
            form.setValue('client_email', customer.email);
            form.setValue('client_company', customer.company || '');
          }
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to fetch customers",
          variant: "destructive",
        });
      }
    };

    fetchCustomers();
  }, [user, proposal, customerId]);

  // Handle customer selection
  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    form.setValue('client_name', customer.name);
    form.setValue('client_email', customer.email);
    form.setValue('client_company', customer.company || '');
    setCustomerSearchTerm('');
  };

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.company?.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (proposal?.id && user) {
        handleAutoSave();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSave);
  }, [coverPage, sections, pricingTable, notes, signatureRequired]);

  const handleAutoSave = async () => {
    if (!user || !proposal?.id) return;
    
    setSaving(true);
    try {
      const proposalData = {
        cover_page: coverPage,
        sections: sections,
        pricing_table: pricingTable,
        attachments: attachments,
        notes: notes,
        signature_required: signatureRequired,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('proposals')
        .update(proposalData)
        .eq('id', proposal.id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Auto-save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = async (data: ProposalFormData) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const proposalData = {
        title: data.title,
        description: data.description || null,
        client_name: data.client_name,
        client_email: data.client_email,
        client_company: data.client_company || null,
        total_amount: data.total_amount ? parseFloat(data.total_amount) : null,
        currency: data.currency,
        expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
        status: data.status,
        signature_required: data.signature_required,
        customer_id: selectedCustomer?.id || customerId || null,
        cover_page: coverPage,
        sections: sections,
        pricing_table: pricingTable,
        attachments: attachments,
        notes: notes,
        created_by: user.id,
      };

      if (proposal) {
        const { error } = await supabase
          .from('proposals')
          .update(proposalData)
          .eq('id', proposal.id);

        if (error) throw error;
        toast({ title: "Success", description: "Proposal updated successfully" });
      } else {
        const { error } = await supabase
          .from('proposals')
          .insert(proposalData);

        if (error) throw error;
        toast({ title: "Success", description: "Proposal created successfully" });
      }

      onSuccess?.();
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

  const handleDuplicate = async () => {
    if (!proposal || !user) return;

    setLoading(true);
    try {
      const duplicateData = {
        ...proposal,
        id: undefined,
        title: `${proposal.title} (Copy)`,
        status: 'draft',
        created_at: undefined,
        updated_at: undefined,
        signed_at: null,
        signature_data: null,
        version: (proposal.version || 1) + 1,
        parent_id: proposal.id,
      };

      const { error } = await supabase
        .from('proposals')
        .insert(duplicateData);

      if (error) throw error;
      toast({ title: "Success", description: "Proposal duplicated successfully" });
      onSuccess?.();
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

  const calculateTotal = () => {
    const items = pricingTable.items || [];
    return items.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.unit_price);
    }, 0);
  };

  // Update total amount when pricing table changes
  useEffect(() => {
    const total = calculateTotal();
    form.setValue('total_amount', total.toString());
  }, [pricingTable]);

  return (
    <div className="h-full flex flex-col">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {proposal ? 'Edit Proposal' : 'Create New Proposal'}
            </h1>
            <p className="text-muted-foreground">
              {proposal ? 'Update your proposal details' : 'Build a professional proposal'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {saving && (
              <Badge variant="outline" className="animate-pulse">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Auto-saving...
              </Badge>
            )}
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            {proposal && (
              <>
                <Button
                  variant="outline"
                  onClick={handleDuplicate}
                  disabled={loading}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEmailSender(true)}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs - Fixed */}
      <div className="flex-shrink-0 p-6 pb-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details" className="gap-2">
              <Settings className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="cover" className="gap-2">
              <Layout className="h-4 w-4" />
              Cover Page
            </TabsTrigger>
            <TabsTrigger value="sections" className="gap-2">
              <FileText className="h-4 w-4" />
              Sections
            </TabsTrigger>
            <TabsTrigger value="pricing" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="finalize" className="gap-2">
              <Signature className="h-4 w-4" />
              Finalize
            </TabsTrigger>
          </TabsList>

          {/* Scrollable Content Area */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Proposal Details</CardTitle>
                  <CardDescription>Basic information about your proposal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Proposal title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="sent">Sent</SelectItem>
                              <SelectItem value="viewed">Viewed</SelectItem>
                              <SelectItem value="signed">Signed</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Brief description of the proposal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Customer Selection */}
                  <Card className="p-4 bg-muted/5">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Client Information</h3>
                        {selectedCustomer && (
                          <Badge variant="outline" className="gap-1">
                            <Users className="h-3 w-3" />
                            From Customer Database
                          </Badge>
                        )}
                      </div>
                      
                      {!selectedCustomer ? (
                        <div className="space-y-3">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search existing customers..."
                              value={customerSearchTerm}
                              onChange={(e) => setCustomerSearchTerm(e.target.value)}
                              className="pl-9"
                            />
                          </div>
                          
                          {customerSearchTerm && filteredCustomers.length > 0 && (
                            <div className="border rounded-lg max-h-40 overflow-y-auto">
                              {filteredCustomers.slice(0, 5).map((customer) => (
                                <button
                                  key={customer.id}
                                  type="button"
                                  onClick={() => handleCustomerSelect(customer)}
                                  className="w-full text-left p-3 hover:bg-muted/50 border-b last:border-b-0 transition-colors"
                                >
                                  <div className="font-medium">{customer.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {customer.email}
                                    {customer.company && ` • ${customer.company}`}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                          
                          <p className="text-sm text-muted-foreground">
                            Search for an existing customer or fill in the fields below manually
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                          <div>
                            <div className="font-medium">{selectedCustomer.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {selectedCustomer.email}
                              {selectedCustomer.company && ` • ${selectedCustomer.company}`}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCustomer(null)}
                          >
                            Change
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="client_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Doe" 
                              {...field}
                              disabled={!!selectedCustomer}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="client_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Email *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="john@example.com" 
                              type="email" 
                              {...field}
                              disabled={!!selectedCustomer}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="client_company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Company</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Acme Corp" 
                              {...field}
                              disabled={!!selectedCustomer}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expires_at"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expires At</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="total_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Amount</FormLabel>
                          <FormControl>
                            <Input placeholder="0.00" type="number" step="0.01" {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cover Page Tab */}
            <TabsContent value="cover">
              <ProposalCoverPage
                coverPage={coverPage}
                onCoverPageChange={setCoverPage}
              />
            </TabsContent>

            {/* Sections Tab */}
            <TabsContent value="sections">
              <ProposalSectionBuilder
                sections={sections}
                onSectionsChange={setSections}
              />
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing">
              <ProposalPricingTable
                pricingTable={pricingTable}
                onPricingTableChange={setPricingTable}
                currency={form.watch('currency')}
              />
            </TabsContent>

            {/* Finalize Tab */}
            <TabsContent value="finalize" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notes & Attachments</CardTitle>
                  <CardDescription>Additional information and files</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Internal Notes</label>
                    <Textarea
                      placeholder="Internal notes (not visible to client)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Attachments</label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drag & drop files here or click to browse
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Choose Files
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="signature_required"
                      checked={signatureRequired}
                      onChange={(e) => setSignatureRequired(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="signature_required" className="text-sm font-medium">
                      Require electronic signature
                    </label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <div className="flex gap-2">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.setValue('status', 'draft')}
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {proposal ? 'Update Proposal' : 'Create Proposal'}
                </Button>
              </div>
            </div>
                  </form>
                </Form>
              </div>
            </ScrollArea>
          </div>
        </Tabs>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <ProposalPreview
          proposal={{
            ...form.getValues(),
            cover_page: coverPage,
            sections: sections,
            pricing_table: pricingTable,
            notes: notes,
            signature_required: signatureRequired,
          }}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Email Sender Modal */}
      {showEmailSender && proposal && (
        <ProposalEmailSender
          proposal={proposal}
          onClose={() => setShowEmailSender(false)}
          onSuccess={() => {
            setShowEmailSender(false);
            toast({ title: "Success", description: "Proposal sent successfully" });
          }}
        />
      )}
    </div>
  );
};

export default ProposalBuilder;