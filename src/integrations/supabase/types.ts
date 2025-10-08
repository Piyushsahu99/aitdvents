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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      blogs: {
        Row: {
          ai_generated: boolean | null
          author: string
          category: string
          content: string
          created_at: string | null
          event_id: string | null
          excerpt: string
          id: string
          published: boolean | null
          read_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          author: string
          category: string
          content: string
          created_at?: string | null
          event_id?: string | null
          excerpt: string
          id?: string
          published?: boolean | null
          read_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          author?: string
          category?: string
          content?: string
          created_at?: string | null
          event_id?: string | null
          excerpt?: string
          id?: string
          published?: boolean | null
          read_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blogs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      bounties: {
        Row: {
          banner_url: string | null
          category: string
          created_at: string | null
          created_by: string | null
          deadline: string
          description: string
          difficulty: string
          id: string
          judging_criteria: string | null
          max_submissions: number | null
          prize_amount: string
          prize_currency: string | null
          requirements: string
          rules: string | null
          status: Database["public"]["Enums"]["event_status"]
          tags: string[] | null
          title: string
          total_participants: number | null
          updated_at: string | null
        }
        Insert: {
          banner_url?: string | null
          category: string
          created_at?: string | null
          created_by?: string | null
          deadline: string
          description: string
          difficulty: string
          id?: string
          judging_criteria?: string | null
          max_submissions?: number | null
          prize_amount: string
          prize_currency?: string | null
          requirements: string
          rules?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          tags?: string[] | null
          title: string
          total_participants?: number | null
          updated_at?: string | null
        }
        Update: {
          banner_url?: string | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          deadline?: string
          description?: string
          difficulty?: string
          id?: string
          judging_criteria?: string | null
          max_submissions?: number | null
          prize_amount?: string
          prize_currency?: string | null
          requirements?: string
          rules?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          tags?: string[] | null
          title?: string
          total_participants?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bounty_payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          paid_at: string | null
          payment_method: string | null
          status: string
          submission_id: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          status?: string
          submission_id: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          status?: string
          submission_id?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bounty_payments_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "bounty_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      bounty_submissions: {
        Row: {
          bounty_id: string
          description: string
          feedback: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          score: number | null
          status: string
          submission_url: string
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          bounty_id: string
          description: string
          feedback?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number | null
          status?: string
          submission_url: string
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          bounty_id?: string
          description?: string
          feedback?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number | null
          status?: string
          submission_url?: string
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bounty_submissions_bounty_id_fkey"
            columns: ["bounty_id"]
            isOneToOne: false
            referencedRelation: "bounties"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          date: string
          description: string
          external_link: string | null
          hashtags: string[] | null
          id: string
          location: string
          participants: number | null
          poster_url: string | null
          status: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          date: string
          description: string
          external_link?: string | null
          hashtags?: string[] | null
          id?: string
          location: string
          participants?: number | null
          poster_url?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string
          external_link?: string | null
          hashtags?: string[] | null
          id?: string
          location?: string
          participants?: number | null
          poster_url?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hackathons: {
        Row: {
          banner_url: string | null
          category: string
          created_at: string | null
          created_by: string | null
          description: string
          difficulty: string
          end_date: string
          external_link: string | null
          id: string
          location: string
          max_team_size: number
          mode: string
          organizer: string
          prize_pool: string
          registration_deadline: string
          start_date: string
          status: Database["public"]["Enums"]["event_status"]
          themes: Json | null
          title: string
          total_participants: number | null
          updated_at: string | null
        }
        Insert: {
          banner_url?: string | null
          category: string
          created_at?: string | null
          created_by?: string | null
          description: string
          difficulty: string
          end_date: string
          external_link?: string | null
          id?: string
          location: string
          max_team_size?: number
          mode: string
          organizer: string
          prize_pool: string
          registration_deadline: string
          start_date: string
          status?: Database["public"]["Enums"]["event_status"]
          themes?: Json | null
          title: string
          total_participants?: number | null
          updated_at?: string | null
        }
        Update: {
          banner_url?: string | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          difficulty?: string
          end_date?: string
          external_link?: string | null
          id?: string
          location?: string
          max_team_size?: number
          mode?: string
          organizer?: string
          prize_pool?: string
          registration_deadline?: string
          start_date?: string
          status?: Database["public"]["Enums"]["event_status"]
          themes?: Json | null
          title?: string
          total_participants?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          apply_by: string | null
          category: string
          company: string
          created_at: string | null
          created_by: string | null
          description: string | null
          duration: string
          id: string
          location: string
          requirements: string | null
          status: Database["public"]["Enums"]["event_status"]
          stipend: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          apply_by?: string | null
          category: string
          company: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration: string
          id?: string
          location: string
          requirements?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          stipend: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          apply_by?: string | null
          category?: string
          company?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration?: string
          id?: string
          location?: string
          requirements?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          stipend?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      scholarships: {
        Row: {
          amount: string
          category: string
          created_at: string | null
          created_by: string | null
          deadline: string
          description: string
          eligibility: string
          id: string
          provider: string
          requirements: string | null
          status: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          amount: string
          category: string
          created_at?: string | null
          created_by?: string | null
          deadline: string
          description: string
          eligibility: string
          id?: string
          provider: string
          requirements?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          amount?: string
          category?: string
          created_at?: string | null
          created_by?: string | null
          deadline?: string
          description?: string
          eligibility?: string
          id?: string
          provider?: string
          requirements?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      event_status: "draft" | "live" | "ended"
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
    Enums: {
      app_role: ["admin", "user"],
      event_status: ["draft", "live", "ended"],
    },
  },
} as const
