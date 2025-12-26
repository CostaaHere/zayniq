import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

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
      
      // If profile has avatar_url stored, generate a fresh signed URL
      if (data?.avatar_url) {
        const signedUrl = await getSignedAvatarUrl(data.avatar_url);
        if (signedUrl) {
          data.avatar_url = signedUrl;
        }
      }
      
      setProfile(data as Profile);
    } catch (error) {
      logger.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSignedAvatarUrl = async (storedPath: string): Promise<string | null> => {
    try {
      // Extract the file path from the stored URL or path
      let filePath = storedPath;
      
      // If it's a full URL, extract the path portion
      if (storedPath.includes('/avatars/')) {
        const match = storedPath.match(/avatars\/(.+?)(?:\?|$)/);
        if (match) {
          filePath = match[1];
        }
      }
      
      const { data, error } = await supabase.storage
        .from("avatars")
        .createSignedUrl(filePath, 3600); // 1 hour expiry
      
      if (error) {
        logger.error("Error creating signed URL:", error);
        return null;
      }
      
      return data.signedUrl;
    } catch (error) {
      logger.error("Error in getSignedAvatarUrl:", error);
      return null;
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
    } catch (error) {
      logger.error("Error updating profile:", error);
      return { error: error as Error };
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

      // Create a signed URL for the uploaded avatar
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from("avatars")
        .createSignedUrl(fileName, 3600); // 1 hour expiry
      
      if (signedUrlError) throw signedUrlError;

      // Store the file path (not the signed URL) in the database
      // The signed URL will be generated fresh when loading the profile
      const storagePath = `${user.id}/avatar.${fileExt}`;
      await updateProfile({ avatar_url: storagePath });
      
      return { url: signedUrlData.signedUrl, error: null };
    } catch (error) {
      logger.error("Error uploading avatar:", error);
      return { url: null, error: error as Error };
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
    getSignedAvatarUrl,
  };
};
