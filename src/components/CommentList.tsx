import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Comment as CustomComment } from "@/types/comment";

interface CommentListProps {
  comments: CustomComment[];
}

export function CommentList({ comments }: CommentListProps) {
  return (
    <div className="space-y-4">
      {comments.length === 0 ? (
        <p className="text-center text-muted-foreground">No comments yet.</p>
      ) : (
        comments.map((comment, index) => (
          <motion.div
            key={comment._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="bg-surface rounded-xl border border-border/50 p-4"
          >
            <div className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={comment.author.image}
                  alt={comment.author.name}
                />
                <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-onSurface">
                    {comment.author.name}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt))} ago
                  </span>
                </div>
                <p className="mt-1 text-onSurface">{comment.content}</p>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
