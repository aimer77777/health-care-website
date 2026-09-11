import { BACKEND_HOST } from "@/module/config/config";
import { redirect } from "next/navigation";

export default function LogoutPage() {
  const baseUrl = BACKEND_HOST || "https://health.ncu.edu.tw";
  redirect(new URL("/api/auth/sign-out", baseUrl).href);
}
