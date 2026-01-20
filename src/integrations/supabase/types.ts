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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      courses: {
        Row: {
          code: string
          created_at: string
          duration_years: number
          id: string
          name: string
          university_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          duration_years?: number
          id?: string
          name: string
          university_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          duration_years?: number
          id?: string
          name?: string
          university_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          component_stack: string | null
          created_at: string
          error_message: string
          error_stack: string | null
          id: string
          metadata: Json | null
          severity: string | null
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          component_stack?: string | null
          created_at?: string
          error_message: string
          error_stack?: string | null
          id?: string
          metadata?: Json | null
          severity?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          component_stack?: string | null
          created_at?: string
          error_message?: string
          error_stack?: string | null
          id?: string
          metadata?: Json | null
          severity?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      important_questions: {
        Row: {
          answer_template: Json | null
          created_at: string
          frequency: string
          id: string
          marks: number
          question: string
          subject_id: string
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          answer_template?: Json | null
          created_at?: string
          frequency?: string
          id?: string
          marks?: number
          question: string
          subject_id: string
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          answer_template?: Json | null
          created_at?: string
          frequency?: string
          id?: string
          marks?: number
          question?: string
          subject_id?: string
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "important_questions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "important_questions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          chapter_title: string
          created_at: string
          id: string
          order_index: number
          points: Json
          unit_id: string
          updated_at: string
        }
        Insert: {
          chapter_title: string
          created_at?: string
          id?: string
          order_index?: number
          points?: Json
          unit_id: string
          updated_at?: string
        }
        Update: {
          chapter_title?: string
          created_at?: string
          id?: string
          order_index?: number
          points?: Json
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_password_resets: {
        Row: {
          attempts: number | null
          created_at: string | null
          email: string
          id: string
          otp_code: string
          otp_expires_at: string
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          email: string
          id?: string
          otp_code: string
          otp_expires_at: string
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          email?: string
          id?: string
          otp_code?: string
          otp_expires_at?: string
        }
        Relationships: []
      }
      pending_signups: {
        Row: {
          attempts: number | null
          created_at: string | null
          email: string
          id: string
          otp_code: string
          otp_expires_at: string
          verified: boolean | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          email: string
          id?: string
          otp_code: string
          otp_expires_at: string
          verified?: boolean | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          email?: string
          id?: string
          otp_code?: string
          otp_expires_at?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          course_id: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          semester_id: string | null
          university_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          course_id?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          semester_id?: string | null
          university_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          course_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          semester_id?: string | null
          university_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      pyq_papers: {
        Row: {
          created_at: string
          id: string
          paper_code: string | null
          pdf_url: string | null
          subject_id: string
          updated_at: string
          year: string
        }
        Insert: {
          created_at?: string
          id?: string
          paper_code?: string | null
          pdf_url?: string | null
          subject_id: string
          updated_at?: string
          year: string
        }
        Update: {
          created_at?: string
          id?: string
          paper_code?: string | null
          pdf_url?: string | null
          subject_id?: string
          updated_at?: string
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "pyq_papers_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      pyq_questions: {
        Row: {
          answer: string | null
          created_at: string
          id: string
          marks: number
          order_index: number
          pyq_paper_id: string
          question: string
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          answer?: string | null
          created_at?: string
          id?: string
          marks?: number
          order_index?: number
          pyq_paper_id: string
          question: string
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          answer?: string | null
          created_at?: string
          id?: string
          marks?: number
          order_index?: number
          pyq_paper_id?: string
          question?: string
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pyq_questions_pyq_paper_id_fkey"
            columns: ["pyq_paper_id"]
            isOneToOne: false
            referencedRelation: "pyq_papers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pyq_questions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          created_at: string | null
          id: string
          identifier: string
          identifier_type: string
          request_count: number | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          identifier: string
          identifier_type: string
          request_count?: number | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          identifier?: string
          identifier_type?: string
          request_count?: number | null
          window_start?: string | null
        }
        Relationships: []
      }
      recent_views: {
        Row: {
          id: string
          item_id: string
          item_name: string
          item_type: string
          item_url: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          item_id: string
          item_name: string
          item_type: string
          item_url: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          item_name?: string
          item_type?: string
          item_url?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: []
      }
      semesters: {
        Row: {
          course_id: string
          created_at: string
          id: string
          name: string
          number: number
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          name: string
          number: number
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          name?: string
          number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "semesters_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      studylist_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          studylist_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          studylist_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          studylist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "studylist_items_studylist_id_fkey"
            columns: ["studylist_id"]
            isOneToOne: false
            referencedRelation: "studylists"
            referencedColumns: ["id"]
          },
        ]
      }
      studylists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          code: string
          created_at: string
          duration: string
          exam_type: string
          gradient_from: string | null
          gradient_to: string | null
          icon: string | null
          id: string
          internal_marks: number
          name: string
          pattern: string
          semester_id: string
          slug: string
          theory_marks: number
          total_marks: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          duration?: string
          exam_type?: string
          gradient_from?: string | null
          gradient_to?: string | null
          icon?: string | null
          id?: string
          internal_marks?: number
          name: string
          pattern?: string
          semester_id: string
          slug: string
          theory_marks?: number
          total_marks?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          duration?: string
          exam_type?: string
          gradient_from?: string | null
          gradient_to?: string | null
          icon?: string | null
          id?: string
          internal_marks?: number
          name?: string
          pattern?: string
          semester_id?: string
          slug?: string
          theory_marks?: number
          total_marks?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          created_at: string
          id: string
          name: string
          number: number
          subject_id: string
          updated_at: string
          weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          number: number
          subject_id: string
          updated_at?: string
          weight?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          number?: number
          subject_id?: string
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "units_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      universities: {
        Row: {
          created_at: string
          full_name: string
          id: string
          location: string
          logo_url: string | null
          name: string
          slug: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          location: string
          logo_url?: string | null
          name: string
          slug: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          location?: string
          logo_url?: string | null
          name?: string
          slug?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_exam_settings: {
        Row: {
          created_at: string
          exam_date: string | null
          exam_type: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exam_date?: string | null
          exam_type?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          exam_date?: string | null
          exam_type?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_library_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          user_id?: string
        }
        Relationships: []
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
      user_study_progress: {
        Row: {
          ai_sessions: number | null
          created_at: string
          id: string
          last_activity_at: string | null
          last_unit_id: string | null
          notes_viewed: number | null
          pyqs_practiced: number | null
          questions_attempted: number | null
          subject_id: string
          total_notes: number | null
          total_pyqs: number | null
          total_questions: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_sessions?: number | null
          created_at?: string
          id?: string
          last_activity_at?: string | null
          last_unit_id?: string | null
          notes_viewed?: number | null
          pyqs_practiced?: number | null
          questions_attempted?: number | null
          subject_id: string
          total_notes?: number | null
          total_pyqs?: number | null
          total_questions?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_sessions?: number | null
          created_at?: string
          id?: string
          last_activity_at?: string | null
          last_unit_id?: string | null
          notes_viewed?: number | null
          pyqs_practiced?: number | null
          questions_attempted?: number | null
          subject_id?: string
          total_notes?: number | null
          total_pyqs?: number | null
          total_questions?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_study_progress_last_unit_id_fkey"
            columns: ["last_unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_study_progress_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
