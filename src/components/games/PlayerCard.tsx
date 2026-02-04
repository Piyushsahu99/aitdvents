import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatPrice, IPLPlayer } from "@/data/iplPlayers";
import { User, Star, Flag } from "lucide-react";

interface PlayerCardProps {
  player: IPLPlayer;
  currentBid?: number;
  isOnBlock?: boolean;
  isSold?: boolean;
  soldPrice?: number;
  onClick?: () => void;
}

const categoryColors = {
  Platinum: "from-purple-500 to-pink-500 border-purple-500/50",
  Gold: "from-yellow-500 to-orange-500 border-yellow-500/50",
  Silver: "from-gray-400 to-gray-500 border-gray-400/50",
  Bronze: "from-amber-600 to-amber-700 border-amber-600/50",
};

const roleIcons: Record<string, string> = {
  Batsman: "🏏",
  Bowler: "🎯",
  "All-rounder": "⚡",
  "Wicket-keeper": "🧤",
};

export function PlayerCard({
  player,
  currentBid,
  isOnBlock,
  isSold,
  soldPrice,
  onClick,
}: PlayerCardProps) {
  return (
    <motion.div
      whileHover={!isOnBlock ? { scale: 1.02, y: -4 } : {}}
      whileTap={!isOnBlock ? { scale: 0.98 } : {}}
      layout
    >
      <Card
        className={`relative overflow-hidden cursor-pointer transition-all duration-300 ${
          isOnBlock
            ? "border-2 border-primary shadow-xl shadow-primary/20"
            : isSold
              ? "opacity-60 border-green-500/30"
              : "hover:border-primary/30"
        }`}
        onClick={onClick}
      >
        {/* Category gradient strip */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${
            categoryColors[player.category]
          }`}
        />

        {/* Sold overlay */}
        {isSold && (
          <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center z-10">
            <Badge className="bg-green-500 text-white text-lg px-4 py-1 rotate-[-15deg]">
              SOLD
            </Badge>
          </div>
        )}

        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* Avatar */}
            <div className="relative shrink-0">
              <Avatar className="h-16 w-16 border-2 border-muted">
                <AvatarImage src={player.photo_url} alt={player.name} />
                <AvatarFallback className="bg-primary/10">
                  <User className="h-8 w-8 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              {player.is_overseas && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-background rounded-full flex items-center justify-center border">
                  <Flag className="h-3 w-3 text-blue-500" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-sm line-clamp-1">{player.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {player.team_name}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`shrink-0 text-[10px] border ${
                    categoryColors[player.category].split(" ").pop()
                  }`}
                >
                  {player.category}
                </Badge>
              </div>

              {/* Role and nationality */}
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant="secondary" className="text-[10px] px-1.5">
                  {roleIcons[player.role]} {player.role}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {player.nationality}
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                {player.stats.runs !== undefined && (
                  <span>{player.stats.runs} runs</span>
                )}
                {player.stats.wickets !== undefined && (
                  <span>{player.stats.wickets} wkts</span>
                )}
                {player.stats.matches && (
                  <span>{player.stats.matches} matches</span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Base:</span>
                  <span className="text-sm font-semibold text-primary">
                    {formatPrice(player.base_price)}
                  </span>
                </div>
                {(currentBid || soldPrice) && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">
                      {isSold ? "Sold:" : "Bid:"}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        isSold ? "text-green-500" : "text-yellow-500"
                      }`}
                    >
                      {formatPrice(soldPrice || currentBid || 0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Large version for auction block
export function PlayerCardLarge({ player, currentBid }: PlayerCardProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <Card className="relative overflow-hidden border-2 border-primary shadow-2xl shadow-primary/30">
        {/* Category header */}
        <div
          className={`bg-gradient-to-r ${categoryColors[player.category]} p-3 text-center text-white`}
        >
          <Badge className="bg-white/20 text-white border-white/30">
            {player.category} Player
          </Badge>
        </div>

        <CardContent className="p-6 text-center">
          {/* Avatar */}
          <div className="relative inline-block mb-4">
            <Avatar className="h-32 w-32 border-4 border-muted">
              <AvatarImage src={player.photo_url} alt={player.name} />
              <AvatarFallback className="bg-primary/10 text-4xl">
                <User className="h-16 w-16" />
              </AvatarFallback>
            </Avatar>
            {player.is_overseas && (
              <div className="absolute -top-2 -right-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full flex items-center gap-1">
                <Flag className="h-3 w-3" />
                Overseas
              </div>
            )}
          </div>

          {/* Name */}
          <h2 className="text-2xl font-bold mb-1">{player.name}</h2>
          <p className="text-muted-foreground mb-4">{player.team_name}</p>

          {/* Role badge */}
          <Badge variant="secondary" className="text-base mb-4">
            {roleIcons[player.role]} {player.role}
          </Badge>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/50 rounded-xl">
            {player.stats.matches && (
              <div>
                <p className="text-2xl font-bold">{player.stats.matches}</p>
                <p className="text-xs text-muted-foreground">Matches</p>
              </div>
            )}
            {player.stats.runs !== undefined && (
              <div>
                <p className="text-2xl font-bold">{player.stats.runs}</p>
                <p className="text-xs text-muted-foreground">Runs</p>
              </div>
            )}
            {player.stats.wickets !== undefined && (
              <div>
                <p className="text-2xl font-bold">{player.stats.wickets}</p>
                <p className="text-xs text-muted-foreground">Wickets</p>
              </div>
            )}
            {player.stats.average !== undefined && (
              <div>
                <p className="text-2xl font-bold">{player.stats.average?.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Average</p>
              </div>
            )}
            {player.stats.strike_rate !== undefined && (
              <div>
                <p className="text-2xl font-bold">{player.stats.strike_rate?.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">SR</p>
              </div>
            )}
            {player.stats.economy !== undefined && (
              <div>
                <p className="text-2xl font-bold">{player.stats.economy?.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Economy</p>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="flex items-center justify-center gap-8">
            <div>
              <p className="text-sm text-muted-foreground">Base Price</p>
              <p className="text-xl font-bold text-primary">
                {formatPrice(player.base_price)}
              </p>
            </div>
            {currentBid && (
              <div>
                <p className="text-sm text-muted-foreground">Current Bid</p>
                <motion.p
                  key={currentBid}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-bold text-yellow-500"
                >
                  {formatPrice(currentBid)}
                </motion.p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
