import { Request, Response, NextFunction } from 'express';

export const auditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // In a real app, we would extract this from JWT or Headers
  // For MVP/No-Auth, we use defaults or headers if provided
  
  const userId = req.headers['x-user-id'] as string || 'system';
  const workstationId = req.headers['x-workstation-id'] as string || 'system';

  // Attach to request object (needs type extension or just use as existing property loose typing for now)
  (req as any).auditContext = {
    userId,
    workstationId
  };

  next();
};
