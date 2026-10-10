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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor: string | null
          created_at: string
          detail: Json
          id: number
          target: string | null
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string
          detail?: Json
          id?: never
          target?: string | null
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string
          detail?: Json
          id?: never
          target?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_fkey"
            columns: ["actor"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_notices: {
        Row: {
          author_id: string | null
          body: string
          community: string
          created_at: string
          destination_id: string
          ends_on: string
          id: string
          is_active: boolean
          kind: Database["public"]["Enums"]["notice_kind"]
          starts_on: string
          title: string
        }
        Insert: {
          author_id?: string | null
          body?: string
          community?: string
          created_at?: string
          destination_id: string
          ends_on: string
          id?: string
          is_active?: boolean
          kind: Database["public"]["Enums"]["notice_kind"]
          starts_on: string
          title: string
        }
        Update: {
          author_id?: string | null
          body?: string
          community?: string
          created_at?: string
          destination_id?: string
          ends_on?: string
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["notice_kind"]
          starts_on?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_notices_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_notices_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      destinations: {
        Row: {
          access: Json
          aliases: string[]
          carrying_capacity: number | null
          cover_url: string | null
          created_at: string
          culture: string
          district: string
          ecosystem: string
          etiquette: string[]
          facts: Json
          id: string
          is_lesser_known: boolean
          is_published: boolean
          kind: string
          lat: number
          lng: number
          name: string
          place: string
          sensitivity: Database["public"]["Enums"]["sensitivity"]
          slug: string
          state_code: string
          summary: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          access?: Json
          aliases?: string[]
          carrying_capacity?: number | null
          cover_url?: string | null
          created_at?: string
          culture?: string
          district?: string
          ecosystem?: string
          etiquette?: string[]
          facts?: Json
          id?: string
          is_lesser_known?: boolean
          is_published?: boolean
          kind?: string
          lat: number
          lng: number
          name: string
          place?: string
          sensitivity?: Database["public"]["Enums"]["sensitivity"]
          slug: string
          state_code: string
          summary?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          access?: Json
          aliases?: string[]
          carrying_capacity?: number | null
          cover_url?: string | null
          created_at?: string
          culture?: string
          district?: string
          ecosystem?: string
          etiquette?: string[]
          facts?: Json
          id?: string
          is_lesser_known?: boolean
          is_published?: boolean
          kind?: string
          lat?: number
          lng?: number
          name?: string
          place?: string
          sensitivity?: Database["public"]["Enums"]["sensitivity"]
          slug?: string
          state_code?: string
          summary?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "destinations_state_code_fkey"
            columns: ["state_code"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "destinations_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          community: string
          created_at: string
          created_by: string | null
          description: string
          destination_id: string | null
          ends_on: string
          etiquette: string[]
          id: string
          is_published: boolean
          name: string
          open_to_visitors: boolean
          starts_on: string
          state_code: string
          visitor_impact: Database["public"]["Enums"]["sensitivity"]
        }
        Insert: {
          community?: string
          created_at?: string
          created_by?: string | null
          description?: string
          destination_id?: string | null
          ends_on: string
          etiquette?: string[]
          id?: string
          is_published?: boolean
          name: string
          open_to_visitors?: boolean
          starts_on: string
          state_code: string
          visitor_impact?: Database["public"]["Enums"]["sensitivity"]
        }
        Update: {
          community?: string
          created_at?: string
          created_by?: string | null
          description?: string
          destination_id?: string | null
          ends_on?: string
          etiquette?: string[]
          id?: string
          is_published?: boolean
          name?: string
          open_to_visitors?: boolean
          starts_on?: string
          state_code?: string
          visitor_impact?: Database["public"]["Enums"]["sensitivity"]
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_state_code_fkey"
            columns: ["state_code"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["code"]
          },
        ]
      }
      heritage_sites: {
        Row: {
          community: string
          community_endorsed_at: string | null
          community_endorsed_by: string | null
          created_at: string
          created_by: string | null
          description: string
          destination_id: string | null
          guidelines: string[]
          id: string
          is_published: boolean
          lat: number | null
          lng: number | null
          name: string
          photography: string
          protection: string
          restricted: boolean
          site_type: string
          state_code: string
        }
        Insert: {
          community?: string
          community_endorsed_at?: string | null
          community_endorsed_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          destination_id?: string | null
          guidelines?: string[]
          id?: string
          is_published?: boolean
          lat?: number | null
          lng?: number | null
          name: string
          photography?: string
          protection?: string
          restricted?: boolean
          site_type?: string
          state_code: string
        }
        Update: {
          community?: string
          community_endorsed_at?: string | null
          community_endorsed_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          destination_id?: string | null
          guidelines?: string[]
          id?: string
          is_published?: boolean
          lat?: number | null
          lng?: number | null
          name?: string
          photography?: string
          protection?: string
          restricted?: boolean
          site_type?: string
          state_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "heritage_sites_community_endorsed_by_fkey"
            columns: ["community_endorsed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "heritage_sites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "heritage_sites_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "heritage_sites_state_code_fkey"
            columns: ["state_code"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["code"]
          },
        ]
      }
      indicators: {
        Row: {
          destination_id: string
          id: string
          kind: string
          label: string
          level: Database["public"]["Enums"]["level"]
          source: string
          updated_at: string
          value: string
        }
        Insert: {
          destination_id: string
          id?: string
          kind: string
          label: string
          level?: Database["public"]["Enums"]["level"]
          source?: string
          updated_at?: string
          value: string
        }
        Update: {
          destination_id?: string
          id?: string
          kind?: string
          label?: string
          level?: Database["public"]["Enums"]["level"]
          source?: string
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "indicators_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      panoramas: {
        Row: {
          author_id: string | null
          captured_at: string
          client_id: string | null
          cover_path: string | null
          created_at: string
          destination_id: string
          frame_count: number
          frames: Json
          hfov: number
          id: string
          lat: number | null
          lng: number | null
          status: Database["public"]["Enums"]["review_status"]
          title: string
          vfov: number
        }
        Insert: {
          author_id?: string | null
          captured_at?: string
          client_id?: string | null
          cover_path?: string | null
          created_at?: string
          destination_id: string
          frame_count?: number
          frames?: Json
          hfov?: number
          id?: string
          lat?: number | null
          lng?: number | null
          status?: Database["public"]["Enums"]["review_status"]
          title?: string
          vfov?: number
        }
        Update: {
          author_id?: string | null
          captured_at?: string
          client_id?: string | null
          cover_path?: string | null
          created_at?: string
          destination_id?: string
          frame_count?: number
          frames?: Json
          hfov?: number
          id?: string
          lat?: number | null
          lng?: number | null
          status?: Database["public"]["Enums"]["review_status"]
          title?: string
          vfov?: number
        }
        Relationships: [
          {
            foreignKeyName: "panoramas_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panoramas_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          description: string
          grp: string
          key: string
          label: string
        }
        Insert: {
          description?: string
          grp: string
          key: string
          label: string
        }
        Update: {
          description?: string
          grp?: string
          key?: string
          label?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          home_state: string | null
          id: string
          is_active: boolean
          phone: string | null
          requested_role: string | null
          role: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          home_state?: string | null
          id: string
          is_active?: boolean
          phone?: string | null
          requested_role?: string | null
          role?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          home_state?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          requested_role?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_home_state_fkey"
            columns: ["home_state"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "profiles_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["key"]
          },
        ]
      }
      recommendations: {
        Row: {
          body: string
          destination_id: string
          generated_at: string
          meta: string
        }
        Insert: {
          body: string
          destination_id: string
          generated_at?: string
          meta?: string
        }
        Update: {
          body?: string
          destination_id?: string
          generated_at?: string
          meta?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: true
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      report_photos: {
        Row: {
          created_at: string
          id: string
          report_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          id?: string
          report_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          id?: string
          report_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_photos_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          accuracy_m: number | null
          author_id: string | null
          body: string
          captured_at: string
          category: Database["public"]["Enums"]["report_category"]
          client_id: string | null
          created_at: string
          destination_id: string
          id: string
          lat: number | null
          lng: number | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_note: string | null
          source: string
          source_label: string
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          accuracy_m?: number | null
          author_id?: string | null
          body: string
          captured_at?: string
          category: Database["public"]["Enums"]["report_category"]
          client_id?: string | null
          created_at?: string
          destination_id: string
          id?: string
          lat?: number | null
          lng?: number | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          source?: string
          source_label?: string
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          accuracy_m?: number | null
          author_id?: string | null
          body?: string
          captured_at?: string
          category?: Database["public"]["Enums"]["report_category"]
          client_id?: string | null
          created_at?: string
          destination_id?: string
          id?: string
          lat?: number | null
          lng?: number | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          source?: string
          source_label?: string
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          color: string
          created_at: string
          description: string
          is_system: boolean
          key: string
          name: string
          permissions: string[]
          rank: number
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string
          is_system?: boolean
          key: string
          name: string
          permissions?: string[]
          rank: number
        }
        Update: {
          color?: string
          created_at?: string
          description?: string
          is_system?: boolean
          key?: string
          name?: string
          permissions?: string[]
          rank?: number
        }
        Relationships: []
      }
      seasonal_conditions: {
        Row: {
          destination_id: string
          month: number
          note: string
          suitability: Database["public"]["Enums"]["suitability"]
        }
        Insert: {
          destination_id: string
          month: number
          note?: string
          suitability: Database["public"]["Enums"]["suitability"]
        }
        Update: {
          destination_id?: string
          month?: number
          note?: string
          suitability?: Database["public"]["Enums"]["suitability"]
        }
        Relationships: [
          {
            foreignKeyName: "seasonal_conditions_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          invited_by: string | null
          role: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          invited_by?: string | null
          role: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          invited_by?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_invites_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["key"]
          },
        ]
      }
      states: {
        Row: {
          code: string
          name: string
          sort: number
        }
        Insert: {
          code: string
          name: string
          sort?: number
        }
        Update: {
          code?: string
          name?: string
          sort?: number
        }
        Relationships: []
      }
      trip_stops: {
        Row: {
          day: string
          destination_id: string
          id: string
          note: string
          position: number
          trip_id: string
        }
        Insert: {
          day: string
          destination_id: string
          id?: string
          note?: string
          position?: number
          trip_id: string
        }
        Update: {
          day?: string
          destination_id?: string
          id?: string
          note?: string
          position?: number
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_stops_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_stops_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          created_at: string
          end_date: string
          id: string
          notes: string
          owner_id: string
          party_size: number
          start_date: string
          status: Database["public"]["Enums"]["trip_status"]
          title: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          notes?: string
          owner_id?: string
          party_size?: number
          start_date: string
          status?: Database["public"]["Enums"]["trip_status"]
          title?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          notes?: string
          owner_id?: string
          party_size?: number
          start_date?: string
          status?: Database["public"]["Enums"]["trip_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_counts: {
        Row: {
          day: string
          destination_id: string
          recorded_by: string | null
          source: string
          visitors: number
        }
        Insert: {
          day: string
          destination_id: string
          recorded_by?: string | null
          source?: string
          visitors: number
        }
        Update: {
          day?: string
          destination_id?: string
          recorded_by?: string | null
          source?: string
          visitors?: number
        }
        Relationships: [
          {
            foreignKeyName: "visitor_counts_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitor_counts_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          contact: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          contact: string
          created_at?: string
          id?: string
          role?: string
        }
        Update: {
          contact?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      crm_stats: { Args: never; Returns: Json }
      decline_role_request: { Args: { target: string }; Returns: undefined }
      destination_overview: {
        Args: { on_day?: string }
        Returns: {
          capacity: number
          community_closed: boolean
          counted: number
          district: string
          ecosystem: string
          expected: number
          id: string
          is_lesser_known: boolean
          kind: string
          lat: number
          lng: number
          load_ratio: number
          name: string
          notice: string
          open_issues: number
          planned: number
          risk_issues: number
          risk_level: Database["public"]["Enums"]["level"]
          risk_pressure: number
          risk_score: number
          risk_season: number
          risk_sensitivity: number
          sensitivity: Database["public"]["Enums"]["sensitivity"]
          slug: string
          state_code: string
          suitability: Database["public"]["Enums"]["suitability"]
        }[]
      }
      distance_km: {
        Args: { lat1: number; lat2: number; lng1: number; lng2: number }
        Returns: number
      }
      endorse_heritage: {
        Args: { endorse: boolean; site: string }
        Returns: undefined
      }
      has_perm: { Args: { p: string }; Returns: boolean }
      invite_staff: {
        Args: { p_email: string; p_role: string }
        Returns: string
      }
      log_action: {
        Args: { p_action: string; p_detail?: Json; p_target: string }
        Returns: undefined
      }
      my_rank: { Args: never; Returns: number }
      recurring_issues: {
        Args: { window_days?: number }
        Returns: {
          category: Database["public"]["Enums"]["report_category"]
          destination_id: string
          last_at: string
          name: string
          reports: number
          slug: string
          state_code: string
        }[]
      }
      set_user_active: {
        Args: { active: boolean; target: string }
        Returns: undefined
      }
      set_user_role: {
        Args: { new_role: string; target: string }
        Returns: undefined
      }
      suggest_alternatives: {
        Args: { dest: string; max_results?: number; on_day?: string }
        Returns: {
          distance_km: number
          id: string
          is_lesser_known: boolean
          load_ratio: number
          name: string
          risk_score: number
          slug: string
          state_code: string
          suitability: Database["public"]["Enums"]["suitability"]
        }[]
      }
    }
    Enums: {
      level: "good" | "warn" | "high" | "none"
      notice_kind: "closure" | "sacred_day" | "restriction" | "advisory"
      report_category:
        | "road"
        | "trail"
        | "weather"
        | "waste"
        | "crowd"
        | "closure"
        | "wildlife"
        | "heritage"
      report_status:
        | "pending"
        | "verified"
        | "official"
        | "unverified"
        | "rejected"
      review_status: "pending" | "published" | "rejected"
      sensitivity: "low" | "medium" | "high" | "critical"
      suitability: "good" | "fair" | "poor" | "closed"
      trip_status: "draft" | "planned" | "completed" | "cancelled"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      level: ["good", "warn", "high", "none"],
      notice_kind: ["closure", "sacred_day", "restriction", "advisory"],
      report_category: [
        "road",
        "trail",
        "weather",
        "waste",
        "crowd",
        "closure",
        "wildlife",
        "heritage",
      ],
      report_status: [
        "pending",
        "verified",
        "official",
        "unverified",
        "rejected",
      ],
      review_status: ["pending", "published", "rejected"],
      sensitivity: ["low", "medium", "high", "critical"],
      suitability: ["good", "fair", "poor", "closed"],
      trip_status: ["draft", "planned", "completed", "cancelled"],
    },
  },
} as const
