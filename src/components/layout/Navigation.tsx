"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Home, User, LogOut, LogIn, MessageSquare, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

interface NotificationItem {
  id: string;
  type: "like" | "comment" | "follow";
  postId?: string;
  read: boolean;
  createdAt: string;
  actorName: string;
  actorImage?: string;
}

export default function Navigation() {
  const { data: session } = useSession();
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session?.user?.id]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotificationsList(data);
        setUnreadCount(data.filter((n: NotificationItem) => !n.read).length);
      }
    } catch {
      // Ignore
    }
  };

  const handleOpenNotifications = async () => {
    if (unreadCount > 0) {
      setUnreadCount(0);
      try {
        await fetch("/api/notifications", { method: "PATCH" });
      } catch {
        // Ignore
      }
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 border-b border-slate-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo Branding */}
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <MessageSquare className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-slate-100 tracking-tight">
              Chirpify
            </span>
          </Link>

          {/* User Nav Actions */}
          <div className="flex items-center space-x-2.5">
            {session ? (
              <>
                <Link href="/">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg px-2.5 py-1 transition-colors"
                  >
                    <Home className="h-4 w-4 text-blue-400" />
                    <span className="hidden sm:inline text-xs font-semibold">Home</span>
                  </Button>
                </Link>

                {/* Notifications Bell */}
                <DropdownMenu onOpenChange={(open) => open && handleOpenNotifications()}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                    >
                      <Bell className="h-4 w-4" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-slate-900" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-72 bg-slate-900 border border-slate-800 shadow-xl z-50 text-slate-200 p-1"
                  >
                    <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-blue-500/20 text-blue-400 font-semibold px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/50">
                      {notificationsList.length === 0 ? (
                        <p className="p-4 text-center text-xs text-slate-400">
                          No notifications yet.
                        </p>
                      ) : (
                        notificationsList.map((n) => (
                          <DropdownMenuItem
                            key={n.id}
                            asChild
                            className="p-2.5 cursor-pointer hover:bg-slate-800 focus:bg-slate-800 rounded-md"
                          >
                            <Link
                              href={n.postId ? `/posts/${n.postId}` : "/profile"}
                              className="flex items-start space-x-2.5 text-xs"
                            >
                              <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                                <AvatarImage src={n.actorImage || ""} />
                                <AvatarFallback className="bg-slate-800 text-slate-200 text-[10px]">
                                  {n.actorName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-slate-200 leading-snug">
                                  <span className="font-semibold text-slate-100">
                                    {n.actorName}
                                  </span>{" "}
                                  {n.type === "like" && "liked your post."}
                                  {n.type === "comment" && "commented on your post."}
                                  {n.type === "follow" && "started following you."}
                                </p>
                                <span className="text-[10px] text-slate-400">
                                  {formatDistanceToNow(new Date(n.createdAt))} ago
                                </span>
                              </div>
                            </Link>
                          </DropdownMenuItem>
                        ))
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Avatar Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full p-0 border border-slate-700 hover:border-slate-500 transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={session.user?.image || ""}
                          alt={session.user?.name || ""}
                        />
                        <AvatarFallback className="bg-slate-800 text-slate-200 font-semibold text-xs">
                          {session.user?.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 bg-slate-900 border border-slate-800 shadow-xl z-50 text-slate-200 p-1"
                  >
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <p className="text-xs font-semibold text-slate-100 truncate">
                        {session.user?.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {session.user?.email}
                      </p>
                    </div>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/profile"
                        className="flex items-center cursor-pointer rounded-md px-2.5 py-1.5 text-xs hover:bg-slate-800 transition-colors"
                      >
                        <User className="mr-2 h-3.5 w-3.5 text-blue-400" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="flex items-center text-rose-400 cursor-pointer rounded-md px-2.5 py-1.5 text-xs hover:bg-rose-500/10 focus:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="mr-2 h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg px-4 py-1.5">
                  <LogIn className="mr-1.5 h-3.5 w-3.5" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
