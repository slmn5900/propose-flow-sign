import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, MoreHorizontal, Pencil, Trash2, Star, StarOff, Users } from 'lucide-react';
import { toast } from 'sonner';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  role: z.string().optional(),
  department: z.string().optional(),
  notes: z.string().optional(),
  is_primary: z.boolean().default(false),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactDialogProps {
  customer: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContactDialog = ({ customer, open, onOpenChange }: ContactDialogProps) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      notes: '',
      is_primary: false,
    },
  });

  useEffect(() => {
    if (open && customer) {
      fetchContacts();
    }
  }, [open, customer]);

  useEffect(() => {
    if (editingContact) {
      form.reset({
        name: editingContact.name || '',
        email: editingContact.email || '',
        phone: editingContact.phone || '',
        role: editingContact.role || '',
        department: editingContact.department || '',
        notes: editingContact.notes || '',
        is_primary: editingContact.is_primary || false,
      });
    } else {
      form.reset({
        name: '',
        email: '',
        phone: '',
        role: '',
        department: '',
        notes: '',
        is_primary: false,
      });
    }
  }, [editingContact, form]);

  const fetchContacts = async () => {
    if (!customer) return;

    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('customer_id', customer.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch contacts');
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (data: ContactFormData) => {
    if (!user || !customer) return;

    setLoading(true);
    try {
      // If setting as primary, unset other primary contacts
      if (data.is_primary) {
        await supabase
          .from('contacts')
          .update({ is_primary: false })
          .eq('customer_id', customer.id);
      }

      const contactData = {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        role: data.role || null,
        department: data.department || null,
        notes: data.notes || null,
        is_primary: data.is_primary,
        customer_id: customer.id,
        created_by: user.id,
      };

      let error;
      if (editingContact) {
        ({ error } = await supabase
          .from('contacts')
          .update(contactData)
          .eq('id', editingContact.id));
      } else {
        ({ error } = await supabase
          .from('contacts')
          .insert(contactData));
      }

      if (error) throw error;

      toast.success(editingContact ? 'Contact updated successfully' : 'Contact created successfully');
      setShowForm(false);
      setEditingContact(null);
      fetchContacts();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Contact deleted successfully');
      fetchContacts();
    } catch (error: any) {
      toast.error('Failed to delete contact');
      console.error('Error:', error);
    }
  };

  const togglePrimary = async (contact: any) => {
    try {
      if (!contact.is_primary) {
        // Unset other primary contacts
        await supabase
          .from('contacts')
          .update({ is_primary: false })
          .eq('customer_id', customer.id);
      }

      const { error } = await supabase
        .from('contacts')
        .update({ is_primary: !contact.is_primary })
        .eq('id', contact.id);

      if (error) throw error;

      fetchContacts();
    } catch (error: any) {
      toast.error('Failed to update contact');
      console.error('Error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Contacts for {customer?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Contact Button */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Manage contacts for this customer
            </p>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>

          {/* Contact Form */}
          {showForm && (
            <div className="border rounded-lg p-6 bg-muted/50">
              <h3 className="text-lg font-semibold mb-4">
                {editingContact ? 'Edit Contact' : 'Add New Contact'}
              </h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Contact name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contact@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Sales Manager" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Sales" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional notes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name="is_primary"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="cursor-pointer">Primary Contact</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      {editingContact ? 'Update Contact' : 'Add Contact'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowForm(false);
                        setEditingContact(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {/* Contacts Table */}
          {contacts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No contacts yet</h3>
              <p className="text-muted-foreground">Add the first contact for this customer.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Primary</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.role || '-'}</TableCell>
                    <TableCell>{contact.department || '-'}</TableCell>
                    <TableCell>{contact.phone || '-'}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePrimary(contact)}
                      >
                        {contact.is_primary ? (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        ) : (
                          <StarOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingContact(contact);
                              setShowForm(true);
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(contact.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDialog;