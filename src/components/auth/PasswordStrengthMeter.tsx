import { useMemo } from "react";
import { Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PasswordStrengthMeterProps {
  password: string;
  showRequirements?: boolean;
}

interface Requirement {
  label: string;
  met: boolean;
}

export function PasswordStrengthMeter({ password, showRequirements = true }: PasswordStrengthMeterProps) {
  const requirements: Requirement[] = useMemo(() => [
    { label: "At least 6 characters", met: password.length >= 6 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains number", met: /[0-9]/.test(password) },
    { label: "Contains special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ], [password]);

  const strength = useMemo(() => {
    const metCount = requirements.filter(r => r.met).length;
    if (metCount === 0) return { level: 0, label: "", color: "" };
    if (metCount <= 2) return { level: 1, label: "Weak", color: "bg-destructive" };
    if (metCount <= 3) return { level: 2, label: "Fair", color: "bg-orange-500" };
    if (metCount <= 4) return { level: 3, label: "Good", color: "bg-yellow-500" };
    return { level: 4, label: "Strong", color: "bg-green-500" };
  }, [requirements]);

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2">
      {/* Strength Bar */}
      <div className="space-y-1.5">
        <div className="flex gap-1 h-1.5">
          {[1, 2, 3, 4].map((level) => (
            <motion.div
              key={level}
              className={`flex-1 rounded-full transition-colors ${
                strength.level >= level ? strength.color : "bg-muted"
              }`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: level * 0.05 }}
            />
          ))}
        </div>
        {strength.label && (
          <p className={`text-xs font-medium ${
            strength.level <= 1 ? "text-destructive" :
            strength.level === 2 ? "text-orange-500" :
            strength.level === 3 ? "text-yellow-600" :
            "text-green-600"
          }`}>
            {strength.label} password
          </p>
        )}
      </div>

      {/* Requirements Checklist */}
      <AnimatePresence>
        {showRequirements && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-1.5"
          >
            {requirements.map((req, index) => (
              <motion.div
                key={req.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-1.5 text-xs ${
                  req.met ? "text-green-600" : "text-muted-foreground"
                }`}
              >
                {req.met ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <X className="h-3 w-3" />
                )}
                <span>{req.label}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}