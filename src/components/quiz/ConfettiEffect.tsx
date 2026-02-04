import { useEffect } from "react";
import confetti from "canvas-confetti";

interface ConfettiEffectProps {
  trigger: boolean;
  type?: "success" | "celebration" | "fireworks" | "playerJoined" | "spinWin" | "jackpot" | "luckyDraw" | "auctionSold";
}

export function ConfettiEffect({ trigger, type = "success" }: ConfettiEffectProps) {
  useEffect(() => {
    if (!trigger) return;

    const duration = 3000;
    const animationEnd = Date.now() + duration;

    if (type === "playerJoined") {
      // Quick burst for new player joining
      confetti({
        particleCount: 30,
        spread: 50,
        startVelocity: 20,
        origin: { x: 0.5, y: 0.3 },
        colors: ["#F97316", "#FBBF24", "#22C55E"],
        gravity: 1.5,
        scalar: 0.8,
      });
      return;
    }

    if (type === "fireworks") {
      // Fireworks effect for big wins
      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          particleCount,
          startVelocity: 30,
          spread: 360,
          origin: {
            x: Math.random(),
            y: Math.random() - 0.2,
          },
          colors: ["#FFD700", "#FFA500", "#FF6B6B", "#4ECDC4", "#95E1D3"],
        });
      }, 250);

      return () => clearInterval(interval);
    } else if (type === "celebration") {
      // Big celebration effect for winners
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        colors: ["#FFD700", "#FFA500", "#FF6B6B", "#4ECDC4", "#95E1D3"],
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });

      fire(0.2, {
        spread: 60,
      });

      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    } else {
      // Simple success effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FFD700", "#FFA500", "#4ECDC4"],
      });
    }
  }, [trigger, type]);

  return null;
}

// Utility function to trigger confetti programmatically
export function fireConfetti(type: "success" | "celebration" | "fireworks" | "playerJoined" | "spinWin" | "jackpot" | "luckyDraw" | "auctionSold" = "success") {
  if (type === "playerJoined") {
    confetti({
      particleCount: 30,
      spread: 50,
      startVelocity: 20,
      origin: { x: 0.5, y: 0.3 },
      colors: ["#F97316", "#FBBF24", "#22C55E"],
      gravity: 1.5,
      scalar: 0.8,
    });
  } else if (type === "celebration") {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ["#FFD700", "#FFA500", "#FF6B6B", "#4ECDC4", "#95E1D3"],
    };

    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.25),
      spread: 26,
      startVelocity: 55,
    });

    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.35),
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
  } else {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#FFD700", "#FFA500", "#4ECDC4"],
    });
  }
}
