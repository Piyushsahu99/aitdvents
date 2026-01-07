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
      achievements: {
        Row: {
          category: string
          created_at: string | null
          description: string
          icon: string
          id: string
          is_active: boolean | null
          name: string
          points_reward: number
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          category?: string
          created_at?: string | null
          description: string
          icon?: string
          id?: string
          is_active?: boolean | null
          name: string
          points_reward?: number
          requirement_type: string
          requirement_value: number
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          points_reward?: number
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      admin_invites: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invite_code: string
          invited_by: string | null
          status: string
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invite_code?: string
          invited_by?: string | null
          status?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invite_code?: string
          invited_by?: string | null
          status?: string
          used_at?: string | null
        }
        Relationships: []
      }
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
      campus_ambassadors: {
        Row: {
          admin_notes: string | null
          city: string
          college: string
          course: string
          created_at: string
          email: string
          full_name: string
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          phone: string
          previous_experience: string | null
          skills: string[] | null
          state: string
          status: string
          updated_at: string
          user_id: string | null
          why_ambassador: string
          year_of_study: string
        }
        Insert: {
          admin_notes?: string | null
          city: string
          college: string
          course: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          phone: string
          previous_experience?: string | null
          skills?: string[] | null
          state: string
          status?: string
          updated_at?: string
          user_id?: string | null
          why_ambassador: string
          year_of_study: string
        }
        Update: {
          admin_notes?: string | null
          city?: string
          college?: string
          course?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          phone?: string
          previous_experience?: string | null
          skills?: string[] | null
          state?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          why_ambassador?: string
          year_of_study?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_templates: {
        Row: {
          background_color: string | null
          badge_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          primary_color: string | null
          template_type: string
          updated_at: string | null
        }
        Insert: {
          background_color?: string | null
          badge_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          primary_color?: string | null
          template_type?: string
          updated_at?: string | null
        }
        Update: {
          background_color?: string | null
          badge_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          template_type?: string
          updated_at?: string | null
        }
        Relationships: []
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
      coupons: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          current_uses: number
          discount_amount: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          min_order_amount: number | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          discount_amount?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_amount?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          discount_amount?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_amount?: number | null
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
      daily_login_rewards: {
        Row: {
          bonus_description: string | null
          created_at: string | null
          day_number: number
          id: string
          points_reward: number
        }
        Insert: {
          bonus_description?: string | null
          created_at?: string | null
          day_number: number
          id?: string
          points_reward: number
        }
        Update: {
          bonus_description?: string | null
          created_at?: string | null
          day_number?: number
          id?: string
          points_reward?: number
        }
        Relationships: []
      }
      event_rsvps: {
        Row: {
          additional_notes: string | null
          attending_mode: string
          check_in_time: string | null
          created_at: string | null
          dietary_requirements: string | null
          email: string
          event_id: string
          full_name: string
          id: string
          phone: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          additional_notes?: string | null
          attending_mode?: string
          check_in_time?: string | null
          created_at?: string | null
          dietary_requirements?: string | null
          email: string
          event_id: string
          full_name: string
          id?: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          additional_notes?: string | null
          attending_mode?: string
          check_in_time?: string | null
          created_at?: string | null
          dietary_requirements?: string | null
          email?: string
          event_id?: string
          full_name?: string
          id?: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
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
          submitted_by_user: boolean | null
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
          submitted_by_user?: boolean | null
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
          submitted_by_user?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          id: string
          issue: string | null
          rating: number
          suggestion: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          issue?: string | null
          rating: number
          suggestion?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          issue?: string | null
          rating?: number
          suggestion?: string | null
          user_id?: string | null
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
      issued_certificates: {
        Row: {
          certificate_number: string
          course_id: string | null
          created_at: string | null
          event_id: string | null
          id: string
          is_valid: boolean | null
          issue_date: string | null
          linkedin_credential_id: string | null
          metadata: Json | null
          recipient_email: string
          recipient_name: string
          template_id: string | null
          user_id: string | null
          valid_until: string | null
          verification_url: string | null
        }
        Insert: {
          certificate_number: string
          course_id?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          is_valid?: boolean | null
          issue_date?: string | null
          linkedin_credential_id?: string | null
          metadata?: Json | null
          recipient_email: string
          recipient_name: string
          template_id?: string | null
          user_id?: string | null
          valid_until?: string | null
          verification_url?: string | null
        }
        Update: {
          certificate_number?: string
          course_id?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          is_valid?: boolean | null
          issue_date?: string | null
          linkedin_credential_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          recipient_name?: string
          template_id?: string | null
          user_id?: string | null
          valid_until?: string | null
          verification_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issued_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issued_certificates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issued_certificates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "certificate_templates"
            referencedColumns: ["id"]
          },
        ]
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
      marketplace_products: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          category: Database["public"]["Enums"]["product_category"]
          condition: Database["public"]["Enums"]["product_condition"]
          contact_info: string | null
          created_at: string | null
          description: string
          id: string
          images: string[] | null
          is_admin_product: boolean | null
          location: string | null
          price: number
          rejection_reason: string | null
          seller_id: string
          status: Database["public"]["Enums"]["product_status"]
          subcategory: string | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          category?: Database["public"]["Enums"]["product_category"]
          condition?: Database["public"]["Enums"]["product_condition"]
          contact_info?: string | null
          created_at?: string | null
          description: string
          id?: string
          images?: string[] | null
          is_admin_product?: boolean | null
          location?: string | null
          price?: number
          rejection_reason?: string | null
          seller_id: string
          status?: Database["public"]["Enums"]["product_status"]
          subcategory?: string | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          category?: Database["public"]["Enums"]["product_category"]
          condition?: Database["public"]["Enums"]["product_condition"]
          contact_info?: string | null
          created_at?: string | null
          description?: string
          id?: string
          images?: string[] | null
          is_admin_product?: boolean | null
          location?: string | null
          price?: number
          rejection_reason?: string | null
          seller_id?: string
          status?: Database["public"]["Enums"]["product_status"]
          subcategory?: string | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      mentor_sessions: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          id: string
          meeting_link: string | null
          mentor_id: string
          notes: string | null
          points_cost: number
          scheduled_at: string
          status: string
          student_id: string
          student_rating: number | null
          student_review: string | null
          topic: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_link?: string | null
          mentor_id: string
          notes?: string | null
          points_cost: number
          scheduled_at: string
          status?: string
          student_id: string
          student_rating?: number | null
          student_review?: string | null
          topic: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_link?: string | null
          mentor_id?: string
          notes?: string | null
          points_cost?: number
          scheduled_at?: string
          status?: string
          student_id?: string
          student_rating?: number | null
          student_review?: string | null
          topic?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_sessions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors: {
        Row: {
          availability: Json | null
          bio: string | null
          created_at: string | null
          expertise: string[]
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          rate_per_session: number
          rating: number | null
          sessions_completed: number | null
          title: string
          total_reviews: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          availability?: Json | null
          bio?: string | null
          created_at?: string | null
          expertise: string[]
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          rate_per_session?: number
          rating?: number | null
          sessions_completed?: number | null
          title: string
          total_reviews?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          availability?: Json | null
          bio?: string | null
          created_at?: string | null
          expertise?: string[]
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          rate_per_session?: number
          rating?: number | null
          sessions_completed?: number | null
          title?: string
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          product_price: number
          product_title: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          product_price: number
          product_title: string
          quantity?: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          product_price?: number
          product_title?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          coupon_id: string | null
          created_at: string
          delivery_address: string
          delivery_city: string
          delivery_name: string
          delivery_phone: string
          delivery_pincode: string
          delivery_state: string
          discount_amount: number | null
          id: string
          order_number: string
          payment_reference: string | null
          payment_status: string
          status: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          coupon_id?: string | null
          created_at?: string
          delivery_address: string
          delivery_city: string
          delivery_name: string
          delivery_phone: string
          delivery_pincode: string
          delivery_state: string
          discount_amount?: number | null
          id?: string
          order_number: string
          payment_reference?: string | null
          payment_status?: string
          status?: string
          subtotal: number
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          coupon_id?: string | null
          created_at?: string
          delivery_address?: string
          delivery_city?: string
          delivery_name?: string
          delivery_phone?: string
          delivery_pincode?: string
          delivery_state?: string
          discount_amount?: number | null
          id?: string
          order_number?: string
          payment_reference?: string | null
          payment_status?: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
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
      points_transactions: {
        Row: {
          action_type: string
          amount: number
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      product_inquiries: {
        Row: {
          buyer_id: string
          created_at: string | null
          id: string
          message: string
          product_id: string
          responded_at: string | null
          seller_response: string | null
          status: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          id?: string
          message: string
          product_id: string
          responded_at?: string | null
          seller_response?: string | null
          status?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          id?: string
          message?: string
          product_id?: string
          responded_at?: string | null
          seller_response?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_inquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
        ]
      }
      reel_likes: {
        Row: {
          created_at: string | null
          id: string
          reel_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reel_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reel_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reel_likes_reel_id_fkey"
            columns: ["reel_id"]
            isOneToOne: false
            referencedRelation: "reels"
            referencedColumns: ["id"]
          },
        ]
      }
      reel_reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reel_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reel_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reel_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reel_reports_reel_id_fkey"
            columns: ["reel_id"]
            isOneToOne: false
            referencedRelation: "reels"
            referencedColumns: ["id"]
          },
        ]
      }
      reels: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          is_hidden: boolean | null
          likes_count: number | null
          platform: string
          reported_count: number | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string
          video_url: string
          views_count: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_hidden?: boolean | null
          likes_count?: number | null
          platform: string
          reported_count?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          video_url: string
          views_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_hidden?: boolean | null
          likes_count?: number | null
          platform?: string
          reported_count?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          video_url?: string
          views_count?: number | null
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
      reward_redemptions: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          id: string
          points_spent: number
          processed_at: string | null
          processed_by: string | null
          reward_description: string | null
          reward_name: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          points_spent: number
          processed_at?: string | null
          processed_by?: string | null
          reward_description?: string | null
          reward_name: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          points_spent?: number
          processed_at?: string | null
          processed_by?: string | null
          reward_description?: string | null
          reward_name?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      rewards_catalog: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          points_cost: number
          stock_quantity: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          points_cost: number
          stock_quantity?: number | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          points_cost?: number
          stock_quantity?: number | null
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
          share_phone_publicly: boolean | null
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
          share_phone_publicly?: boolean | null
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
          share_phone_publicly?: boolean | null
          skills?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      study_materials: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          category: string
          city: string | null
          college: string | null
          course: string | null
          created_at: string | null
          description: string | null
          downloads_count: number | null
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          is_admin_upload: boolean | null
          rejection_reason: string | null
          semester: string | null
          state: string | null
          status: string
          subject: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          university: string | null
          updated_at: string | null
          uploaded_by: string
          views_count: number | null
          year: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          city?: string | null
          college?: string | null
          course?: string | null
          created_at?: string | null
          description?: string | null
          downloads_count?: number | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          is_admin_upload?: boolean | null
          rejection_reason?: string | null
          semester?: string | null
          state?: string | null
          status?: string
          subject: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          university?: string | null
          updated_at?: string | null
          uploaded_by: string
          views_count?: number | null
          year?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          city?: string | null
          college?: string | null
          course?: string | null
          created_at?: string | null
          description?: string | null
          downloads_count?: number | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_admin_upload?: boolean | null
          rejection_reason?: string | null
          semester?: string | null
          state?: string | null
          status?: string
          subject?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          university?: string | null
          updated_at?: string | null
          uploaded_by?: string
          views_count?: number | null
          year?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_points: {
        Row: {
          bounties_completed: number | null
          connections_count: number | null
          courses_completed: number | null
          created_at: string | null
          daily_login_streak: number | null
          events_submitted: number | null
          id: string
          last_activity: string | null
          last_login_date: string | null
          level: number | null
          lifetime_points: number | null
          mentor_sessions_booked: number | null
          monthly_points: number | null
          profile_completeness: number | null
          reels_uploaded: number | null
          referrals_count: number | null
          resumes_created: number | null
          shares_count: number | null
          study_materials_uploaded: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string
          xp: number | null
        }
        Insert: {
          bounties_completed?: number | null
          connections_count?: number | null
          courses_completed?: number | null
          created_at?: string | null
          daily_login_streak?: number | null
          events_submitted?: number | null
          id?: string
          last_activity?: string | null
          last_login_date?: string | null
          level?: number | null
          lifetime_points?: number | null
          mentor_sessions_booked?: number | null
          monthly_points?: number | null
          profile_completeness?: number | null
          reels_uploaded?: number | null
          referrals_count?: number | null
          resumes_created?: number | null
          shares_count?: number | null
          study_materials_uploaded?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
          xp?: number | null
        }
        Update: {
          bounties_completed?: number | null
          connections_count?: number | null
          courses_completed?: number | null
          created_at?: string | null
          daily_login_streak?: number | null
          events_submitted?: number | null
          id?: string
          last_activity?: string | null
          last_login_date?: string | null
          level?: number | null
          lifetime_points?: number | null
          mentor_sessions_booked?: number | null
          monthly_points?: number | null
          profile_completeness?: number | null
          reels_uploaded?: number | null
          referrals_count?: number | null
          resumes_created?: number | null
          shares_count?: number | null
          study_materials_uploaded?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
          xp?: number | null
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
      award_points: {
        Args: {
          p_action_type: string
          p_amount: number
          p_description?: string
          p_reference_id?: string
          p_user_id: string
        }
        Returns: number
      }
      check_daily_login: { Args: { p_user_id: string }; Returns: Json }
      earn_points: {
        Args: {
          p_action_type: string
          p_description?: string
          p_reference_id?: string
        }
        Returns: number
      }
      generate_certificate_number: { Args: never; Returns: string }
      get_public_profile: {
        Args: { profile_user_id: string }
        Returns: {
          avatar_url: string
          bio: string
          college: string
          created_at: string
          full_name: string
          github_url: string
          graduation_year: number
          id: string
          interests: string[]
          is_looking_for_team: boolean
          is_public: boolean
          linkedin_url: string
          phone: string
          portfolio_url: string
          skills: string[]
          updated_at: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      spend_points: {
        Args: {
          p_action_type: string
          p_amount: number
          p_description?: string
          p_reference_id?: string
          p_user_id: string
        }
        Returns: boolean
      }
      use_admin_invite:
        | { Args: { invite_code_input: string }; Returns: boolean }
        | {
            Args: { invite_code_input: string; user_id_input: string }
            Returns: boolean
          }
      validate_admin_invite: {
        Args: { invite_code_input: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      event_status: "draft" | "live" | "ended"
      product_category:
        | "electronics"
        | "books"
        | "stationery"
        | "tasks"
        | "other"
      product_condition: "new" | "like_new" | "good" | "fair" | "old"
      product_status: "pending" | "approved" | "rejected" | "sold" | "archived"
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
      product_category: [
        "electronics",
        "books",
        "stationery",
        "tasks",
        "other",
      ],
      product_condition: ["new", "like_new", "good", "fair", "old"],
      product_status: ["pending", "approved", "rejected", "sold", "archived"],
    },
  },
} as const
