import "server-only";
import { env } from "@/env";

export const isProductionDeployment = env.VERCEL_ENV === "production";
