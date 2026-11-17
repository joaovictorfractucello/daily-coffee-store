import { connection as waitForIncomingRequest } from "next/server";
import { productSearchTermSchema } from "@/server/validators/product.validator";
import { MenuCategories } from "./MenuCategories";
import { MenuSearchResults } from "./MenuSearchResults";
import { MenuShell } from "./MenuShell";

type MenuSearchParams = Promise<{ q?: string | string[] }>;

export async function MenuContent({
  searchParams,
}: {
  searchParams: MenuSearchParams;
}) {
  await waitForIncomingRequest();
  const { q } = await searchParams;
  const term = productSearchTermSchema.safeParse(Array.isArray(q) ? q[0] : q);

  return (
    <MenuShell>
      {term.success ? (
        <MenuSearchResults term={term.data} />
      ) : (
        <MenuCategories />
      )}
    </MenuShell>
  );
}
