import { authController } from "@/server/controllers/auth.controller";
import { withErrorHandler } from "@/server/errors/error-handler";
import { withAuth } from "@/server/middlewares/with-auth";

export const GET = withErrorHandler(withAuth(authController.me));
