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
      ai_generations: {
        Row: {
          created_at: string
          generation_type: string
          id: string
          input_niche: string | null
          input_topic: string
          longtail_keywords: Json | null
          primary_keywords: Json | null
          question_keywords: Json | null
          trending_topics: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          generation_type?: string
          id?: string
          input_niche?: string | null
          input_topic: string
          longtail_keywords?: Json | null
          primary_keywords?: Json | null
          question_keywords?: Json | null
          trending_topics?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          generation_type?: string
          id?: string
          input_niche?: string | null
          input_topic?: string
          longtail_keywords?: Json | null
          primary_keywords?: Json | null
          question_keywords?: Json | null
          trending_topics?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      channel_bottlenecks: {
        Row: {
          bottleneck_type: string
          evidence: Json | null
          id: string
          identified_at: string
          recommended_actions: Json | null
          resolved_at: string | null
          severity: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bottleneck_type: string
          evidence?: Json | null
          id?: string
          identified_at?: string
          recommended_actions?: Json | null
          resolved_at?: string | null
          severity: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bottleneck_type?: string
          evidence?: Json | null
          id?: string
          identified_at?: string
          recommended_actions?: Json | null
          resolved_at?: string | null
          severity?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      channel_dna: {
        Row: {
          analyzed_at: string
          audience_demographics: Json | null
          avg_comments: number | null
          avg_engagement_rate: number | null
          avg_likes: number | null
          avg_title_length: number | null
          avg_views: number | null
          channel_id: string | null
          content_categories: Json | null
          created_at: string
          dna_summary: string | null
          emoji_usage: string | null
          id: string
          peak_engagement_times: Json | null
          power_words: Json | null
          title_formulas: Json | null
          title_patterns: Json | null
          tone_profile: Json | null
          top_performing_topics: Json | null
          updated_at: string
          user_id: string
          videos_analyzed: number
          view_to_like_ratio: number | null
          vocabulary_style: string | null
        }
        Insert: {
          analyzed_at?: string
          audience_demographics?: Json | null
          avg_comments?: number | null
          avg_engagement_rate?: number | null
          avg_likes?: number | null
          avg_title_length?: number | null
          avg_views?: number | null
          channel_id?: string | null
          content_categories?: Json | null
          created_at?: string
          dna_summary?: string | null
          emoji_usage?: string | null
          id?: string
          peak_engagement_times?: Json | null
          power_words?: Json | null
          title_formulas?: Json | null
          title_patterns?: Json | null
          tone_profile?: Json | null
          top_performing_topics?: Json | null
          updated_at?: string
          user_id: string
          videos_analyzed?: number
          view_to_like_ratio?: number | null
          vocabulary_style?: string | null
        }
        Update: {
          analyzed_at?: string
          audience_demographics?: Json | null
          avg_comments?: number | null
          avg_engagement_rate?: number | null
          avg_likes?: number | null
          avg_title_length?: number | null
          avg_views?: number | null
          channel_id?: string | null
          content_categories?: Json | null
          created_at?: string
          dna_summary?: string | null
          emoji_usage?: string | null
          id?: string
          peak_engagement_times?: Json | null
          power_words?: Json | null
          title_formulas?: Json | null
          title_patterns?: Json | null
          tone_profile?: Json | null
          top_performing_topics?: Json | null
          updated_at?: string
          user_id?: string
          videos_analyzed?: number
          view_to_like_ratio?: number | null
          vocabulary_style?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_dna_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          channel_name: string
          created_at: string
          description: string | null
          id: string
          last_synced_at: string | null
          subscriber_count: number | null
          thumbnail_url: string | null
          total_view_count: number | null
          user_id: string
          video_count: number | null
          youtube_channel_id: string
        }
        Insert: {
          channel_name: string
          created_at?: string
          description?: string | null
          id?: string
          last_synced_at?: string | null
          subscriber_count?: number | null
          thumbnail_url?: string | null
          total_view_count?: number | null
          user_id: string
          video_count?: number | null
          youtube_channel_id: string
        }
        Update: {
          channel_name?: string
          created_at?: string
          description?: string | null
          id?: string
          last_synced_at?: string | null
          subscriber_count?: number | null
          thumbnail_url?: string | null
          total_view_count?: number | null
          user_id?: string
          video_count?: number | null
          youtube_channel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      competitors: {
        Row: {
          banner_url: string | null
          channel_id: string | null
          channel_name: string
          channel_url: string
          created_at: string
          id: string
          last_video_date: string | null
          notes: string | null
          subscriber_count: number | null
          thumbnail_url: string | null
          total_views: number | null
          updated_at: string
          upload_frequency: string | null
          user_id: string
          video_count: number | null
        }
        Insert: {
          banner_url?: string | null
          channel_id?: string | null
          channel_name: string
          channel_url: string
          created_at?: string
          id?: string
          last_video_date?: string | null
          notes?: string | null
          subscriber_count?: number | null
          thumbnail_url?: string | null
          total_views?: number | null
          updated_at?: string
          upload_frequency?: string | null
          user_id: string
          video_count?: number | null
        }
        Update: {
          banner_url?: string | null
          channel_id?: string | null
          channel_name?: string
          channel_url?: string
          created_at?: string
          id?: string
          last_video_date?: string | null
          notes?: string | null
          subscriber_count?: number | null
          thumbnail_url?: string | null
          total_views?: number | null
          updated_at?: string
          upload_frequency?: string | null
          user_id?: string
          video_count?: number | null
        }
        Relationships: []
      }
      performance_predictions: {
        Row: {
          algorithm_factors: Json | null
          competition_saturation: string | null
          competitive_gap_analysis: Json | null
          content_reference: string
          created_at: string
          ctr_confidence: string | null
          ctr_factors: Json | null
          dropoff_triggers: Json | null
          feature_type: string
          feed_predictions: Json | null
          id: string
          optimal_path: Json | null
          overall_confidence: string | null
          overall_confidence_score: number | null
          predicted_ctr_range: Json | null
          predicted_retention_curve: Json | null
          promotion_likelihood: string | null
          recommendation_summary: string | null
          risk_factors: Json | null
          session_impact: string | null
          simulations: Json | null
          success_indicators: Json | null
          trend_alignment: string | null
          user_id: string
        }
        Insert: {
          algorithm_factors?: Json | null
          competition_saturation?: string | null
          competitive_gap_analysis?: Json | null
          content_reference: string
          created_at?: string
          ctr_confidence?: string | null
          ctr_factors?: Json | null
          dropoff_triggers?: Json | null
          feature_type: string
          feed_predictions?: Json | null
          id?: string
          optimal_path?: Json | null
          overall_confidence?: string | null
          overall_confidence_score?: number | null
          predicted_ctr_range?: Json | null
          predicted_retention_curve?: Json | null
          promotion_likelihood?: string | null
          recommendation_summary?: string | null
          risk_factors?: Json | null
          session_impact?: string | null
          simulations?: Json | null
          success_indicators?: Json | null
          trend_alignment?: string | null
          user_id: string
        }
        Update: {
          algorithm_factors?: Json | null
          competition_saturation?: string | null
          competitive_gap_analysis?: Json | null
          content_reference?: string
          created_at?: string
          ctr_confidence?: string | null
          ctr_factors?: Json | null
          dropoff_triggers?: Json | null
          feature_type?: string
          feed_predictions?: Json | null
          id?: string
          optimal_path?: Json | null
          overall_confidence?: string | null
          overall_confidence_score?: number | null
          predicted_ctr_range?: Json | null
          predicted_retention_curve?: Json | null
          promotion_likelihood?: string | null
          recommendation_summary?: string | null
          risk_factors?: Json | null
          session_impact?: string | null
          simulations?: Json | null
          success_indicators?: Json | null
          trend_alignment?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          channel_niche: string | null
          created_at: string
          email: string | null
          experience_level: string | null
          full_name: string | null
          goals: string[] | null
          id: string
          onboarding_completed: boolean
          onboarding_step: number
          subscriber_goal: number | null
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          channel_niche?: string | null
          created_at?: string
          email?: string | null
          experience_level?: string | null
          full_name?: string | null
          goals?: string[] | null
          id: string
          onboarding_completed?: boolean
          onboarding_step?: number
          subscriber_goal?: number | null
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          channel_niche?: string | null
          created_at?: string
          email?: string | null
          experience_level?: string | null
          full_name?: string | null
          goals?: string[] | null
          id?: string
          onboarding_completed?: boolean
          onboarding_step?: number
          subscriber_goal?: number | null
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      saved_content_ideas: {
        Row: {
          best_posting_time: string | null
          content_type: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          id: string
          key_points: Json | null
          niche: string | null
          scheduled_date: string | null
          thumbnail_concept: string | null
          title: string
          updated_at: string
          user_id: string
          viral_score: number | null
        }
        Insert: {
          best_posting_time?: string | null
          content_type?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          key_points?: Json | null
          niche?: string | null
          scheduled_date?: string | null
          thumbnail_concept?: string | null
          title: string
          updated_at?: string
          user_id: string
          viral_score?: number | null
        }
        Update: {
          best_posting_time?: string | null
          content_type?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          key_points?: Json | null
          niche?: string | null
          scheduled_date?: string | null
          thumbnail_concept?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          viral_score?: number | null
        }
        Relationships: []
      }
      strategy_history: {
        Row: {
          bottleneck_addressed: string | null
          confidence_score: number | null
          created_at: string
          feature_type: string
          future_impact: Json | null
          id: string
          output_summary: string
          potential_downside: string | null
          potential_upside: string | null
          prediction_accuracy_score: number | null
          prediction_id: string | null
          request_context: Json | null
          risk_level: string | null
          self_critique: Json | null
          strategy_applied: string
          user_id: string
        }
        Insert: {
          bottleneck_addressed?: string | null
          confidence_score?: number | null
          created_at?: string
          feature_type: string
          future_impact?: Json | null
          id?: string
          output_summary: string
          potential_downside?: string | null
          potential_upside?: string | null
          prediction_accuracy_score?: number | null
          prediction_id?: string | null
          request_context?: Json | null
          risk_level?: string | null
          self_critique?: Json | null
          strategy_applied: string
          user_id: string
        }
        Update: {
          bottleneck_addressed?: string | null
          confidence_score?: number | null
          created_at?: string
          feature_type?: string
          future_impact?: Json | null
          id?: string
          output_summary?: string
          potential_downside?: string | null
          potential_upside?: string | null
          prediction_accuracy_score?: number | null
          prediction_id?: string | null
          request_context?: Json | null
          risk_level?: string | null
          self_critique?: Json | null
          strategy_applied?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_history_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "performance_predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_cache: {
        Row: {
          cache_key: string
          cached_at: string
          created_at: string
          id: string
          response_data: Json
        }
        Insert: {
          cache_key: string
          cached_at?: string
          created_at?: string
          id?: string
          response_data: Json
        }
        Update: {
          cache_key?: string
          cached_at?: string
          created_at?: string
          id?: string
          response_data?: Json
        }
        Relationships: []
      }
      youtube_oauth_tokens: {
        Row: {
          access_token: string
          channel_name: string | null
          channel_thumbnail: string | null
          created_at: string
          id: string
          refresh_token: string | null
          scopes: string[] | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
          youtube_channel_id: string | null
        }
        Insert: {
          access_token: string
          channel_name?: string | null
          channel_thumbnail?: string | null
          created_at?: string
          id?: string
          refresh_token?: string | null
          scopes?: string[] | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
          youtube_channel_id?: string | null
        }
        Update: {
          access_token?: string
          channel_name?: string | null
          channel_thumbnail?: string | null
          created_at?: string
          id?: string
          refresh_token?: string | null
          scopes?: string[] | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
          youtube_channel_id?: string | null
        }
        Relationships: []
      }
      youtube_videos: {
        Row: {
          category_id: string | null
          channel_row_id: string | null
          comment_count: number | null
          created_at: string
          description: string | null
          duration: string | null
          id: string
          like_count: number | null
          published_at: string | null
          raw: Json | null
          tags: Json | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          view_count: number | null
          youtube_video_id: string
        }
        Insert: {
          category_id?: string | null
          channel_row_id?: string | null
          comment_count?: number | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          like_count?: number | null
          published_at?: string | null
          raw?: Json | null
          tags?: Json | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          view_count?: number | null
          youtube_video_id: string
        }
        Update: {
          category_id?: string | null
          channel_row_id?: string | null
          comment_count?: number | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          like_count?: number | null
          published_at?: string | null
          raw?: Json | null
          tags?: Json | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number | null
          youtube_video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "youtube_videos_channel_row_fkey"
            columns: ["channel_row_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youtube_videos_user_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      youtube_connection_status: {
        Row: {
          channel_name: string | null
          channel_thumbnail: string | null
          is_token_valid: boolean | null
          scopes: string[] | null
          updated_at: string | null
          user_id: string | null
          youtube_channel_id: string | null
        }
        Insert: {
          channel_name?: string | null
          channel_thumbnail?: string | null
          is_token_valid?: never
          scopes?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          youtube_channel_id?: string | null
        }
        Update: {
          channel_name?: string | null
          channel_thumbnail?: string | null
          is_token_valid?: never
          scopes?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          youtube_channel_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_tier: "free" | "pro" | "agency"
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
      subscription_tier: ["free", "pro", "agency"],
    },
  },
} as const
