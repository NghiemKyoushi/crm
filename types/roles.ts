export interface Role {
  role_id: string;
  role_name: string;
  description: string;
  permissions: string[];
  is_active: boolean;
  user_count: number | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  groups: any;
}

export interface RoleResponse {
  data: Role[];
}

export type Permission = {
  permission: string;
  description: string;
  category: string;
  is_system: boolean;
};

export type PermissionGroup = {
  category: string;
  permissions: Permission[];
};

export interface RoleRequest {
    role_name: string;
    description: string;
    permissions: string[];
    is_active: boolean;
  }
