import { authController } from "@/server/controllers/auth.controller";
import { withErrorHandler } from "@/server/errors/error-handler";

export const POST = withErrorHandler(authController.forgotPassword);
