import "server-only";
import type { z } from "zod";
import { ValidationError } from "@/server/errors/validation.error";

export function parseInput<Schema extends z.ZodType>(
  schema: Schema,
  input: unknown,
): z.output<Schema> {
  const result = schema.safeParse(input);
  if (!result.success) throw new ValidationError();
  return result.data;
}
