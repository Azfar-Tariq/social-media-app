import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, MoreHorizontal, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { Comment as CustomComment } from "@/types/comment";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useRouter } from "next/navigation";
import { User } from "@/models/user";

interface PostProps {
  post: {
    _id: string;
    content: string;
    createdAt: string;
    author: User;
  };
  showComments?: boolean;
}

export function Post({ post, showComments = true }: PostProps) {
  const [likes, setLikes] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<CustomComment[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchLikes = useCallback(async () => {
    try {
      const response = await fetch(`/api/likes?postId=${post._id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch likes");
      }
      const data = await response.json();
      setLikes(data.likes);
      setLiked(data.userLiked);
    } catch (err) {
      setError("Failed to fetch likes");
      console.error(err);
    }
  }, [post._id]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/comments?postId=${post._id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      const data = await response.json();
      setComments(data);
    } catch (err) {
      setError("Failed to fetch comments");
      console.error(err);
    }
  }, [post._id]);

  useEffect(() => {
    fetchLikes();
    if (showComments) {
      fetchComments();
    }
  }, [fetchLikes, fetchComments, showComments]);

  const handleLike = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post._id }),
      });
      if (!response.ok) {
        throw new Error("Failed to update like");
      }
      fetchLikes();
    } catch (err) {
      setError("Failed to update like");
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface rounded-xl shadow-sm border border-border/50 overflow-hidden cursor-pointer"
      onClick={() => router.push(`/posts/${post._id}`)}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Link
              href={`/profile/${post.author._id}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="h-10 w-10 cursor-pointer hover:opacity-90 transition-opacity">
                <AvatarImage src={post.author.image} alt={post.author.name} />
              </Avatar>
            </Link>
            <div>
              <Link
                href={`/profile/${post.author._id}`}
                className="font-semibold text-onSurface hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {post.author.name}
              </Link>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt))} ago
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-surface border border-border/50 shadow-lg z-50"
            >
              <DropdownMenuItem>Report</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-onSurface mb-4 whitespace-pre-wrap">
          {post.content}
        </p>

        <div className="flex items-center justify-between border-t border-border/50 pt-4">
          <div className="flex items-center space-x-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center space-x-1 ${
                    liked ? "text-red-500" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(e);
                  }}
                >
                  <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                  <span>{likes === null ? "0" : likes}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-surface border border-border/50 shadow-lg z-50">
                Like
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{comments.length}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-surface border border-border/50 shadow-lg z-50">
                Comments
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-surface border border-border/50 shadow-lg z-50">
                Share
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        {showComments && comments.length > 0 && (
          <div className="mt-4 space-y-2">
            {comments.slice(0, 3).map((comment) => (
              <div
                key={comment._id}
                className="flex items-start space-x-2 text-sm"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={comment.author.image}
                    alt={comment.author.name}
                  />
                  <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-onSurface">
                    {comment.author.name}
                  </p>
                  <p className="text-muted-foreground">{comment.content}</p>
                </div>
              </div>
            ))}
            {comments.length > 3 && (
              <Link
                href={`/posts/${post._id}`}
                className="text-sm text-primary hover:underline"
              >
                View all comments
              </Link>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
