import { cartController } from "@/server/controllers/cart.controller";
import { withErrorHandler } from "@/server/errors/error-handler";

export const POST = withErrorHandler(cartController.quote);
