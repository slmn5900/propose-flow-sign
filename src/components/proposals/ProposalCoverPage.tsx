import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Image } from 'lucide-react';
import MediaUploader from '../MediaUploader';

interface CoverPage {
  logo_url: string;
  company_name: string;
  about_us: string;
  custom_text: string;
}

interface ProposalCoverPageProps {
  coverPage: CoverPage;
  onCoverPageChange: (coverPage: CoverPage) => void;
}

const ProposalCoverPage = ({ coverPage, onCoverPageChange }: ProposalCoverPageProps) => {
  const [showLogoUploader, setShowLogoUploader] = useState(false);

  const handleFieldChange = (field: keyof CoverPage, value: string) => {
    onCoverPageChange({
      ...coverPage,
      [field]: value,
    });
  };

  const handleLogoUpload = (url: string, fileName: string) => {
    handleFieldChange('logo_url', url);
    setShowLogoUploader(false);
  };

  const handleRemoveLogo = () => {
    handleFieldChange('logo_url', '');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cover Page Design</CardTitle>
          <CardDescription>
            Create an impressive first impression with a professional cover page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Logo */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Company Logo</h3>
            <div className="space-y-4">
              {/* Logo Preview */}
              <div className="flex items-center gap-4">
                <div className="w-32 h-20 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/5">
                  {coverPage.logo_url ? (
                    <img 
                      src={coverPage.logo_url} 
                      alt="Company Logo" 
                      className="max-w-full max-h-full object-contain rounded"
                    />
                  ) : (
                    <div className="text-center">
                      <Image className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">No logo</p>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Logo URL (optional)"
                    value={coverPage.logo_url}
                    onChange={(e) => handleFieldChange('logo_url', e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowLogoUploader(!showLogoUploader)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                    {coverPage.logo_url && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleRemoveLogo}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Logo Uploader */}
              {showLogoUploader && (
                <div className="border rounded-lg p-4 bg-muted/5">
                  <MediaUploader
                    bucketName="proposal-logos"
                    acceptedTypes="image/*"
                    maxSize={5}
                    onUploadSuccess={handleLogoUpload}
                    multiple={false}
                    showPreview={false}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Company Name</label>
            <Input
              placeholder="Your Company Name"
              value={coverPage.company_name}
              onChange={(e) => handleFieldChange('company_name', e.target.value)}
            />
          </div>

          {/* About Us Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">About Us</label>
            <Textarea
              placeholder="Brief description of your company and expertise..."
              value={coverPage.about_us}
              onChange={(e) => handleFieldChange('about_us', e.target.value)}
              rows={4}
            />
          </div>

          {/* Custom Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Message</label>
            <Textarea
              placeholder="Custom welcome message or project-specific introduction..."
              value={coverPage.custom_text}
              onChange={(e) => handleFieldChange('custom_text', e.target.value)}
              rows={3}
            />
          </div>

          {/* Preview */}
          <div className="border rounded-lg p-6 bg-muted/5">
            <h3 className="text-lg font-medium mb-4">Cover Page Preview</h3>
            <div className="bg-white border rounded-lg p-8 shadow-sm">
              {/* Logo and Company Name */}
              <div className="text-center mb-8">
                {coverPage.logo_url && (
                  <img 
                    src={coverPage.logo_url} 
                    alt="Logo" 
                    className="h-16 mx-auto mb-4 object-contain"
                  />
                )}
                {coverPage.company_name && (
                  <h1 className="text-2xl font-bold text-foreground">
                    {coverPage.company_name}
                  </h1>
                )}
              </div>

              {/* About Us */}
              {coverPage.about_us && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-3 text-primary">About Us</h2>
                  <div className="text-muted-foreground leading-relaxed">
                    {coverPage.about_us.split('\n').map((line, index) => (
                      <p key={index} className="mb-2">{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Text */}
              {coverPage.custom_text && (
                <div className="border-t pt-6">
                  <div className="text-foreground leading-relaxed">
                    {coverPage.custom_text.split('\n').map((line, index) => (
                      <p key={index} className="mb-2">{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProposalCoverPage;