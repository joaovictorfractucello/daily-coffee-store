import { addressController } from "@/server/controllers/address.controller";
import { withErrorHandler } from "@/server/errors/error-handler";
import { withAuth } from "@/server/middlewares/with-auth";

export const PATCH = withErrorHandler(withAuth(addressController.update));
export const DELETE = withErrorHandler(withAuth(addressController.remove));
