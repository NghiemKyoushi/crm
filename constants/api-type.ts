const AUTH_PREFIX = "users/v1/auth";

export const API_TYPE_CONST = {
  LOGIN: `${AUTH_PREFIX}/login`,
  LOGOUT: `${AUTH_PREFIX}/logout`,
  GENERATE_ACCESS_TOKEN: `${AUTH_PREFIX}/generate/access-token`,
} as const;