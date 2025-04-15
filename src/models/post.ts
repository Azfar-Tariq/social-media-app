import { ObjectId } from "mongodb";

export interface Post {
  _id: ObjectId;
  content: string;
  authorId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  media?: {
    type: "image" | "video";
    url: string;
    thumbnail?: string;
  };
}
