export interface AdminJwtPayload {
  sub: string;
  email: string;
  isSuperAdmin: boolean;
  iat?: number;
  exp?: number;
}
