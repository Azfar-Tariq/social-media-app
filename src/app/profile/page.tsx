"use client";

import { useSession } from "next-auth/react";
import withAuth from "@/components/withAuth";
import Image from "next/image";

function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5 text-onBackground">
        User Profile
      </h1>
      <div className="bg-surface shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="flex items-center mb-4">
          <Image
            src={session?.user?.image || "/default-avatar.png"}
            alt={session?.user?.name || "User"}
            className="w-20 h-20 rounded-full mr-4"
            width={80}
            height={80}
          />
          <div>
            <p className="font-semibold text-onSurface text-xl">
              {session?.user?.name}
            </p>
            <p className="text-onSurface opacity-70">{session?.user?.email}</p>
          </div>
        </div>
        <div className="mb-4">
          <label
            className="block text-onSurface text-sm font-bold mb-2"
            htmlFor="name"
          >
            Name
          </label>
          <p className="text-onSurface">{session?.user?.name}</p>
        </div>
        <div className="mb-4">
          <label
            className="block text-onSurface text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <p className="text-onSurface">{session?.user?.email}</p>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ProfilePage);
