import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Linkedin, Twitter, Copy, CheckCircle, Share2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ShareCertificatePanelProps {
  certificateNumber: string;
  recipientName: string;
  issueDate: string;
  publicUrl: string;
  certificateTitle?: string;
}

export const ShareCertificatePanel = ({
  certificateNumber,
  recipientName,
  issueDate,
  publicUrl,
  certificateTitle = "AITD Events Certification"
}: ShareCertificatePanelProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const issueDateObj = new Date(issueDate);

  const handleAddToLinkedIn = async () => {
    const linkedInUrl = new URL("https://www.linkedin.com/profile/add");
    linkedInUrl.searchParams.set("startTask", "CERTIFICATION_NAME");
    linkedInUrl.searchParams.set("name", certificateTitle);
    linkedInUrl.searchParams.set("organizationName", "AITD Events");
    linkedInUrl.searchParams.set("issueYear", String(issueDateObj.getFullYear()));
    linkedInUrl.searchParams.set("issueMonth", String(issueDateObj.getMonth() + 1));
    linkedInUrl.searchParams.set("certUrl", publicUrl);
    linkedInUrl.searchParams.set("certId", certificateNumber);

    window.open(linkedInUrl.toString(), "_blank");

    // Track share
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("issued_certificates")
          .update({ shared_to_linkedin: true })
          .eq("certificate_number", certificateNumber)
          .eq("user_id", user.id);
      }
    } catch {}

    toast({ title: "Opening LinkedIn", description: "Add this credential to your profile!" });
  };

  const handleShareTwitter = async () => {
    const text = `🎉 I just earned "${certificateTitle}" from AITD Events!\n\nVerify my credential: ${publicUrl}\n\n#AITDEvents #Credential #Achievement`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, "_blank");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("issued_certificates")
          .update({ shared_to_twitter: true })
          .eq("certificate_number", certificateNumber)
          .eq("user_id", user.id);
      }
    } catch {}

    toast({ title: "Opening Twitter/X", description: "Share your achievement!" });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Link copied!", description: "Share this link to let anyone verify your credential." });
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  return (
    <Card className="border-2 border-primary/10">
      <CardContent className="p-6">
        <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-primary" />
          Share Your Credential
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add to your LinkedIn profile or share on social media
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            onClick={handleAddToLinkedIn}
            className="gap-2 bg-[hsl(201,100%,35%)] hover:bg-[hsl(201,100%,28%)] text-white"
          >
            <Linkedin className="w-4 h-4" />
            Add to LinkedIn
          </Button>

          <Button
            onClick={handleShareTwitter}
            variant="outline"
            className="gap-2"
          >
            <Twitter className="w-4 h-4" />
            Share on X
          </Button>

          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="gap-2"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground truncate font-mono">{publicUrl}</p>
        </div>
      </CardContent>
    </Card>
  );
};
