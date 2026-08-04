import { Request } from "express";
import { AuthSession, AuthUser } from "./auth.types.ts";

export interface IAuthService {
  getSession(req: Request): Promise<{
    user: AuthUser;
    session: AuthSession;
  } | null>;
  getAuthHandler(): (req: Request, res: unknown) => Promise<Response>;
}
