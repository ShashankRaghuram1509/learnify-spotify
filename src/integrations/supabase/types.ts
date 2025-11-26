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
      admin_course_feedback: {
        Row: {
          admin_id: string
          course_id: string
          created_at: string | null
          feedback_text: string
          id: string
          improvement_suggestions: string | null
          rating: number | null
          review_id: string | null
          updated_at: string | null
        }
        Insert: {
          admin_id: string
          course_id: string
          created_at?: string | null
          feedback_text: string
          id?: string
          improvement_suggestions?: string | null
          rating?: number | null
          review_id?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_id?: string
          course_id?: string
          created_at?: string | null
          feedback_text?: string
          id?: string
          improvement_suggestions?: string | null
          rating?: number | null
          review_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_course_feedback_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_course_feedback_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_submissions: {
        Row: {
          assignment_id: string
          created_at: string | null
          feedback: string | null
          graded_at: string | null
          id: string
          marks_obtained: number | null
          status: string
          student_id: string
          submission_text: string | null
          submission_url: string | null
          submitted_at: string | null
          time_taken_minutes: number | null
          updated_at: string | null
        }
        Insert: {
          assignment_id: string
          created_at?: string | null
          feedback?: string | null
          graded_at?: string | null
          id?: string
          marks_obtained?: number | null
          status?: string
          student_id: string
          submission_text?: string | null
          submission_url?: string | null
          submitted_at?: string | null
          time_taken_minutes?: number | null
          updated_at?: string | null
        }
        Update: {
          assignment_id?: string
          created_at?: string | null
          feedback?: string | null
          graded_at?: string | null
          id?: string
          marks_obtained?: number | null
          status?: string
          student_id?: string
          submission_text?: string | null
          submission_url?: string | null
          submitted_at?: string | null
          time_taken_minutes?: number | null
          updated_at?: string | null
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
          allow_late_submission: boolean | null
          attachment_url: string | null
          course_id: string
          created_at: string | null
          description: string | null
          due_date: string
          duration_minutes: number | null
          id: string
          instructions: string | null
          proctoring_enabled: boolean | null
          teacher_id: string
          title: string
          total_marks: number
          type: string
          updated_at: string | null
        }
        Insert: {
          allow_late_submission?: boolean | null
          attachment_url?: string | null
          course_id: string
          created_at?: string | null
          description?: string | null
          due_date: string
          duration_minutes?: number | null
          id?: string
          instructions?: string | null
          proctoring_enabled?: boolean | null
          teacher_id: string
          title: string
          total_marks?: number
          type: string
          updated_at?: string | null
        }
        Update: {
          allow_late_submission?: boolean | null
          attachment_url?: string | null
          course_id?: string
          created_at?: string | null
          description?: string | null
          due_date?: string
          duration_minutes?: number | null
          id?: string
          instructions?: string | null
          proctoring_enabled?: boolean | null
          teacher_id?: string
          title?: string
          total_marks?: number
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_url: string | null
          course_id: string
          enrollment_id: string
          id: string
          issued_at: string
          student_id: string
        }
        Insert: {
          certificate_url?: string | null
          course_id: string
          enrollment_id: string
          id?: string
          issued_at?: string
          student_id: string
        }
        Update: {
          certificate_url?: string | null
          course_id?: string
          enrollment_id?: string
          id?: string
          issued_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          conversation_id: string | null
          created_at: string
          id: string
          message: string
          read: boolean | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      course_categories: {
        Row: {
          category_id: string
          course_id: string
        }
        Insert: {
          category_id: string
          course_id: string
        }
        Update: {
          category_id?: string
          course_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_categories_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_materials: {
        Row: {
          code_examples: Json | null
          course_id: string
          created_at: string
          id: string
          key_points: Json | null
          overview: string | null
          practice_exercises: Json | null
          resources: Json | null
          updated_at: string
        }
        Insert: {
          code_examples?: Json | null
          course_id: string
          created_at?: string
          id?: string
          key_points?: Json | null
          overview?: string | null
          practice_exercises?: Json | null
          resources?: Json | null
          updated_at?: string
        }
        Update: {
          code_examples?: Json | null
          course_id?: string
          created_at?: string
          id?: string
          key_points?: Json | null
          overview?: string | null
          practice_exercises?: Json | null
          resources?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_materials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_resources: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          file_path: string | null
          id: string
          position: number
          resource_type: string
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          position?: number
          resource_type: string
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          position?: number
          resource_type?: string
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_resources_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_tags: {
        Row: {
          course_id: string
          tag_id: string
        }
        Insert: {
          course_id: string
          tag_id: string
        }
        Update: {
          course_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_tags_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_premium: boolean | null
          price: number | null
          teacher_id: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_premium?: boolean | null
          price?: number | null
          teacher_id: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_premium?: boolean | null
          price?: number | null
          teacher_id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          progress: number | null
          student_id: string
          test_progress_bonus: number | null
          video_minutes_watched: number | null
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          id?: string
          progress?: number | null
          student_id: string
          test_progress_bonus?: number | null
          video_minutes_watched?: number | null
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          id?: string
          progress?: number | null
          student_id?: string
          test_progress_bonus?: number | null
          video_minutes_watched?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      external_job_interests: {
        Row: {
          company_name: string
          created_at: string | null
          external_job_id: string
          id: string
          interested_at: string
          job_title: string
          job_url: string | null
          notes: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          company_name: string
          created_at?: string | null
          external_job_id: string
          id?: string
          interested_at?: string
          job_title: string
          job_url?: string | null
          notes?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string | null
          external_job_id?: string
          id?: string
          interested_at?: string
          job_title?: string
          job_url?: string | null
          notes?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      job_roles: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          experience_level: string
          id: string
          salary_max: number | null
          salary_min: number | null
          skills_required: Json | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          experience_level: string
          id?: string
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: Json | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          experience_level?: string
          id?: string
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: Json | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content_text: string | null
          content_type: string
          content_url: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          module_id: string
          position: number
          title: string
        }
        Insert: {
          content_text?: string | null
          content_type: string
          content_url?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          module_id: string
          position: number
          title: string
        }
        Update: {
          content_text?: string | null
          content_type?: string
          content_url?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          module_id?: string
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          id: string
          position: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          position: number
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_companies: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          logo_url: string | null
          mou_signed_date: string | null
          name: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          logo_url?: string | null
          mou_signed_date?: string | null
          name: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          logo_url?: string | null
          mou_signed_date?: string | null
          name?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          course_id: string | null
          created_at: string
          currency: string | null
          id: string
          payment_method: string | null
          plan_name: string | null
          status: string | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          course_id?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          payment_method?: string | null
          plan_name?: string | null
          status?: string | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          course_id?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          payment_method?: string | null
          plan_name?: string | null
          status?: string | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_analytics: {
        Row: {
          active_users: number | null
          avg_session_duration: number | null
          date: string
          id: string
          new_signups: number | null
          total_courses: number | null
          total_enrollments: number | null
          total_revenue: number | null
          total_users: number | null
        }
        Insert: {
          active_users?: number | null
          avg_session_duration?: number | null
          date?: string
          id?: string
          new_signups?: number | null
          total_courses?: number | null
          total_enrollments?: number | null
          total_revenue?: number | null
          total_users?: number | null
        }
        Update: {
          active_users?: number | null
          avg_session_duration?: number | null
          date?: string
          id?: string
          new_signups?: number | null
          total_courses?: number | null
          total_enrollments?: number | null
          total_revenue?: number | null
          total_users?: number | null
        }
        Relationships: []
      }
      proctoring_logs: {
        Row: {
          event_data: Json | null
          event_type: string
          id: string
          student_id: string
          submission_id: string
          timestamp: string | null
        }
        Insert: {
          event_data?: Json | null
          event_type: string
          id?: string
          student_id: string
          submission_id: string
          timestamp?: string | null
        }
        Update: {
          event_data?: Json | null
          event_type?: string
          id?: string
          student_id?: string
          submission_id?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proctoring_logs_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "assignment_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      proctoring_violations: {
        Row: {
          assignment_id: string
          blocked_until: string | null
          created_at: string | null
          failed_attempts: number | null
          id: string
          student_id: string
          updated_at: string | null
          violation_count: number | null
        }
        Insert: {
          assignment_id: string
          blocked_until?: string | null
          created_at?: string | null
          failed_attempts?: number | null
          id?: string
          student_id: string
          updated_at?: string | null
          violation_count?: number | null
        }
        Update: {
          assignment_id?: string
          blocked_until?: string | null
          created_at?: string | null
          failed_attempts?: number | null
          id?: string
          student_id?: string
          updated_at?: string | null
          violation_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proctoring_violations_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          college: string | null
          created_at: string
          email: string
          experience_level: string | null
          full_name: string | null
          id: string
          interests: Json | null
          linkedin_url: string | null
          phone: string | null
          resume_text: string | null
          resume_url: string | null
          subscription_expires_at: string | null
          subscription_tier: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          college?: string | null
          created_at?: string
          email: string
          experience_level?: string | null
          full_name?: string | null
          id: string
          interests?: Json | null
          linkedin_url?: string | null
          phone?: string | null
          resume_text?: string | null
          resume_url?: string | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          college?: string | null
          created_at?: string
          email?: string
          experience_level?: string | null
          full_name?: string | null
          id?: string
          interests?: Json | null
          linkedin_url?: string | null
          phone?: string | null
          resume_text?: string | null
          resume_url?: string | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          course_id: string
          created_at: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          course_id: string
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          course_id?: string
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      student_applications: {
        Row: {
          applied_at: string
          company_response_letter_url: string | null
          company_response_uploaded_at: string | null
          cover_letter: string | null
          id: string
          job_role_id: string
          recommendation_generated_at: string | null
          recommendation_letter_url: string | null
          resume_url: string | null
          status: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          applied_at?: string
          company_response_letter_url?: string | null
          company_response_uploaded_at?: string | null
          cover_letter?: string | null
          id?: string
          job_role_id: string
          recommendation_generated_at?: string | null
          recommendation_letter_url?: string | null
          resume_url?: string | null
          status?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          applied_at?: string
          company_response_letter_url?: string | null
          company_response_uploaded_at?: string | null
          cover_letter?: string | null
          id?: string
          job_role_id?: string
          recommendation_generated_at?: string | null
          recommendation_letter_url?: string | null
          resume_url?: string | null
          status?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_applications_job_role_id_fkey"
            columns: ["job_role_id"]
            isOneToOne: false
            referencedRelation: "job_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_test_attempts: {
        Row: {
          assignment_id: string
          attempt_number: number
          created_at: string | null
          id: string
          marks_obtained: number | null
          passed: boolean | null
          student_id: string
          submission_id: string | null
        }
        Insert: {
          assignment_id: string
          attempt_number?: number
          created_at?: string | null
          id?: string
          marks_obtained?: number | null
          passed?: boolean | null
          student_id: string
          submission_id?: string | null
        }
        Update: {
          assignment_id?: string
          attempt_number?: number
          created_at?: string | null
          id?: string
          marks_obtained?: number | null
          passed?: boolean | null
          student_id?: string
          submission_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_test_attempts_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_test_attempts_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "assignment_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      teacher_feedback: {
        Row: {
          application_id: string | null
          areas_for_improvement: string | null
          course_id: string | null
          created_at: string
          id: string
          rating: number | null
          recommendation: string | null
          soft_skills: string | null
          strengths: string | null
          student_id: string
          teacher_id: string
          technical_skills: string | null
          updated_at: string
        }
        Insert: {
          application_id?: string | null
          areas_for_improvement?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          recommendation?: string | null
          soft_skills?: string | null
          strengths?: string | null
          student_id: string
          teacher_id: string
          technical_skills?: string | null
          updated_at?: string
        }
        Update: {
          application_id?: string | null
          areas_for_improvement?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          recommendation?: string | null
          soft_skills?: string | null
          strengths?: string | null
          student_id?: string
          teacher_id?: string
          technical_skills?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_feedback_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "student_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_feedback_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      transcripts: {
        Row: {
          created_at: string | null
          enrollment_id: string | null
          id: string
          summary: string | null
          transcript: string | null
          updated_at: string | null
          video_url: string
        }
        Insert: {
          created_at?: string | null
          enrollment_id?: string | null
          id?: string
          summary?: string | null
          transcript?: string | null
          updated_at?: string | null
          video_url: string
        }
        Update: {
          created_at?: string | null
          enrollment_id?: string | null
          id?: string
          summary?: string | null
          transcript?: string | null
          updated_at?: string | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "transcripts_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_call_schedules: {
        Row: {
          course_id: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          meeting_url: string | null
          scheduled_at: string
          status: string | null
          student_id: string
          teacher_id: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          meeting_url?: string | null
          scheduled_at: string
          status?: string | null
          student_id: string
          teacher_id: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          meeting_url?: string | null
          scheduled_at?: string
          status?: string | null
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_call_schedules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      video_watch_tracking: {
        Row: {
          course_id: string
          created_at: string | null
          enrollment_id: string
          id: string
          last_position: number | null
          minutes_watched: number | null
          student_id: string
          updated_at: string | null
          video_url: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          enrollment_id: string
          id?: string
          last_position?: number | null
          minutes_watched?: number | null
          student_id: string
          updated_at?: string | null
          video_url: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          enrollment_id?: string
          id?: string
          last_position?: number | null
          minutes_watched?: number | null
          student_id?: string
          updated_at?: string | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_watch_tracking_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_watch_tracking_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_expired_schedules: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      search_courses: {
        Args: { search_query: string }
        Returns: {
          description: string
          id: string
          is_premium: boolean
          price: number
          similarity: number
          teacher_id: string
          title: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      app_role: "student" | "teacher" | "admin"
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
      app_role: ["student", "teacher", "admin"],
    },
  },
} as const
