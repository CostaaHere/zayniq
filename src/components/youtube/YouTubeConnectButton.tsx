import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useYouTubeConnection } from "@/hooks/useYouTubeConnection";
import { Youtube, Loader2, CheckCircle2, RefreshCw, AlertCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface YouTubeConnectButtonProps {
  variant?: "default" | "compact" | "card";
  showChannelPreview?: boolean;
  onConnected?: () => void;
  className?: string;
}

export function YouTubeConnectButton({
  variant = "default",
  showChannelPreview = true,
  onConnected,
  className,
}: YouTubeConnectButtonProps) {
  const {
    isConnected,
    isLoading,
    isSyncing,
    channel,
    error,
    connectYouTube,
    syncYouTubeData,
  } = useYouTubeConnection();
  
  const [isHovered, setIsHovered] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectYouTube();
      onConnected?.();
    } finally {
      // Keep loading state since OAuth will redirect
      // It will clear when the component unmounts or user returns
    }
  };

  const handleSync = async () => {
    await syncYouTubeData();
  };

  // Loading state
  if (isLoading && !isConnecting) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Checking connection...</span>
      </div>
    );
  }

  // Connected state with channel preview
  if (isConnected && channel && showChannelPreview) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
          <div className="relative">
            {channel.thumbnail ? (
              <img
                src={channel.thumbnail}
                alt={channel.name}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                <Youtube className="w-6 h-6 text-destructive" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center border-2 border-background">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold truncate">{channel.name}</h4>
            <p className="text-sm text-muted-foreground">
              {channel.subscriberCount.toLocaleString()} subscribers
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSync}
            disabled={isSyncing}
            className="shrink-0"
            title="Sync channel data"
          >
            <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
          </Button>
        </div>
      </div>
    );
  }

  // Connected state without preview (compact)
  if (isConnected && variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2 text-green-500", className)}>
        <CheckCircle2 className="w-4 h-4" />
        <span className="text-sm font-medium">Channel Connected</span>
      </div>
    );
  }

  // Error state
  if (error && !isConnecting) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
        >
          {isConnecting ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Youtube className="w-5 h-5 mr-2" />
          )}
          Try Again
        </Button>
      </div>
    );
  }

  // Card variant - large clickable area
  if (variant === "card") {
    return (
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "w-full p-6 rounded-xl border-2 transition-all duration-200",
          "flex items-center justify-between",
          "border-destructive/30 bg-destructive/5 hover:border-destructive hover:bg-destructive/10",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
            isConnecting ? "bg-muted" : "bg-destructive"
          )}>
            {isConnecting ? (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : (
              <Youtube className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="text-left">
            <div className="font-semibold">
              {isConnecting ? "Connecting..." : "Connect with YouTube"}
            </div>
            <div className="text-sm text-muted-foreground">
              {isConnecting 
                ? "Redirecting to Google..." 
                : "Sign in with Google to sync your channel"
              }
            </div>
          </div>
        </div>
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-all",
          isHovered && !isConnecting ? "bg-destructive text-white" : "bg-muted"
        )}>
          <ExternalLink className="w-4 h-4" />
        </div>
      </button>
    );
  }

  // Default button style
  return (
    <Button
      onClick={handleConnect}
      disabled={isLoading || isConnecting}
      className={cn(
        "bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium",
        variant === "compact" ? "h-9 px-4" : "h-12 px-6",
        className
      )}
    >
      {isConnecting ? (
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
      ) : (
        <Youtube className="w-5 h-5 mr-2" />
      )}
      {isConnecting ? "Connecting..." : "Connect with YouTube"}
    </Button>
  );
}
