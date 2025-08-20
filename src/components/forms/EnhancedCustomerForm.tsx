import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Loader2, X, Plus } from 'lucide-react';
import { toast } from 'sonner';

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().optional(),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  industry: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface EnhancedCustomerFormProps {
  customer?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Real Estate',
  'Consulting',
  'Marketing',
  'Other'
];

const EnhancedCustomerForm = ({ customer, onSuccess, onCancel }: EnhancedCustomerFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>(customer?.tags || []);
  const [newTag, setNewTag] = useState('');

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name || '',
      company: customer?.company || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      website: customer?.website || '',
      address: customer?.address || '',
      industry: customer?.industry || '',
      status: customer?.status || 'active',
      notes: customer?.notes || '',
    },
  });

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data: CustomerFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      const customerData = {
        name: data.name,
        company: data.company || null,
        email: data.email,
        phone: data.phone || null,
        website: data.website || null,
        address: data.address || null,
        industry: data.industry || null,
        status: data.status,
        notes: data.notes || null,
        tags: tags.length > 0 ? tags : null,
        created_by: user.id,
      };

      let error;
      if (customer) {
        ({ error } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', customer.id));
      } else {
        ({ error } = await supabase
          .from('customers')
          .insert(customerData));
      }

      if (error) throw error;

      toast.success(customer ? 'Customer updated successfully' : 'Customer created successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Customer name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input placeholder="Company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="customer@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Customer address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags Section */}
        <div className="space-y-2">
          <FormLabel>Tags</FormLabel>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Add tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {tags.map(tag => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes about this customer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {customer ? 'Update Customer' : 'Create Customer'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EnhancedCustomerForm;