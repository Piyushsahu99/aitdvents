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
      assignment_submissions: {
        Row: {
          assignment_id: string
          content: string
          feedback: string | null
          file_url: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          score: number | null
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          assignment_id: string
          content: string
          feedback?: string | null
          file_url?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          score?: number | null
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          assignment_id?: string
          content?: string
          feedback?: string | null
          file_url?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          score?: number | null
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          created_at: string | null
          description: string
          due_date: string | null
          id: string
          lesson_id: string
          max_score: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description: string
          due_date?: string | null
          id?: string
          lesson_id: string
          max_score?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string
          due_date?: string | null
          id?: string
          lesson_id?: string
          max_score?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
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
          posted_by_student: boolean | null
          prize_amount: string
          prize_currency: string | null
          requirements: string
          rules: string | null
          status: Database["public"]["Enums"]["event_status"]
          tags: string[] | null
          task_type: string | null
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
          posted_by_student?: boolean | null
          prize_amount: string
          prize_currency?: string | null
          requirements: string
          rules?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          tags?: string[] | null
          task_type?: string | null
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
          posted_by_student?: boolean | null
          prize_amount?: string
          prize_currency?: string | null
          requirements?: string
          rules?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          tags?: string[] | null
          task_type?: string | null
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
      community_links: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string
          id: string
          is_active: boolean | null
          platform: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon: string
          id?: string
          is_active?: boolean | null
          platform: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean | null
          platform?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string | null
          id: string
          progress_percentage: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string | null
          id?: string
          progress_percentage?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string | null
          id?: string
          progress_percentage?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string
          duration: string
          enrolled_count: number | null
          id: string
          instructor_bio: string | null
          instructor_name: string
          is_free: boolean | null
          level: string
          price: number | null
          rating: number | null
          status: Database["public"]["Enums"]["event_status"]
          thumbnail_url: string | null
          title: string
          total_lessons: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description: string
          duration: string
          enrolled_count?: number | null
          id?: string
          instructor_bio?: string | null
          instructor_name: string
          is_free?: boolean | null
          level?: string
          price?: number | null
          rating?: number | null
          status?: Database["public"]["Enums"]["event_status"]
          thumbnail_url?: string | null
          title: string
          total_lessons?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          duration?: string
          enrolled_count?: number | null
          id?: string
          instructor_bio?: string | null
          instructor_name?: string
          is_free?: boolean | null
          level?: string
          price?: number | null
          rating?: number | null
          status?: Database["public"]["Enums"]["event_status"]
          thumbnail_url?: string | null
          title?: string
          total_lessons?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          applied_count: number | null
          category: string
          created_at: string | null
          created_by: string | null
          date: string
          days_left: number | null
          description: string
          external_link: string | null
          hashtags: string[] | null
          id: string
          is_free: boolean | null
          is_online: boolean | null
          location: string
          participants: number | null
          poster_url: string | null
          status: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          applied_count?: number | null
          category: string
          created_at?: string | null
          created_by?: string | null
          date: string
          days_left?: number | null
          description: string
          external_link?: string | null
          hashtags?: string[] | null
          id?: string
          is_free?: boolean | null
          is_online?: boolean | null
          location: string
          participants?: number | null
          poster_url?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          applied_count?: number | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          date?: string
          days_left?: number | null
          description?: string
          external_link?: string | null
          hashtags?: string[] | null
          id?: string
          is_free?: boolean | null
          is_online?: boolean | null
          location?: string
          participants?: number | null
          poster_url?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "student_groups"
            referencedColumns: ["id"]
          },
        ]
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
      lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          enrollment_id: string
          id: string
          last_position: number | null
          lesson_id: string
          time_spent_minutes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          enrollment_id: string
          id?: string
          last_position?: number | null
          lesson_id: string
          time_spent_minutes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          enrollment_id?: string
          id?: string
          last_position?: number | null
          lesson_id?: string
          time_spent_minutes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "course_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string
          course_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_free_preview: boolean | null
          order_index: number
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          content: string
          course_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free_preview?: boolean | null
          order_index: number
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          content?: string
          course_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free_preview?: boolean | null
          order_index?: number
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      page_banners: {
        Row: {
          background_color: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          link_text: string | null
          link_url: string | null
          order_index: number | null
          page: string
          position: string
          start_date: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          background_color?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_text?: string | null
          link_url?: string | null
          order_index?: number | null
          page: string
          position?: string
          start_date?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          background_color?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_text?: string | null
          link_url?: string | null
          order_index?: number | null
          page?: string
          position?: string
          start_date?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          converted_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_id: string | null
          referrer_id: string
          status: string
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_id?: string | null
          referrer_id: string
          status?: string
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_id?: string | null
          referrer_id?: string
          status?: string
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
      site_content: {
        Row: {
          content_key: string
          content_type: string
          content_value: string | null
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean | null
          link_url: string | null
          order_index: number | null
          page: string
          section: string
          updated_at: string
        }
        Insert: {
          content_key: string
          content_type?: string
          content_value?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          order_index?: number | null
          page: string
          section: string
          updated_at?: string
        }
        Update: {
          content_key?: string
          content_type?: string
          content_value?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          order_index?: number | null
          page?: string
          section?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_groups: {
        Row: {
          avatar_url: string | null
          category: string
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_public: boolean | null
          max_members: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          category: string
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          max_members?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          category?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          max_members?: number | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          college: string | null
          created_at: string | null
          email_verified: boolean | null
          full_name: string
          github_url: string | null
          graduation_year: number | null
          id: string
          interests: string[] | null
          is_looking_for_team: boolean | null
          is_public: boolean | null
          linkedin_url: string | null
          phone: string | null
          phone_verified: boolean | null
          portfolio_url: string | null
          skills: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          college?: string | null
          created_at?: string | null
          email_verified?: boolean | null
          full_name: string
          github_url?: string | null
          graduation_year?: number | null
          id?: string
          interests?: string[] | null
          is_looking_for_team?: boolean | null
          is_public?: boolean | null
          linkedin_url?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          portfolio_url?: string | null
          skills?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          college?: string | null
          created_at?: string | null
          email_verified?: boolean | null
          full_name?: string
          github_url?: string | null
          graduation_year?: number | null
          id?: string
          interests?: string[] | null
          is_looking_for_team?: boolean | null
          is_public?: boolean | null
          linkedin_url?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          portfolio_url?: string | null
          skills?: string[] | null
          updated_at?: string | null
          user_id?: string
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
      is_admin: { Args: never; Returns: boolean }
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
