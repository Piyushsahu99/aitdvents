import { QRCodeSVG } from 'qrcode.react';
import { Crown, Medal, Trophy } from 'lucide-react';
import aitdLogo from '@/assets/aitd-logo.png';

interface LeaderboardCertificateProps {
  recipientName: string;
  certificateNumber: string;
  rank: 1 | 2 | 3;
  month: string;
  year: number;
  pointsEarned: number;
  issueDate: string;
}

export const LeaderboardCertificate = ({
  recipientName,
  certificateNumber,
  rank,
  month,
  year,
  pointsEarned,
  issueDate
}: LeaderboardCertificateProps) => {
  const verificationUrl = `${window.location.origin}/certificates?verify=${certificateNumber}`;

  const rankConfig = {
    1: {
      gradient: 'from-yellow-400 via-amber-400 to-yellow-500',
      borderColor: 'border-yellow-400',
      bgGradient: 'from-yellow-50 via-amber-50 to-yellow-100',
      icon: Crown,
      title: 'CHAMPION',
      subtitle: '1st Place Winner',
      glow: 'shadow-yellow-400/30'
    },
    2: {
      gradient: 'from-gray-300 via-gray-400 to-slate-400',
      borderColor: 'border-gray-400',
      bgGradient: 'from-gray-50 via-slate-50 to-gray-100',
      icon: Medal,
      title: 'RUNNER UP',
      subtitle: '2nd Place Winner',
      glow: 'shadow-gray-400/30'
    },
    3: {
      gradient: 'from-orange-400 via-orange-500 to-amber-600',
      borderColor: 'border-orange-400',
      bgGradient: 'from-orange-50 via-amber-50 to-orange-100',
      icon: Trophy,
      title: 'ACHIEVER',
      subtitle: '3rd Place Winner',
      glow: 'shadow-orange-400/30'
    }
  };

  const config = rankConfig[rank];
  const RankIcon = config.icon;

  return (
    <div 
      id="leaderboard-certificate"
      className={`relative w-full max-w-3xl mx-auto aspect-[1.414/1] bg-gradient-to-br ${config.bgGradient} rounded-xl shadow-2xl ${config.glow} overflow-hidden`}
      style={{ fontFamily: 'Georgia, serif' }}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)`
        }} />
      </div>

      {/* Decorative Border */}
      <div className={`absolute inset-3 border-4 ${config.borderColor} rounded-lg pointer-events-none`} />
      <div className="absolute inset-5 border border-gray-300/50 rounded-lg pointer-events-none" />
      
      {/* Rank Badge - Top Center */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
        <div className={`bg-gradient-to-r ${config.gradient} text-white px-8 py-3 rounded-b-2xl shadow-lg flex items-center gap-2`}>
          <RankIcon className="w-6 h-6" />
          <span className="font-bold text-lg">{config.title}</span>
          <RankIcon className="w-6 h-6" />
        </div>
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-8 pt-16 text-center">
        {/* Logo */}
        <img 
          src={aitdLogo} 
          alt="AITD Events" 
          className="h-14 mb-2 object-contain"
        />
        
        {/* Month/Year Badge */}
        <div className={`bg-gradient-to-r ${config.gradient} text-white px-6 py-1 rounded-full font-semibold text-sm mb-4`}>
          {month} {year} • Monthly Leaderboard
        </div>

        {/* Title */}
        <h1 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent tracking-wide mb-2`}>
          Certificate of Excellence
        </h1>
        
        {/* Subtitle */}
        <p className="text-gray-500 text-sm mb-4">{config.subtitle}</p>
        
        {/* Decorative Line */}
        <div className={`w-48 h-1 bg-gradient-to-r from-transparent ${config.gradient.replace('from-', 'via-').split(' ')[0]} to-transparent my-2`} />
        
        {/* Presented To */}
        <p className="text-gray-600 text-lg mb-1">Awarded to</p>
        
        {/* Recipient Name */}
        <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4 px-8">
          {recipientName}
        </h2>
        
        {/* Points Badge */}
        <div className={`bg-gradient-to-r ${config.gradient} text-white px-8 py-3 rounded-full font-bold text-xl shadow-lg mb-4 flex items-center gap-3`}>
          <Trophy className="w-6 h-6" />
          {pointsEarned.toLocaleString()} Points
          <Trophy className="w-6 h-6" />
        </div>

        {/* Achievement Description */}
        <p className="text-gray-600 text-center max-w-md mb-4 leading-relaxed">
          For outstanding contribution and exceptional performance on the AITD Events platform during {month} {year}
        </p>
        
        {/* Date & Certificate ID */}
        <div className="flex items-center justify-center gap-8 text-sm text-gray-500 mb-2">
          <div>
            <span className="font-semibold">Issue Date:</span> {issueDate}
          </div>
        </div>
        
        {/* QR Code & Certificate ID */}
        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="bg-white p-2 rounded-lg shadow-md">
            <QRCodeSVG value={verificationUrl} size={50} />
          </div>
          <div className="text-left">
            <p className="text-xs text-gray-400">Certificate ID</p>
            <p className="text-sm font-mono font-semibold text-gray-600">{certificateNumber}</p>
          </div>
        </div>
        
        {/* Official Seal */}
        <div className="absolute bottom-6 right-10 opacity-40">
          <div className={`w-16 h-16 border-4 ${config.borderColor} rounded-full flex items-center justify-center`}>
            <RankIcon className={`w-8 h-8 text-${rank === 1 ? 'yellow' : rank === 2 ? 'gray' : 'orange'}-500`} />
          </div>
        </div>
        
        {/* Signature Area */}
        <div className="absolute bottom-6 left-10 text-center">
          <div className="w-28 border-t border-gray-400 pt-1">
            <p className="text-xs text-gray-500">AITD Events</p>
          </div>
        </div>
      </div>
    </div>
  );
};
