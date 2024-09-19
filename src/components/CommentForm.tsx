import { useState } from "react";
import { Comment as CustomComment } from "@/types/comment";

interface CommentFormProps {
  postId: string;
  onCommentAdded: (comment: CustomComment) => void;
}

export function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content }),
      });

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }

      const newComment = await response.json();
      onCommentAdded(newComment);
      setContent("");
    } catch (err) {
      setError("Failed to post comment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-2 border rounded text-black placeholder:text-gray-400"
        placeholder="Write a comment..."
        rows={3}
        disabled={isLoading}
      />
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
        disabled={isLoading || content.trim().length === 0}
      >
        {isLoading ? "Posting..." : "Post Comment"}
      </button>
    </form>
  );
}
