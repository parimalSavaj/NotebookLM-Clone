import { Request, Response, NextFunction } from "express";
import { IAuthService } from "../services/auth/auth.service.interface.ts";
import { AuthUser } from "../services/auth/auth.types.ts";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export class AuthMiddleware {
  constructor(private readonly authService: IAuthService) {}

  authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const session = await this.authService.getSession(req);

    if (!session) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    req.user = session.user;
    next();
  };
}
