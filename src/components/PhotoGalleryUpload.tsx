import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, X, Loader2, Image, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PhotoGalleryUploadProps {
  bucket: "certificates" | "lot-documents" | "exploration-photos";
  folder?: string;
  existingPhotos?: string[];
  onPhotosChange?: (urls: string[]) => void;
  maxPhotos?: number;
  maxSizeMB?: number;
}

const PhotoGalleryUpload = ({
  bucket,
  folder = "",
  existingPhotos = [],
  onPhotosChange,
  maxPhotos = 10,
  maxSizeMB = 5,
}: PhotoGalleryUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > maxPhotos) {
      toast.error(`Máximo de ${maxPhotos} fotos permitidas`);
      return;
    }

    setUploading(true);

    const newPhotos: string[] = [];

    for (const file of Array.from(files)) {
      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} não é uma imagem válida`);
        continue;
      }

      // Check file size
      const maxSize = maxSizeMB * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`${file.name} é muito grande. Máximo ${maxSizeMB}MB`);
        continue;
      }

      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = folder ? `${folder}/${fileName}` : fileName;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        newPhotos.push(urlData.publicUrl);
      } catch (error: any) {
        console.error("Upload error:", error);
        toast.error(`Erro ao carregar ${file.name}`);
      }
    }

    if (newPhotos.length > 0) {
      const updatedPhotos = [...photos, ...newPhotos];
      setPhotos(updatedPhotos);
      onPhotosChange?.(updatedPhotos);
      toast.success(`${newPhotos.length} foto(s) carregada(s) com sucesso`);
    }

    setUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = async (urlToRemove: string) => {
    try {
      // Extract file path from URL
      const urlParts = urlToRemove.split("/storage/v1/object/public/");
      if (urlParts.length > 1) {
        const pathWithBucket = urlParts[1];
        const filePath = pathWithBucket.replace(`${bucket}/`, "");
        
        const { error } = await supabase.storage
          .from(bucket)
          .remove([filePath]);

        if (error) {
          console.error("Delete error:", error);
        }
      }

      const updatedPhotos = photos.filter((url) => url !== urlToRemove);
      setPhotos(updatedPhotos);
      onPhotosChange?.(updatedPhotos);
      toast.success("Foto removida");
    } catch (error) {
      console.error("Remove error:", error);
      toast.error("Erro ao remover foto");
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((url, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={url}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => handleRemovePhoto(url)}
                className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length < maxPhotos && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              A carregar...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              {photos.length === 0 ? "Adicionar Fotos" : "Adicionar Mais Fotos"}
            </>
          )}
        </Button>
      )}

      {photos.length === 0 && !uploading && (
        <Card className="border-dashed">
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Image className="h-10 w-10 mb-2" />
            <p className="text-sm">Nenhuma foto adicionada</p>
            <p className="text-xs">Clique no botão acima para adicionar</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PhotoGalleryUpload;
