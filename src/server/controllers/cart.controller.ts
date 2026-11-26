import "server-only";
import { presentCartQuote } from "@/server/presenters/cart.presenter";
import { cartService } from "@/server/services/cart.service";
import { cartQuoteSchema } from "@/server/validators/cart.validator";
import { parseInput } from "@/server/validators/parse-input";
import { readJsonBody } from "./read-json-body";

export const cartController = {
  async quote(request: Request): Promise<Response> {
    const { items } = parseInput(cartQuoteSchema, await readJsonBody(request));
    const quote = await cartService.quote(items);
    return Response.json(presentCartQuote(quote));
  },
};
