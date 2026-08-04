"use client";

import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Comment as CustomComment } from "@/types/comment";

interface CommentListProps {
  comments: CustomComment[];
}

export function CommentList({ comments }: CommentListProps) {
  return (
    <div className="space-y-3">
      {comments.length === 0 ? (
        <div className="text-center py-8 glass-card rounded-2xl border border-white/10 p-4">
          <p className="text-slate-400 text-xs font-medium">
            No comments yet. Be the first to leave a comment!
          </p>
        </div>
      ) : (
        comments.map((comment, index) => (
          <motion.div
            key={comment._id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04 }}
            className="glass-card rounded-2xl border border-white/10 p-4 shadow-md"
          >
            <div className="flex items-start space-x-3">
              <Avatar className="h-8 w-8 shrink-0 ring-1 ring-white/10">
                <AvatarImage
                  src={comment.author.image}
                  alt={comment.author.name}
                />
                <AvatarFallback className="bg-indigo-600 text-white text-xs">
                  {comment.author.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="font-semibold text-slate-200 text-xs truncate">
                    {comment.author.name}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {formatDistanceToNow(new Date(comment.createdAt))} ago
                  </span>
                </div>
                <p className="mt-1 text-slate-300 text-xs leading-relaxed break-words">
                  {comment.content}
                </p>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
