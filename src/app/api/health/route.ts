import { healthController } from "@/server/controllers/health.controller";
import { withErrorHandler } from "@/server/errors/error-handler";

export const GET = withErrorHandler(healthController.check);
