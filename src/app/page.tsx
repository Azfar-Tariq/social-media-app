"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Post } from "@/components/Post";
import { PostType } from "@/types/post";
import { LogIn, Sparkles, Search, Send, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MediaUpload } from "@/components/MediaUpload";
import { Skeleton } from "@/components/ui/skeleton";

const MAX_CHARS = 280;

export default function Home() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [newPost, setNewPost] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newPost.trim() && !mediaFile) || newPost.length > MAX_CHARS) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("content", newPost);
      if (mediaFile) {
        formData.append("media", mediaFile);
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setNewPost("");
        setMediaFile(null);
        fetchPosts();
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePostDeleted = (deletedPostId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const charCount = newPost.length;
  const isOverLimit = charCount > MAX_CHARS;

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-5">
        <div className="flex items-center space-x-3 mb-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 card-surface text-center shadow-xl border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/20">
            <Sparkles className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-bold text-slate-100 mb-2">
            Welcome to Chirpify
          </h1>
          <p className="text-slate-400 text-xs mb-6 leading-relaxed">
            Share posts, photos, videos, and comments in real-time. Sign in with custom email, quick demo profiles, or Google.
          </p>

          <div className="space-y-3">
            <Link href="/login">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-5 rounded-xl transition-all shadow-md flex items-center justify-center text-xs">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In / Demo Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* User Greeting & Search Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 card-surface p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border border-slate-700">
              <AvatarImage
                src={session.user?.image || ""}
                alt={session.user?.name || ""}
              />
              <AvatarFallback className="bg-slate-800 text-slate-200 font-semibold text-xs">
                {session.user?.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-base font-bold text-slate-100">
                Welcome back, {session.user?.name?.split(" ")[0]}! 👋
              </h1>
              <p className="text-xs text-slate-400">
                What&apos;s happening today?
              </p>
            </div>
          </div>

          {/* Feed Search Input */}
          <div className="relative min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feed..."
              className="w-full pl-8 pr-4 py-1.5 text-xs rounded-lg input-surface focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Post Composer Card */}
        <form
          onSubmit={handleSubmit}
          className="card-surface p-4 shadow-sm"
        >
          <div className="flex space-x-3">
            <Avatar className="h-9 w-9 shrink-0 border border-slate-700">
              <AvatarImage src={session.user?.image || ""} />
              <AvatarFallback className="bg-slate-800 text-slate-200 text-xs">
                {session.user?.name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full p-3 text-xs rounded-lg input-surface focus:outline-none resize-none min-h-[90px]"
                rows={3}
              />

              <div className="mt-2">
                <MediaUpload
                  onMediaSelected={(file) => setMediaFile(file)}
                  onRemove={() => setMediaFile(null)}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                {/* Character Count Indicator */}
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                    isOverLimit
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      : charCount > 240
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  {MAX_CHARS - charCount} chars left
                </span>

                <Button
                  type="submit"
                  disabled={
                    isUploading ||
                    (!newPost.trim() && !mediaFile) ||
                    isOverLimit
                  }
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
                >
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  {isUploading ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* Feed Posts List */}
        <div className="space-y-4">
          {searchQuery && (
            <div className="text-xs text-slate-400 px-1">
              Search results matching &quot;{searchQuery}&quot; ({filteredPosts.length} posts found)
            </div>
          )}

          {filteredPosts.length === 0 ? (
            <div className="text-center py-10 card-surface p-6">
              <p className="text-slate-400 text-xs font-medium">
                {searchQuery ? "No posts match your search query." : "No posts yet. Be the first to share something!"}
              </p>
            </div>
          ) : (
            filteredPosts.map((post, idx) => (
              <Post
                key={post._id}
                post={post}
                priority={idx === 0}
                onDelete={handlePostDeleted}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
