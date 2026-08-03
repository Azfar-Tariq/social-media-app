/** Maps DB rows to the shape the frontend expects (legacy MongoDB _id fields) */

export function serializeAuthor(author: {
  id: string;
  name: string | null;
  image: string | null;
}) {
  return {
    _id: author.id,
    name: author.name ?? "Unknown",
    image: author.image ?? "",
  };
}

export function serializePost(row: {
  id: string;
  content: string;
  createdAt: Date;
  mediaType: "image" | "video" | null;
  mediaUrl: string | null;
  mediaThumbnail: string | null;
  author: { id: string; name: string | null; image: string | null };
}) {
  return {
    _id: row.id,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    media: row.mediaUrl
      ? {
          type: row.mediaType as "image" | "video",
          url: row.mediaUrl,
          thumbnail: row.mediaThumbnail ?? undefined,
        }
      : undefined,
    author: serializeAuthor(row.author),
  };
}

export function serializeComment(row: {
  id: string;
  content: string;
  createdAt: Date;
  author: { name: string | null; image: string | null };
}) {
  return {
    _id: row.id,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    author: {
      name: row.author.name ?? "Unknown",
      image: row.author.image ?? "",
    },
  };
}
