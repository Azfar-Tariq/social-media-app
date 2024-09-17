import { ObjectId } from "mongodb";

export interface Post {
  _id: ObjectId;
  content: string;
  authorId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
