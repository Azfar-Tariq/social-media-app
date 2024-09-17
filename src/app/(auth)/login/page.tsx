"use client";

import { signIn, signOut, useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  // const router = useRouter();
  // console.log("Here");
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-4xl font-bold mb-5">
          Welcome, {session.user.name}!
        </h1>
        <p className="mb-5">You are logged in with {session.user.email}</p>
        <Button
          onClick={() => signOut()}
          className="bg-red-500 hover:bg-red-700"
        >
          Sign out
        </Button>
      </div>
    );
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
          {/* Add other sign-in methods here */}
        </div>
      </div>
    </div>
  );
}
