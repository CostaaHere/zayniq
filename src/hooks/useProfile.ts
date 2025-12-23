import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: "free" | "pro" | "agency";
  onboarding_completed: boolean;
  onboarding_step: number;
  channel_niche: string | null;
  experience_level: string | null;
  goals: string[];
  subscriber_goal: number | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data as Profile);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;
      
      setProfile((prev) => prev ? { ...prev, ...updates } : null);
      return { error: null };
    } catch (error: any) {
      console.error("Error updating profile:", error);
      return { error };
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return { url: null, error: new Error("Not authenticated") };

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Add cache-busting query param
      const avatarUrl = `${publicUrl}?t=${Date.now()}`;
      
      await updateProfile({ avatar_url: avatarUrl });
      
      return { url: avatarUrl, error: null };
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      return { url: null, error };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    uploadAvatar,
    refetch: fetchProfile,
  };
};
