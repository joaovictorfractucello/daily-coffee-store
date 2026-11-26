import { authController } from "@/server/controllers/auth.controller";
import { withErrorHandler } from "@/server/errors/error-handler";
import { withAuth } from "@/server/middlewares/with-auth";

export const POST = withErrorHandler(withAuth(authController.changePassword));
