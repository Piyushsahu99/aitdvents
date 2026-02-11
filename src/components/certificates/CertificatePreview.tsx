import { QRCodeSVG } from 'qrcode.react';
import aitdLogo from '@/assets/aitd-logo.png';

interface CertificatePreviewProps {
  recipientName: string;
  certificateNumber: string;
  issueDate: string;
  certificateType: 'membership' | 'achievement' | 'leaderboard' | 'participation' | 'completion';
  achievementDetails?: {
    rank?: number;
    month?: string;
    year?: number;
    pointsEarned?: number;
    eventName?: string;
    courseName?: string;
  };
  validUntil?: string;
}

export const CertificatePreview = ({
  recipientName,
  certificateNumber,
  issueDate,
  certificateType,
  achievementDetails,
  validUntil
}: CertificatePreviewProps) => {
  const verificationUrl = `${window.location.origin}/certificate/${certificateNumber}`;

  const getCertificateTitle = () => {
    switch (certificateType) {
      case 'leaderboard':
        return 'Certificate of Excellence';
      case 'achievement':
        return 'Certificate of Achievement';
      case 'participation':
        return 'Certificate of Participation';
      case 'completion':
        return 'Certificate of Completion';
      default:
        return 'Certificate of Membership';
    }
  };

  const getRankBadge = () => {
    if (certificateType !== 'leaderboard' || !achievementDetails?.rank) return null;
    
    const rankStyles = {
      1: { bg: 'from-yellow-400 to-amber-500', text: '🥇 1st Place', shadow: 'shadow-yellow-400/50' },
      2: { bg: 'from-gray-300 to-gray-400', text: '🥈 2nd Place', shadow: 'shadow-gray-400/50' },
      3: { bg: 'from-orange-400 to-orange-600', text: '🥉 3rd Place', shadow: 'shadow-orange-400/50' }
    };
    
    const style = rankStyles[achievementDetails.rank as 1 | 2 | 3];
    
    return (
      <div className={`absolute top-4 right-4 bg-gradient-to-r ${style.bg} text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg ${style.shadow}`}>
        {style.text}
      </div>
    );
  };

  const getAchievementText = () => {
    if (certificateType === 'leaderboard' && achievementDetails) {
      return `For outstanding performance as a Top Contributor in ${achievementDetails.month} ${achievementDetails.year}, earning ${achievementDetails.pointsEarned?.toLocaleString()} points`;
    }
    if (certificateType === 'participation' && achievementDetails?.eventName) {
      return `For participating in "${achievementDetails.eventName}"`;
    }
    if (certificateType === 'completion' && achievementDetails?.courseName) {
      return `For successfully completing "${achievementDetails.courseName}"`;
    }
    if (certificateType === 'membership') {
      return 'For being a valued member of the AITD Events community';
    }
    return 'For exceptional contribution and dedication';
  };

  return (
    <div 
      id="certificate-preview"
      className="relative w-full max-w-3xl mx-auto aspect-[1.414/1] bg-gradient-to-br from-orange-50 via-white to-amber-50 rounded-lg shadow-2xl overflow-hidden"
      style={{ fontFamily: 'Georgia, serif' }}
    >
      {/* Decorative Border */}
      <div className="absolute inset-3 border-4 border-double border-orange-400/60 rounded-lg pointer-events-none" />
      <div className="absolute inset-5 border border-orange-300/40 rounded-lg pointer-events-none" />
      
      {/* Corner Decorations */}
      <div className="absolute top-6 left-6 w-16 h-16 border-l-4 border-t-4 border-orange-500/50 rounded-tl-lg" />
      <div className="absolute top-6 right-6 w-16 h-16 border-r-4 border-t-4 border-orange-500/50 rounded-tr-lg" />
      <div className="absolute bottom-6 left-6 w-16 h-16 border-l-4 border-b-4 border-orange-500/50 rounded-bl-lg" />
      <div className="absolute bottom-6 right-6 w-16 h-16 border-r-4 border-b-4 border-orange-500/50 rounded-br-lg" />
      
      {/* Rank Badge */}
      {getRankBadge()}
      
      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
        {/* Logo */}
        <img 
          src={aitdLogo} 
          alt="AITD Events" 
          className="h-16 mb-4 object-contain"
        />
        
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 bg-clip-text text-transparent tracking-wide mb-2">
          {getCertificateTitle()}
        </h1>
        
        {/* Decorative Line */}
        <div className="w-48 h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent my-4" />
        
        {/* Presented To */}
        <p className="text-gray-600 text-lg mb-2">This is to certify that</p>
        
        {/* Recipient Name */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 border-b-2 border-orange-400/50 pb-2 px-8">
          {recipientName}
        </h2>
        
        {/* Achievement Description */}
        <p className="text-gray-600 text-center max-w-md mb-6 leading-relaxed">
          {getAchievementText()}
        </p>
        
        {/* Points Badge for Leaderboard */}
        {certificateType === 'leaderboard' && achievementDetails?.pointsEarned && (
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2 rounded-full font-bold mb-6 shadow-lg">
            🏆 {achievementDetails.pointsEarned.toLocaleString()} Points Earned
          </div>
        )}
        
        {/* Date & Certificate ID */}
        <div className="flex items-center justify-center gap-8 text-sm text-gray-500 mb-4">
          <div>
            <span className="font-semibold">Issue Date:</span> {issueDate}
          </div>
          {validUntil && (
            <div>
              <span className="font-semibold">Valid Until:</span> {validUntil}
            </div>
          )}
        </div>
        
        {/* QR Code & Certificate ID */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="bg-white p-2 rounded-lg shadow-md">
            <QRCodeSVG value={verificationUrl} size={60} />
          </div>
          <div className="text-left">
            <p className="text-xs text-gray-400">Certificate ID</p>
            <p className="text-sm font-mono font-semibold text-gray-600">{certificateNumber}</p>
            <p className="text-xs text-gray-400 mt-1">Scan to verify</p>
          </div>
        </div>
        
        {/* Official Seal */}
        <div className="absolute bottom-8 right-12 opacity-30">
          <div className="w-20 h-20 border-4 border-orange-600 rounded-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-xs font-bold text-orange-600">AITD</p>
              <p className="text-[8px] text-orange-600">VERIFIED</p>
            </div>
          </div>
        </div>
        
        {/* Signature Area */}
        <div className="absolute bottom-8 left-12 text-center">
          <div className="w-32 border-t border-gray-400 pt-1">
            <p className="text-xs text-gray-500">AITD Events Team</p>
          </div>
        </div>
      </div>
    </div>
  );
};
