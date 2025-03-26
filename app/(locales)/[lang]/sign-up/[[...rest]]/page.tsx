import { redirect } from "next/navigation";

interface SignUpPageProps {
  params: {
    lang: string;
    rest?: string[];
  };
}

export default function SignUpPage({ params }: SignUpPageProps) {
  const { lang } = params;
  
  // Redirect to the register page
  redirect(`/${lang}/register`);
  
  // The below code won't execute due to the redirect
  return null;
} 