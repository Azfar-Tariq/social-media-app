export interface Post {
  id: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  mediaType?: "image" | "video" | null;
  mediaUrl?: string | null;
  mediaThumbnail?: string | null;
}
