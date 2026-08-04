"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Comment as CustomComment } from "@/types/comment";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { Send } from "lucide-react";

interface CommentFormProps {
  postId: string;
  onCommentAdded: (comment: CustomComment) => void;
}

export function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content: content.trim() }),
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
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onSubmit={handleSubmit}
      className="glass-card rounded-2xl border border-white/10 p-4 shadow-lg"
    >
      <div className="flex items-start space-x-3">
        <Avatar className="h-9 w-9 shrink-0 ring-1 ring-white/10">
          <AvatarImage
            src={session?.user?.image || ""}
            alt={session?.user?.name || ""}
          />
          <AvatarFallback className="bg-indigo-600 text-white text-xs font-semibold">
            {session?.user?.name?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 text-xs rounded-xl glass-input text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none"
            placeholder="Write a thoughtful comment..."
            rows={2}
            disabled={isLoading}
          />
          {error && <p className="text-rose-400 text-xs">{error}</p>}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading || content.trim().length === 0}
              size="sm"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-medium px-4 py-1.5 rounded-xl shadow-md disabled:opacity-50 transition-all"
            >
              <Send className="h-3.5 w-3.5 mr-1.5" />
              {isLoading ? "Posting..." : "Comment"}
            </Button>
          </div>
        </div>
      </div>
    </motion.form>
  );
}
