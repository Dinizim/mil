"use server";

import { revalidatePath } from "next/cache";
import { createCategory, deleteCategory } from "@/services/category.services";

export async function createCategoryAction(
  name: string,
  type: "income" | "expense"
) {
  const category = await createCategory(name, type);

  revalidatePath("/categories");

  return category;
}

export async function deleteCategoryAction(id: string) {
  await deleteCategory(id);

  revalidatePath("/categories");
}