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
      activity_log: {
        Row: {
          action_description: string | null
          action_type: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action_description?: string | null
          action_type: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action_description?: string | null
          action_type?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_id?: string | null
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
      ambassador_event_registrations: {
        Row: {
          ambassador_id: string | null
          attended_at: string | null
          created_at: string | null
          event_id: string | null
          food_coupon_code: string | null
          id: string
          status: string
        }
        Insert: {
          ambassador_id?: string | null
          attended_at?: string | null
          created_at?: string | null
          event_id?: string | null
          food_coupon_code?: string | null
          id?: string
          status?: string
        }
        Update: {
          ambassador_id?: string | null
          attended_at?: string | null
          created_at?: string | null
          event_id?: string | null
          food_coupon_code?: string | null
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_event_registrations_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "campus_ambassadors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambassador_event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "ambassador_events"
            referencedColumns: ["id"]
          },
        ]
      }
      ambassador_events: {
        Row: {
          created_at: string | null
          cycle_id: string | null
          description: string | null
          eligible_min_points: number | null
          eligible_min_rank: number | null
          event_date: string
          event_type: string
          food_coupon_value: number | null
          id: string
          is_active: boolean | null
          location: string | null
          max_attendees: number | null
          meeting_link: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cycle_id?: string | null
          description?: string | null
          eligible_min_points?: number | null
          eligible_min_rank?: number | null
          event_date: string
          event_type?: string
          food_coupon_value?: number | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_link?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cycle_id?: string | null
          description?: string | null
          eligible_min_points?: number | null
          eligible_min_rank?: number | null
          event_date?: string
          event_type?: string
          food_coupon_value?: number | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_link?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_events_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "ambassador_program_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      ambassador_mentor_sessions: {
        Row: {
          ambassador_id: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          meeting_link: string | null
          mentor_id: string | null
          notes: string | null
          rating: number | null
          scheduled_at: string
          status: string
          topic: string
          updated_at: string | null
        }
        Insert: {
          ambassador_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_link?: string | null
          mentor_id?: string | null
          notes?: string | null
          rating?: number | null
          scheduled_at: string
          status?: string
          topic: string
          updated_at?: string | null
        }
        Update: {
          ambassador_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_link?: string | null
          mentor_id?: string | null
          notes?: string | null
          rating?: number | null
          scheduled_at?: string
          status?: string
          topic?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_mentor_sessions_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "campus_ambassadors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambassador_mentor_sessions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "ambassador_mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      ambassador_mentors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          expertise: string[] | null
          full_name: string
          id: string
          is_active: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          expertise?: string[] | null
          full_name: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          expertise?: string[] | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ambassador_points: {
        Row: {
          ambassador_id: string | null
          created_at: string | null
          cycle_id: string | null
          id: string
          rank: number | null
          tasks_completed: number | null
          team_size: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ambassador_id?: string | null
          created_at?: string | null
          cycle_id?: string | null
          id?: string
          rank?: number | null
          tasks_completed?: number | null
          team_size?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ambassador_id?: string | null
          created_at?: string | null
          cycle_id?: string | null
          id?: string
          rank?: number | null
          tasks_completed?: number | null
          team_size?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_points_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "campus_ambassadors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambassador_points_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "ambassador_program_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      ambassador_program_cycles: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          is_active: boolean | null
          name: string
          rewards_description: string | null
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          name: string
          rewards_description?: string | null
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          name?: string
          rewards_description?: string | null
          start_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ambassador_reward_claims: {
        Row: {
          ambassador_id: string | null
          created_at: string | null
          cycle_id: string | null
          fulfilled_at: string | null
          fulfillment_notes: string | null
          id: string
          reward_id: string | null
          status: string
        }
        Insert: {
          ambassador_id?: string | null
          created_at?: string | null
          cycle_id?: string | null
          fulfilled_at?: string | null
          fulfillment_notes?: string | null
          id?: string
          reward_id?: string | null
          status?: string
        }
        Update: {
          ambassador_id?: string | null
          created_at?: string | null
          cycle_id?: string | null
          fulfilled_at?: string | null
          fulfillment_notes?: string | null
          id?: string
          reward_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_reward_claims_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "campus_ambassadors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambassador_reward_claims_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "ambassador_program_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambassador_reward_claims_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "ambassador_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      ambassador_rewards: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          points_required: number
          quantity: number | null
          rank_required: number | null
          reward_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          points_required?: number
          quantity?: number | null
          rank_required?: number | null
          reward_type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          points_required?: number
          quantity?: number | null
          rank_required?: number | null
          reward_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ambassador_task_submissions: {
        Row: {
          admin_feedback: string | null
          ambassador_id: string | null
          attachments: string[] | null
          created_at: string | null
          id: string
          points_awarded: number | null
          proof_images: string[] | null
          proof_links: string[] | null
          report_content: string
          report_title: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_by_user_id: string | null
          task_id: string | null
        }
        Insert: {
          admin_feedback?: string | null
          ambassador_id?: string | null
          attachments?: string[] | null
          created_at?: string | null
          id?: string
          points_awarded?: number | null
          proof_images?: string[] | null
          proof_links?: string[] | null
          report_content: string
          report_title: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_by_user_id?: string | null
          task_id?: string | null
        }
        Update: {
          admin_feedback?: string | null
          ambassador_id?: string | null
          attachments?: string[] | null
          created_at?: string | null
          id?: string
          points_awarded?: number | null
          proof_images?: string[] | null
          proof_links?: string[] | null
          report_content?: string
          report_title?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_by_user_id?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_task_submissions_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "campus_ambassadors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambassador_task_submissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "ambassador_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      ambassador_tasks: {
        Row: {
          created_at: string | null
          cycle_id: string | null
          deadline: string | null
          description: string
          difficulty: string
          id: string
          instructions: string | null
          is_active: boolean | null
          max_completions: number | null
          points: number
          priority: number | null
          required_proof: string[] | null
          task_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cycle_id?: string | null
          deadline?: string | null
          description: string
          difficulty?: string
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          max_completions?: number | null
          points?: number
          priority?: number | null
          required_proof?: string[] | null
          task_type?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cycle_id?: string | null
          deadline?: string | null
          description?: string
          difficulty?: string
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          max_completions?: number | null
          points?: number
          priority?: number | null
          required_proof?: string[] | null
          task_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_tasks_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "ambassador_program_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      ambassador_team_members: {
        Row: {
          ambassador_id: string | null
          college: string | null
          created_at: string | null
          cycle_id: string | null
          designation: string | null
          email: string
          full_name: string
          id: string
          joined_at: string | null
          phone: string | null
          role: string
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ambassador_id?: string | null
          college?: string | null
          created_at?: string | null
          cycle_id?: string | null
          designation?: string | null
          email: string
          full_name: string
          id?: string
          joined_at?: string | null
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ambassador_id?: string | null
          college?: string | null
          created_at?: string | null
          cycle_id?: string | null
          designation?: string | null
          email?: string
          full_name?: string
          id?: string
          joined_at?: string | null
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_team_members_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "campus_ambassadors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambassador_team_members_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "ambassador_program_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_pinned: boolean | null
          is_read_by: string[] | null
          priority: string | null
          published_at: string | null
          published_by: string | null
          target_audience: string | null
          target_users: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_pinned?: boolean | null
          is_read_by?: string[] | null
          priority?: string | null
          published_at?: string | null
          published_by?: string | null
          target_audience?: string | null
          target_users?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_pinned?: boolean | null
          is_read_by?: string[] | null
          priority?: string | null
          published_at?: string | null
          published_by?: string | null
          target_audience?: string | null
          target_users?: string[] | null
          title?: string
          updated_at?: string | null
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
      auction_bids: {
        Row: {
          auction_id: string
          bid_amount: number
          bid_at: string | null
          id: string
          player_id: string
          team_id: string
        }
        Insert: {
          auction_id: string
          bid_amount: number
          bid_at?: string | null
          id?: string
          player_id: string
          team_id: string
        }
        Update: {
          auction_id?: string
          bid_amount?: number
          bid_at?: string | null
          id?: string
          player_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_bids_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "ipl_auctions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auction_bids_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "ipl_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auction_bids_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "auction_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_sold_players: {
        Row: {
          auction_id: string
          id: string
          player_id: string
          sold_at: string | null
          sold_price: number
          team_id: string
        }
        Insert: {
          auction_id: string
          id?: string
          player_id: string
          sold_at?: string | null
          sold_price: number
          team_id: string
        }
        Update: {
          auction_id?: string
          id?: string
          player_id?: string
          sold_at?: string | null
          sold_price?: number
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_sold_players_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "ipl_auctions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auction_sold_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "ipl_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auction_sold_players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "auction_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_teams: {
        Row: {
          auction_id: string
          id: string
          is_ready: boolean | null
          joined_at: string | null
          overseas_count: number | null
          players_count: number | null
          remaining_budget: number
          team_logo: string | null
          team_name: string
          user_id: string
        }
        Insert: {
          auction_id: string
          id?: string
          is_ready?: boolean | null
          joined_at?: string | null
          overseas_count?: number | null
          players_count?: number | null
          remaining_budget: number
          team_logo?: string | null
          team_name: string
          user_id: string
        }
        Update: {
          auction_id?: string
          id?: string
          is_ready?: boolean | null
          joined_at?: string | null
          overseas_count?: number | null
          players_count?: number | null
          remaining_budget?: number
          team_logo?: string | null
          team_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_teams_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "ipl_auctions"
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
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          room_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          room_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string
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
      crm_tasks: {
        Row: {
          actual_hours: number | null
          assigned_by: string | null
          assigned_to: string | null
          attachments: string[] | null
          category: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          parent_task_id: string | null
          points_reward: number | null
          priority: string | null
          recurrence_pattern: Json | null
          recurring: boolean | null
          started_at: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_hours?: number | null
          assigned_by?: string | null
          assigned_to?: string | null
          attachments?: string[] | null
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          parent_task_id?: string | null
          points_reward?: number | null
          priority?: string | null
          recurrence_pattern?: Json | null
          recurring?: boolean | null
          started_at?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_hours?: number | null
          assigned_by?: string | null
          assigned_to?: string | null
          attachments?: string[] | null
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          parent_task_id?: string | null
          points_reward?: number | null
          priority?: string | null
          recurrence_pattern?: Json | null
          recurring?: boolean | null
          started_at?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_tasks_parent_fk"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "crm_tasks"
            referencedColumns: ["id"]
          },
        ]
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
      earning_tasks: {
        Row: {
          action_required: string
          bonus_pool: number | null
          brand_logo_url: string | null
          brand_name: string
          created_at: string | null
          created_by: string | null
          current_completions: number | null
          deadline: string | null
          description: string
          difficulty: string | null
          id: string
          instructions: string | null
          is_active: boolean | null
          is_featured: boolean | null
          max_completions: number | null
          platform: string | null
          reward_amount: number
          reward_currency: string | null
          task_type: string
          task_url: string
          title: string
          top_performers_count: number | null
          updated_at: string | null
          verification_type: string | null
        }
        Insert: {
          action_required: string
          bonus_pool?: number | null
          brand_logo_url?: string | null
          brand_name: string
          created_at?: string | null
          created_by?: string | null
          current_completions?: number | null
          deadline?: string | null
          description: string
          difficulty?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          max_completions?: number | null
          platform?: string | null
          reward_amount?: number
          reward_currency?: string | null
          task_type?: string
          task_url: string
          title: string
          top_performers_count?: number | null
          updated_at?: string | null
          verification_type?: string | null
        }
        Update: {
          action_required?: string
          bonus_pool?: number | null
          brand_logo_url?: string | null
          brand_name?: string
          created_at?: string | null
          created_by?: string | null
          current_completions?: number | null
          deadline?: string | null
          description?: string
          difficulty?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          max_completions?: number | null
          platform?: string | null
          reward_amount?: number
          reward_currency?: string | null
          task_type?: string
          task_url?: string
          title?: string
          top_performers_count?: number | null
          updated_at?: string | null
          verification_type?: string | null
        }
        Relationships: []
      }
      event_galleries: {
        Row: {
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          drive_link: string
          event_date: string | null
          event_title: string
          id: string
          is_active: boolean | null
          password: string
          photo_count: number | null
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          drive_link: string
          event_date?: string | null
          event_title: string
          id?: string
          is_active?: boolean | null
          password: string
          photo_count?: number | null
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          drive_link?: string
          event_date?: string | null
          event_title?: string
          id?: string
          is_active?: boolean | null
          password?: string
          photo_count?: number | null
          updated_at?: string
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
          college: string | null
          created_at: string | null
          created_by: string | null
          date: string
          days_left: number | null
          description: string
          external_link: string | null
          hashtags: string[] | null
          home_position: number | null
          id: string
          is_featured: boolean
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
          college?: string | null
          created_at?: string | null
          created_by?: string | null
          date: string
          days_left?: number | null
          description: string
          external_link?: string | null
          hashtags?: string[] | null
          home_position?: number | null
          id?: string
          is_featured?: boolean
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
          college?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          days_left?: number | null
          description?: string
          external_link?: string | null
          hashtags?: string[] | null
          home_position?: number | null
          id?: string
          is_featured?: boolean
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
      ipl_auctions: {
        Row: {
          bid_increment: number | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          current_bid: number | null
          current_bidder_id: string | null
          current_player_id: string | null
          id: string
          initial_budget: number | null
          is_public: boolean | null
          join_code: string | null
          max_overseas: number | null
          max_team_size: number | null
          max_teams: number | null
          min_team_size: number | null
          season_name: string | null
          started_at: string | null
          status: string | null
          time_per_player: number | null
          title: string
        }
        Insert: {
          bid_increment?: number | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_bid?: number | null
          current_bidder_id?: string | null
          current_player_id?: string | null
          id?: string
          initial_budget?: number | null
          is_public?: boolean | null
          join_code?: string | null
          max_overseas?: number | null
          max_team_size?: number | null
          max_teams?: number | null
          min_team_size?: number | null
          season_name?: string | null
          started_at?: string | null
          status?: string | null
          time_per_player?: number | null
          title: string
        }
        Update: {
          bid_increment?: number | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_bid?: number | null
          current_bidder_id?: string | null
          current_player_id?: string | null
          id?: string
          initial_budget?: number | null
          is_public?: boolean | null
          join_code?: string | null
          max_overseas?: number | null
          max_team_size?: number | null
          max_teams?: number | null
          min_team_size?: number | null
          season_name?: string | null
          started_at?: string | null
          status?: string | null
          time_per_player?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ipl_auctions_current_player_id_fkey"
            columns: ["current_player_id"]
            isOneToOne: false
            referencedRelation: "ipl_players"
            referencedColumns: ["id"]
          },
        ]
      }
      ipl_players: {
        Row: {
          age: number | null
          base_price: number | null
          category: string | null
          created_at: string | null
          id: string
          ipl_team_history: string[] | null
          is_overseas: boolean | null
          is_uncapped: boolean | null
          name: string
          nationality: string
          photo_url: string | null
          role: string
          stats: Json | null
          team_name: string | null
        }
        Insert: {
          age?: number | null
          base_price?: number | null
          category?: string | null
          created_at?: string | null
          id?: string
          ipl_team_history?: string[] | null
          is_overseas?: boolean | null
          is_uncapped?: boolean | null
          name: string
          nationality: string
          photo_url?: string | null
          role: string
          stats?: Json | null
          team_name?: string | null
        }
        Update: {
          age?: number | null
          base_price?: number | null
          category?: string | null
          created_at?: string | null
          id?: string
          ipl_team_history?: string[] | null
          is_overseas?: boolean | null
          is_uncapped?: boolean | null
          name?: string
          nationality?: string
          photo_url?: string | null
          role?: string
          stats?: Json | null
          team_name?: string | null
        }
        Relationships: []
      }
      issued_certificates: {
        Row: {
          achievement_details: Json | null
          certificate_number: string
          certificate_type: string | null
          course_id: string | null
          created_at: string | null
          email_sent_at: string | null
          event_id: string | null
          id: string
          is_valid: boolean | null
          issue_date: string | null
          linkedin_credential_id: string | null
          metadata: Json | null
          recipient_email: string
          recipient_name: string
          shared_to_linkedin: boolean | null
          shared_to_twitter: boolean | null
          template_id: string | null
          user_id: string | null
          valid_until: string | null
          verification_url: string | null
        }
        Insert: {
          achievement_details?: Json | null
          certificate_number: string
          certificate_type?: string | null
          course_id?: string | null
          created_at?: string | null
          email_sent_at?: string | null
          event_id?: string | null
          id?: string
          is_valid?: boolean | null
          issue_date?: string | null
          linkedin_credential_id?: string | null
          metadata?: Json | null
          recipient_email: string
          recipient_name: string
          shared_to_linkedin?: boolean | null
          shared_to_twitter?: boolean | null
          template_id?: string | null
          user_id?: string | null
          valid_until?: string | null
          verification_url?: string | null
        }
        Update: {
          achievement_details?: Json | null
          certificate_number?: string
          certificate_type?: string | null
          course_id?: string | null
          created_at?: string | null
          email_sent_at?: string | null
          event_id?: string | null
          id?: string
          is_valid?: boolean | null
          issue_date?: string | null
          linkedin_credential_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          recipient_name?: string
          shared_to_linkedin?: boolean | null
          shared_to_twitter?: boolean | null
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
          apply_link: string | null
          category: string
          company: string
          created_at: string | null
          created_by: string | null
          description: string | null
          duration: string
          id: string
          location: string
          poster_url: string | null
          requirements: string | null
          status: Database["public"]["Enums"]["event_status"]
          stipend: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          apply_by?: string | null
          apply_link?: string | null
          category: string
          company: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration: string
          id?: string
          location: string
          poster_url?: string | null
          requirements?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          stipend: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          apply_by?: string | null
          apply_link?: string | null
          category?: string
          company?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration?: string
          id?: string
          location?: string
          poster_url?: string | null
          requirements?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          stipend?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      kpi_definitions: {
        Row: {
          calculation_type: string | null
          color: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          entity_type: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          metric_source: string | null
          name: string
          target_period: string | null
          target_value: number
          updated_at: string | null
        }
        Insert: {
          calculation_type?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          entity_type?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          metric_source?: string | null
          name: string
          target_period?: string | null
          target_value: number
          updated_at?: string | null
        }
        Update: {
          calculation_type?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          entity_type?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          metric_source?: string | null
          name?: string
          target_period?: string | null
          target_value?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      kpi_records: {
        Row: {
          created_at: string | null
          current_value: number | null
          entity_id: string | null
          entity_type: string | null
          id: string
          kpi_id: string
          percentage: number | null
          period_end: string
          period_start: string
          target_value: number
          trend: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          kpi_id: string
          percentage?: number | null
          period_end: string
          period_start: string
          target_value: number
          trend?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          kpi_id?: string
          percentage?: number | null
          period_end?: string
          period_start?: string
          target_value?: number
          trend?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kpi_records_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "kpi_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_resources: {
        Row: {
          admin_notes: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          instructor_or_channel: string
          is_free: boolean | null
          language: string | null
          level: string | null
          link: string
          platform: string
          resource_type: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_by: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_count: string | null
        }
        Insert: {
          admin_notes?: string | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          instructor_or_channel: string
          is_free?: boolean | null
          language?: string | null
          level?: string | null
          link: string
          platform: string
          resource_type: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_by?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_count?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          instructor_or_channel?: string
          is_free?: boolean | null
          language?: string | null
          level?: string | null
          link?: string
          platform?: string
          resource_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_by?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_count?: string | null
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
      lucky_draw_entries: {
        Row: {
          draw_id: string
          entered_at: string | null
          entry_count: number | null
          id: string
          user_id: string
        }
        Insert: {
          draw_id: string
          entered_at?: string | null
          entry_count?: number | null
          id?: string
          user_id: string
        }
        Update: {
          draw_id?: string
          entered_at?: string | null
          entry_count?: number | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lucky_draw_entries_draw_id_fkey"
            columns: ["draw_id"]
            isOneToOne: false
            referencedRelation: "lucky_draws"
            referencedColumns: ["id"]
          },
        ]
      }
      lucky_draw_winners: {
        Row: {
          draw_id: string
          id: string
          prize_details: Json | null
          prize_rank: number | null
          selected_at: string | null
          user_id: string
          verification_seed: string | null
        }
        Insert: {
          draw_id: string
          id?: string
          prize_details?: Json | null
          prize_rank?: number | null
          selected_at?: string | null
          user_id: string
          verification_seed?: string | null
        }
        Update: {
          draw_id?: string
          id?: string
          prize_details?: Json | null
          prize_rank?: number | null
          selected_at?: string | null
          user_id?: string
          verification_seed?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lucky_draw_winners_draw_id_fkey"
            columns: ["draw_id"]
            isOneToOne: false
            referencedRelation: "lucky_draws"
            referencedColumns: ["id"]
          },
        ]
      }
      lucky_draws: {
        Row: {
          banner_image: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          draw_type: string | null
          drawn_at: string | null
          entry_cost: number | null
          id: string
          is_public: boolean | null
          max_entries: number | null
          prizes: Json | null
          scheduled_draw_at: string | null
          status: string | null
          title: string
          updated_at: string | null
          verification_hash: string | null
          winner_count: number | null
        }
        Insert: {
          banner_image?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          draw_type?: string | null
          drawn_at?: string | null
          entry_cost?: number | null
          id?: string
          is_public?: boolean | null
          max_entries?: number | null
          prizes?: Json | null
          scheduled_draw_at?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          verification_hash?: string | null
          winner_count?: number | null
        }
        Update: {
          banner_image?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          draw_type?: string | null
          drawn_at?: string | null
          entry_cost?: number | null
          id?: string
          is_public?: boolean | null
          max_entries?: number | null
          prizes?: Json | null
          scheduled_draw_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          verification_hash?: string | null
          winner_count?: number | null
        }
        Relationships: []
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
      monthly_leaderboard_winners: {
        Row: {
          certificate_id: string | null
          created_at: string
          id: string
          month: number
          points_earned: number
          rank: number
          user_id: string
          year: number
        }
        Insert: {
          certificate_id?: string | null
          created_at?: string
          id?: string
          month: number
          points_earned?: number
          rank: number
          user_id: string
          year: number
        }
        Update: {
          certificate_id?: string | null
          created_at?: string
          id?: string
          month?: number
          points_earned?: number
          rank?: number
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_leaderboard_winners_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "issued_certificates"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_checklists: {
        Row: {
          checklist_items: Json | null
          completed_at: string | null
          id: string
          mentor_id: string | null
          started_at: string | null
          status: string | null
          team_member_id: string | null
        }
        Insert: {
          checklist_items?: Json | null
          completed_at?: string | null
          id?: string
          mentor_id?: string | null
          started_at?: string | null
          status?: string | null
          team_member_id?: string | null
        }
        Update: {
          checklist_items?: Json | null
          completed_at?: string | null
          id?: string
          mentor_id?: string | null
          started_at?: string | null
          status?: string | null
          team_member_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_checklists_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_checklists_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
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
      performance_reviews: {
        Row: {
          created_at: string | null
          goals: string | null
          id: string
          improvements: string | null
          manager_rating: number | null
          overall_feedback: string | null
          review_period: string
          reviewer_id: string | null
          self_rating: number | null
          status: string | null
          strengths: string | null
          team_member_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          goals?: string | null
          id?: string
          improvements?: string | null
          manager_rating?: number | null
          overall_feedback?: string | null
          review_period: string
          reviewer_id?: string | null
          self_rating?: number | null
          status?: string | null
          strengths?: string | null
          team_member_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          goals?: string | null
          id?: string
          improvements?: string | null
          manager_rating?: number | null
          overall_feedback?: string | null
          review_period?: string
          reviewer_id?: string | null
          self_rating?: number | null
          status?: string | null
          strengths?: string | null
          team_member_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
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
      quiz_announcements: {
        Row: {
          id: string
          message: string
          quiz_id: string | null
          sent_at: string | null
        }
        Insert: {
          id?: string
          message: string
          quiz_id?: string | null
          sent_at?: string | null
        }
        Update: {
          id?: string
          message?: string
          quiz_id?: string | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_announcements_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_participant_answers: {
        Row: {
          answered_at: string
          id: string
          is_correct: boolean
          participant_id: string
          points_earned: number
          question_id: string
          selected_option_index: number
          time_taken_ms: number
        }
        Insert: {
          answered_at?: string
          id?: string
          is_correct?: boolean
          participant_id: string
          points_earned?: number
          question_id: string
          selected_option_index: number
          time_taken_ms?: number
        }
        Update: {
          answered_at?: string
          id?: string
          is_correct?: boolean
          participant_id?: string
          points_earned?: number
          question_id?: string
          selected_option_index?: number
          time_taken_ms?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_participant_answers_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "quiz_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_participant_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_participants: {
        Row: {
          avatar_url: string | null
          device_id: string | null
          final_rank: number | null
          id: string
          joined_at: string
          participant_name: string
          quiz_id: string
          reactions_sent: string[] | null
          streak_count: number | null
          team_name: string | null
          total_score: number
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          device_id?: string | null
          final_rank?: number | null
          id?: string
          joined_at?: string
          participant_name: string
          quiz_id: string
          reactions_sent?: string[] | null
          streak_count?: number | null
          team_name?: string | null
          total_score?: number
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          device_id?: string | null
          final_rank?: number | null
          id?: string
          joined_at?: string
          participant_name?: string
          quiz_id?: string
          reactions_sent?: string[] | null
          streak_count?: number | null
          team_name?: string | null
          total_score?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_participants_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_option_index: number
          created_at: string
          id: string
          image_url: string | null
          options: Json
          order_index: number
          points: number
          question_text: string
          quiz_id: string
          time_limit_seconds: number
        }
        Insert: {
          correct_option_index: number
          created_at?: string
          id?: string
          image_url?: string | null
          options?: Json
          order_index?: number
          points?: number
          question_text: string
          quiz_id: string
          time_limit_seconds?: number
        }
        Update: {
          correct_option_index?: number
          created_at?: string
          id?: string
          image_url?: string | null
          options?: Json
          order_index?: number
          points?: number
          question_text?: string
          quiz_id?: string
          time_limit_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_registrations: {
        Row: {
          id: string
          quiz_id: string | null
          registered_at: string | null
          reminder_sent: boolean | null
          user_id: string
        }
        Insert: {
          id?: string
          quiz_id?: string | null
          registered_at?: string | null
          reminder_sent?: boolean | null
          user_id: string
        }
        Update: {
          id?: string
          quiz_id?: string | null
          registered_at?: string | null
          reminder_sent?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_registrations_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_templates: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string | null
          id: string
          is_public: boolean | null
          questions: Json
          title: string
          updated_at: string | null
          use_count: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_public?: boolean | null
          questions?: Json
          title: string
          updated_at?: string | null
          use_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_public?: boolean | null
          questions?: Json
          title?: string
          updated_at?: string | null
          use_count?: number | null
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          allow_late_join: boolean | null
          answer_reveal_seconds: number | null
          auto_advance: boolean | null
          banner_image: string | null
          category: string | null
          countdown_seconds: number | null
          created_at: string
          created_by: string | null
          current_question_idx: number | null
          custom_code: string | null
          description: string | null
          difficulty: string | null
          estimated_duration_minutes: number | null
          event_id: string | null
          id: string
          is_paused: boolean | null
          is_public: boolean | null
          logo_url: string | null
          max_participants: number | null
          organizer_name: string | null
          participant_approval: boolean | null
          prizes: Json | null
          quiz_code: string
          registration_open: boolean | null
          require_registration: boolean | null
          scheduled_start: string | null
          show_live_leaderboard: boolean | null
          shuffle_options: boolean | null
          shuffle_questions: boolean | null
          sound_effects: boolean | null
          starts_at: string | null
          status: Database["public"]["Enums"]["quiz_status"]
          streak_bonus_enabled: boolean | null
          team_mode: boolean | null
          theme_color: string | null
          title: string
          updated_at: string
        }
        Insert: {
          allow_late_join?: boolean | null
          answer_reveal_seconds?: number | null
          auto_advance?: boolean | null
          banner_image?: string | null
          category?: string | null
          countdown_seconds?: number | null
          created_at?: string
          created_by?: string | null
          current_question_idx?: number | null
          custom_code?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_duration_minutes?: number | null
          event_id?: string | null
          id?: string
          is_paused?: boolean | null
          is_public?: boolean | null
          logo_url?: string | null
          max_participants?: number | null
          organizer_name?: string | null
          participant_approval?: boolean | null
          prizes?: Json | null
          quiz_code: string
          registration_open?: boolean | null
          require_registration?: boolean | null
          scheduled_start?: string | null
          show_live_leaderboard?: boolean | null
          shuffle_options?: boolean | null
          shuffle_questions?: boolean | null
          sound_effects?: boolean | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["quiz_status"]
          streak_bonus_enabled?: boolean | null
          team_mode?: boolean | null
          theme_color?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          allow_late_join?: boolean | null
          answer_reveal_seconds?: number | null
          auto_advance?: boolean | null
          banner_image?: string | null
          category?: string | null
          countdown_seconds?: number | null
          created_at?: string
          created_by?: string | null
          current_question_idx?: number | null
          custom_code?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_duration_minutes?: number | null
          event_id?: string | null
          id?: string
          is_paused?: boolean | null
          is_public?: boolean | null
          logo_url?: string | null
          max_participants?: number | null
          organizer_name?: string | null
          participant_approval?: boolean | null
          prizes?: Json | null
          quiz_code?: string
          registration_open?: boolean | null
          require_registration?: boolean | null
          scheduled_start?: string | null
          show_live_leaderboard?: boolean | null
          shuffle_options?: boolean | null
          shuffle_questions?: boolean | null
          sound_effects?: boolean | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["quiz_status"]
          streak_bonus_enabled?: boolean | null
          team_mode?: boolean | null
          theme_color?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
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
      reel_views: {
        Row: {
          created_at: string
          earned_coins: boolean | null
          id: string
          reel_id: string
          updated_at: string
          user_id: string
          watched_seconds: number
        }
        Insert: {
          created_at?: string
          earned_coins?: boolean | null
          id?: string
          reel_id: string
          updated_at?: string
          user_id: string
          watched_seconds?: number
        }
        Update: {
          created_at?: string
          earned_coins?: boolean | null
          id?: string
          reel_id?: string
          updated_at?: string
          user_id?: string
          watched_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "reel_views_reel_id_fkey"
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
          native_video_url: string | null
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
          native_video_url?: string | null
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
          native_video_url?: string | null
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
      showcase_members: {
        Row: {
          bio: string | null
          college: string | null
          created_at: string
          created_by: string | null
          designation: string
          display_order: number | null
          full_name: string
          github_url: string | null
          id: string
          instagram_url: string | null
          is_active: boolean | null
          linkedin_url: string | null
          photo_url: string | null
          role_type: string
          twitter_url: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          college?: string | null
          created_at?: string
          created_by?: string | null
          designation?: string
          display_order?: number | null
          full_name: string
          github_url?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean | null
          linkedin_url?: string | null
          photo_url?: string | null
          role_type?: string
          twitter_url?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          college?: string | null
          created_at?: string
          created_by?: string | null
          designation?: string
          display_order?: number | null
          full_name?: string
          github_url?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean | null
          linkedin_url?: string | null
          photo_url?: string | null
          role_type?: string
          twitter_url?: string | null
          updated_at?: string
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
      spin_results: {
        Row: {
          id: string
          is_jackpot: boolean | null
          prize_type: string
          prize_value: number | null
          segment_id: string
          spun_at: string | null
          user_id: string
          wheel_id: string
        }
        Insert: {
          id?: string
          is_jackpot?: boolean | null
          prize_type: string
          prize_value?: number | null
          segment_id: string
          spun_at?: string | null
          user_id: string
          wheel_id: string
        }
        Update: {
          id?: string
          is_jackpot?: boolean | null
          prize_type?: string
          prize_value?: number | null
          segment_id?: string
          spun_at?: string | null
          user_id?: string
          wheel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spin_results_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "spin_wheel_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spin_results_wheel_id_fkey"
            columns: ["wheel_id"]
            isOneToOne: false
            referencedRelation: "spin_wheels"
            referencedColumns: ["id"]
          },
        ]
      }
      spin_wheel_segments: {
        Row: {
          color: string
          icon: string | null
          id: string
          is_jackpot: boolean | null
          label: string
          order_index: number | null
          prize_type: string
          prize_value: number | null
          probability_weight: number | null
          wheel_id: string
        }
        Insert: {
          color: string
          icon?: string | null
          id?: string
          is_jackpot?: boolean | null
          label: string
          order_index?: number | null
          prize_type?: string
          prize_value?: number | null
          probability_weight?: number | null
          wheel_id: string
        }
        Update: {
          color?: string
          icon?: string | null
          id?: string
          is_jackpot?: boolean | null
          label?: string
          order_index?: number | null
          prize_type?: string
          prize_value?: number | null
          probability_weight?: number | null
          wheel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spin_wheel_segments_wheel_id_fkey"
            columns: ["wheel_id"]
            isOneToOne: false
            referencedRelation: "spin_wheels"
            referencedColumns: ["id"]
          },
        ]
      }
      spin_wheels: {
        Row: {
          banner_image: string | null
          cost_per_spin: number | null
          created_at: string | null
          created_by: string | null
          daily_spin_limit: number | null
          description: string | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          theme_color: string | null
          title: string
          total_spins_allowed: number | null
        }
        Insert: {
          banner_image?: string | null
          cost_per_spin?: number | null
          created_at?: string | null
          created_by?: string | null
          daily_spin_limit?: number | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          theme_color?: string | null
          title: string
          total_spins_allowed?: number | null
        }
        Update: {
          banner_image?: string | null
          cost_per_spin?: number | null
          created_at?: string | null
          created_by?: string | null
          daily_spin_limit?: number | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          theme_color?: string | null
          title?: string
          total_spins_allowed?: number | null
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
          email: string | null
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
          unstop_referral_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          college?: string | null
          created_at?: string | null
          email?: string | null
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
          unstop_referral_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          college?: string | null
          created_at?: string | null
          email?: string | null
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
          unstop_referral_id?: string | null
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
      task_comments: {
        Row: {
          attachments: string[] | null
          comment: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          task_id: string
          user_id: string
        }
        Insert: {
          attachments?: string[] | null
          comment: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          task_id: string
          user_id: string
        }
        Update: {
          attachments?: string[] | null
          comment?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "crm_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_completions: {
        Row: {
          bonus_earned: number | null
          coins_earned: number | null
          id: string
          proof_url: string | null
          rejection_reason: string | null
          status: string | null
          submitted_at: string | null
          task_id: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          bonus_earned?: number | null
          coins_earned?: number | null
          id?: string
          proof_url?: string | null
          rejection_reason?: string | null
          status?: string | null
          submitted_at?: string | null
          task_id: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          bonus_earned?: number | null
          coins_earned?: number | null
          id?: string
          proof_url?: string | null
          rejection_reason?: string | null
          status?: string | null
          submitted_at?: string | null
          task_id?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "earning_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      team_documents: {
        Row: {
          created_at: string | null
          document_type: string
          expires_at: string | null
          file_name: string
          file_url: string
          id: string
          is_verified: boolean | null
          team_member_id: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          expires_at?: string | null
          file_name: string
          file_url: string
          id?: string
          is_verified?: boolean | null
          team_member_id?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          expires_at?: string | null
          file_name?: string
          file_url?: string
          id?: string
          is_verified?: boolean | null
          team_member_id?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_documents_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_leaves: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          end_date: string
          id: string
          leave_type: string
          reason: string | null
          start_date: string
          status: string | null
          team_member_id: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          end_date: string
          id?: string
          leave_type?: string
          reason?: string | null
          start_date: string
          status?: string | null
          team_member_id?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string | null
          start_date?: string
          status?: string | null
          team_member_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_leaves_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_leaves_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          department: string | null
          email: string
          emergency_contact: string | null
          full_name: string
          id: string
          is_remote: boolean | null
          join_date: string | null
          notes: string | null
          phone: string | null
          reporting_to: string | null
          role_title: string | null
          skills: string[] | null
          status: string | null
          stipend_amount: number | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          emergency_contact?: string | null
          full_name: string
          id?: string
          is_remote?: boolean | null
          join_date?: string | null
          notes?: string | null
          phone?: string | null
          reporting_to?: string | null
          role_title?: string | null
          skills?: string[] | null
          status?: string | null
          stipend_amount?: number | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          emergency_contact?: string | null
          full_name?: string
          id?: string
          is_remote?: boolean | null
          join_date?: string | null
          notes?: string | null
          phone?: string | null
          reporting_to?: string | null
          role_title?: string | null
          skills?: string[] | null
          status?: string | null
          stipend_amount?: number | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_reporting_fk"
            columns: ["reporting_to"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_permissions: {
        Row: {
          can_assign_tasks: boolean | null
          can_manage_bounties: boolean | null
          can_manage_events: boolean | null
          can_manage_hackathons: boolean | null
          can_manage_jobs: boolean | null
          can_manage_reels: boolean | null
          can_manage_scholarships: boolean | null
          can_manage_store: boolean | null
          can_manage_study_materials: boolean | null
          can_send_announcements: boolean | null
          can_view_analytics: boolean | null
          can_view_users: boolean | null
          created_at: string | null
          id: string
          team_member_id: string
          updated_at: string | null
        }
        Insert: {
          can_assign_tasks?: boolean | null
          can_manage_bounties?: boolean | null
          can_manage_events?: boolean | null
          can_manage_hackathons?: boolean | null
          can_manage_jobs?: boolean | null
          can_manage_reels?: boolean | null
          can_manage_scholarships?: boolean | null
          can_manage_store?: boolean | null
          can_manage_study_materials?: boolean | null
          can_send_announcements?: boolean | null
          can_view_analytics?: boolean | null
          can_view_users?: boolean | null
          created_at?: string | null
          id?: string
          team_member_id: string
          updated_at?: string | null
        }
        Update: {
          can_assign_tasks?: boolean | null
          can_manage_bounties?: boolean | null
          can_manage_events?: boolean | null
          can_manage_hackathons?: boolean | null
          can_manage_jobs?: boolean | null
          can_manage_reels?: boolean | null
          can_manage_scholarships?: boolean | null
          can_manage_store?: boolean | null
          can_manage_study_materials?: boolean | null
          can_send_announcements?: boolean | null
          can_view_analytics?: boolean | null
          can_view_users?: boolean | null
          created_at?: string | null
          id?: string
          team_member_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_permissions_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: true
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      time_logs: {
        Row: {
          created_at: string | null
          description: string | null
          hours: number
          id: string
          logged_at: string | null
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          hours: number
          id?: string
          logged_at?: string | null
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          hours?: number
          id?: string
          logged_at?: string | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "crm_tasks"
            referencedColumns: ["id"]
          },
        ]
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
      add_admin_by_email: { Args: { admin_email: string }; Returns: Json }
      add_team_member_by_email: {
        Args: {
          member_department?: string
          member_email: string
          member_name?: string
          member_phone?: string
          member_role_title?: string
        }
        Returns: Json
      }
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
      earn_points:
        | {
            Args: {
              p_action_type: string
              p_description?: string
              p_reference_id?: string
            }
            Returns: number
          }
        | {
            Args: {
              p_action_type: string
              p_description: string
              p_reference_id?: string
            }
            Returns: boolean
          }
      generate_auction_code: { Args: never; Returns: string }
      generate_certificate_number: { Args: never; Returns: string }
      generate_quiz_code: { Args: never; Returns: string }
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
      get_team_member_permissions: { Args: never; Returns: Json }
      get_user_email: { Args: { target_user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_core_team: { Args: never; Returns: boolean }
      log_activity: {
        Args: {
          p_action_description: string
          p_action_type: string
          p_entity_id?: string
          p_entity_type?: string
          p_metadata?: Json
        }
        Returns: string
      }
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
      verify_certificate: {
        Args: { cert_number: string }
        Returns: {
          certificate_number: string
          is_valid: boolean
          issue_date: string
          recipient_name: string
          valid_until: string
          verification_url: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user" | "core_team"
      event_status: "draft" | "live" | "ended"
      product_category:
        | "electronics"
        | "books"
        | "stationery"
        | "tasks"
        | "other"
      product_condition: "new" | "like_new" | "good" | "fair" | "old"
      product_status: "pending" | "approved" | "rejected" | "sold" | "archived"
      quiz_status:
        | "draft"
        | "waiting"
        | "active"
        | "question_active"
        | "question_ended"
        | "completed"
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
      app_role: ["admin", "user", "core_team"],
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
      quiz_status: [
        "draft",
        "waiting",
        "active",
        "question_active",
        "question_ended",
        "completed",
      ],
    },
  },
} as const
