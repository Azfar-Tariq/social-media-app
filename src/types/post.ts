export interface PostType {
  _id: string;
  content: string;
  authorId: string;
  createdAt: string;
  author: {
    name: string;
    image: string;
  };
}
