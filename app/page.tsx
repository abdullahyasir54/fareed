import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();
  if (session?.role === "fareed") redirect("/fareed");
  if (session?.role === "employee") redirect("/employee");
  redirect("/login");
}
