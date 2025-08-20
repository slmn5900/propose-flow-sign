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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
