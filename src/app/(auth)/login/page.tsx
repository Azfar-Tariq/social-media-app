"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  if (session) {
    return null; // or a loading indicator if you prefer
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-onBackground">
          Login to SocialApp
        </h1>
        <div className="bg-surface shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <button
            onClick={() => signIn("google")}
            className="w-full bg-primary text-onPrimary font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-primary/80"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
