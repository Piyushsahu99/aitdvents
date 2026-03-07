export type AdminRole = "admin" | "core_team" | "moderator" | "user";

export interface Permissions {
  canViewDashboard: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
  canEditUserRoles: boolean;
  canDeleteUsers: boolean;
  canManageContent: boolean;
  canApproveContent: boolean;
  canDeleteContent: boolean;
  canManageCRM: boolean;
  canManageTasks: boolean;
  canManageTeam: boolean;
  canViewSettings: boolean;
  canEditSettings: boolean;
  canViewLogs: boolean;
  canManageStore: boolean;
  canManagePoints: boolean;
}

const ROLE_PERMISSIONS: Record<AdminRole, Permissions> = {
  admin: {
    canViewDashboard: true,
    canViewAnalytics: true,
    canManageUsers: true,
    canEditUserRoles: true,
    canDeleteUsers: true,
    canManageContent: true,
    canApproveContent: true,
    canDeleteContent: true,
    canManageCRM: true,
    canManageTasks: true,
    canManageTeam: true,
    canViewSettings: true,
    canEditSettings: true,
    canViewLogs: true,
    canManageStore: true,
    canManagePoints: true,
  },
  core_team: {
    canViewDashboard: true,
    canViewAnalytics: true,
    canManageUsers: true,
    canEditUserRoles: false,
    canDeleteUsers: false,
    canManageContent: true,
    canApproveContent: true,
    canDeleteContent: false,
    canManageCRM: true,
    canManageTasks: true,
    canManageTeam: true,
    canViewSettings: true,
    canEditSettings: false,
    canViewLogs: true,
    canManageStore: true,
    canManagePoints: false,
  },
  moderator: {
    canViewDashboard: true,
    canViewAnalytics: false,
    canManageUsers: false,
    canEditUserRoles: false,
    canDeleteUsers: false,
    canManageContent: true,
    canApproveContent: true,
    canDeleteContent: false,
    canManageCRM: false,
    canManageTasks: false,
    canManageTeam: false,
    canViewSettings: false,
    canEditSettings: false,
    canViewLogs: false,
    canManageStore: false,
    canManagePoints: false,
  },
  user: {
    canViewDashboard: false,
    canViewAnalytics: false,
    canManageUsers: false,
    canEditUserRoles: false,
    canDeleteUsers: false,
    canManageContent: false,
    canApproveContent: false,
    canDeleteContent: false,
    canManageCRM: false,
    canManageTasks: false,
    canManageTeam: false,
    canViewSettings: false,
    canEditSettings: false,
    canViewLogs: false,
    canManageStore: false,
    canManagePoints: false,
  },
};

export function getPermissions(roles: string[]): Permissions {
  // Admin has all permissions
  if (roles.includes("admin")) {
    return ROLE_PERMISSIONS.admin;
  }
  
  // Core team has most permissions
  if (roles.includes("core_team")) {
    return ROLE_PERMISSIONS.core_team;
  }
  
  // Moderator has content management permissions
  if (roles.includes("moderator")) {
    return ROLE_PERMISSIONS.moderator;
  }
  
  // Default user has no admin permissions
  return ROLE_PERMISSIONS.user;
}

export function hasPermission(
  roles: string[],
  permission: keyof Permissions
): boolean {
  const permissions = getPermissions(roles);
  return permissions[permission];
}

export function canAccessRoute(roles: string[], route: string): boolean {
  const permissions = getPermissions(roles);
  
  const routePermissions: Record<string, keyof Permissions> = {
    "/admin/dashboard": "canViewDashboard",
    "/admin/analytics": "canViewAnalytics",
    "/admin/users": "canManageUsers",
    "/admin/content": "canManageContent",
    "/admin/crm": "canManageCRM",
    "/admin/settings": "canViewSettings",
  };
  
  const requiredPermission = routePermissions[route];
  if (!requiredPermission) return false;
  
  return permissions[requiredPermission];
}
