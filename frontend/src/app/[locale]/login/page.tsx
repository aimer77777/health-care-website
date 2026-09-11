import { BACKEND_HOST } from "@/module/config/config";
import { redirect } from "next/navigation";

export default function LoginPage() {
  const baseUrl = BACKEND_HOST || "https://health.ncu.edu.tw";
  redirect(new URL("/api/auth/login", baseUrl).href);
}
