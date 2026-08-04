"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import withAuth from "@/components/withAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import {
  Mail,
  User,
  Settings,
  MessageSquare,
  Bookmark,
  Shield,
} from "lucide-react";

function ProfilePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"overview" | "settings">(
    "overview"
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Profile Card */}
        <div className="card-surface overflow-hidden shadow-sm">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-800" />

          <div className="px-6 pb-6 relative">
            {/* Avatar Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-5 gap-3">
              <div className="flex items-end space-x-3">
                <Avatar className="h-24 w-24 border-4 border-slate-950 shrink-0">
                  <AvatarImage
                    src={session?.user?.image || ""}
                    alt={session?.user?.name || ""}
                  />
                  <AvatarFallback className="bg-slate-800 text-slate-100 font-bold text-2xl">
                    {session?.user?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="pb-1">
                  <h1 className="text-xl font-bold text-slate-100">
                    {session?.user?.name}
                  </h1>
                  <p className="text-xs text-slate-400 font-medium">
                    {session?.user?.email}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setActiveTab(activeTab === "overview" ? "settings" : "overview")
                }
                className="border-slate-700 text-slate-200 hover:bg-slate-800 rounded-lg text-xs"
              >
                {activeTab === "overview" ? (
                  <>
                    <Settings className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
                    Settings
                  </>
                ) : (
                  <>
                    <User className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
                    Overview
                  </>
                )}
              </Button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              <StatCard
                label="Posts"
                value="Active"
                icon={<MessageSquare className="h-5 w-5" />}
                subtext="Chirpify User"
              />
              <StatCard
                label="Account"
                value="Verified"
                icon={<Shield className="h-5 w-5" />}
                subtext="Google OAuth"
              />
              <StatCard
                label="Saved"
                value="Bookmarks"
                icon={<Bookmark className="h-5 w-5" />}
                subtext="Personal list"
              />
            </div>

            {/* Account Details */}
            {activeTab === "overview" ? (
              <div className="space-y-3">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Account Details
                </h2>

                <div className="grid gap-2.5">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <User className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-[11px] text-slate-400">Full Name</p>
                      <p className="text-xs font-semibold text-slate-200">
                        {session?.user?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <Mail className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-[11px] text-slate-400">Email Address</p>
                      <p className="text-xs font-semibold text-slate-200">
                        {session?.user?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Settings
                </h2>
                <div className="p-5 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-2">
                  <Settings className="h-6 w-6 text-blue-400 mx-auto" />
                  <h3 className="text-slate-200 font-semibold text-xs">
                    Account Managed via Google Security
                  </h3>
                  <p className="text-slate-400 text-[11px] max-w-sm mx-auto">
                    Profile credentials and authentication are managed securely through Google OAuth.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ProfilePage);
