import "server-only";
import { z } from "zod";
import { addressInputSchema } from "@/lib/address-schemas";
import { presentAddress } from "@/server/presenters/address.presenter";
import { addressService } from "@/server/services/address.service";
import type { ValidSession } from "@/server/services/session.service";
import { parseInput } from "@/server/validators/parse-input";
import { readJsonBody } from "./read-json-body";

type AddressRouteContext = { params: Promise<{ id: string }> };

const addressIdSchema = z.cuid().max(40);

const readId = async ({ params }: AddressRouteContext) =>
  parseInput(addressIdSchema, (await params).id);

const noStore = { "Cache-Control": "private, no-store" };

export const addressController = {
  async list(
    _request: Request,
    _context: unknown,
    { user }: ValidSession,
  ): Promise<Response> {
    const addresses = await addressService.list(user.id);
    return Response.json(
      { addresses: addresses.map(presentAddress) },
      { headers: noStore },
    );
  },

  async create(
    request: Request,
    _context: unknown,
    { user }: ValidSession,
  ): Promise<Response> {
    const input = parseInput(addressInputSchema, await readJsonBody(request));
    const address = await addressService.create(user.id, input);
    return Response.json(
      { address: presentAddress(address) },
      { status: 201, headers: noStore },
    );
  },

  async update(
    request: Request,
    context: AddressRouteContext,
    { user }: ValidSession,
  ): Promise<Response> {
    const id = await readId(context);
    const input = parseInput(addressInputSchema, await readJsonBody(request));
    const address = await addressService.update(user.id, id, input);
    return Response.json(
      { address: presentAddress(address) },
      { headers: noStore },
    );
  },

  async setDefault(
    _request: Request,
    context: AddressRouteContext,
    { user }: ValidSession,
  ): Promise<Response> {
    const address = await addressService.setDefault(
      user.id,
      await readId(context),
    );
    return Response.json(
      { address: presentAddress(address) },
      { headers: noStore },
    );
  },

  async remove(
    _request: Request,
    context: AddressRouteContext,
    { user }: ValidSession,
  ): Promise<Response> {
    await addressService.remove(user.id, await readId(context));
    return new Response(null, { status: 204 });
  },
};
