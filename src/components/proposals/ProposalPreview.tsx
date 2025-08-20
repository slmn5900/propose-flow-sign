import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, Mail, X } from 'lucide-react';

interface ProposalPreviewProps {
  proposal: any;
  onClose: () => void;
}

const ProposalPreview = ({ proposal, onClose }: ProposalPreviewProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: proposal.currency || 'USD',
    }).format(amount);
  };

  const calculateItemTotal = (item: any) => {
    const subtotal = item.quantity * item.unit_price;
    const discount = (item.discount || 0) / 100;
    const afterDiscount = subtotal * (1 - discount);
    const tax = afterDiscount * ((item.tax_rate || 0) / 100);
    const gst = afterDiscount * ((item.gst_rate || 0) / 100);
    return afterDiscount + tax + gst;
  };

  const calculateTotal = () => {
    const items = proposal.pricing_table?.items || [];
    return items.reduce((sum: number, item: any) => sum + calculateItemTotal(item), 0);
  };

  const handleDownloadPDF = () => {
    // This would integrate with a PDF generation service
    console.log('Downloading PDF...');
  };

  const handleSendEmail = () => {
    // This would open the email sender component
    console.log('Opening email sender...');
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-6">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Proposal Preview</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleSendEmail}>
                <Mail className="h-4 w-4 mr-2" />
                Send
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Cover Page - Always show with fallbacks */}
          <div className="p-8 border-b bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="text-center space-y-6">
              {proposal.cover_page?.logo_url && (
                <img 
                  src={proposal.cover_page.logo_url} 
                  alt="Company Logo" 
                  className="h-16 mx-auto object-contain"
                />
              )}
              
              {proposal.cover_page?.company_name && (
                <h1 className="text-3xl font-bold text-foreground">
                  {proposal.cover_page.company_name}
                </h1>
              )}

              <div className="max-w-2xl mx-auto space-y-4">
                <h2 className="text-xl font-semibold text-primary">
                  {proposal.title || 'Untitled Proposal'}
                </h2>
                
                <p className="text-muted-foreground">
                  {proposal.description || 'This is a preview of your proposal. Add a description in the Details tab to customize this section.'}
                </p>
              </div>

              {proposal.cover_page?.about_us && (
                <div className="max-w-2xl mx-auto text-left">
                  <h3 className="text-lg font-semibold text-primary mb-3">About Us</h3>
                  <div className="text-muted-foreground space-y-2">
                    {proposal.cover_page.about_us.split('\n').map((line: string, index: number) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {proposal.cover_page?.custom_text && (
                <div className="max-w-2xl mx-auto text-left border-t pt-6">
                  <div className="text-foreground space-y-2">
                    {proposal.cover_page.custom_text.split('\n').map((line: string, index: number) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Proposal Details */}
          <div className="p-8 space-y-6">
            {/* Client Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-primary mb-3">Proposal Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="outline">{proposal.status}</Badge>
                  </div>
                  {proposal.expires_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expires:</span>
                      <span>{new Date(proposal.expires_at).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="font-semibold">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-primary mb-3">Client Information</h3>
                <div className="space-y-1 text-sm">
                  <div className="font-medium">{proposal.client_name}</div>
                  {proposal.client_company && (
                    <div className="text-muted-foreground">{proposal.client_company}</div>
                  )}
                  <div className="text-muted-foreground">{proposal.client_email}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Sections */}
            {proposal.sections && proposal.sections.length > 0 ? (
              <div className="space-y-8">
                {proposal.sections
                  .sort((a: any, b: any) => a.order - b.order)
                  .map((section: any, index: number) => (
                    <div key={section.id}>
                      <h3 className="text-xl font-semibold text-primary mb-4">
                        {section.title}
                      </h3>
                      
                      <div className="prose max-w-none">
                        {section.content.split('\n').map((line: string, lineIndex: number) => (
                          <p key={lineIndex} className="mb-2">{line || '\u00A0'}</p>
                        ))}
                      </div>

                      {/* Section Items */}
                      {section.items && section.items.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {section.items.map((item: any) => (
                            <div key={item.id} className="border rounded-lg p-4">
                              <h4 className="font-semibold">{item.title}</h4>
                              {item.description && (
                                <p className="text-muted-foreground mt-1">{item.description}</p>
                              )}
                              {item.timeline && (
                                <div className="mt-2">
                                  <Badge variant="outline">{item.timeline}</Badge>
                                </div>
                              )}
                              {item.cost && (
                                <div className="mt-2 font-semibold text-primary">
                                  {formatCurrency(item.cost)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {index < proposal.sections.length - 1 && <Separator className="mt-8" />}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground bg-muted/5 rounded-lg">
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-medium mb-2">No sections added yet</h3>
                  <p className="text-sm">
                    Add sections like Introduction, Deliverables, Timeline, and Terms using the "Sections" tab to build your proposal content.
                  </p>
                </div>
              </div>
            )}

            {/* Pricing Table */}
            {proposal.pricing_table && proposal.pricing_table.items && proposal.pricing_table.items.length > 0 ? (
              <div>
                <Separator className="mb-6" />
                <h3 className="text-xl font-semibold text-primary mb-4">Investment Breakdown</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border border-border p-3 text-left">Item</th>
                        <th className="border border-border p-3 text-center">Qty</th>
                        <th className="border border-border p-3 text-right">Rate</th>
                        <th className="border border-border p-3 text-center">HSN</th>
                        <th className="border border-border p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proposal.pricing_table.items.map((item: any) => (
                        <tr key={item.id}>
                          <td className="border border-border p-3">
                            <div className="font-medium">{item.name}</div>
                            {item.description && (
                              <div className="text-sm text-muted-foreground mt-1">
                                {item.description}
                              </div>
                            )}
                          </td>
                          <td className="border border-border p-3 text-center">{item.quantity}</td>
                          <td className="border border-border p-3 text-right">
                            {formatCurrency(item.unit_price)}
                            {item.unit_type && (
                              <div className="text-xs text-muted-foreground">/{item.unit_type}</div>
                            )}
                          </td>
                          <td className="border border-border p-3 text-center text-xs">
                            {item.hsn_code || '-'}
                          </td>
                          <td className="border border-border p-3 text-right font-medium">
                            {formatCurrency(calculateItemTotal(item))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/50">
                        <td colSpan={4} className="border border-border p-3 text-right font-semibold">
                          Total Amount:
                        </td>
                        <td className="border border-border p-3 text-right font-bold text-primary">
                          {formatCurrency(calculateTotal())}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ) : (
              <div>
                <Separator className="mb-6" />
                <div className="text-center py-12 text-muted-foreground bg-muted/5 rounded-lg">
                  <div className="max-w-md mx-auto">
                    <h3 className="text-lg font-medium mb-2">No pricing items added yet</h3>
                    <p className="text-sm">
                      Add line items and pricing packages using the "Pricing" tab to show your investment breakdown.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Signature Block */}
            {proposal.signature_required && (
              <div>
                <Separator className="mb-6" />
                <div className="bg-muted/5 border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">Acceptance</h3>
                  <p className="text-muted-foreground mb-6">
                    By signing below, you agree to the terms and conditions outlined in this proposal.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="border-b border-muted-foreground/30 h-12 mb-2"></div>
                      <div className="text-sm text-muted-foreground">Client Signature</div>
                    </div>
                    <div>
                      <div className="border-b border-muted-foreground/30 h-12 mb-2"></div>
                      <div className="text-sm text-muted-foreground">Date</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalPreview;