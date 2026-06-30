declare namespace Express {
  export interface Request {
    xDomain: string;
    user?: {
      id: string;
      email: string;
      roles: string[];
    };
  }
}
