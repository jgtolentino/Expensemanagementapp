// lib/logger.ts
// Structured logger for TBWA Agency Databank
// Follows Odoo-style logging with correlation IDs and tenant context

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  correlationId?: string;
  requestId?: string;
  tenantId?: string;
  workspaceId?: string;
  userId?: string;
  userEmail?: string;
  app?: string; // Which app: ratecard, te, gearroom, ppm, procure, creative, wiki, bi
  action?: string;
  duration?: number;
  [key: string]: unknown;
}

interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  correlation_id?: string;
  tenant_id?: string;
  workspace_id?: string;
  user_id?: string;
  user_email?: string;
  app?: string;
  action?: string;
  duration_ms?: number;
  meta?: Record<string, unknown>;
}

function baseLog(level: LogLevel, message: string, ctx: LogContext = {}) {
  const payload: LogPayload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    correlation_id: ctx.correlationId ?? ctx.requestId,
    tenant_id: ctx.tenantId,
    workspace_id: ctx.workspaceId,
    user_id: ctx.userId,
    user_email: ctx.userEmail,
    app: ctx.app,
    action: ctx.action,
    duration_ms: ctx.duration,
    // keep extra keys but avoid nesting confusion
    meta: Object.fromEntries(
      Object.entries(ctx).filter(
        ([k]) =>
          ![
            'correlationId',
            'requestId',
            'tenantId',
            'workspaceId',
            'userId',
            'userEmail',
            'app',
            'action',
            'duration',
          ].includes(k),
      ),
    ),
  };

  // stdout is fine – Supabase / DigitalOcean will capture and route this
  // In production, this goes to structured logging service
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(payload));
}

export const logger = {
  debug: (msg: string, ctx?: LogContext) => baseLog('debug', msg, ctx),
  info: (msg: string, ctx?: LogContext) => baseLog('info', msg, ctx),
  warn: (msg: string, ctx?: LogContext) => baseLog('warn', msg, ctx),
  error: (msg: string, ctx?: LogContext) => baseLog('error', msg, ctx),

  // Convenience methods for common patterns
  apiRequest: (endpoint: string, method: string, ctx?: LogContext) =>
    baseLog('info', `API request: ${method} ${endpoint}`, {
      ...ctx,
      action: 'api_request',
      endpoint,
      method,
    }),

  apiResponse: (endpoint: string, statusCode: number, duration: number, ctx?: LogContext) =>
    baseLog('info', `API response: ${endpoint} ${statusCode}`, {
      ...ctx,
      action: 'api_response',
      endpoint,
      statusCode,
      duration,
    }),

  dbQuery: (query: string, duration: number, ctx?: LogContext) =>
    baseLog('debug', `DB query: ${query.substring(0, 100)}...`, {
      ...ctx,
      action: 'db_query',
      duration,
    }),

  workflowStart: (workflow: string, ctx?: LogContext) =>
    baseLog('info', `Workflow started: ${workflow}`, {
      ...ctx,
      action: 'workflow_start',
      workflow,
    }),

  workflowComplete: (workflow: string, duration: number, ctx?: LogContext) =>
    baseLog('info', `Workflow completed: ${workflow}`, {
      ...ctx,
      action: 'workflow_complete',
      workflow,
      duration,
    }),

  workflowError: (workflow: string, error: Error, ctx?: LogContext) =>
    baseLog('error', `Workflow failed: ${workflow}`, {
      ...ctx,
      action: 'workflow_error',
      workflow,
      error: error.message,
      stack: error.stack,
    }),

  // Odoo-style audit logging
  audit: (
    model: string,
    operation: 'create' | 'update' | 'delete' | 'approve' | 'reject',
    recordId: string,
    ctx?: LogContext,
  ) =>
    baseLog('info', `Audit: ${operation} ${model} ${recordId}`, {
      ...ctx,
      action: 'audit',
      model,
      operation,
      recordId,
    }),
};

// Performance timing helper
export class PerformanceTimer {
  private startTime: number;
  private ctx: LogContext;

  constructor(ctx: LogContext = {}) {
    this.startTime = Date.now();
    this.ctx = ctx;
  }

  end(message: string) {
    const duration = Date.now() - this.startTime;
    logger.info(message, { ...this.ctx, duration });
    return duration;
  }

  endWithThreshold(message: string, thresholdMs: number) {
    const duration = Date.now() - this.startTime;
    if (duration > thresholdMs) {
      logger.warn(`${message} (exceeded threshold)`, {
        ...this.ctx,
        duration,
        threshold: thresholdMs,
      });
    } else {
      logger.info(message, { ...this.ctx, duration });
    }
    return duration;
  }
}

// Context builder helper
export function createLogContext(
  req?: any, // Next.js request or similar
  additionalContext?: Partial<LogContext>,
): LogContext {
  return {
    correlationId:
      req?.headers?.['x-correlation-id'] ||
      req?.headers?.['x-request-id'] ||
      `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    tenantId: req?.headers?.['x-tenant-id'] || req?.user?.tenantId,
    workspaceId: req?.headers?.['x-workspace-id'] || req?.user?.workspaceId,
    userId: req?.user?.id,
    userEmail: req?.user?.email,
    ...additionalContext,
  };
}
