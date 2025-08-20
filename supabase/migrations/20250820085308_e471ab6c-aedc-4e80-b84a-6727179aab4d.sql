-- Enhance customers table with additional fields
ALTER TABLE public.customers 
ADD COLUMN website TEXT,
ADD COLUMN tags TEXT[],
ADD COLUMN notes TEXT,
ADD COLUMN status TEXT DEFAULT 'active',
ADD COLUMN industry TEXT;

-- Enhance contacts table with additional fields
ALTER TABLE public.contacts 
ADD COLUMN notes TEXT,
ADD COLUMN department TEXT;

-- Add user roles table for admin/manager permissions
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'manager')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS for user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
CREATE POLICY "Users can view their own role" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Enhance proposals table
ALTER TABLE public.proposals 
ADD COLUMN version INTEGER DEFAULT 1,
ADD COLUMN parent_id UUID REFERENCES public.proposals(id),
ADD COLUMN cover_page JSONB DEFAULT '{}',
ADD COLUMN sections JSONB DEFAULT '[]',
ADD COLUMN attachments JSONB DEFAULT '[]',
ADD COLUMN signature_required BOOLEAN DEFAULT true,
ADD COLUMN tracking_data JSONB DEFAULT '{}';

-- Enhance invoices table with payment tracking (no gateway)
ALTER TABLE public.invoices 
ADD COLUMN payment_terms TEXT DEFAULT 'Net 30',
ADD COLUMN payment_notes TEXT,
ADD COLUMN reminder_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN discount_percentage NUMERIC DEFAULT 0,
ADD COLUMN discount_amount NUMERIC DEFAULT 0;

-- Create invoice_payments table for offline payment tracking
CREATE TABLE public.invoice_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL, -- 'bank_transfer', 'check', 'cash', 'other'
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reference_number TEXT,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for invoice_payments
ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for invoice_payments
CREATE POLICY "Users can view payments for their invoices" 
ON public.invoice_payments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.invoices 
  WHERE invoices.id = invoice_payments.invoice_id 
  AND invoices.created_by = auth.uid()
));

CREATE POLICY "Users can manage payments for their invoices" 
ON public.invoice_payments 
FOR ALL 
USING (auth.uid() = created_by AND EXISTS (
  SELECT 1 FROM public.invoices 
  WHERE invoices.id = invoice_payments.invoice_id 
  AND invoices.created_by = auth.uid()
));

-- Create activity_logs table for tracking
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL, -- 'proposal', 'estimate', 'invoice', 'customer'
  entity_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'created', 'updated', 'viewed', 'sent', 'signed', etc.
  details JSONB DEFAULT '{}',
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for activity_logs
CREATE POLICY "Users can view logs for their entities" 
ON public.activity_logs 
FOR SELECT 
USING (
  (entity_type = 'customer' AND EXISTS (SELECT 1 FROM public.customers WHERE id = entity_id AND created_by = auth.uid())) OR
  (entity_type = 'proposal' AND EXISTS (SELECT 1 FROM public.proposals WHERE id = entity_id AND created_by = auth.uid())) OR
  (entity_type = 'estimate' AND EXISTS (SELECT 1 FROM public.estimates WHERE id = entity_id AND created_by = auth.uid())) OR
  (entity_type = 'invoice' AND EXISTS (SELECT 1 FROM public.invoices WHERE id = entity_id AND created_by = auth.uid()))
);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();