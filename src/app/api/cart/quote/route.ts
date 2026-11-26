import { cartController } from "@/server/controllers/cart.controller";
import { withErrorHandler } from "@/server/errors/error-handler";
import { withRateLimit } from "@/server/middlewares/with-rate-limit";

export const POST = withErrorHandler(
  withRateLimit("quotePerIp", cartController.quote),
);
