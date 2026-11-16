import "server-only";
import { connection as waitForIncomingRequest } from "next/server";
import { presentProduct } from "@/server/presenters/product.presenter";
import { productService } from "@/server/services/product.service";
import { parseInput } from "@/server/validators/parse-input";
import {
  productListQuerySchema,
  productSlugSchema,
} from "@/server/validators/product.validator";

type ProductRouteContext = { params: Promise<{ slug: string }> };

export const productController = {
  async list(request: Request): Promise<Response> {
    await waitForIncomingRequest();

    const query = Object.fromEntries(new URL(request.url).searchParams);
    const { q, ...filters } = parseInput(productListQuerySchema, query);
    const products = await productService.list({ ...filters, search: q });
    return Response.json(products.map(presentProduct));
  },

  async getBySlug(
    _request: Request,
    { params }: ProductRouteContext,
  ): Promise<Response> {
    await waitForIncomingRequest();

    const slug = parseInput(productSlugSchema, (await params).slug);
    const product = await productService.getBySlug(slug);
    return Response.json(presentProduct(product));
  },
};
