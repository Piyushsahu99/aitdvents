import { motion } from "framer-motion";
import { Shield, Users, GraduationCap } from "lucide-react";

interface RoleSelectorProps {
  selectedRole: "student" | "team" | "admin";
  onRoleChange: (role: "student" | "team" | "admin") => void;
}

const roles = [
  {
    id: "student" as const,
    label: "Student",
    icon: GraduationCap,
    description: "Regular platform user",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "team" as const,
    label: "Team Member",
    icon: Users,
    description: "Platform moderator",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "admin" as const,
    label: "Admin",
    icon: Shield,
    description: "Full access",
    color: "from-orange-500 to-amber-500",
  },
];

export function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2 p-1 bg-muted/50 rounded-xl">
      {roles.map((role) => (
        <button
          key={role.id}
          type="button"
          onClick={() => onRoleChange(role.id)}
          className={`relative flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-all ${
            selectedRole === role.id
              ? "bg-background shadow-md"
              : "hover:bg-background/50"
          }`}
        >
          {selectedRole === role.id && (
            <motion.div
              layoutId="role-indicator"
              className={`absolute inset-0 rounded-lg bg-gradient-to-br ${role.color} opacity-10`}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <role.icon className={`h-5 w-5 ${
            selectedRole === role.id ? "text-primary" : "text-muted-foreground"
          }`} />
          <span className={`text-xs font-medium ${
            selectedRole === role.id ? "text-foreground" : "text-muted-foreground"
          }`}>
            {role.label}
          </span>
        </button>
      ))}
    </div>
  );
}