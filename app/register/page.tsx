import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { RegistrationForm } from "@/components/registration-form";

export default function RegisterPage() {
  // Redirect to the register page (let middleware handle language detection)
  redirect("/register");
  
  // The below code won't execute due to the redirect
  return null;
} 