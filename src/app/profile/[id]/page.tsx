"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Post } from "@/components/Post";
import { PostType } from "@/types/post";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Shield, UserPlus, UserCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface UserProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    bio?: string;
  };
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
  isFollowing: boolean;
}

export default function UserProfilePage() {
  const { id } = useParams();
  const userId = Array.isArray(id) ? id[0] : id;
  const { data: session } = useSession();
  const isOwnProfile = session?.user?.id === userId;

  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [userPosts, setUserPosts] = useState<PostType[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!userId || userId === "undefined") return;
    try {
      const res = await fetch(`/api/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
        setIsFollowing(data.isFollowing);
        setFollowersCount(data.stats.followers);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchUserPosts = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts`);
      if (res.ok) {
        const data: PostType[] = await res.json();
        setUserPosts(data.filter((p) => p.author._id === userId));
      }
    } catch {
      // Ignore
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, [fetchProfile, fetchUserPosts]);

  const handleToggleFollow = async () => {
    const prev = isFollowing;
    setIsFollowing(!prev);
    setFollowersCount((c) => (prev ? c - 1 : c + 1));

    try {
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId }),
      });
      if (!res.ok) {
        setIsFollowing(prev);
        setFollowersCount((c) => (prev ? c + 1 : c - 1));
      }
    } catch {
      setIsFollowing(prev);
      setFollowersCount((c) => (prev ? c + 1 : c - 1));
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center space-y-4">
        <p className="text-slate-400 text-sm">User profile not found.</p>
        <Link href="/" className="text-xs font-semibold text-blue-400">
          Back to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto space-y-5">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-1"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Back to Feed
        </Link>

        {/* Profile Banner */}
        <div className="card-surface overflow-hidden shadow-sm">
          <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-800" />

          <div className="px-6 pb-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-5 gap-3">
              <div className="flex items-end space-x-3">
                <Avatar className="h-24 w-24 border-4 border-slate-950 shrink-0">
                  <AvatarImage
                    src={profileData.user.image || ""}
                    alt={profileData.user.name}
                  />
                  <AvatarFallback className="bg-slate-800 text-slate-100 font-bold text-2xl">
                    {profileData.user.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="pb-1">
                  <h1 className="text-xl font-bold text-slate-100">
                    {profileData.user.name}
                  </h1>
                  {profileData.user.bio && (
                    <p className="text-xs text-slate-300 mt-1">
                      {profileData.user.bio}
                    </p>
                  )}
                </div>
              </div>

              {!isOwnProfile && session?.user && (
                <Button
                  onClick={handleToggleFollow}
                  className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors ${
                    isFollowing
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                  size="sm"
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                      Follow
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <StatCard
                label="Posts"
                value={profileData.stats.posts}
                icon={<MessageSquare className="h-5 w-5" />}
              />
              <StatCard
                label="Followers"
                value={followersCount}
                icon={<Shield className="h-5 w-5" />}
              />
              <StatCard
                label="Following"
                value={profileData.stats.following}
                icon={<UserCheck className="h-5 w-5" />}
              />
            </div>
          </div>
        </div>

        {/* Timeline Posts */}
        <div className="space-y-4 pt-2">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Posts by {profileData.user.name} ({userPosts.length})
          </h2>
          {userPosts.length === 0 ? (
            <div className="card-surface p-6 text-center text-xs text-slate-400">
              No posts shared yet.
            </div>
          ) : (
            userPosts.map((p) => <Post key={p._id} post={p} />)
          )}
        </div>
      </div>
    </div>
  );
}
