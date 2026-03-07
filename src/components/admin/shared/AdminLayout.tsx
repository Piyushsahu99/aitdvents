import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  FileText,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Bell,
  Search,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hasPermission } from "@/utils/admin/adminPermissions";

interface AdminLayoutProps {
  children: React.ReactNode;
  userRoles: string[];
}

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    permission: "canViewDashboard" as const,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    permission: "canViewAnalytics" as const,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    permission: "canManageUsers" as const,
  },
  {
    name: "Content",
    href: "/admin/content",
    icon: FileText,
    permission: "canManageContent" as const,
  },
  {
    name: "CRM",
    href: "/admin/crm",
    icon: Briefcase,
    permission: "canManageCRM" as const,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    permission: "canViewSettings" as const,
  },
];

export function AdminLayout({ children, userRoles }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const filteredNavigation = navigation.filter((item) =>
    hasPermission(userRoles, item.permission)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-card border-r transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo and collapse button */}
        <div className="flex items-center justify-between p-4 border-b">
          {!isCollapsed && (
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">AITD Admin</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isCollapsed && "justify-center"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", isCollapsed ? "" : "mr-0")} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Back to main site */}
        <div className="p-3 border-t">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
              isCollapsed && "justify-center"
            )}
            title={isCollapsed ? "Back to Site" : undefined}
          >
            <Home className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Back to Site</span>}
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          "transition-all duration-300",
          isCollapsed ? "lg:ml-16" : "lg:ml-64"
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Search bar - placeholder */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-muted/50">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none text-sm w-64"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        AD
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium">Admin</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
