"use server";

import { revalidatePath } from "next/cache";
import { createCategory, softDeleteCategory } from "@/services/category.services";

export async function createCategoryAction(name: string, type: "income" | "expense") {
  if (typeof name !== "string") throw new Error("Informe o nome da categoria.");
  if (typeof type !== "string") throw new Error("Tipo de categoria inválido.");

  const category = await createCategory(name, type);
  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return category;
}

export async function deleteCategoryAction(id: string) {
  if (typeof id !== "string" || !id) throw new Error("Categoria inválida.");

  await softDeleteCategory(id);
  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}
