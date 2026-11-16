import "server-only";
import { z } from "zod";
import { ProductCategory } from "@/generated/prisma/enums";

const booleanFlag = z
  .enum(["true", "false"])
  .transform((flag) => flag === "true");

export const productListQuerySchema = z.object({
  category: z.enum(ProductCategory).optional(),
  featured: booleanFlag.optional(),
  q: z.string().trim().max(60).optional(),
});

export const productSearchTermSchema = z.string().trim().min(1).max(60);

export const productSlugSchema = z
  .string()
  .max(120)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
