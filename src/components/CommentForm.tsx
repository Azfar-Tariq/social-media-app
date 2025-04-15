import { useState } from "react";
import { motion } from "framer-motion";
import { Comment as CustomComment } from "@/types/comment";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

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
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onSubmit={handleSubmit}
      className="bg-surface rounded-xl border border-border/50 p-4"
    >
      <div className="flex items-start space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={session?.user?.image || ""}
            alt={session?.user?.name || ""}
          />
          <AvatarFallback>{session?.user?.name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 rounded-lg border border-border/50 bg-background text-onBackground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Write a comment..."
            rows={3}
            disabled={isLoading}
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <div className="flex justify-end mt-2">
            <Button
              type="submit"
              disabled={isLoading || content.trim().length === 0}
              className="bg-primary text-onPrimary hover:bg-primary/90"
            >
              {isLoading ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>
      </div>
    </motion.form>
  );
}
