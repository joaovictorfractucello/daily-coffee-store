import "server-only";
import { connection as waitForIncomingRequest } from "next/server";
import { healthService } from "@/server/services/health.service";

export const healthController = {
  async check(): Promise<Response> {
    await waitForIncomingRequest();

    const health = await healthService.check();
    const httpStatus = health.status === "ok" ? 200 : 503;
    return Response.json(health, { status: httpStatus });
  },
};
