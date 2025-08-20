export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string
          entity_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string
          created_by: string
          customer_id: string
          department: string | null
          email: string
          id: string
          is_primary: boolean | null
          name: string
          notes: string | null
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          customer_id: string
          department?: string | null
          email: string
          id?: string
          is_primary?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          customer_id?: string
          department?: string | null
          email?: string
          id?: string
          is_primary?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          company: string | null
          created_at: string
          created_by: string
          email: string
          id: string
          industry: string | null
          name: string
          notes: string | null
          phone: string | null
          status: string | null
          tags: string[] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          company?: string | null
          created_at?: string
          created_by: string
          email: string
          id?: string
          industry?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          company?: string | null
          created_at?: string
          created_by?: string
          email?: string
          id?: string
          industry?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      engagement_tracking: {
        Row: {
          client_ip: string | null
          created_at: string
          document_id: string
          document_type: string
          id: string
          last_viewed_at: string | null
          page_views: number | null
          sections_viewed: Json | null
          session_id: string
          time_spent: number | null
          user_agent: string | null
        }
        Insert: {
          client_ip?: string | null
          created_at?: string
          document_id: string
          document_type: string
          id?: string
          last_viewed_at?: string | null
          page_views?: number | null
          sections_viewed?: Json | null
          session_id: string
          time_spent?: number | null
          user_agent?: string | null
        }
        Update: {
          client_ip?: string | null
          created_at?: string
          document_id?: string
          document_type?: string
          id?: string
          last_viewed_at?: string | null
          page_views?: number | null
          sections_viewed?: Json | null
          session_id?: string
          time_spent?: number | null
          user_agent?: string | null
        }
        Relationships: []
      }
      estimates: {
        Row: {
          client_company: string | null
          client_email: string
          client_name: string
          created_at: string
          created_by: string
          currency: string | null
          customer_id: string | null
          description: string | null
          id: string
          items: Json | null
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
          title: string
          total_amount: number | null
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          client_company?: string | null
          client_email: string
          client_name: string
          created_at?: string
          created_by: string
          currency?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          items?: Json | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          title: string
          total_amount?: number | null
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          client_company?: string | null
          client_email?: string
          client_name?: string
          created_at?: string
          created_by?: string
          currency?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          items?: Json | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          title?: string
          total_amount?: number | null
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estimates_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_method: string
          reference_number: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          created_by: string
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date: string
          payment_method: string
          reference_number?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_company: string | null
          client_email: string
          client_name: string
          created_at: string
          created_by: string
          currency: string | null
          customer_id: string | null
          description: string | null
          discount_amount: number | null
          discount_percentage: number | null
          due_date: string | null
          estimate_id: string | null
          id: string
          invoice_number: string
          items: Json | null
          paid_at: string | null
          payment_method: string | null
          payment_notes: string | null
          payment_terms: string | null
          proposal_id: string | null
          reminder_sent_at: string | null
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
          title: string
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          client_company?: string | null
          client_email: string
          client_name: string
          created_at?: string
          created_by: string
          currency?: string | null
          customer_id?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          due_date?: string | null
          estimate_id?: string | null
          id?: string
          invoice_number: string
          items?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          payment_notes?: string | null
          payment_terms?: string | null
          proposal_id?: string | null
          reminder_sent_at?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          title: string
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          client_company?: string | null
          client_email?: string
          client_name?: string
          created_at?: string
          created_by?: string
          currency?: string | null
          customer_id?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          due_date?: string | null
          estimate_id?: string | null
          id?: string
          invoice_number?: string
          items?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          payment_notes?: string | null
          payment_terms?: string | null
          proposal_id?: string | null
          reminder_sent_at?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          title?: string
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          alt_text: string | null
          created_at: string
          file_size: number | null
          filename: string
          height: number | null
          id: string
          mime_type: string | null
          site_id: string | null
          url: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          file_size?: number | null
          filename: string
          height?: number | null
          id?: string
          mime_type?: string | null
          site_id?: string | null
          url: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          file_size?: number | null
          filename?: string
          height?: number | null
          id?: string
          mime_type?: string | null
          site_id?: string | null
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          role: string | null
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string | null
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          role?: string | null
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          blocks: Json | null
          created_at: string
          id: string
          path: string
          published_at: string | null
          seo_data: Json | null
          site_id: string | null
          status: string | null
          title: string
          updated_at: string
          version: number | null
        }
        Insert: {
          blocks?: Json | null
          created_at?: string
          id?: string
          path: string
          published_at?: string | null
          seo_data?: Json | null
          site_id?: string | null
          status?: string | null
          title: string
          updated_at?: string
          version?: number | null
        }
        Update: {
          blocks?: Json | null
          created_at?: string
          id?: string
          path?: string
          published_at?: string | null
          seo_data?: Json | null
          site_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pages_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      proposals: {
        Row: {
          attachments: Json | null
          client_company: string | null
          client_email: string
          client_name: string
          content: Json | null
          cover_page: Json | null
          created_at: string
          created_by: string
          currency: string | null
          customer_id: string | null
          description: string | null
          expires_at: string | null
          id: string
          parent_id: string | null
          sections: Json | null
          signature_data: Json | null
          signature_required: boolean | null
          signed_at: string | null
          status: string | null
          title: string
          total_amount: number | null
          tracking_data: Json | null
          updated_at: string
          version: number | null
        }
        Insert: {
          attachments?: Json | null
          client_company?: string | null
          client_email: string
          client_name: string
          content?: Json | null
          cover_page?: Json | null
          created_at?: string
          created_by: string
          currency?: string | null
          customer_id?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          parent_id?: string | null
          sections?: Json | null
          signature_data?: Json | null
          signature_required?: boolean | null
          signed_at?: string | null
          status?: string | null
          title: string
          total_amount?: number | null
          tracking_data?: Json | null
          updated_at?: string
          version?: number | null
        }
        Update: {
          attachments?: Json | null
          client_company?: string | null
          client_email?: string
          client_name?: string
          content?: Json | null
          cover_page?: Json | null
          created_at?: string
          created_by?: string
          currency?: string | null
          customer_id?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          parent_id?: string | null
          sections?: Json | null
          signature_data?: Json | null
          signature_required?: boolean | null
          signed_at?: string | null
          status?: string | null
          title?: string
          total_amount?: number | null
          tracking_data?: Json | null
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          created_at: string
          id: string
          name: string
          primary_domain: string | null
          seo_config: Json | null
          status: string | null
          subdomain: string | null
          template_id: string | null
          tenant_id: string | null
          theme_config: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          primary_domain?: string | null
          seo_config?: Json | null
          status?: string | null
          subdomain?: string | null
          template_id?: string | null
          tenant_id?: string | null
          theme_config?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          primary_domain?: string | null
          seo_config?: Json | null
          status?: string | null
          subdomain?: string | null
          template_id?: string | null
          tenant_id?: string | null
          theme_config?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sites_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          industry: string
          is_featured: boolean | null
          json_schema: Json
          name: string
          thumbnail_url: string | null
          updated_at: string
          version: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          industry: string
          is_featured?: boolean | null
          json_schema: Json
          name: string
          thumbnail_url?: string | null
          updated_at?: string
          version?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          industry?: string
          is_featured?: boolean | null
          json_schema?: Json
          name?: string
          thumbnail_url?: string | null
          updated_at?: string
          version?: number | null
        }
        Relationships: []
      }
      tenants: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          plan: string | null
          slug: string
          status: string | null
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          plan?: string | null
          slug: string
          status?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          plan?: string | null
          slug?: string
          status?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          permissions: Json | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permissions?: Json | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permissions?: Json | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
