import "server-only";

import { revalidatePath } from "next/cache";

/** Saldo, metas e listas aparecem em várias telas: atualiza todas de uma vez. */
export function revalidateApp() {
  revalidatePath("/", "layout");
}
