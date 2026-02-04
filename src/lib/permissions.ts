export enum Permission {
  // User management
  USERS_READ = 'users:read',
  USERS_WRITE = 'users:write',

  // API key management
  API_KEYS_READ = 'api_keys:read',
  API_KEYS_WRITE = 'api_keys:write',

  // Admin (wildcard - grants all permissions)
  ADMIN = 'admin:*',
}

export function hasPermission(userPermissions: string[], requiredPermission: Permission): boolean {
  // Admin wildcard grants all permissions
  if (userPermissions.includes(Permission.ADMIN)) {
    return true;
  }

  // Check for exact permission match
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  // Check for category wildcard (e.g., 'users:*' grants 'users:read' and 'users:write')
  const [category] = requiredPermission.split(':');
  if (userPermissions.includes(`${category}:*`)) {
    return true;
  }

  return false;
}

export function hasAnyPermission(userPermissions: string[], requiredPermissions: Permission[]): boolean {
  return requiredPermissions.some((permission) => hasPermission(userPermissions, permission));
}

export function hasAllPermissions(userPermissions: string[], requiredPermissions: Permission[]): boolean {
  return requiredPermissions.every((permission) => hasPermission(userPermissions, permission));
}

export function isAdmin(userPermissions: string[]): boolean {
  return userPermissions.includes(Permission.ADMIN);
}

// Default permissions for roles
export const ROLE_PERMISSIONS = {
  admin: [Permission.ADMIN],
  user: [Permission.API_KEYS_READ, Permission.API_KEYS_WRITE],
} as const;
