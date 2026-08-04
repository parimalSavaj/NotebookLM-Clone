import { betterAuth } from "better-auth";
import { Request } from "express";
import { toNodeHandler } from "better-auth/node";
import { Pool } from "pg";
import { config } from "../../config/index.ts";
import { IAuthService } from "./auth.service.interface.ts";
import { AuthSession, AuthUser } from "./auth.types.ts";

export class AuthService implements IAuthService {
  private static instance: AuthService | null = null;
  private auth;
  private handler;

  private constructor() {
    this.auth = betterAuth({
      database: new Pool({
        connectionString: config.databaseUrl,
      }),
      secret: config.betterAuthSecret,
      baseURL: config.betterAuthUrl,
      trustedOrigins: [config.clientUrl],
      emailAndPassword: {
        enabled: false,
      },
      socialProviders: {
        google: {
          clientId: config.googleClientId,
          clientSecret: config.googleClientSecret,
        },
      },
    });

    this.handler = toNodeHandler(this.auth);
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async getSession(
    req: Request
  ): Promise<{ user: AuthUser; session: AuthSession } | null> {
    const session = await this.auth.api.getSession({
      headers: req.headers as unknown as Headers,
    });

    if (!session) {
      return null;
    }

    return session as { user: AuthUser; session: AuthSession };
  }

  getAuthHandler(): (req: Request, res: unknown) => Promise<Response> {
    return this.handler as unknown as (
      req: Request,
      res: unknown
    ) => Promise<Response>;
  }
}
