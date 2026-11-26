import { createClient } from "@/lib/supabase/server";
import { PropertyModel, PropertyFormValues } from "./interface";

export async function getProperties(): Promise<PropertyModel[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []) as PropertyModel[];
}

export async function createProperty(
  values: PropertyFormValues,
): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("properties").insert({
    owner_id: user.id,
    name: values.name.trim(),
    address: values.address.trim() || null,
    description: values.description.trim() || null,
  });

  if (error) throw new Error(error.message);
}

export async function updateProperty(
  id: string,
  values: PropertyFormValues,
): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("properties")
    .update({
      name: values.name.trim(),
      address: values.address.trim() || null,
      description: values.description.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Properti tidak ditemukan atau akses ditolak.");
}

export async function deleteProperty(id: string): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("properties")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Properti tidak ditemukan atau akses ditolak.");
}
