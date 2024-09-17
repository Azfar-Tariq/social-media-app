import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { Comment as CustomComment } from "@/types/comment";
import { useSession } from "next-auth/react";

interface CommentListProps {
  comments: CustomComment[];
}

export function CommentList({ comments }: CommentListProps) {
  const { data: session } = useSession();
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Comments</h2>
      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        comments.map((comment) => (
          <div key={comment._id} className="border-b pb-4 mb-4">
            <div className="flex items-center mb-2">
              <Image
                src={session?.user?.image || ""}
                alt={session?.user?.name || ""}
                className="w-8 h-8 rounded-full mr-2"
                width={32}
                height={32}
              />
              <span className="font-semibold">{session?.user?.name}</span>
            </div>
            <p className="mb-2">{comment.content}</p>
            <span className="text-gray-500 text-sm">
              {formatDistanceToNow(new Date(comment.createdAt))} ago
            </span>
          </div>
        ))
      )}
    </div>
  );
}
