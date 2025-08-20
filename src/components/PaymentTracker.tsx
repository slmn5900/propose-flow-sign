import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, CreditCard, Calendar, DollarSign, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const paymentSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  payment_method: z.enum(['bank_transfer', 'check', 'cash', 'other']),
  payment_date: z.string().min(1, 'Payment date is required'),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentTrackerProps {
  invoice: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentAdded?: () => void;
}

const PaymentTracker = ({ invoice, open, onOpenChange, onPaymentAdded }: PaymentTrackerProps) => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      payment_method: 'bank_transfer',
      payment_date: new Date().toISOString().split('T')[0],
      reference_number: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (open && invoice) {
      fetchPayments();
    }
  }, [open, invoice]);

  const fetchPayments = async () => {
    if (!invoice) return;

    try {
      const { data, error } = await supabase
        .from('invoice_payments')
        .select('*')
        .eq('invoice_id', invoice.id)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch payments');
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (data: PaymentFormData) => {
    if (!user || !invoice) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('invoice_payments')
        .insert({
          invoice_id: invoice.id,
          amount: data.amount,
          payment_method: data.payment_method,
          payment_date: new Date(data.payment_date).toISOString(),
          reference_number: data.reference_number || null,
          notes: data.notes || null,
          created_by: user.id,
        });

      if (error) throw error;

      // Check if invoice is fully paid
      const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0) + data.amount;
      const invoiceTotal = parseFloat(invoice.total_amount);

      if (totalPaid >= invoiceTotal) {
        // Update invoice status to paid
        await supabase
          .from('invoices')
          .update({ 
            status: 'paid',
            paid_at: new Date().toISOString()
          })
          .eq('id', invoice.id);
      }

      toast.success('Payment recorded successfully');
      setShowForm(false);
      form.reset();
      fetchPayments();
      onPaymentAdded?.();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment record?')) return;

    try {
      const { error } = await supabase
        .from('invoice_payments')
        .delete()
        .eq('id', paymentId);

      if (error) throw error;

      toast.success('Payment deleted successfully');
      fetchPayments();
      onPaymentAdded?.();
    } catch (error: any) {
      toast.error('Failed to delete payment');
      console.error('Error:', error);
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      bank_transfer: 'Bank Transfer',
      check: 'Check',
      cash: 'Cash',
      other: 'Other',
    };
    return labels[method] || method;
  };

  const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
  const remainingBalance = parseFloat(invoice?.total_amount || 0) - totalPaid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Tracking - {invoice?.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Invoice Total</p>
              <p className="text-lg font-semibold">
                {formatCurrency(parseFloat(invoice?.total_amount || 0), invoice?.currency)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(totalPaid, invoice?.currency)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className={`text-lg font-semibold ${remainingBalance <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                {formatCurrency(remainingBalance, invoice?.currency)}
              </p>
            </div>
          </div>

          {/* Add Payment Button */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Track payments for this invoice
            </p>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </div>

          {/* Payment Form */}
          {showForm && (
            <div className="border rounded-lg p-6 bg-muted/50">
              <h3 className="text-lg font-semibold mb-4">Record New Payment</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="payment_method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                              <SelectItem value="check">Check</SelectItem>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="payment_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reference_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reference Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Check #, Transaction ID, etc." {...field} />
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
                          <Textarea placeholder="Additional payment notes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      Record Payment
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {/* Payments Table */}
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No payments recorded</h3>
              <p className="text-muted-foreground">Start tracking payments for this invoice.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(parseFloat(payment.amount), invoice?.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getPaymentMethodLabel(payment.payment_method)}
                      </Badge>
                    </TableCell>
                    <TableCell>{payment.reference_number || '-'}</TableCell>
                    <TableCell>{payment.notes || '-'}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(payment.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

export default PaymentTracker;