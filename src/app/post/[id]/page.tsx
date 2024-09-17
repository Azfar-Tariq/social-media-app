"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Post } from "@/components/Post";
import { CommentForm } from "@/components/CommentForm";
import { CommentList } from "@/components/CommentList";
import { Comment as CustomComment } from "@/types/comment";

export default function PostPage() {
  const { id } = useParams();
  const postId = Array.isArray(id) ? id[0] : id;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState<CustomComment[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchPost = useCallback(async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch post");
      }
      const data = await response.json();
      setPost(data);
    } catch (err) {
      setError("Failed to fetch post");
      console.error(err);
    }
  }, [postId]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/comments?postId=${postId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      const data = await response.json();
      setComments(data);
    } catch (err) {
      setError("Failed to fetch comments");
      console.error(err);
    }
  }, [postId]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchPost(), fetchComments()])
      .catch((err) => {
        setError("Failed to load data");
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  }, [fetchPost, fetchComments]);

  const handleCommentAdded = (newComment: CustomComment) => {
    setComments((prevComments) => [newComment, ...prevComments]);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <Post post={post} />
      <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />
      <CommentList comments={comments} />
    </div>
  );
}
