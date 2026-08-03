import { getSupabaseAdmin, UPLOADS_BUCKET } from "./supabase";

export async function uploadMedia(
  file: File,
  userId: string
): Promise<{ type: "image" | "video"; url: string }> {
  const supabase = getSupabaseAdmin();
  const extension = file.name.split(".").pop() ?? "bin";
  const filename = `${userId}/${Date.now()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(UPLOADS_BUCKET)
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(UPLOADS_BUCKET).getPublicUrl(filename);

  const isImage = file.type.startsWith("image/");

  return {
    type: isImage ? "image" : "video",
    url: publicUrl,
  };
}
