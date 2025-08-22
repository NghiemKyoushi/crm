export interface Role {
  role_id: number;
  role_name: string;
  description: string;
  permissions: string[];
  is_active: boolean;
  user_count: number | null;
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
