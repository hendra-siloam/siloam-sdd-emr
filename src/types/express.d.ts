/**
 * Type extensions for Express Request
 */
import { AuditContext } from './types';

declare global {
  namespace Express {
    interface Request {
      auditContext?: AuditContext;
    }
  }
}
