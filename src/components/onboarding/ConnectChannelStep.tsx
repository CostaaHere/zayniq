import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowLeft, Link, Loader2, CheckCircle2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { YouTubeConnectButton } from "@/components/youtube/YouTubeConnectButton";
import { useYouTubeConnection } from "@/hooks/useYouTubeConnection";

interface ConnectChannelStepProps {
  onNext: () => void;
  onBack: () => void;
}

const ConnectChannelStep = ({ onNext, onBack }: ConnectChannelStepProps) => {
  const { user } = useAuth();
  const { updateProfile } = useProfile();
  const { toast } = useToast();
  const { isConnected, channel, isLoading: connectionLoading } = useYouTubeConnection();
  
  const [mode, setMode] = useState<"oauth" | "manual">("oauth");
  const [channelUrl, setChannelUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [manualConnected, setManualConnected] = useState(false);
  const [channelPreview, setChannelPreview] = useState<{
    name: string;
    thumbnail: string;
    subscribers: string;
  } | null>(null);

  // Sync channel preview when OAuth connection succeeds
  useEffect(() => {
    if (isConnected && channel) {
      setChannelPreview({
        name: channel.name,
        thumbnail: channel.thumbnail || `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name)}&background=dc2626&color=fff&size=100`,
        subscribers: `${channel.subscriberCount.toLocaleString()} subscribers`,
      });
    }
  }, [isConnected, channel]);

  const extractChannelId = (url: string): string | null => {
    const patterns = [
      /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/c\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/@([a-zA-Z0-9_-]+)/,
      /youtube\.com\/user\/([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    if (/^[a-zA-Z0-9_-]+$/.test(url)) {
      return url;
    }

    return null;
  };

  const handleManualConnect = async () => {
    if (!channelUrl.trim()) {
      toast({
        title: "Required",
        description: "Please enter your channel URL or ID",
        variant: "destructive",
      });
      return;
    }

    const channelId = extractChannelId(channelUrl);
    if (!channelId) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube channel URL",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const channelData = {
        user_id: user?.id,
        youtube_channel_id: channelId,
        channel_name: channelId.startsWith("@") ? channelId : `Channel ${channelId.slice(0, 8)}`,
        thumbnail_url: null,
        description: null,
        subscriber_count: 0,
        video_count: 0,
        total_view_count: 0,
      };

      const { error } = await supabase
        .from("channels")
        .upsert(channelData, { onConflict: "user_id,youtube_channel_id" });

      if (error) throw error;

      setChannelPreview({
        name: channelData.channel_name,
        thumbnail: `https://ui-avatars.com/api/?name=${encodeURIComponent(channelData.channel_name)}&background=8b5cf6&color=fff&size=100`,
        subscribers: "Pending sync",
      });
      setManualConnected(true);

      toast({
        title: "Channel connected!",
        description: "Your channel has been linked. Connect with YouTube for full analytics.",
      });
    } catch (error: any) {
      console.error("Error connecting channel:", error);
      toast({
        title: "Error",
        description: "Failed to connect channel",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    await updateProfile({ onboarding_step: 2 });
    onNext();
  };

  const handleSkip = async () => {
    await updateProfile({ onboarding_step: 2 });
    onNext();
  };

  const showConnected = isConnected || manualConnected;

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="text-center">
        <h2 className="text-3xl font-bold gradient-text mb-2">Connect your channel</h2>
        <p className="text-muted-foreground">Link your YouTube channel to unlock powerful analytics</p>
      </div>

      {!showConnected ? (
        <>
          {/* OAuth Option - Primary */}
          <div className="space-y-4">
            <YouTubeConnectButton
              variant="card"
              showChannelPreview={false}
              onConnected={() => {}}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-background text-muted-foreground text-sm">or</span>
              </div>
            </div>

            {/* Manual Entry - Fallback */}
            <button
              onClick={() => setMode("manual")}
              className={cn(
                "w-full p-6 rounded-xl border-2 transition-all duration-200",
                "flex items-center justify-between",
                mode === "manual"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <Link className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Enter Channel URL</div>
                  <div className="text-sm text-muted-foreground">
                    Manual entry (limited features)
                  </div>
                </div>
              </div>
            </button>

            {mode === "manual" && (
              <div className="space-y-4 animate-fade-up">
                <div className="space-y-2">
                  <Label>Channel URL or ID</Label>
                  <Input
                    value={channelUrl}
                    onChange={(e) => setChannelUrl(e.target.value)}
                    placeholder="https://youtube.com/@yourchannel"
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    e.g., youtube.com/@channel, youtube.com/channel/ID
                  </p>
                </div>
                <Button
                  onClick={handleManualConnect}
                  disabled={loading}
                  className="w-full h-12"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  Connect Channel
                </Button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Channel Preview */
        <div className="glass-card p-6 animate-fade-up">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={channelPreview?.thumbnail}
                alt={channelPreview?.name}
                className="w-16 h-16 rounded-full"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{channelPreview?.name}</h3>
              <p className="text-muted-foreground text-sm">{channelPreview?.subscribers}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        {showConnected ? (
          <Button
            onClick={handleNext}
            className="flex-1 h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="flex-1 h-12"
          >
            Skip for now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ConnectChannelStep;
