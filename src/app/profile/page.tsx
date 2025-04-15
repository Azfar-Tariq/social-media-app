"use client";

import { useSession } from "next-auth/react";
import withAuth from "@/components/withAuth";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mail, User, Settings } from "lucide-react";

function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-surface rounded-xl shadow-lg border border-border/50 overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-primary/20 to-primary/10" />

          <div className="px-6 pb-6">
            <div className="flex items-end -mt-12 mb-4">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage
                  src={session?.user?.image || ""}
                  alt={session?.user?.name || ""}
                />
                <AvatarFallback className="text-2xl">
                  {session?.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-onSurface">
                  {session?.user?.name}
                </h1>
                <p className="text-muted-foreground">{session?.user?.email}</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="flex items-center space-x-3 p-4 rounded-lg bg-background/50 border border-border/50">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Name
                  </p>
                  <p className="text-onSurface">{session?.user?.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 rounded-lg bg-background/50 border border-border/50">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-onSurface">{session?.user?.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 rounded-lg bg-background/50 border border-border/50">
                <Settings className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Account Settings
                  </p>
                  <p className="text-onSurface">
                    Manage your account preferences
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default withAuth(ProfilePage);
