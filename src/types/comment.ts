export interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  author: {
    name: string;
    image: string;
  };
}
