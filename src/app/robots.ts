import type { MetadataRoute } from "next";
import { isProductionDeployment } from "@/server/lib/deployment";

export default function robots(): MetadataRoute.Robots {
  if (!isProductionDeployment) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return { rules: { userAgent: "*", allow: "/", disallow: "/api/" } };
}
