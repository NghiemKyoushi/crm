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
