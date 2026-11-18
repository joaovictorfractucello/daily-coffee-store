import "server-only";
import { ValidationError } from "@/server/errors/validation.error";
import { presentCartQuote } from "@/server/presenters/cart.presenter";
import { cartService } from "@/server/services/cart.service";
import { cartQuoteSchema } from "@/server/validators/cart.validator";
import { parseInput } from "@/server/validators/parse-input";

async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ValidationError();
  }
}

export const cartController = {
  async quote(request: Request): Promise<Response> {
    const { items } = parseInput(cartQuoteSchema, await readJsonBody(request));
    const quote = await cartService.quote(items);
    return Response.json(presentCartQuote(quote));
  },
};
