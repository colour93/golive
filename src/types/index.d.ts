import { Express } from 'express';

declare module "express-session" {
  interface SessionData {
    username: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      file: {
        buffer: Buffer;
        originalname: string;
      };
    }
  }
}