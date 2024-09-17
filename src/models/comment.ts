import { ObjectId } from "mongodb";

export interface Comment {
  _id: ObjectId;
  content: string;
  authorId: ObjectId;
  createdAt: Date;
}
