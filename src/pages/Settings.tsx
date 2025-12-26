import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  Link2,
  AlertTriangle,
  Camera,
  Loader2,
  Youtube,
  Mail,
  Download,
  Trash2,
  ExternalLink,
  Bell,
  CreditCard,
  Crown,
  Sparkles,
  Users,
  Search,
  FileText,
  Check,
} from "lucide-react";
import AvatarCropper from "@/components/settings/AvatarCropper";
import DeleteAccountModal from "@/components/settings/DeleteAccountModal";
import UpgradeModal from "@/components/settings/UpgradeModal";
import CancelSubscriptionModal from "@/components/settings/CancelSubscriptionModal";

const nicheOptions = [
  "Gaming",
  "Technology",
  "Lifestyle",
  "Education",
  "Entertainment",
  "Music",
  "Sports",
  "Food & Cooking",
  "Travel",
  "Fashion & Beauty",
  "Health & Fitness",
  "Business",
  "News & Politics",
  "Science",
  "DIY & Crafts",
  "Automotive",
  "Pets & Animals",
  "Comedy",
  "Other",
];

const experienceLevels = [
  { value: "beginner", label: "Beginner (0-1 year)" },
  { value: "intermediate", label: "Intermediate (1-3 years)" },
  { value: "advanced", label: "Advanced (3-5 years)" },
  { value: "expert", label: "Expert (5+ years)" },
];

// Mock billing history
const billingHistory = [
  { date: "2024-12-01", amount: "$19.00", status: "Paid", invoice: "#INV-001" },
  { date: "2024-11-01", amount: "$19.00", status: "Paid", invoice: "#INV-002" },
  { date: "2024-10-01", amount: "$19.00", status: "Paid", invoice: "#INV-003" },
];

const Settings = () => {
  const { user, signOut } = useAuth();
  const { profile, loading, updateProfile, uploadAvatar, refetch } = useProfile();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [channelNiche, setChannelNiche] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    weeklyReport: true,
    competitorAlerts: true,
    newFeatures: true,
    tipsAndPractices: false,
    pushNotifications: false,
  });

  // Avatar cropper state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Usage stats (mock data - would come from API)
  const [usageStats, setUsageStats] = useState({
    aiGenerations: { used: 3, limit: 5 },
    keywordSearches: { used: 7, limit: 10 },
    channelsConnected: { used: 1, limit: 1 },
    competitorsTracked: { used: 2, limit: 3 },
  });

  // Sync form state when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setChannelNiche(profile.channel_niche || "");
      setExperienceLevel(profile.experience_level || "");
    }
  }, [profile]);

  const isFreeTier = profile?.subscription_tier === "free";
  const currentPlan = profile?.subscription_tier || "free";

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
    const { error } = await uploadAvatar(file);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
      refetch();
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await updateProfile({
        full_name: fullName,
        channel_niche: channelNiche,
        experience_level: experienceLevel,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: "Success",
      description: "Notification preferences saved",
    });
    setIsSavingNotifications(false);
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const [profileData, channelsData, videosData, competitorsData] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user?.id).single(),
        supabase.from("channels").select("*").eq("user_id", user?.id),
        supabase.from("saved_content_ideas").select("*").eq("user_id", user?.id),
        supabase.from("competitors").select("*").eq("user_id", user?.id),
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        profile: profileData.data,
        channels: channelsData.data,
        savedIdeas: videosData.data,
        competitors: competitorsData.data,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zainiq-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Your data has been exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await signOut();
      toast({
        title: "Account deletion requested",
        description: "Your account deletion has been initiated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
    }
  };

  const handleCancelSubscription = async (reason: string, feedback: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast({
      title: "Subscription Cancelled",
      description: "Your subscription will remain active until the end of your billing period",
    });
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 100) return "text-destructive";
    if (percentage >= 80) return "text-yellow-500";
    return "text-accent";
  };

  if (loading) {
    return (
      <DashboardLayout title="Settings">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Settings">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-card border border-border flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="subscription" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="connections" className="gap-2">
              <Link2 className="w-4 h-4" />
              Connections
            </TabsTrigger>
            <TabsTrigger value="danger" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              Danger Zone
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div
                      onClick={handleAvatarClick}
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center cursor-pointer overflow-hidden border-4 border-background shadow-lg group-hover:opacity-90 transition-opacity"
                    >
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-bold text-primary-foreground">
                          {user?.email?.charAt(0).toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleAvatarClick}
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Profile Photo</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click to upload a new photo. Square images work best.
                    </p>
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Form Fields */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="bg-background border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        value={user?.email || ""}
                        disabled
                        className="bg-muted border-border pr-24"
                      />
                      <Button
                        variant="link"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-primary h-auto py-1"
                      >
                        Change <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Contact support to change your email address
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="niche">Channel Niche</Label>
                    <Select value={channelNiche} onValueChange={setChannelNiche}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Select your niche" />
                      </SelectTrigger>
                      <SelectContent>
                        {nicheOptions.map((niche) => (
                          <SelectItem key={niche} value={niche.toLowerCase()}>
                            {niche}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience Level</Label>
                    <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio / Description</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself and your channel..."
                      rows={4}
                      className="bg-background border-border resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>
                  Choose what emails you'd like to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Weekly Performance Report</h4>
                      <p className="text-sm text-muted-foreground">
                        Get a summary of your channel's performance every week
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.weeklyReport}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, weeklyReport: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Competitor Alerts</h4>
                      <p className="text-sm text-muted-foreground">
                        Get notified when competitors post new videos
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.competitorAlerts}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, competitorAlerts: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">New Feature Announcements</h4>
                      <p className="text-sm text-muted-foreground">
                        Be the first to know about new features and updates
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.newFeatures}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, newFeatures: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Tips & Best Practices</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive tips to help grow your channel
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.tipsAndPractices}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, tipsAndPractices: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Push Notifications</CardTitle>
                <CardDescription>
                  Receive notifications in your browser
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Browser Push Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Get real-time alerts in your browser
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, pushNotifications: checked })
                    }
                  />
                </div>

                <div className="flex justify-end mt-6">
                  <Button onClick={handleSaveNotifications} disabled={isSavingNotifications}>
                    {isSavingNotifications ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Preferences"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            {/* Current Plan */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Current Plan
                      <Badge
                        className={
                          isFreeTier
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary/10 text-primary border-primary/20"
                        }
                      >
                        {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {isFreeTier
                        ? "You're on the free plan with limited features"
                        : "You have access to premium features"}
                    </CardDescription>
                  </div>
                  <Button onClick={() => setUpgradeModalOpen(true)}>
                    <Crown className="w-4 h-4 mr-2" />
                    {isFreeTier ? "Upgrade Plan" : "Manage Plan"}
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Usage Stats */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Usage This Period</CardTitle>
                <CardDescription>
                  Track your usage across different features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-background rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">AI Generations</span>
                      </div>
                      <span
                        className={`text-sm font-medium ${getUsageColor(
                          usageStats.aiGenerations.used,
                          usageStats.aiGenerations.limit
                        )}`}
                      >
                        {usageStats.aiGenerations.used}/{usageStats.aiGenerations.limit}
                      </span>
                    </div>
                    <Progress
                      value={getUsagePercentage(
                        usageStats.aiGenerations.used,
                        usageStats.aiGenerations.limit
                      )}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Resets daily</p>
                  </div>

                  <div className="p-4 bg-background rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium">Keyword Searches</span>
                      </div>
                      <span
                        className={`text-sm font-medium ${getUsageColor(
                          usageStats.keywordSearches.used,
                          usageStats.keywordSearches.limit
                        )}`}
                      >
                        {usageStats.keywordSearches.used}/{usageStats.keywordSearches.limit}
                      </span>
                    </div>
                    <Progress
                      value={getUsagePercentage(
                        usageStats.keywordSearches.used,
                        usageStats.keywordSearches.limit
                      )}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Resets daily</p>
                  </div>

                  <div className="p-4 bg-background rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Youtube className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium">Channels Connected</span>
                      </div>
                      <span
                        className={`text-sm font-medium ${getUsageColor(
                          usageStats.channelsConnected.used,
                          usageStats.channelsConnected.limit
                        )}`}
                      >
                        {usageStats.channelsConnected.used}/{usageStats.channelsConnected.limit}
                      </span>
                    </div>
                    <Progress
                      value={getUsagePercentage(
                        usageStats.channelsConnected.used,
                        usageStats.channelsConnected.limit
                      )}
                      className="h-2"
                    />
                  </div>

                  <div className="p-4 bg-background rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">Competitors Tracked</span>
                      </div>
                      <span
                        className={`text-sm font-medium ${getUsageColor(
                          usageStats.competitorsTracked.used,
                          usageStats.competitorsTracked.limit
                        )}`}
                      >
                        {usageStats.competitorsTracked.used}/{usageStats.competitorsTracked.limit}
                      </span>
                    </div>
                    <Progress
                      value={getUsagePercentage(
                        usageStats.competitorsTracked.used,
                        usageStats.competitorsTracked.limit
                      )}
                      className="h-2"
                    />
                  </div>
                </div>

                {isFreeTier && (
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-3">
                      <Crown className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">Need more?</h4>
                        <p className="text-sm text-muted-foreground">
                          Upgrade to Pro for unlimited AI generations and keyword searches
                        </p>
                      </div>
                      <Button size="sm" onClick={() => setUpgradeModalOpen(true)}>
                        Upgrade Now
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Billing History */}
            {!isFreeTier && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>
                    View your past invoices and payments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Invoice</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billingHistory.map((item, index) => (
                        <TableRow key={index} className="border-border">
                          <TableCell>{item.date}</TableCell>
                          <TableCell>{item.amount}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-green-500/10 text-green-500 border-green-500/20"
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="link" size="sm" className="text-primary p-0 h-auto">
                              Download <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <Separator className="my-6 bg-border" />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Cancel Subscription</h4>
                      <p className="text-sm text-muted-foreground">
                        You'll keep access until the end of your billing period
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => setCancelModalOpen(true)}
                    >
                      Cancel Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Connected Accounts Tab */}
          <TabsContent value="connections" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>
                  Manage your connected services and accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <Youtube className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">YouTube Channel</h4>
                      <p className="text-sm text-muted-foreground">No channel connected</p>
                    </div>
                  </div>
                  <Button variant="outline">Connect Channel</Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Google Account</h4>
                      <p className="text-sm text-muted-foreground">
                        {user?.email || "Not connected"}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" disabled>
                    Connected
                  </Button>
                </div>

                <Separator className="bg-border" />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Connect Another Channel</h4>
                    <p className="text-sm text-muted-foreground">
                      Upgrade to Pro to connect multiple channels
                    </p>
                  </div>
                  <Button variant="secondary" onClick={() => setUpgradeModalOpen(true)}>
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger" className="space-y-6">
            <Card className="bg-card border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>Irreversible and destructive actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Download className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Export My Data</h4>
                      <p className="text-sm text-muted-foreground">
                        Download all your data in JSON format
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleExportData} disabled={isExporting}>
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                      </>
                    )}
                  </Button>
                </div>

                <Separator className="bg-border" />

                <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <Trash2 className="w-6 h-6 text-destructive" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Delete Account</h4>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all data
                      </p>
                    </div>
                  </div>
                  <Button variant="destructive" onClick={() => setDeleteModalOpen(true)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Avatar Cropper Modal */}
      {selectedImage && (
        <AvatarCropper
          open={cropperOpen}
          onClose={() => {
            setCropperOpen(false);
            setSelectedImage(null);
          }}
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
        />
      )}

      {/* Delete Account Modal */}
      <DeleteAccountModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        userEmail={user?.email || ""}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        currentPlan={currentPlan as "free" | "pro" | "agency"}
      />

      {/* Cancel Subscription Modal */}
      <CancelSubscriptionModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelSubscription}
      />
    </DashboardLayout>
  );
};

export default Settings;
