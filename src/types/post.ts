import { User } from "@/models/user";

export interface PostType {
  _id: string;
  content: string;
  createdAt: string;
  author: User;
  media?: {
    type: "image" | "video";
    url: string;
    thumbnail?: string;
  };
}
