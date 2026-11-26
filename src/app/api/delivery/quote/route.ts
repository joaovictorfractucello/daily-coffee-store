import { deliveryController } from "@/server/controllers/delivery.controller";
import { withErrorHandler } from "@/server/errors/error-handler";
import { withRateLimit } from "@/server/middlewares/with-rate-limit";

export const GET = withErrorHandler(
  withRateLimit("cepLookupPerIp", deliveryController.quote),
);
