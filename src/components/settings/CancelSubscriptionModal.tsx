import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle, Loader2 } from "lucide-react";

interface CancelSubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string, feedback: string) => Promise<void>;
}

const cancellationReasons = [
  { value: "too_expensive", label: "Too expensive" },
  { value: "not_using", label: "Not using it enough" },
  { value: "missing_features", label: "Missing features I need" },
  { value: "found_alternative", label: "Found a better alternative" },
  { value: "technical_issues", label: "Technical issues" },
  { value: "other", label: "Other reason" },
];

const CancelSubscriptionModal = ({
  open,
  onClose,
  onConfirm,
}: CancelSubscriptionModalProps) => {
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    if (!reason) return;
    setIsCancelling(true);
    try {
      await onConfirm(reason, feedback);
      onClose();
    } finally {
      setIsCancelling(false);
    }
  };

  const handleClose = () => {
    setReason("");
    setFeedback("");
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md bg-card border-border">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-muted-foreground pt-2">
            We're sorry to see you go. Your subscription will remain active
            until the end of your current billing period.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Why are you cancelling? <span className="text-destructive">*</span>
            </Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {cancellationReasons.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label
                    htmlFor={option.value}
                    className="flex-1 cursor-pointer text-sm"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback" className="text-sm font-medium">
              Additional feedback (optional)
            </Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us how we can improve..."
              rows={3}
              className="bg-background border-border resize-none"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isCancelling}>
            Keep Subscription
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={!reason || isCancelling}
          >
            {isCancelling ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Cancel Subscription"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CancelSubscriptionModal;
