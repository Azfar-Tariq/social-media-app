import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Image, Video, X } from "lucide-react";

interface MediaUploadProps {
  onMediaSelected: (file: File) => void;
  onRemove: () => void;
  mediaType?: "image" | "video";
  mediaUrl?: string;
}

export function MediaUpload({
  onMediaSelected,
  onRemove,
  mediaType,
  mediaUrl,
}: MediaUploadProps) {
  const [preview, setPreview] = useState<string | null>(mediaUrl || null);
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

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    onMediaSelected(file);
  };

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
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
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto max-h-[300px] object-cover rounded-lg"
            />
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
            <Image className="h-4 w-4" />
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
