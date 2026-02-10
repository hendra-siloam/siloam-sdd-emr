import { Request, Response, NextFunction } from 'express';
import { AuditContext } from '../models/types';
import { AUDIT_CONTEXT_DEFAULTS } from '../config/constants';

/**
 * Audit Middleware
 * Extracts user and workstation information from request headers
 * and attaches to request for tracking changes
 */
export const auditMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // In production, extract from JWT or OAuth token
  // For MVP/No-Auth, use headers or defaults
  
  const userId = typeof req.headers['x-user-id'] === 'string' 
    ? req.headers['x-user-id'] 
    : AUDIT_CONTEXT_DEFAULTS.USER_ID;
    
  const workstationId = typeof req.headers['x-workstation-id'] === 'string' 
    ? req.headers['x-workstation-id'] 
    : AUDIT_CONTEXT_DEFAULTS.WORKSTATION_ID;

  const auditContext: AuditContext = {
    userId,
    workstationId,
  };

  req.auditContext = auditContext;
  next();
};
