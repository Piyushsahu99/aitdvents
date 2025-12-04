import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Share2, Linkedin, Twitter, Loader2, Award, Sparkles, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/aitd-logo.png";

interface MemberCertificateProps {
  userName: string;
  joinDate: string;
  memberId: string;
  onShare?: () => void;
}

export function MemberCertificate({ userName, joinDate, memberId, onShare }: MemberCertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const formattedDate = new Date(joinDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Use html2canvas dynamically
      const html2canvas = (await import('html2canvas')).default;
      
      if (certificateRef.current) {
        const canvas = await html2canvas(certificateRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
        });
        
        const link = document.createElement('a');
        link.download = `AITD-Events-Certificate-${userName.replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        toast({
          title: "Certificate Downloaded! 🎉",
          description: "Share it on your social media to earn points!",
        });
        
        onShare?.();
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const shareToLinkedIn = () => {
    const text = encodeURIComponent(`🎉 Excited to share that I'm now an official member of AITD Events! 

AITD Events is an amazing platform for tech students to discover hackathons, bounties, jobs, scholarships, and networking opportunities.

Join me on this journey! 🚀

#AITDEvents #TechCommunity #StudentLife #CareerGrowth`);
    
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`, '_blank');
    
    toast({
      title: "Points Earned! 🎉",
      description: "+10 points for sharing on LinkedIn!",
    });
    
    onShare?.();
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(`🎉 I'm now an official member of @AITDEvents! 

A platform where tech students discover hackathons, bounties, jobs & more. Join me! 🚀

${window.location.origin}

#AITDEvents #TechCommunity`);
    
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    
    toast({
      title: "Points Earned! 🎉",
      description: "+10 points for sharing on Twitter!",
    });
    
    onShare?.();
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <CardTitle>Member Certificate</CardTitle>
        </div>
        <CardDescription>Download and share to earn points!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Certificate Preview */}
        <div 
          ref={certificateRef}
          className="relative bg-white rounded-xl overflow-hidden shadow-lg border-4 border-primary/20"
          style={{ aspectRatio: '16/9' }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-accent/5" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
          
          {/* Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="AITD Events" className="h-12 w-12 rounded-xl shadow-md" />
              <div className="text-left">
                <h3 className="text-xl font-bold text-primary">AITD Events</h3>
                <p className="text-xs text-gray-500">Your Gateway to Tech Opportunities</p>
              </div>
            </div>
            
            {/* Certificate Title */}
            <div className="mb-4">
              <Badge className="bg-gradient-to-r from-primary to-accent text-white px-4 py-1 text-sm">
                <Sparkles className="h-3 w-3 mr-1" />
                Certificate of Membership
              </Badge>
            </div>
            
            {/* Main Content */}
            <p className="text-gray-600 text-sm mb-2">This is to certify that</p>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
              {userName}
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              is an official member of the AITD Events community
            </p>
            
            {/* Details */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-success" />
                <span>Member since {formattedDate}</span>
              </div>
              <div className="text-gray-300">•</div>
              <span>ID: {memberId.slice(0, 8).toUpperCase()}</span>
            </div>
            
            {/* Footer */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <p className="text-[10px] text-gray-400">
                🚀 Hackathons • 💰 Bounties • 💼 Jobs • 🎓 Scholarships • 🤝 Networking
              </p>
            </div>
          </div>
          
          {/* Decorative corners */}
          <div className="absolute top-2 left-2 w-8 h-8 border-l-2 border-t-2 border-primary/30 rounded-tl-lg" />
          <div className="absolute top-2 right-2 w-8 h-8 border-r-2 border-t-2 border-primary/30 rounded-tr-lg" />
          <div className="absolute bottom-2 left-2 w-8 h-8 border-l-2 border-b-2 border-primary/30 rounded-bl-lg" />
          <div className="absolute bottom-2 right-2 w-8 h-8 border-r-2 border-b-2 border-primary/30 rounded-br-lg" />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            className="w-full" 
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download Certificate
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="bg-[#0077B5]/10 border-[#0077B5]/30 text-[#0077B5] hover:bg-[#0077B5]/20"
              onClick={shareToLinkedIn}
            >
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
            </Button>
            <Button 
              variant="outline"
              className="bg-[#1DA1F2]/10 border-[#1DA1F2]/30 text-[#1DA1F2] hover:bg-[#1DA1F2]/20"
              onClick={shareToTwitter}
            >
              <Twitter className="h-4 w-4 mr-2" />
              Twitter/X
            </Button>
          </div>
          
          <p className="text-xs text-center text-muted-foreground">
            🎁 Share on social media to earn <span className="font-semibold text-primary">+10 points</span> per share!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
