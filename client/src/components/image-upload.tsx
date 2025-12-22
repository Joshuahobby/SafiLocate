import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // 1. Show local preview immediately
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setPreview(base64String);

        // 2. Upload to server
        setIsUploading(true);
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64String }),
          });

          if (!res.ok) throw new Error("Upload failed");

          const data = await res.json();
          // 3. Pass the SERVER URL to the parent form
          onChange(data.url);
        } catch (error) {
          console.error("Upload error:", error);
          // Revert preview on failure? Or just let user retry.
          // For now, clear it so they know it failed.
          setPreview(null);
          onChange(null);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    multiple: false,
    disabled: isUploading
  });

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onChange(null);
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-xl transition-all cursor-pointer flex items-center gap-3 bg-muted/20 hover:bg-muted/40 p-4",
          isDragActive && "border-primary bg-primary/5 ring-2 ring-primary/20",
          !preview && "border-muted-foreground/25",
          preview && "border-primary/50 bg-primary/5"
        )}
      >
        <input {...getInputProps()} />

        {preview ? (
          <>
            <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted border border-border">
              <img
                src={preview}
                alt="Thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Image uploaded</p>
              <p className="text-xs text-muted-foreground">Click to change</p>
            </div>
            {isUploading && (
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin shrink-0"></div>
            )}
            {!isUploading && (
              <button
                onClick={removeImage}
                className="p-1.5 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors shrink-0"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <>
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {isDragActive ? "Drop the image here" : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WEBP (max. 5MB)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
