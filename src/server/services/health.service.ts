import "server-only";
import { healthRepository } from "@/server/repositories/health.repository";

export type HealthStatus = { status: "ok" | "error" };

export const healthService = {
  async check(): Promise<HealthStatus> {
    try {
      await healthRepository.ping();
      return { status: "ok" };
    } catch (error) {
      console.error("Health check: falha ao consultar o banco", error);
      return { status: "error" };
    }
  },
};
