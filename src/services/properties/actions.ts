"use server";

import { PropertyFormValues } from "@/services/properties/interface";
import {
  createProperty,
  deleteProperty,
  updateProperty,
} from "@/services/properties/service";
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
    // Foreign Key: properti masih memiliki kamar.
    if (
      error !== null &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23503" &&
      "constraint" in error &&
      error.constraint === "rooms_property_id_fkey"
    ) {
      return {
        success: false,
        message:
          "Properti ini masih memiliki kamar yang terdaftar. Hapus data kamar terlebih dahulu sebelum menghapus properti.",
      };
    }

    return {
      success: false,
      message: "Gagal menghapus properti. Silakan coba kembali.",
    };
  }
}
