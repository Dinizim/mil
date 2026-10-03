"use server";

import { runAction } from "@/lib/action-result";
import { revalidateApp } from "@/lib/revalidate";
import { createCategory, softDeleteCategory } from "@/services/category.services";

export async function createCategoryAction(name: string, type: "income" | "expense") {
  return runAction("Não foi possível criar a categoria.", async () => {
    const category = await createCategory(name, type);
    revalidateApp();
    return category;
  });
}

export async function deleteCategoryAction(id: string) {
  return runAction("Não foi possível excluir a categoria.", async () => {
    await softDeleteCategory(String(id));
    revalidateApp();
  });
}
