import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle, XCircle, Linkedin, Twitter, Copy, ExternalLink, 
  Award, Shield, Calendar, ArrowLeft, Share2, Loader2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CertificatePreview } from "@/components/certificates/CertificatePreview";
import { ShareCertificatePanel } from "@/components/certificates/ShareCertificatePanel";

interface VerifiedCertificate {
  certificate_number: string;
  recipient_name: string;
  issue_date: string;
  valid_until: string | null;
  is_valid: boolean;
  verification_url: string | null;
}

const CertificatePublic = () => {
  const { certificateNumber } = useParams<{ certificateNumber: string }>();
  const { toast } = useToast();
  const [certificate, setCertificate] = useState<VerifiedCertificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (certificateNumber) {
      verifyCertificate(certificateNumber);
    }
  }, [certificateNumber]);

  const verifyCertificate = async (certNumber: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .rpc("verify_certificate", { cert_number: certNumber.toUpperCase() });

    if (error || !data || data.length === 0) {
      setNotFound(true);
    } else {
      setCertificate(data[0]);
    }
    setLoading(false);
  };

  const publicUrl = `${window.location.origin}/certificate/${certificateNumber}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground font-medium">Verifying credential...</p>
        </div>
      </div>
    );
  }

  if (notFound || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background px-4">
        <Card className="max-w-md w-full border-destructive/30">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Certificate Not Found</h1>
            <p className="text-muted-foreground">
              The certificate <span className="font-mono font-semibold">{certificateNumber}</span> could not be verified. 
              It may not exist or has been revoked.
            </p>
            <Link to="/certificates">
              <Button variant="outline" className="gap-2 mt-4">
                <ArrowLeft className="w-4 h-4" /> Go to Certificate Portal
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const issueDate = new Date(certificate.issue_date);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/certificates" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Certificate Portal
          </Link>
          <Badge variant={certificate.is_valid ? "default" : "destructive"} className="gap-1">
            {certificate.is_valid ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            {certificate.is_valid ? "Verified" : "Revoked"}
          </Badge>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Verification Banner */}
        <div className={`rounded-xl p-6 mb-8 border-2 ${
          certificate.is_valid 
            ? "bg-success/5 border-success/20" 
            : "bg-destructive/5 border-destructive/20"
        }`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              certificate.is_valid ? "bg-success/10" : "bg-destructive/10"
            }`}>
              {certificate.is_valid 
                ? <Shield className="w-6 h-6 text-success" />
                : <XCircle className="w-6 h-6 text-destructive" />
              }
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {certificate.is_valid ? "This credential is verified" : "This credential has been revoked"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {certificate.is_valid 
                  ? "This certificate was issued by AITD Events and is currently valid."
                  : "This certificate is no longer valid."
                }
              </p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Award className="w-4 h-4" />
                  <span className="font-mono">{certificate.certificate_number}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Issued {issueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Preview */}
        <div className="mb-8">
          <CertificatePreview
            recipientName={certificate.recipient_name}
            certificateNumber={certificate.certificate_number}
            issueDate={issueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            certificateType="achievement"
            validUntil={certificate.valid_until ? new Date(certificate.valid_until).toLocaleDateString() : undefined}
          />
        </div>

        {/* Share Panel */}
        <ShareCertificatePanel
          certificateNumber={certificate.certificate_number}
          recipientName={certificate.recipient_name}
          issueDate={certificate.issue_date}
          publicUrl={publicUrl}
          certificateTitle="AITD Events - Certificate of Achievement"
        />

        {/* Credential Details */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Credential Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Recipient</p>
                <p className="font-semibold text-foreground">{certificate.recipient_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Certificate ID</p>
                <p className="font-mono text-sm text-foreground">{certificate.certificate_number}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Issue Date</p>
                <p className="text-foreground">{issueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Issuing Organization</p>
                <p className="text-foreground">AITD Events</p>
              </div>
              {certificate.valid_until && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Valid Until</p>
                  <p className="text-foreground">{new Date(certificate.valid_until).toLocaleDateString()}</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                <Badge variant={certificate.is_valid ? "default" : "destructive"}>
                  {certificate.is_valid ? "Active" : "Revoked"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CertificatePublic;
