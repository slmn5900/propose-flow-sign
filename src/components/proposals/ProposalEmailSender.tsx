import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Send, Mail, Eye, Loader2, Copy, Link } from 'lucide-react';

interface ProposalEmailSenderProps {
  proposal: any;
  onClose: () => void;
  onSuccess: () => void;
}

const ProposalEmailSender = ({ proposal, onClose, onSuccess }: ProposalEmailSenderProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [emailData, setEmailData] = useState({
    to: proposal.client_email,
    cc: '',
    bcc: '',
    subject: `Proposal: ${proposal.title}`,
    message: `Dear ${proposal.client_name},

I hope this email finds you well. Please find attached our proposal for your review.

We have carefully crafted this proposal to address your specific needs and requirements. The proposal includes detailed information about our approach, timeline, and investment.

Key highlights of our proposal:
• Comprehensive solution tailored to your needs
• Competitive pricing with transparent breakdown
• Clear timeline and deliverables
• Professional support throughout the project

Please take your time to review the proposal. If you have any questions or would like to discuss any aspect of the proposal, I'm here to help.

You can view the proposal online using the secure link provided below, or feel free to download the PDF version for your records.

Looking forward to hearing from you soon.

Best regards,
[Your Name]
[Your Company]`,
    enable_tracking: true,
    send_pdf_attachment: true,
    require_login: false,
  });

  const [previewLink, setPreviewLink] = useState('');

  // Generate secure preview link
  const generatePreviewLink = async () => {
    try {
      // This would generate a secure, unique link for the proposal
      const uniqueId = `${proposal.id}_${Date.now()}`;
      const link = `${window.location.origin}/proposal/view/${uniqueId}`;
      setPreviewLink(link);
      
      // Update proposal with tracking data
      await supabase
        .from('proposals')
        .update({
          tracking_data: {
            ...proposal.tracking_data,
            preview_link: uniqueId,
            generated_at: new Date().toISOString(),
          }
        })
        .eq('id', proposal.id);

      return link;
    } catch (error) {
      console.error('Failed to generate preview link:', error);
      return '';
    }
  };

  const handleSend = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Generate preview link if tracking is enabled
      let link = '';
      if (emailData.enable_tracking) {
        link = await generatePreviewLink();
      }

      // Prepare email content with preview link
      let finalMessage = emailData.message;
      if (link) {
        finalMessage += `\n\nView Proposal Online: ${link}`;
      }

      // This would integrate with your email service (e.g., Resend, SendGrid)
      // For now, we'll simulate the email sending
      const emailPayload = {
        to: emailData.to,
        cc: emailData.cc || undefined,
        bcc: emailData.bcc || undefined,
        subject: emailData.subject,
        html: finalMessage.replace(/\n/g, '<br>'),
        attachments: emailData.send_pdf_attachment ? [
          {
            filename: `${proposal.title.replace(/\s+/g, '_')}_Proposal.pdf`,
            content: 'base64-encoded-pdf-content', // This would be generated
          }
        ] : undefined,
      };

      console.log('Email payload:', emailPayload);

      // Update proposal status
      await supabase
        .from('proposals')
        .update({
          status: 'sent',
          tracking_data: {
            ...proposal.tracking_data,
            sent_at: new Date().toISOString(),
            sent_to: emailData.to,
            tracking_enabled: emailData.enable_tracking,
          }
        })
        .eq('id', proposal.id);

      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          entity_type: 'proposal',
          entity_id: proposal.id,
          action: 'sent',
          details: {
            sent_to: emailData.to,
            subject: emailData.subject,
            tracking_enabled: emailData.enable_tracking,
          },
          user_id: user.id,
        });

      toast({
        title: "Success",
        description: "Proposal sent successfully!",
      });

      onSuccess();
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

  const copyPreviewLink = async () => {
    if (!previewLink) {
      const link = await generatePreviewLink();
      if (link) {
        navigator.clipboard.writeText(link);
        toast({ title: "Link copied to clipboard" });
      }
    } else {
      navigator.clipboard.writeText(previewLink);
      toast({ title: "Link copied to clipboard" });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Proposal
          </DialogTitle>
          <DialogDescription>
            Send your proposal via email with optional tracking and PDF attachment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Recipients */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">To *</label>
              <Input
                placeholder="client@example.com"
                value={emailData.to}
                onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">CC</label>
                <Input
                  placeholder="cc@example.com"
                  value={emailData.cc}
                  onChange={(e) => setEmailData({ ...emailData, cc: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">BCC</label>
                <Input
                  placeholder="bcc@example.com"
                  value={emailData.bcc}
                  onChange={(e) => setEmailData({ ...emailData, bcc: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="text-sm font-medium">Subject *</label>
            <Input
              placeholder="Email subject"
              value={emailData.subject}
              onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
            />
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium">Message *</label>
            <Textarea
              placeholder="Email message"
              value={emailData.message}
              onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
              rows={10}
            />
          </div>

          {/* Options */}
          <div className="space-y-4 p-4 bg-muted/5 rounded-lg">
            <h3 className="font-medium">Email Options</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Enable tracking</div>
                <div className="text-sm text-muted-foreground">
                  Track when the proposal is viewed and how much time is spent
                </div>
              </div>
              <Switch
                checked={emailData.enable_tracking}
                onCheckedChange={(checked) => 
                  setEmailData({ ...emailData, enable_tracking: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Attach PDF</div>
                <div className="text-sm text-muted-foreground">
                  Include a PDF version of the proposal as an attachment
                </div>
              </div>
              <Switch
                checked={emailData.send_pdf_attachment}
                onCheckedChange={(checked) => 
                  setEmailData({ ...emailData, send_pdf_attachment: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Require login to view</div>
                <div className="text-sm text-muted-foreground">
                  Client must create an account to view the proposal online
                </div>
              </div>
              <Switch
                checked={emailData.require_login}
                onCheckedChange={(checked) => 
                  setEmailData({ ...emailData, require_login: checked })
                }
              />
            </div>
          </div>

          {/* Preview Link */}
          {emailData.enable_tracking && (
            <div className="p-4 bg-info/5 border border-info/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Shareable Preview Link
                </h3>
                <Button variant="outline" size="sm" onClick={copyPreviewLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                A secure link will be generated and included in the email for online viewing.
              </p>
              {previewLink && (
                <div className="mt-2 p-2 bg-background rounded border font-mono text-xs break-all">
                  {previewLink}
                </div>
              )}
            </div>
          )}

          {/* Current Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Current status:</span>
            <Badge variant="outline">{proposal.status}</Badge>
            <span className="text-sm text-muted-foreground">→</span>
            <Badge>sent</Badge>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  // Preview email functionality
                  console.log('Email preview:', emailData);
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleSend} disabled={loading || !emailData.to || !emailData.subject}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Send className="h-4 w-4 mr-2" />
                Send Proposal
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalEmailSender;