import "server-only";
import { connection as waitForIncomingRequest } from "next/server";
import { cepQuerySchema } from "@/lib/address-schemas";
import { presentDeliveryQuote } from "@/server/presenters/delivery.presenter";
import { deliveryService } from "@/server/services/delivery.service";
import { parseInput } from "@/server/validators/parse-input";

export const deliveryController = {
  async quote(request: Request): Promise<Response> {
    await waitForIncomingRequest();

    const query = Object.fromEntries(new URL(request.url).searchParams);
    const { cep } = parseInput(cepQuerySchema, query);
    const quote = await deliveryService.quoteByCep(cep);
    return Response.json(presentDeliveryQuote(quote));
  },
};
