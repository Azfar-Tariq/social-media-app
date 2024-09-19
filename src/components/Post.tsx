import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle } from "lucide-react";
import Image from "next/image";
import { Comment as CustomComment } from "@/types/comment";

interface PostProps {
  post: {
    _id: string;
    content: string;
    createdAt: string;
    author: {
      name: string;
      image: string;
    };
  };
}

export function Post({ post }: PostProps) {
  const [likes, setLikes] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<CustomComment[]>([]);
  const [error, setError] = useState("");

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
    fetchComments();
  }, [fetchLikes, fetchComments]);

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
    <Link href={`/posts/${post._id}`}>
      <div className="border rounded-lg p-4 mb-4">
        <div className="flex items-center mb-2">
          <Image
            src={post.author.image}
            alt={post.author.name}
            className="w-10 h-10 rounded-full mr-2"
            width={40}
            height={40}
          />
          <span className="font-semibold">{post.author.name}</span>
        </div>
        <p className="mb-2">{post.content}</p>
        <div className="flex items-center text-gray-500 text-sm">
          <span className="mr-2">
            {formatDistanceToNow(new Date(post.createdAt))} ago
          </span>
          <button
            onClick={handleLike}
            className={`flex items-center hover:text-red-500 mr-2 ${
              liked ? "text-red-500" : ""
            }`}
          >
            <Heart size={16} className="mr-1" /> {likes === null ? "0" : likes}
          </button>
          <div className="flex items-center hover:text-blue-500">
            <MessageCircle size={16} className="mr-1" /> {comments.length}{" "}
            Comments
          </div>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        <div className="mt-4">
          {comments.slice(0, 3).map((comment) => (
            <div key={comment._id} className="text-sm mb-2">
              <div className="flex items-center mb-1">
                <Image
                  src={comment.author.image}
                  alt={comment.author.name}
                  className="w-5 h-5 rounded-full mr-2"
                  width={40}
                  height={40}
                />
                <span className="font-semibold">{comment.author.name}</span>
              </div>
              <p className="ml-7">{comment.content}</p>
            </div>
          ))}
          {comments.length > 3 && (
            <Link href={`/posts/${post._id}`} className="text-sm text-blue-500">
              View all comments
            </Link>
          )}
        </div>
      </div>
    </Link>
  );
}
