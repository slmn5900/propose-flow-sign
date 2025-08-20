-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contacts table
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for customers
CREATE POLICY "Users can view their own customers" 
ON public.customers 
FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own customers" 
ON public.customers 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own customers" 
ON public.customers 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own customers" 
ON public.customers 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create policies for contacts
CREATE POLICY "Users can view contacts of their customers" 
ON public.contacts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.customers 
  WHERE customers.id = contacts.customer_id 
  AND customers.created_by = auth.uid()
));

CREATE POLICY "Users can create contacts for their customers" 
ON public.contacts 
FOR INSERT 
WITH CHECK (auth.uid() = created_by AND EXISTS (
  SELECT 1 FROM public.customers 
  WHERE customers.id = contacts.customer_id 
  AND customers.created_by = auth.uid()
));

CREATE POLICY "Users can update contacts of their customers" 
ON public.contacts 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.customers 
  WHERE customers.id = contacts.customer_id 
  AND customers.created_by = auth.uid()
));

CREATE POLICY "Users can delete contacts of their customers" 
ON public.contacts 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.customers 
  WHERE customers.id = contacts.customer_id 
  AND customers.created_by = auth.uid()
));

-- Add customer_id to proposals, estimates, and invoices
ALTER TABLE public.proposals ADD COLUMN customer_id UUID REFERENCES public.customers(id);
ALTER TABLE public.estimates ADD COLUMN customer_id UUID REFERENCES public.customers(id);
ALTER TABLE public.invoices ADD COLUMN customer_id UUID REFERENCES public.customers(id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();