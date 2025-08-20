import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Edit,
  Calendar,
  FileText,
  Receipt,
  Calculator
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import CustomerInsights from './CustomerInsights';
import CustomerCommunication from './CustomerCommunication';
import ContactDialog from './ContactDialog';
import EnhancedCustomerForm from './forms/EnhancedCustomerForm';

interface CustomerDetailViewProps {
  customer: any;
  isOpen: boolean;
  onClose: () => void;
  onCustomerUpdated: () => void;
}

const CustomerDetailView = ({ customer, isOpen, onClose, onCustomerUpdated }: CustomerDetailViewProps) => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [documents, setDocuments] = useState({
    proposals: [],
    estimates: [],
    invoices: []
  });
  const [editMode, setEditMode] = useState(false);
  const [contactDialog, setContactDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer && isOpen) {
      fetchCustomerData();
    }
  }, [customer, isOpen]);

  const fetchCustomerData = async () => {
    if (!customer) return;

    setLoading(true);
    try {
      // Fetch contacts
      const { data: contactsData } = await supabase
        .from('contacts')
        .select('*')
        .eq('customer_id', customer.id)
        .order('is_primary', { ascending: false });

      // Fetch proposals
      const { data: proposalsData } = await supabase
        .from('proposals')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });

      // Fetch estimates
      const { data: estimatesData } = await supabase
        .from('estimates')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });

      // Fetch invoices
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });

      setContacts(contactsData || []);
      setDocuments({
        proposals: proposalsData || [],
        estimates: estimatesData || [],
        invoices: invoicesData || []
      });
    } catch (error) {
      console.error('Error fetching customer data:', error);
      toast.error('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerUpdate = () => {
    setEditMode(false);
    onCustomerUpdated();
    fetchCustomerData();
  };

  const handleContactUpdate = () => {
    setContactDialog(false);
    fetchCustomerData();
  };

  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {customer.name}
              {customer.company && (
                <Badge variant="secondary">{customer.company}</Badge>
              )}
            </DialogTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setEditMode(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </DialogHeader>

        {editMode ? (
          <EnhancedCustomerForm
            customer={customer}
            onSuccess={handleCustomerUpdate}
            onCancel={() => setEditMode(false)}
          />
        ) : (
          <div className="space-y-6">
            {/* Customer Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{customer.name}</span>
                  </div>
                  {customer.company && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.company}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.email}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a href={customer.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {customer.website}
                      </a>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.address}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {customer.status || 'Active'}
                  </Badge>
                  {customer.industry && (
                    <Badge variant="secondary">
                      {customer.industry}
                    </Badge>
                  )}
                  {customer.tags && customer.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {customer.notes && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground">{customer.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tabbed Content */}
            <Tabs defaultValue="insights" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="communication">Communication</TabsTrigger>
                <TabsTrigger value="contacts">Contacts</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="insights" className="mt-6">
                <CustomerInsights customerId={customer.id} customer={customer} />
              </TabsContent>

              <TabsContent value="communication" className="mt-6">
                <CustomerCommunication customer={customer} contacts={contacts} />
              </TabsContent>

              <TabsContent value="contacts" className="mt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Contact Management</h3>
                    <Button onClick={() => setContactDialog(true)}>
                      Add Contact
                    </Button>
                  </div>
                  
                  {contacts.length > 0 ? (
                    <div className="grid gap-4">
                      {contacts.map(contact => (
                        <Card key={contact.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{contact.name}</h4>
                                <p className="text-sm text-muted-foreground">{contact.email}</p>
                                {contact.role && (
                                  <Badge variant="outline" className="mt-1">
                                    {contact.role}
                                  </Badge>
                                )}
                                {contact.is_primary && (
                                  <Badge className="mt-1 ml-2">Primary</Badge>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {contact.phone && (
                                  <Button size="sm" variant="outline">
                                    <Phone className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button size="sm" variant="outline">
                                  <Mail className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            {contact.notes && (
                              <p className="text-xs text-muted-foreground mt-2">{contact.notes}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No contacts added yet</p>
                        <Button onClick={() => setContactDialog(true)} className="mt-4">
                          Add First Contact
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="documents" className="mt-6">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Proposals ({documents.proposals.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {documents.proposals.length > 0 ? (
                        <div className="space-y-2">
                          {documents.proposals.map((proposal: any) => (
                            <div key={proposal.id} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <p className="font-medium">{proposal.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(proposal.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant="outline">{proposal.status}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No proposals</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Estimates ({documents.estimates.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {documents.estimates.length > 0 ? (
                        <div className="space-y-2">
                          {documents.estimates.map((estimate: any) => (
                            <div key={estimate.id} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <p className="font-medium">{estimate.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(estimate.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant="outline">{estimate.status}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No estimates</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Invoices ({documents.invoices.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {documents.invoices.length > 0 ? (
                        <div className="space-y-2">
                          {documents.invoices.map((invoice: any) => (
                            <div key={invoice.id} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <p className="font-medium">{invoice.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(invoice.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant="outline">{invoice.status}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No invoices</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Customer Timeline
                    </CardTitle>
                    <CardDescription>
                      Complete interaction history with this customer
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                        <div>
                          <p className="font-medium">Customer created</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(customer.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {/* Add more timeline events based on activity logs */}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Contact Dialog */}
        <ContactDialog
          customer={customer}
          open={contactDialog}
          onOpenChange={setContactDialog}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailView;