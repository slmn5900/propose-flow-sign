import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';

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
});

type ProposalFormData = z.infer<typeof proposalSchema>;

interface ProposalFormProps {
  proposal?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ProposalForm = ({ proposal, onSuccess, onCancel }: ProposalFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [contentBlocks, setContentBlocks] = useState(proposal?.content || []);

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
    },
  });

  const addContentBlock = () => {
    setContentBlocks([...contentBlocks, { type: 'text', title: '', content: '' }]);
  };

  const removeContentBlock = (index: number) => {
    setContentBlocks(contentBlocks.filter((_: any, i: number) => i !== index));
  };

  const updateContentBlock = (index: number, field: string, value: string) => {
    const updated = [...contentBlocks];
    updated[index] = { ...updated[index], [field]: value };
    setContentBlocks(updated);
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
        content: contentBlocks,
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

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{proposal ? 'Edit Proposal' : 'Create New Proposal'}</CardTitle>
        <CardDescription>
          {proposal ? 'Update your proposal details' : 'Fill in the details to create a new proposal'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <Textarea placeholder="Proposal description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="client_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
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
                    <FormLabel>Client Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" type="email" {...field} />
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
                      <Input placeholder="Acme Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="total_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Amount</FormLabel>
                    <FormControl>
                      <Input placeholder="5000.00" type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Content Blocks</h3>
                <Button type="button" variant="outline" onClick={addContentBlock}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Block
                </Button>
              </div>

              {contentBlocks.map((block: any, index: number) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Input
                        placeholder="Block title"
                        value={block.title}
                        onChange={(e) => updateContentBlock(index, 'title', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeContentBlock(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Block content"
                      value={block.content}
                      onChange={(e) => updateContentBlock(index, 'content', e.target.value)}
                      rows={3}
                    />
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {proposal ? 'Update Proposal' : 'Create Proposal'}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProposalForm;