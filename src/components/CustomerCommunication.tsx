import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Mail, 
  Send, 
  Calendar, 
  Phone, 
  MessageSquare, 
  FileText,
  Clock,
  User,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CustomerCommunicationProps {
  customer: any;
  contacts: any[];
}

const CustomerCommunication = ({ customer, contacts }: CustomerCommunicationProps) => {
  const { user } = useAuth();
  const [emailDialog, setEmailDialog] = useState(false);
  const [reminderDialog, setReminderDialog] = useState(false);
  const [zapierDialog, setZapierDialog] = useState(false);
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    message: '',
    template: '',
  });
  const [reminderForm, setReminderForm] = useState({
    type: '',
    date: '',
    notes: '',
  });
  const [zapierUrl, setZapierUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const emailTemplates = [
    {
      id: 'follow_up',
      name: 'Follow-up Email',
      subject: 'Following up on our recent conversation',
      body: `Hi ${customer?.name || '[Name]'},

I hope this email finds you well. I wanted to follow up on our recent conversation about your project requirements.

Is there anything specific you'd like to discuss or any questions I can help answer?

Looking forward to hearing from you.

Best regards,
[Your Name]`
    },
    {
      id: 'proposal_ready',
      name: 'Proposal Ready',
      subject: 'Your custom proposal is ready for review',
      body: `Hi ${customer?.name || '[Name]'},

Great news! I've prepared a custom proposal based on our discussions about your project needs.

The proposal includes:
- Detailed project scope and timeline
- Transparent pricing structure
- Our recommended approach

Please review it at your convenience and let me know if you have any questions.

Best regards,
[Your Name]`
    },
    {
      id: 'invoice_reminder',
      name: 'Payment Reminder',
      subject: 'Friendly reminder: Invoice payment due',
      body: `Hi ${customer?.name || '[Name]'},

I hope you're doing well. This is a friendly reminder that we have an invoice that's due for payment.

If you've already processed the payment, please disregard this message. If you have any questions about the invoice or need any adjustments, please don't hesitate to reach out.

Thank you for your business!

Best regards,
[Your Name]`
    }
  ];

  const handleSendEmail = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Log the communication attempt
      await supabase
        .from('activity_logs')
        .insert({
          entity_type: 'customer',
          entity_id: customer.id,
          action: 'email_sent',
          details: {
            to: emailForm.to,
            subject: emailForm.subject,
            template: emailForm.template || 'custom'
          },
          user_id: user?.id
        });

      toast.success('Email logged successfully! (Note: Actual email sending requires backend integration)');
      setEmailDialog(false);
      setEmailForm({ to: '', subject: '', message: '', template: '' });
    } catch (error) {
      console.error('Error logging email:', error);
      toast.error('Failed to log email communication');
    } finally {
      setLoading(false);
    }
  };

  const handleSetReminder = async () => {
    if (!reminderForm.type || !reminderForm.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await supabase
        .from('activity_logs')
        .insert({
          entity_type: 'customer',
          entity_id: customer.id,
          action: 'reminder_set',
          details: {
            reminder_type: reminderForm.type,
            reminder_date: reminderForm.date,
            notes: reminderForm.notes
          },
          user_id: user?.id
        });

      toast.success('Reminder set successfully!');
      setReminderDialog(false);
      setReminderForm({ type: '', date: '', notes: '' });
    } catch (error) {
      console.error('Error setting reminder:', error);
      toast.error('Failed to set reminder');
    } finally {
      setLoading(false);
    }
  };

  const handleZapierTrigger = async () => {
    if (!zapierUrl) {
      toast.error('Please enter your Zapier webhook URL');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(zapierUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          customer: {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            company: customer.company,
            status: customer.status
          },
          timestamp: new Date().toISOString(),
          triggered_from: 'customer_profile',
          user_id: user?.id
        }),
      });

      // Log the Zapier trigger
      await supabase
        .from('activity_logs')
        .insert({
          entity_type: 'customer',
          entity_id: customer.id,
          action: 'zapier_triggered',
          details: {
            webhook_url: zapierUrl,
            trigger_type: 'customer_action'
          },
          user_id: user?.id
        });

      toast.success('Zapier webhook triggered successfully! Check your Zap history to confirm.');
      setZapierDialog(false);
    } catch (error) {
      console.error('Error triggering Zapier webhook:', error);
      toast.error('Failed to trigger Zapier webhook');
    } finally {
      setLoading(false);
    }
  };

  const selectTemplate = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setEmailForm(prev => ({
        ...prev,
        template: templateId,
        subject: template.subject,
        message: template.body
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Communication Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Email</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Primary: {customer.email}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Phone</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {customer.phone || 'Not provided'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Contacts</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Status</span>
            </div>
            <Badge variant="secondary" className="mt-1">
              {customer.status || 'Active'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Communication Tools</CardTitle>
          <CardDescription>Direct communication and automation tools</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Dialog open={emailDialog} onOpenChange={setEmailDialog}>
              <DialogTrigger asChild>
                <Button className="justify-start" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Send Email</DialogTitle>
                  <DialogDescription>
                    Send a personalized email to this customer
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Template</label>
                      <Select onValueChange={selectTemplate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose template" />
                        </SelectTrigger>
                        <SelectContent>
                          {emailTemplates.map(template => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">To</label>
                      <Select
                        value={emailForm.to}
                        onValueChange={(value) => setEmailForm(prev => ({ ...prev, to: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select recipient" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={customer.email}>{customer.name} ({customer.email})</SelectItem>
                          {contacts.map(contact => (
                            <SelectItem key={contact.id} value={contact.email}>
                              {contact.name} ({contact.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Subject</label>
                    <Input
                      value={emailForm.subject}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Email subject"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      value={emailForm.message}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Email content"
                      rows={8}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSendEmail} disabled={loading}>
                      <Send className="h-4 w-4 mr-2" />
                      {loading ? 'Sending...' : 'Send Email'}
                    </Button>
                    <Button variant="outline" onClick={() => setEmailDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={reminderDialog} onOpenChange={setReminderDialog}>
              <DialogTrigger asChild>
                <Button className="justify-start" variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Set Reminder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set Follow-up Reminder</DialogTitle>
                  <DialogDescription>
                    Schedule a reminder for future customer follow-up
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Reminder Type</label>
                    <Select
                      value={reminderForm.type}
                      onValueChange={(value) => setReminderForm(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select reminder type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="follow_up">Follow-up Call</SelectItem>
                        <SelectItem value="proposal_check">Proposal Check-in</SelectItem>
                        <SelectItem value="invoice_reminder">Invoice Reminder</SelectItem>
                        <SelectItem value="contract_renewal">Contract Renewal</SelectItem>
                        <SelectItem value="general">General Follow-up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Reminder Date</label>
                    <Input
                      type="datetime-local"
                      value={reminderForm.date}
                      onChange={(e) => setReminderForm(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea
                      value={reminderForm.notes}
                      onChange={(e) => setReminderForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes for this reminder"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSetReminder} disabled={loading}>
                      <Calendar className="h-4 w-4 mr-2" />
                      {loading ? 'Setting...' : 'Set Reminder'}
                    </Button>
                    <Button variant="outline" onClick={() => setReminderDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={zapierDialog} onOpenChange={setZapierDialog}>
              <DialogTrigger asChild>
                <Button className="justify-start" variant="outline">
                  <Zap className="h-4 w-4 mr-2" />
                  Trigger Zapier
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Trigger Zapier Automation</DialogTitle>
                  <DialogDescription>
                    Send customer data to your Zapier workflow
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Zapier Webhook URL</label>
                    <Input
                      value={zapierUrl}
                      onChange={(e) => setZapierUrl(e.target.value)}
                      placeholder="https://hooks.zapier.com/hooks/catch/..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Create a Zap with a webhook trigger and paste the URL here
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Data that will be sent:</p>
                    <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                      <li>• Customer ID, name, email, company</li>
                      <li>• Customer status and tags</li>
                      <li>• Timestamp and user information</li>
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleZapierTrigger} disabled={loading}>
                      <Zap className="h-4 w-4 mr-2" />
                      {loading ? 'Triggering...' : 'Trigger Zapier'}
                    </Button>
                    <Button variant="outline" onClick={() => setZapierDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button className="justify-start" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Create Proposal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact List */}
      {contacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Contact Directory</CardTitle>
            <CardDescription>All contacts for this customer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contacts.map(contact => (
                <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.email}</p>
                      {contact.role && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {contact.role}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Mail className="h-3 w-3" />
                    </Button>
                    {contact.phone && (
                      <Button size="sm" variant="outline">
                        <Phone className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomerCommunication;