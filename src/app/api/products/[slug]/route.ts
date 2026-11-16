import { productController } from "@/server/controllers/product.controller";
import { withErrorHandler } from "@/server/errors/error-handler";

export const GET = withErrorHandler(productController.getBySlug);
