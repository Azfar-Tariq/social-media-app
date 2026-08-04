"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Post } from "@/components/Post";
import { CommentForm } from "@/components/CommentForm";
import { CommentList } from "@/components/CommentList";
import { Comment as CustomComment } from "@/types/comment";
import { PostType } from "@/types/post";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PostPage() {
  const { id } = useParams();
  const postId = Array.isArray(id) ? id[0] : id;
  const [post, setPost] = useState<PostType | null>(null);
  const [comments, setComments] = useState<CustomComment[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchPostDetails = useCallback(async () => {
    if (!postId || postId === "undefined") return;
    try {
      const response = await fetch(`/api/posts/${postId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch post details");
      }
      const data = await response.json();
      setPost(data.post);
      setComments(data.comments || []);
    } catch (err) {
      console.error("Error fetching post details:", err);
      setError("Failed to load post. It may have been deleted.");
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPostDetails();
  }, [fetchPostDetails]);

  const handleCommentAdded = (newComment: CustomComment) => {
    setComments((prevComments) => [newComment, ...prevComments]);
    setPost((prev) =>
      prev
        ? {
            ...prev,
            commentsCount: (prev.commentsCount ?? 0) + 1,
          }
        : null
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center space-y-4">
        <p className="text-slate-400 text-sm font-medium">
          {error || "Post not found."}
        </p>
        <Link
          href="/"
          className="inline-flex items-center text-xs font-semibold text-blue-400 hover:text-blue-300"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Back to Home Feed
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

        <Post post={post} />

        <div className="pt-2">
          <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />
        </div>

        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Comments ({comments.length})
          </h2>
          <CommentList comments={comments} />
        </div>
      </div>
    </div>
  );
}
