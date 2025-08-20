-- Create proposals table
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft'::text CHECK (status IN ('draft', 'sent', 'viewed', 'signed', 'rejected')),
  total_amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD'::text,
  client_email TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_company TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  signed_at TIMESTAMP WITH TIME ZONE,
  signature_data JSONB,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create estimates table
CREATE TABLE public.estimates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft'::text CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD'::text,
  client_email TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_company TEXT,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft'::text CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD'::text,
  client_email TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_company TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  proposal_id UUID REFERENCES public.proposals(id),
  estimate_id UUID REFERENCES public.estimates(id),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create engagement tracking table
CREATE TABLE public.engagement_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_type TEXT NOT NULL CHECK (document_type IN ('proposal', 'estimate', 'invoice')),
  document_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  client_ip TEXT,
  user_agent TEXT,
  page_views INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- in seconds
  sections_viewed JSONB DEFAULT '[]'::jsonb,
  last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for proposals
CREATE POLICY "Users can view their own proposals" 
ON public.proposals 
FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own proposals" 
ON public.proposals 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own proposals" 
ON public.proposals 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own proposals" 
ON public.proposals 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create RLS policies for estimates
CREATE POLICY "Users can view their own estimates" 
ON public.estimates 
FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own estimates" 
ON public.estimates 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own estimates" 
ON public.estimates 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own estimates" 
ON public.estimates 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create RLS policies for invoices
CREATE POLICY "Users can view their own invoices" 
ON public.invoices 
FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own invoices" 
ON public.invoices 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own invoices" 
ON public.invoices 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own invoices" 
ON public.invoices 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create RLS policies for engagement tracking
CREATE POLICY "Users can view engagement for their documents" 
ON public.engagement_tracking 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.proposals WHERE id = document_id AND created_by = auth.uid()
    UNION
    SELECT 1 FROM public.estimates WHERE id = document_id AND created_by = auth.uid()
    UNION
    SELECT 1 FROM public.invoices WHERE id = document_id AND created_by = auth.uid()
  )
);

CREATE POLICY "Allow public engagement tracking" 
ON public.engagement_tracking 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public engagement updates" 
ON public.engagement_tracking 
FOR UPDATE 
USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_proposals_updated_at
BEFORE UPDATE ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_estimates_updated_at
BEFORE UPDATE ON public.estimates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_proposals_created_by ON public.proposals(created_by);
CREATE INDEX idx_proposals_status ON public.proposals(status);
CREATE INDEX idx_estimates_created_by ON public.estimates(created_by);
CREATE INDEX idx_estimates_status ON public.estimates(status);
CREATE INDEX idx_invoices_created_by ON public.invoices(created_by);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_engagement_tracking_document ON public.engagement_tracking(document_type, document_id);

-- Create function to generate invoice numbers
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_number INTEGER;
  invoice_number TEXT;
BEGIN
  -- Get the next number in sequence
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 'INV-(\d+)') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.invoices
  WHERE invoice_number ~ '^INV-\d+$';
  
  -- Format as INV-000001
  invoice_number := 'INV-' || LPAD(next_number::TEXT, 6, '0');
  
  RETURN invoice_number;
END;
$$;