import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Camera, Loader2, ArrowRight } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

interface ProfileStepProps {
  onNext: () => void;
}

const niches = [
  "Gaming",
  "Tech & Reviews",
  "Education",
  "Entertainment",
  "Music",
  "Vlogs & Lifestyle",
  "Business & Finance",
  "Health & Fitness",
  "Food & Cooking",
  "Travel",
  "Beauty & Fashion",
  "Sports",
  "Comedy",
  "News & Politics",
  "Other",
];

const experienceLevels = [
  { value: "starting", label: "Starting", description: "Just getting started", icon: "🌱" },
  { value: "growing", label: "Growing", description: "Building momentum", icon: "📈" },
  { value: "established", label: "Established", description: "Consistent uploads", icon: "⭐" },
  { value: "pro", label: "Pro", description: "Full-time creator", icon: "👑" },
];

const ProfileStep = ({ onNext }: ProfileStepProps) => {
  const { profile, updateProfile, uploadAvatar } = useProfile();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [displayName, setDisplayName] = useState(profile?.full_name || "");
  const [niche, setNiche] = useState(profile?.channel_niche || "");
  const [experience, setExperience] = useState(profile?.experience_level || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const { url, error } = await uploadAvatar(file);
    setUploading(false);

    if (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
    } else if (url) {
      setAvatarUrl(url);
      toast({
        title: "Avatar uploaded",
        description: "Your avatar has been updated",
      });
    }
  };

  const handleNext = async () => {
    if (!displayName.trim()) {
      toast({
        title: "Required field",
        description: "Please enter your display name",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const { error } = await updateProfile({
      full_name: displayName,
      channel_niche: niche,
      experience_level: experience,
      onboarding_step: 1,
    });
    setSaving(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    } else {
      onNext();
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="text-center">
        <h2 className="text-3xl font-bold gradient-text mb-2">Let's set up your profile</h2>
        <p className="text-muted-foreground">Tell us a bit about yourself and your channel</p>
      </div>

      {/* Avatar Upload */}
      <div className="flex justify-center">
        <div
          onClick={handleAvatarClick}
          className={cn(
            "relative w-28 h-28 rounded-full cursor-pointer group",
            "bg-secondary border-2 border-dashed border-muted-foreground/30",
            "hover:border-primary/50 transition-all duration-300"
          )}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground">
              👤
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            ) : (
              <Camera className="w-6 h-6 text-white" />
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Display Name */}
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name *</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your name"
          className="h-12"
        />
      </div>

      {/* Channel Niche */}
      <div className="space-y-2">
        <Label>Channel Niche</Label>
        <Select value={niche} onValueChange={setNiche}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select your niche" />
          </SelectTrigger>
          <SelectContent>
            {niches.map((n) => (
              <SelectItem key={n} value={n}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Experience Level */}
      <div className="space-y-3">
        <Label>Experience Level</Label>
        <div className="grid grid-cols-2 gap-3">
          {experienceLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => setExperience(level.value)}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all duration-200",
                experience === level.value
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-muted-foreground/50"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{level.icon}</span>
                <div>
                  <div className="font-medium">{level.label}</div>
                  <div className="text-xs text-muted-foreground">{level.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Next Button */}
      <Button
        onClick={handleNext}
        disabled={saving}
        className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90"
      >
        {saving ? (
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
        ) : null}
        Continue
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
};

export default ProfileStep;
