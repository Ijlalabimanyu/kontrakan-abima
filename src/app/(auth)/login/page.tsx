import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginTemplate from "@/components/templates/LoginTemplate";
import LoginForm from "./_components/LoginForm";

export default async function LoginPage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/dashboard");
  }

  return (
    <LoginTemplate>
      <LoginForm />
    </LoginTemplate>
  );
}
