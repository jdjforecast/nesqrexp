import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  // Redirect to the sign-in page (let middleware handle language detection)
  redirect("/sign-in");
  
  // The below code won't execute due to the redirect
  return null;
} 