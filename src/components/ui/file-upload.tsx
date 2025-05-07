import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileIcon, ImageIcon, FileCheck } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onClear?: () => void;
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
  buttonText?: string;
  selectedFile?: File | null;
  previewUrl?: string | null;
  isUploading?: boolean;
  progress?: number;
  error?: string | null;
  variant?: "default" | "compact" | "icon";
}

export function FileUpload({
  onFileSelect,
  onClear,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  className,
  buttonText = "Sélectionner un fichier",
  selectedFile = null,
  previewUrl = null,
  isUploading = false,
  progress = 0,
  error = null,
  variant = "default",
}: FileUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);

  // Combine external and local errors
  const displayError = error || localError;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    validateAndProcessFile(file);
  };

  const validateAndProcessFile = (file: File) => {
    setLocalError(null);

    // Check file size
    if (file.size > maxSize) {
      setLocalError(
        `Le fichier est trop volumineux. Taille maximale: ${(maxSize / (1024 * 1024)).toFixed(1)}MB`,
      );
      return;
    }

    // Check file type if accept is specified
    if (accept && accept !== "*/*") {
      const acceptedTypes = accept.split(",").map((type) => type.trim());
      const fileType = file.type;

      // Handle wildcards like image/* or specific types
      const isAccepted = acceptedTypes.some((type) => {
        if (type.endsWith("/*")) {
          const category = type.split("/")[0];
          return fileType.startsWith(`${category}/`);
        }
        return type === fileType;
      });

      if (!isAccepted) {
        setLocalError("Type de fichier non pris en charge");
        return;
      }
    }

    onFileSelect(file);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setLocalError(null);
    if (onClear) {
      onClear();
    }
  };

  const isImage = (file: File | null, url: string | null): boolean => {
    if (file && file.type.startsWith("image/")) return true;
    if (url && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)) return true;
    return false;
  };

  const renderFilePreview = () => {
    if (!selectedFile && !previewUrl) return null;

    const showImage = isImage(selectedFile, previewUrl);

    return (
      <div className="mt-2 flex items-center gap-2">
        <div className="relative h-12 w-12 overflow-hidden rounded border bg-muted">
          {showImage ? (
            <img
              src={
                previewUrl ||
                (selectedFile ? URL.createObjectURL(selectedFile) : "")
              }
              alt="Preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <FileIcon className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="truncate text-sm">
            {selectedFile?.name || "Fichier sélectionné"}
          </p>
          {selectedFile && (
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          )}
        </div>
        {!isUploading && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  // Compact variant with just an icon button and preview
  if (variant === "icon") {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleButtonClick}
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </Button>
          {(selectedFile || previewUrl) && renderFilePreview()}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        {displayError && (
          <p className="text-xs text-destructive">{displayError}</p>
        )}
      </div>
    );
  }

  // Compact variant with smaller dropzone
  if (variant === "compact") {
    return (
      <div className={cn("space-y-2", className)}>
        {!(selectedFile || previewUrl) ? (
          <div
            className={cn(
              "flex cursor-pointer items-center justify-center rounded-md border border-dashed p-4 transition-colors",
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50",
            )}
            onClick={handleButtonClick}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-1 text-center">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{buttonText}</p>
            </div>
          </div>
        ) : (
          renderFilePreview()
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        {isUploading && <Progress value={progress} className="h-1" />}
        {displayError && (
          <p className="text-xs text-destructive">{displayError}</p>
        )}
      </div>
    );
  }

  // Default variant with full dropzone
  return (
    <div className={cn("space-y-2", className)}>
      {!(selectedFile || previewUrl) ? (
        <div
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-6 transition-colors",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
          )}
          onClick={handleButtonClick}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            {accept.includes("image/") ? (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            ) : (
              <FileIcon className="h-8 w-8 text-muted-foreground" />
            )}
            <div className="space-y-1">
              <p className="text-sm font-medium">{buttonText}</p>
              <p className="text-xs text-muted-foreground">
                Glissez-déposez ou cliquez pour sélectionner
              </p>
            </div>
          </div>
        </div>
      ) : (
        renderFilePreview()
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      {isUploading && (
        <div className="space-y-1">
          <Progress value={progress} className="h-1" />
          <p className="text-xs text-muted-foreground">
            Téléchargement en cours... {progress}%
          </p>
        </div>
      )}
      {displayError && (
        <p className="text-xs text-destructive">{displayError}</p>
      )}
    </div>
  );
}
