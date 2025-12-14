import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link, X, Loader2, Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  onUpload?: (file: File) => Promise<string | null>;
  uploading?: boolean;
  label?: string;
  showPreview?: boolean;
  disabled?: boolean;
}

export function ImageUploader({
  value,
  onChange,
  onUpload,
  uploading = false,
  label = "Image",
  showPreview = true,
  disabled = false,
}: ImageUploaderProps) {
  const [urlInput, setUrlInput] = useState(value || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;

    const url = await onUpload(file);
    if (url) {
      onChange(url);
      setUrlInput(url);
    }
  };

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    onChange(url);
  };

  const handleClear = () => {
    onChange("");
    setUrlInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium">{label}</Label>
      
      <Tabs defaultValue={onUpload ? "upload" : "url"} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-8">
          {onUpload && (
            <TabsTrigger value="upload" className="text-xs">
              <Upload className="h-3 w-3 mr-1" />
              Upload
            </TabsTrigger>
          )}
          <TabsTrigger value="url" className="text-xs">
            <Link className="h-3 w-3 mr-1" />
            URL
          </TabsTrigger>
        </TabsList>

        {onUpload && (
          <TabsContent value="upload" className="mt-2">
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                disabled={uploading || disabled}
                className="text-xs"
              />
              {uploading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
            </div>
          </TabsContent>
        )}

        <TabsContent value="url" className="mt-2">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={(e) => handleUrlChange(e.target.value)}
              disabled={disabled}
              className="text-xs"
            />
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="h-9 w-9 shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {showPreview && value && (
        <div className="relative group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-32 object-cover rounded-md border"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleClear}
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      )}

      {showPreview && !value && (
        <div className="w-full h-24 border-2 border-dashed rounded-md flex items-center justify-center text-muted-foreground">
          <ImageIcon className="h-8 w-8" />
        </div>
      )}
    </div>
  );
}
