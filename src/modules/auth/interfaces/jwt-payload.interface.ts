export interface JwtPayload {
  sub: string; // User ID
  email: string; // User email
  roles?: string[]; // Optional roles
  wallet?: string; // Optional wallet address
}
