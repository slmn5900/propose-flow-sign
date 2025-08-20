import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Users 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ImportExportToolsProps {
  onImportComplete?: () => void;
}

const ImportExportTools = ({ onImportComplete }: ImportExportToolsProps) => {
  const { user } = useAuth();
  const [importDialog, setImportDialog] = useState(false);
  const [exportDialog, setExportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{
    total: number;
    success: number;
    errors: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setImportFile(file);
      setImportResults(null);
    } else {
      toast.error('Please select a valid CSV file');
    }
  };

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }

    return data;
  };

  const handleImport = async () => {
    if (!importFile || !user) return;

    setLoading(true);
    setImportProgress(0);
    
    try {
      const csvText = await importFile.text();
      const customerData = parseCSV(csvText);
      
      const results = {
        total: customerData.length,
        success: 0,
        errors: [] as string[]
      };

      // Validate and import customers
      for (let i = 0; i < customerData.length; i++) {
        const customer = customerData[i];
        setImportProgress(Math.round((i / customerData.length) * 100));

        try {
          // Validate required fields
          if (!customer.name || !customer.email) {
            results.errors.push(`Row ${i + 2}: Missing required fields (name or email)`);
            continue;
          }

          // Check for duplicate email
          const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('email', customer.email)
            .eq('created_by', user.id)
            .single();

          if (existingCustomer) {
            results.errors.push(`Row ${i + 2}: Customer with email ${customer.email} already exists`);
            continue;
          }

          // Insert customer
          const { error } = await supabase
            .from('customers')
            .insert({
              name: customer.name,
              company: customer.company || null,
              email: customer.email,
              phone: customer.phone || null,
              website: customer.website || null,
              address: customer.address || null,
              industry: customer.industry || null,
              status: customer.status || 'active',
              notes: customer.notes || null,
              tags: customer.tags ? customer.tags.split(';').map((t: string) => t.trim()) : null,
              created_by: user.id
            });

          if (error) {
            results.errors.push(`Row ${i + 2}: ${error.message}`);
          } else {
            results.success++;
          }
        } catch (error: any) {
          results.errors.push(`Row ${i + 2}: ${error.message}`);
        }
      }

      setImportProgress(100);
      setImportResults(results);
      
      if (results.success > 0) {
        toast.success(`Successfully imported ${results.success} customers`);
        onImportComplete?.();
      }
      
      if (results.errors.length > 0) {
        toast.error(`${results.errors.length} errors occurred during import`);
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error('Failed to import customers');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'all' | 'filtered' = 'all') => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: customers, error } = await supabase
        .from('customers')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!customers || customers.length === 0) {
        toast.error('No customers to export');
        return;
      }

      // Convert to CSV
      const headers = [
        'name', 'company', 'email', 'phone', 'website', 
        'address', 'industry', 'status', 'notes', 'tags', 'created_at'
      ];
      
      const csvContent = [
        headers.join(','),
        ...customers.map(customer => 
          headers.map(header => {
            let value = customer[header] || '';
            if (header === 'tags' && Array.isArray(value)) {
              value = value.join(';');
            }
            if (header === 'created_at') {
              value = new Date(value).toLocaleDateString();
            }
            return `"${value}"`;
          }).join(',')
        )
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `customers-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Exported ${customers.length} customers`);
      setExportDialog(false);
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Failed to export customers');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const templateContent = [
      'name,company,email,phone,website,address,industry,status,notes,tags',
      'John Doe,Acme Corp,john@acme.com,555-0123,https://acme.com,"123 Main St, City, State",Technology,active,"Key client with multiple projects","VIP;Enterprise"',
      'Jane Smith,TechStart,jane@techstart.com,555-0124,https://techstart.com,"456 Oak Ave, City, State",Technology,active,"Startup client - growth potential","Startup;Growth"'
    ].join('\n');

    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'customer-import-template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success('Template downloaded');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Import Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Customers
            </CardTitle>
            <CardDescription>
              Bulk import customers from CSV file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              onClick={downloadTemplate}
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            
            <Dialog open={importDialog} onOpenChange={setImportDialog}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Import Customers from CSV</DialogTitle>
                  <DialogDescription>
                    Upload a CSV file to bulk import customers. Make sure your file follows the template format.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Only CSV files are supported. Required fields: name, email
                    </p>
                  </div>

                  {importFile && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Selected file:</p>
                      <p className="text-sm text-muted-foreground">{importFile.name}</p>
                    </div>
                  )}

                  {loading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Importing customers...</span>
                        <span>{importProgress}%</span>
                      </div>
                      <Progress value={importProgress} />
                    </div>
                  )}

                  {importResults && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Success: {importResults.success}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm">Errors: {importResults.errors.length}</span>
                        </div>
                      </div>
                      
                      {importResults.errors.length > 0 && (
                        <div className="max-h-32 overflow-y-auto">
                          <p className="text-sm font-medium mb-2">Error Details:</p>
                          <div className="space-y-1">
                            {importResults.errors.map((error, index) => (
                              <p key={index} className="text-xs text-red-600">{error}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleImport} 
                      disabled={!importFile || loading}
                      className="flex-1"
                    >
                      {loading ? 'Importing...' : 'Start Import'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setImportDialog(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Export Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Customers
            </CardTitle>
            <CardDescription>
              Download customer data as CSV
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog open={exportDialog} onOpenChange={setExportDialog}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export to CSV
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export Customer Data</DialogTitle>
                  <DialogDescription>
                    Choose export options for your customer data
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Export Options</h4>
                    <div className="space-y-2">
                      <Button
                        onClick={() => handleExport('all')}
                        disabled={loading}
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Export All Customers
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Exported fields include:</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Name, Company, Email, Phone, Website, Address, Industry, Status, Notes, Tags, Created Date
                    </p>
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={() => setExportDialog(false)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImportExportTools;