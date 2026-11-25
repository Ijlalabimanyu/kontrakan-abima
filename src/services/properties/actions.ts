"use server";

import { PropertyFormValues } from "@/services/properties/property.interface";
import {
  createProperty,
  deleteProperty,
  updateProperty,
} from "@/services/properties/property.service";
import { revalidatePath } from "next/cache";

export interface PropertyActionResult {
  success: boolean;
  message: string;
}

export async function createPropertyAction(
  values: PropertyFormValues,
): Promise<PropertyActionResult> {
  try {
    await createProperty(values);
    revalidatePath("/properties");

    return {
      success: true,
      message: "Properti berhasil ditambahkan.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal menambahkan properti.",
    };
  }
}

export async function updatePropertyAction(
  id: string,
  values: PropertyFormValues,
): Promise<PropertyActionResult> {
  try {
    await updateProperty(id, values);
    revalidatePath("/properties");

    return {
      success: true,
      message: "Properti berhasil diperbarui.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal memperbarui properti.",
    };
  }
}

export async function deletePropertyAction(
  id: string,
): Promise<PropertyActionResult> {
  try {
    await deleteProperty(id);
    revalidatePath("/properties");

    return {
      success: true,
      message: "Properti berhasil dihapus.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal menghapus properti.",
    };
  }
}
