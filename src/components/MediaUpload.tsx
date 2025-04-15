/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Video, X } from "lucide-react";
import Image from "next/image";

interface MediaUploadProps {
  onMediaSelected: (file: File) => void;
  onRemove: () => void;
  mediaUrl?: string;
}

export function MediaUpload({
  onMediaSelected,
  onRemove,
  mediaUrl,
}: MediaUploadProps) {
  const [preview, setPreview] = useState<string | null>(mediaUrl || null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      alert("Please upload an image or video file");
      return;
    }

    // Set media type
    setMediaType(isImage ? "image" : "video");

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setMediaFile(file);
    onMediaSelected(file);
  };

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setMediaFile(null);
    setMediaType(null);
    onRemove();
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,video/*"
        className="hidden"
      />

      {preview ? (
        <div className="relative">
          {mediaType === "image" ? (
            <div className="relative w-full h-[300px]">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover rounded-lg"
                unoptimized
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ) : (
            <video
              src={preview}
              className="w-full h-auto max-h-[300px] rounded-lg"
              controls
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/80 hover:bg-background"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2"
          >
            <ImageIcon className="h-4 w-4" />
            <span>Add Image</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2"
          >
            <Video className="h-4 w-4" />
            <span>Add Video</span>
          </Button>
        </div>
      )}
    </div>
  );
}
