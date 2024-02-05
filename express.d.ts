import { Request } from "express";
export interface AuthenticatedRequest extends Request {
  user?: { userId: string }; // Adjust the properties according to your user object
  fullname?: string;
  // token?: {userToken: string}; // Adjust the properties according to your user object
  jwtSecret?: { secretKey: string };
  // newUserId?: { UserId: string}
  session: Session & Partial<SessionData> & { token?: string, userDetailFromDatabase: Record<string, any>};
}
