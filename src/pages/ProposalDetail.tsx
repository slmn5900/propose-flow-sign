import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, Mail, Edit, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const ProposalDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      fetchProposal();
    }
  }, [id, user]);

  const fetchProposal = async () => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', id)
        .eq('created_by', user?.id)
        .single();

      if (error) throw error;
      
      setProposal(data);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: proposal?.currency || 'USD',
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
    const items = proposal?.pricing_table?.items || [];
    return items.reduce((sum: number, item: any) => sum + calculateItemTotal(item), 0);
  };

  const handleDownloadPDF = () => {
    console.log('Downloading PDF...');
    toast({
      title: "Coming Soon",
      description: "PDF download feature will be available soon",
    });
  };

  const handleSendEmail = () => {
    console.log('Opening email sender...');
    toast({
      title: "Coming Soon", 
      description: "Email sending feature will be available soon",
    });
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/proposal-view/${id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link Copied",
      description: "Proposal link copied to clipboard",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading proposal...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Proposal Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The proposal you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link to="/proposals">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Proposals
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/proposals">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{proposal.title}</h1>
                <p className="text-muted-foreground">{proposal.client_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleSendEmail}>
                <Mail className="h-4 w-4 mr-2" />
                Send
              </Button>
              <Link to={`/proposals?edit=${id}`}>
                <Button size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Cover Page */}
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
                  {proposal.title}
                </h2>
                
                {proposal.description && (
                  <p className="text-muted-foreground">
                    {proposal.description}
                  </p>
                )}
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
            </div>
          </div>

          {/* Proposal Details */}
          <div className="p-8 space-y-6">
            {/* Status and Client Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Proposal Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Client Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div className="font-medium">{proposal.client_name}</div>
                  {proposal.client_company && (
                    <div className="text-muted-foreground">{proposal.client_company}</div>
                  )}
                  <div className="text-muted-foreground">{proposal.client_email}</div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Sections */}
            {proposal.sections && proposal.sections.length > 0 ? (
              <div className="space-y-8">
                {proposal.sections
                  .sort((a: any, b: any) => a.order - b.order)
                  .map((section: any, index: number) => (
                    <div key={section.id}>
                      <h3 className="text-2xl font-semibold text-primary mb-4">
                        {section.title}
                      </h3>
                      
                      <div className="prose max-w-none">
                        {section.content.split('\n').map((line: string, lineIndex: number) => (
                          <p key={lineIndex} className="mb-2">{line || '\u00A0'}</p>
                        ))}
                      </div>

                      {/* Section Items */}
                      {section.items && section.items.length > 0 && (
                        <div className="mt-6 grid gap-4">
                          {section.items.map((item: any) => (
                            <Card key={item.id}>
                              <CardContent className="p-4">
                                <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                                {item.description && (
                                  <p className="text-muted-foreground mb-3">{item.description}</p>
                                )}
                                <div className="flex items-center gap-4">
                                  {item.timeline && (
                                    <Badge variant="outline">{item.timeline}</Badge>
                                  )}
                                  {item.cost && (
                                    <div className="font-semibold text-primary">
                                      {formatCurrency(item.cost)}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}

                      {index < proposal.sections.length - 1 && <Separator className="mt-8" />}
                    </div>
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <h3 className="text-lg font-medium mb-2">No sections added</h3>
                  <p className="text-muted-foreground text-sm">
                    This proposal doesn't have any sections yet.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Pricing Table */}
            {proposal.pricing_table && proposal.pricing_table.items && proposal.pricing_table.items.length > 0 ? (
              <div>
                <Separator className="mb-6" />
                <h3 className="text-2xl font-semibold text-primary mb-6">Investment Breakdown</h3>
                
                <Card>
                  <CardContent className="p-6">
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
                            <td className="border border-border p-3 text-right font-bold text-primary text-lg">
                              {formatCurrency(calculateTotal())}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}

            {/* Signature Block */}
            {proposal.signature_required && (
              <div>
                <Separator className="mb-6" />
                <Card>
                  <CardHeader>
                    <CardTitle>Acceptance</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalDetail;