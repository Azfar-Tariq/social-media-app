"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Bookmark,
  Trash2,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { User } from "@/models/user";
import Image from "next/image";
import { ToastContainer, ToastMessage } from "./ui/toast";

interface PostProps {
  post: {
    _id: string;
    content: string;
    createdAt: string;
    author: User;
    media?: {
      type: string;
      url: string;
      thumbnail?: string;
    };
    likesCount?: number;
    userLiked?: boolean;
    commentsCount?: number;
  };
  onDelete?: (postId: string) => void;
  priority?: boolean;
}

export function Post({ post, onDelete, priority = false }: PostProps) {
  const { data: session } = useSession();
  const isAuthor = session?.user?.id === post.author._id;

  const [likes, setLikes] = useState<number>(post.likesCount ?? 0);
  const [liked, setLiked] = useState<boolean>(post.userLiked ?? false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const router = useRouter();

  const addToast = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLike = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const previousLiked = liked;
    const previousLikes = likes;

    setLiked(!previousLiked);
    setLikes(previousLiked ? previousLikes - 1 : previousLikes + 1);

    try {
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post._id }),
      });

      if (!response.ok) {
        setLiked(previousLiked);
        setLikes(previousLikes);
      }
    } catch {
      setLiked(previousLiked);
      setLikes(previousLikes);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/posts/${post._id}`;

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        addToast("success", "Link copied to clipboard");
      } catch {
        addToast("info", `Post URL: ${shareUrl}`);
      }
    } else {
      addToast("info", `Post URL: ${shareUrl}`);
    }
  };

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved((prev) => !prev);
    addToast(
      "info",
      !isSaved ? "Saved to bookmarks" : "Removed from bookmarks"
    );
  };

  const handleDeletePost = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this post?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        addToast("success", "Post deleted");
        if (onDelete) {
          onDelete(post._id);
        } else {
          router.push("/");
        }
      } else {
        addToast("error", "Failed to delete post");
      }
    } catch {
      addToast("error", "Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMediaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFullscreen(true);
  };

  const handlePostClick = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest(".media-container") ||
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest("a")
    ) {
      return;
    }
    router.push(`/posts/${post._id}`);
  };

  if (isDeleting) {
    return (
      <div className="card-surface p-4 text-center text-xs text-slate-400">
        Deleting post...
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <div
        className="card-surface p-5 cursor-pointer hover:border-slate-700 transition-colors duration-150"
        onClick={handlePostClick}
      >
        {/* Post Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Link
              href="/profile"
              onClick={(e) => e.stopPropagation()}
              className="shrink-0"
            >
              <Avatar className="h-10 w-10 border border-slate-800">
                <AvatarImage
                  src={post.author.image || ""}
                  alt={post.author.name}
                />
                <AvatarFallback className="bg-slate-800 text-slate-200 font-semibold">
                  {post.author.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link
                href="/profile"
                className="font-semibold text-slate-100 hover:text-blue-400 text-sm transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {post.author.name}
              </Link>
              <p className="text-xs text-slate-400">
                {formatDistanceToNow(new Date(post.createdAt))} ago
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-slate-900 border border-slate-800 text-slate-200 p-1"
            >
              <DropdownMenuItem
                onClick={handleShare}
                className="cursor-pointer hover:bg-slate-800 focus:bg-slate-800 rounded-md text-xs"
              >
                <Share2 className="h-3.5 w-3.5 mr-2 text-slate-400" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleToggleSave}
                className="cursor-pointer hover:bg-slate-800 focus:bg-slate-800 rounded-md text-xs"
              >
                <Bookmark className="h-3.5 w-3.5 mr-2 text-amber-400" />
                {isSaved ? "Remove Bookmark" : "Save Bookmark"}
              </DropdownMenuItem>

              {isAuthor && (
                <DropdownMenuItem
                  onClick={handleDeletePost}
                  className="cursor-pointer text-rose-400 hover:bg-rose-500/10 focus:bg-rose-500/10 rounded-md text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete Post
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Post Text */}
        <p className="text-slate-200 text-sm leading-relaxed mb-3.5 whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Media Attachment */}
        {post.media && (
          <div
            className="mb-4 rounded-xl overflow-hidden media-container border border-slate-800 bg-slate-950"
            onClick={handleMediaClick}
          >
            {post.media.type === "image" ? (
              <div className="relative w-full h-[380px]">
                <Image
                  src={post.media.url}
                  alt="Post attachment"
                  fill
                  priority={priority}
                  className="object-cover cursor-pointer hover:opacity-95 transition-opacity"
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ) : (
              <video
                src={post.media.url}
                controls
                className="w-full h-auto max-h-[460px] cursor-pointer"
                poster={post.media.thumbnail}
              />
            )}
          </div>
        )}

        {/* Action Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            {/* Like Action */}
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1 transition-colors ${
                liked
                  ? "text-rose-500 hover:bg-rose-500/10"
                  : "text-slate-400 hover:text-rose-400 hover:bg-slate-800"
              }`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              <span className="font-semibold text-xs">{likes}</span>
            </Button>

            {/* Comment Action */}
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg px-2.5 py-1 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/posts/${post._id}`);
              }}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="font-semibold text-xs">
                {post.commentsCount ?? 0}
              </span>
            </Button>

            {/* Share Action */}
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg p-1.5 transition-colors"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Bookmark Action */}
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-lg p-1.5 transition-colors ${
              isSaved
                ? "text-amber-400 hover:bg-amber-400/10"
                : "text-slate-400 hover:text-amber-400 hover:bg-slate-800"
            }`}
            onClick={handleToggleSave}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Fullscreen Media Modal */}
      {isFullscreen && post.media && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 flex items-center justify-center p-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-slate-300 hover:text-white bg-slate-800 rounded-full"
            onClick={() => setIsFullscreen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="w-full h-full flex items-center justify-center max-w-6xl max-h-[90vh]">
            {post.media.type === "image" ? (
              <div className="relative w-full h-full">
                <Image
                  src={post.media.url}
                  alt="Attachment preview"
                  fill
                  className="object-contain"
                  unoptimized
                  sizes="100vw"
                />
              </div>
            ) : (
              <video
                src={post.media.url}
                controls
                className="w-full h-auto max-h-[85vh] rounded-xl"
                poster={post.media.thumbnail}
                autoPlay
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
