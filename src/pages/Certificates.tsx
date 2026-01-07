import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Award, 
  Search, 
  Download, 
  Linkedin, 
  CheckCircle, 
  XCircle, 
  Calendar,
  User,
  Mail,
  Shield,
  Sparkles,
  ExternalLink
} from "lucide-react";
import html2canvas from "html2canvas";

interface Certificate {
  id: string;
  certificate_number: string;
  recipient_name: string;
  recipient_email: string;
  issue_date: string;
  is_valid: boolean;
  verification_url: string | null;
  template_id: string | null;
  event_id: string | null;
  course_id: string | null;
  linkedin_credential_id: string | null;
  metadata: unknown;
}

interface CertificateTemplate {
  id: string;
  name: string;
  description: string | null;
  template_type: string;
  background_color: string;
  primary_color: string;
  logo_url: string | null;
  badge_url: string | null;
}

const Certificates = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const certificateRef = useRef<HTMLDivElement>(null);
  
  const [activeTab, setActiveTab] = useState(searchParams.get("verify") ? "verify" : "generate");
  const [verifyCode, setVerifyCode] = useState(searchParams.get("code") || "");
  const [verifiedCertificate, setVerifiedCertificate] = useState<Certificate | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "valid" | "invalid">("idle");
  
  const [generateName, setGenerateName] = useState("");
  const [generateEmail, setGenerateEmail] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatedCertificate, setGeneratedCertificate] = useState<Certificate | null>(null);
  
  const [myCertificates, setMyCertificates] = useState<Certificate[]>([]);
  const [loadingMyCerts, setLoadingMyCerts] = useState(false);

  useEffect(() => {
    fetchTemplates();
    fetchMyCertificates();
    
    if (searchParams.get("verify") && searchParams.get("code")) {
      handleVerify();
    }
  }, []);

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from("certificate_templates")
      .select("*")
      .eq("is_active", true);
    if (data) setTemplates(data);
  };

  const fetchMyCertificates = async () => {
    setLoadingMyCerts(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("issued_certificates")
        .select("*")
        .or(`user_id.eq.${user.id},recipient_email.eq.${user.email}`)
        .order("issue_date", { ascending: false });
      if (data) setMyCertificates(data);
    }
    setLoadingMyCerts(false);
  };

  const handleVerify = async () => {
    if (!verifyCode.trim()) {
      toast({ title: "Please enter a certificate number", variant: "destructive" });
      return;
    }
    
    setVerifying(true);
    setVerificationStatus("idle");
    
    const { data, error } = await supabase
      .from("issued_certificates")
      .select("*")
      .eq("certificate_number", verifyCode.trim().toUpperCase())
      .single();
    
    if (error || !data) {
      setVerificationStatus("invalid");
      setVerifiedCertificate(null);
    } else {
      setVerificationStatus(data.is_valid ? "valid" : "invalid");
      setVerifiedCertificate(data);
    }
    
    setVerifying(false);
  };

  const handleGenerate = async () => {
    if (!generateName.trim() || !generateEmail.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setGenerating(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    // Generate certificate number
    const certNumber = `AITD-CERT-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    const { data, error } = await supabase
      .from("issued_certificates")
      .insert({
        certificate_number: certNumber,
        recipient_name: generateName.trim(),
        recipient_email: generateEmail.trim(),
        user_id: user?.id || null,
        template_id: selectedTemplate || null,
        linkedin_credential_id: certNumber,
        verification_url: `${window.location.origin}/certificates?verify=true&code=${certNumber}`
      })
      .select()
      .single();
    
    if (error) {
      toast({ title: "Error generating certificate", description: error.message, variant: "destructive" });
    } else if (data) {
      setGeneratedCertificate(data);
      toast({ title: "Certificate generated successfully!", description: `Certificate ID: ${data.certificate_number}` });
      fetchMyCertificates();
    }
    
    setGenerating(false);
  };

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    
    try {
      const canvas = await html2canvas(certificateRef.current, { scale: 2 });
      const link = document.createElement("a");
      link.download = `certificate-${generatedCertificate?.certificate_number || verifiedCertificate?.certificate_number}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast({ title: "Certificate downloaded!" });
    } catch (err) {
      toast({ title: "Download failed", variant: "destructive" });
    }
  };

  const handleAddToLinkedIn = (cert: Certificate) => {
    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent("AITD Events Certification")}&organizationId=0&issueYear=${new Date(cert.issue_date).getFullYear()}&issueMonth=${new Date(cert.issue_date).getMonth() + 1}&certUrl=${encodeURIComponent(cert.verification_url || `${window.location.origin}/certificates?verify=true&code=${cert.certificate_number}`)}&certId=${encodeURIComponent(cert.certificate_number)}`;
    window.open(linkedInUrl, "_blank");
  };

  const renderCertificatePreview = (cert: Certificate) => (
    <div
      ref={certificateRef}
      className="relative w-full max-w-2xl mx-auto bg-gradient-to-br from-violet-50 via-white to-purple-50 rounded-lg border-4 border-primary/20 p-8 shadow-xl"
      style={{ aspectRatio: "1.4/1" }}
    >
      {/* Decorative corners */}
      <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-primary/30 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-primary/30 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-primary/30 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-primary/30 rounded-br-lg" />
      
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <Award className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Certificate of Achievement
        </h1>
        
        <p className="text-muted-foreground">This is to certify that</p>
        
        <h2 className="text-4xl font-bold text-foreground py-2 border-b-2 border-primary/20 inline-block px-8">
          {cert.recipient_name}
        </h2>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          has successfully completed the requirements and is hereby awarded this certificate by AITD Events.
        </p>
        
        <div className="flex justify-center items-center gap-8 pt-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Issue Date</p>
            <p className="font-semibold">{new Date(cert.issue_date).toLocaleDateString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Certificate ID</p>
            <p className="font-mono text-sm font-semibold">{cert.certificate_number}</p>
          </div>
        </div>
        
        <div className="pt-4">
          <p className="text-xs text-muted-foreground">
            Verify at: {window.location.origin}/certificates?verify=true&code={cert.certificate_number}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="container mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Verified Credentials</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Certificate Portal
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate, verify, and share your AITD Events certificates. Add credentials to your LinkedIn profile with one click.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="generate" className="gap-2">
              <Award className="w-4 h-4" /> Generate
            </TabsTrigger>
            <TabsTrigger value="verify" className="gap-2">
              <Shield className="w-4 h-4" /> Verify
            </TabsTrigger>
            <TabsTrigger value="my-certs" className="gap-2">
              <User className="w-4 h-4" /> My Certs
            </TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate">
            <div className="max-w-2xl mx-auto">
              {!generatedCertificate ? (
                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      Request Your Certificate
                    </CardTitle>
                    <CardDescription>
                      Enter your details to generate a verified certificate
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <User className="w-4 h-4" /> Full Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={generateName}
                        onChange={(e) => setGenerateName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={generateEmail}
                        onChange={(e) => setGenerateEmail(e.target.value)}
                      />
                    </div>

                    {templates.length > 0 && (
                      <div className="space-y-2">
                        <Label>Certificate Template (Optional)</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {templates.map((template) => (
                            <button
                              key={template.id}
                              onClick={() => setSelectedTemplate(template.id)}
                              className={`p-3 rounded-lg border-2 text-left transition-all ${
                                selectedTemplate === template.id
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              <p className="font-medium text-sm">{template.name}</p>
                              <p className="text-xs text-muted-foreground">{template.template_type}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleGenerate}
                      disabled={generating}
                      className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
                    >
                      {generating ? "Generating..." : "Generate Certificate"}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  <Card className="border-2 border-green-500/30 bg-green-50/50 dark:bg-green-950/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <div>
                          <h3 className="font-semibold text-green-700 dark:text-green-400">Certificate Generated!</h3>
                          <p className="text-sm text-muted-foreground">ID: {generatedCertificate.certificate_number}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {renderCertificatePreview(generatedCertificate)}

                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button onClick={handleDownload} className="gap-2">
                      <Download className="w-4 h-4" /> Download PNG
                    </Button>
                    <Button 
                      onClick={() => handleAddToLinkedIn(generatedCertificate)} 
                      className="gap-2 bg-[#0077B5] hover:bg-[#006699]"
                    >
                      <Linkedin className="w-4 h-4" /> Add to LinkedIn
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setGeneratedCertificate(null)}
                    >
                      Generate Another
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Verify Tab */}
          <TabsContent value="verify">
            <div className="max-w-2xl mx-auto">
              <Card className="border-2 border-primary/20 mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Verify Certificate
                  </CardTitle>
                  <CardDescription>
                    Enter a certificate number to verify its authenticity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      placeholder="AITD-CERT-XXXXXXXX"
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value.toUpperCase())}
                      className="font-mono"
                    />
                    <Button onClick={handleVerify} disabled={verifying} className="gap-2">
                      <Search className="w-4 h-4" />
                      {verifying ? "Verifying..." : "Verify"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {verificationStatus === "valid" && verifiedCertificate && (
                <div className="space-y-6">
                  <Card className="border-2 border-green-500/30 bg-green-50/50 dark:bg-green-950/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                        <div>
                          <h3 className="font-semibold text-lg text-green-700 dark:text-green-400">Valid Certificate</h3>
                          <p className="text-muted-foreground">This certificate is authentic and verified.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {renderCertificatePreview(verifiedCertificate)}
                </div>
              )}

              {verificationStatus === "invalid" && (
                <Card className="border-2 border-red-500/30 bg-red-50/50 dark:bg-red-950/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-8 h-8 text-red-500" />
                      <div>
                        <h3 className="font-semibold text-lg text-red-700 dark:text-red-400">Invalid Certificate</h3>
                        <p className="text-muted-foreground">This certificate number was not found or has been revoked.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* My Certificates Tab */}
          <TabsContent value="my-certs">
            <div className="max-w-4xl mx-auto">
              {loadingMyCerts ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                  <p className="mt-4 text-muted-foreground">Loading your certificates...</p>
                </div>
              ) : myCertificates.length === 0 ? (
                <Card className="border-2 border-dashed">
                  <CardContent className="py-12 text-center">
                    <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No Certificates Yet</h3>
                    <p className="text-muted-foreground mb-4">Generate your first certificate to see it here.</p>
                    <Button onClick={() => setActiveTab("generate")}>Generate Certificate</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {myCertificates.map((cert) => (
                    <Card key={cert.id} className="border-2 hover:border-primary/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                              <Award className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{cert.recipient_name}</h3>
                              <p className="text-sm text-muted-foreground font-mono">{cert.certificate_number}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {new Date(cert.issue_date).toLocaleDateString()}
                                </span>
                                {cert.is_valid ? (
                                  <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">Valid</Badge>
                                ) : (
                                  <Badge variant="destructive" className="text-xs">Revoked</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setVerifyCode(cert.certificate_number);
                                setActiveTab("verify");
                                handleVerify();
                              }}
                              className="gap-1"
                            >
                              <ExternalLink className="w-3 h-3" /> View
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAddToLinkedIn(cert)}
                              className="gap-1 bg-[#0077B5] hover:bg-[#006699]"
                            >
                              <Linkedin className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default Certificates;