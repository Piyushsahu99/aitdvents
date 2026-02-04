import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface WheelSegment {
  id: string;
  label: string;
  color: string;
  prize_value: number;
  prize_type: string;
  is_jackpot: boolean;
}

interface SpinWheelCanvasProps {
  segments: WheelSegment[];
  isSpinning: boolean;
  targetSegmentIndex: number | null;
  onSpinComplete: () => void;
}

export function SpinWheelCanvas({
  segments,
  isSpinning,
  targetSegmentIndex,
  onSpinComplete,
}: SpinWheelCanvasProps) {
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wheelSize = 320;

  // Draw the wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = wheelSize / 2;
    const centerY = wheelSize / 2;
    const radius = wheelSize / 2 - 10;
    const segmentAngle = (2 * Math.PI) / segments.length;

    // Clear canvas
    ctx.clearRect(0, 0, wheelSize, wheelSize);

    // Draw segments
    segments.forEach((segment, index) => {
      const startAngle = index * segmentAngle - Math.PI / 2;
      const endAngle = startAngle + segmentAngle;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segment.color;
      ctx.fill();

      // Draw border
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw jackpot glow
      if (segment.is_jackpot) {
        ctx.shadowColor = "#FFD700";
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px sans-serif";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 2;
      
      const text = segment.label.length > 10 
        ? segment.label.substring(0, 10) + "..." 
        : segment.label;
      ctx.fillText(text, radius - 15, 4);
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
    ctx.fillStyle = "#1a1a2e";
    ctx.fill();
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw center text
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SPIN", centerX, centerY);
  }, [segments]);

  // Handle spin animation
  useEffect(() => {
    if (!isSpinning || targetSegmentIndex === null) return;

    const segmentAngle = 360 / segments.length;
    // Calculate target rotation: multiple full rotations + target segment
    // We add an offset to land in the middle of the segment
    const targetAngle = 360 - (targetSegmentIndex * segmentAngle + segmentAngle / 2);
    const fullRotations = 5 * 360; // 5 full rotations
    const finalRotation = rotation + fullRotations + targetAngle - (rotation % 360);

    setRotation(finalRotation);
  }, [isSpinning, targetSegmentIndex]);

  return (
    <div className="relative">
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-2 shadow-2xl shadow-orange-500/30">
        <div className="w-full h-full rounded-full bg-background/95 flex items-center justify-center p-2">
          {/* Wheel */}
          <motion.div
            animate={{ rotate: rotation }}
            transition={{
              duration: isSpinning ? 5 : 0,
              ease: [0.17, 0.67, 0.12, 0.99], // Custom easing for realistic spin
            }}
            onAnimationComplete={() => {
              if (isSpinning) {
                onSpinComplete();
              }
            }}
            className="relative"
          >
            <canvas
              ref={canvasRef}
              width={wheelSize}
              height={wheelSize}
              className="rounded-full"
            />
          </motion.div>
        </div>
      </div>

      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
        <div className="relative">
          <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-yellow-400 drop-shadow-lg" />
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full"
            animate={{ scale: isSpinning ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.3, repeat: isSpinning ? Infinity : 0 }}
          />
        </div>
      </div>

      {/* Decorative lights */}
      <div className="absolute inset-0 rounded-full pointer-events-none">
        {Array.from({ length: 16 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-yellow-400"
            style={{
              left: `${50 + 48 * Math.cos((i * 2 * Math.PI) / 16)}%`,
              top: `${50 + 48 * Math.sin((i * 2 * Math.PI) / 16)}%`,
              transform: "translate(-50%, -50%)",
            }}
            animate={{
              opacity: isSpinning ? [0.3, 1, 0.3] : 0.7,
              scale: isSpinning ? [0.8, 1.2, 0.8] : 1,
            }}
            transition={{
              duration: 0.5,
              repeat: isSpinning ? Infinity : 0,
              delay: i * 0.03,
            }}
          />
        ))}
      </div>
    </div>
  );
}
