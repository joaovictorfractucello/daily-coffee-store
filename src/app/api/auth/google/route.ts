import { googleSignInFailedPath } from "@/lib/links";
import { authController } from "@/server/controllers/auth.controller";
import { withRedirectOnError } from "@/server/middlewares/with-redirect-on-error";

export const GET = withRedirectOnError(authController.googleStart, {
  redirectTo: googleSignInFailedPath,
  failureEvent: "google_login_failure",
});
