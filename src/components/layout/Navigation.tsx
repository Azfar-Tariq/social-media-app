"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const { data: session } = useSession();

  return (
    <nav className="flex justify-between items-center p-4">
      <Link href="/" className="text-xl font-bold">
        SocialApp
      </Link>
      <div>
        {session ? (
          <>
            <Link href="/profile" className="mr-4">
              Profile
            </Link>
            <Button onClick={() => signOut()} variant="outline">
              Sign out
            </Button>
          </>
        ) : (
          <Link href="/login">
            <Button>Sign in</Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
