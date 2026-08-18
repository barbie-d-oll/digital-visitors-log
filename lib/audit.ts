import { connectToDB } from "@/lib/db/mongoose";
import AuditLog from "@/lib/models/audit-log.model";

interface LogEventParams {
  action: string;
  entity: string;
  entityId?: string;
  userId?: string;
  userName?: string;
  organizationId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Records an audit log event. Non-blocking — fire and forget.
 */
export async function logEvent(params: LogEventParams): Promise<void> {
  try {
    await connectToDB();
    await AuditLog.create(params);
  } catch (error) {
    console.error("Audit log error:", error);
  }
}
