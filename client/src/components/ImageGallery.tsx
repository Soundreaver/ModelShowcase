import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ObjectUploader } from "./ObjectUploader";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Image } from "@shared/schema";
import type { UploadResult } from "@uppy/core";

export function ImageGallery() {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadCategory, setUploadCategory] = useState("");
  const [pendingUpload, setPendingUpload] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: images = [] } = useQuery<Image[]>({
    queryKey: ["/api/images"],
  });

  const createImageMutation = useMutation({
    mutationFn: async (imageData: { name: string; filePath: string; category?: string }) => {
      const response = await fetch("/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imageData),
      });
      if (!response.ok) throw new Error("Failed to create image");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/images"] });
      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      });
      setUploadName("");
      setUploadCategory("");
      setPendingUpload(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    const response = await fetch("/api/objects/upload", { method: "POST" });
    if (!response.ok) throw new Error("Failed to get upload URL");
    const { uploadURL } = await response.json();
    
    // The Vite proxy will handle rewriting the URL, so we can use it directly.
    return { method: "PUT" as const, url: uploadURL };
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    const uploadedFile = result.successful?.[0];
    if (uploadedFile) {
      setPendingUpload(uploadedFile);
      setUploadName(uploadedFile.name?.replace(/\.[^/.]+$/, "") || "");
    }
  };

  const handleSaveImage = () => {
    if (!pendingUpload || !uploadName.trim()) return;
    
    // The server response now contains the correct relative path
    const filePath = (pendingUpload.response?.body as { filePath: string })?.filePath;

    if (filePath) {
      createImageMutation.mutate({
        name: uploadName.trim(),
        filePath,
        category: uploadCategory.trim() || undefined,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to get file path from server",
        variant: "destructive",
      });
    }
  };

  const handleImageClick = (image: Image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  return (
    <section className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Gallery Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-primary dark:text-white mb-2">Render Gallery</h2>
            <p className="text-subtle dark:text-white/70">High-quality renders and portfolio images</p>
          </div>
          <ObjectUploader
            maxNumberOfFiles={5}
            maxFileSize={10 * 1024 * 1024} // 10MB
            onGetUploadParameters={handleGetUploadParameters}
            onComplete={handleUploadComplete}
            buttonClassName="bg-accent hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Images
          </ObjectUploader>
        </div>

        {/* Empty State */}
        {images.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <i className="fas fa-images text-2xl text-subtle dark:text-white/50"></i>
            </div>
            <h3 className="text-xl font-semibold text-primary dark:text-white mb-2">No Images Yet</h3>
            <p className="text-subtle dark:text-white/70 mb-6">Upload your first render to get started</p>
            <ObjectUploader
              maxNumberOfFiles={5}
              maxFileSize={10 * 1024 * 1024}
              onGetUploadParameters={handleGetUploadParameters}
              onComplete={handleUploadComplete}
              buttonClassName="bg-accent hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>
              Upload Images
            </ObjectUploader>
          </div>
        )}

        {/* Image Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <div
                key={image.id}
                className="group cursor-pointer"
                onClick={() => handleImageClick(image)}
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                  <img
                    src={image.filePath}
                    alt={image.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="mt-3">
                  <h4 className="font-medium text-primary dark:text-white truncate">{image.name}</h4>
                  {image.category && (
                    <p className="text-sm text-subtle dark:text-white/70 truncate">{image.category}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Upload placeholder */}
            <div className="aspect-square bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-accent hover:bg-accent/5 dark:hover:bg-accent/10 transition-colors">
              <ObjectUploader
                maxNumberOfFiles={5}
                maxFileSize={10 * 1024 * 1024}
                onGetUploadParameters={handleGetUploadParameters}
                onComplete={handleUploadComplete}
                buttonClassName="w-full h-full flex flex-col items-center justify-center text-subtle dark:text-white/70 hover:text-accent transition-colors"
              >
                <i className="fas fa-plus text-2xl mb-2"></i>
                <p className="text-sm font-medium">Add Image</p>
              </ObjectUploader>
            </div>
          </div>
        )}
      </div>

      {/* Image Details Modal */}
      {pendingUpload && (
        <Dialog open={!!pendingUpload} onOpenChange={() => setPendingUpload(null)}>
          <DialogContent>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Image Details</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image-name">Name *</Label>
                  <Input
                    id="image-name"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    placeholder="Enter image name"
                  />
                </div>
                <div>
                  <Label htmlFor="image-category">Category</Label>
                  <Input
                    id="image-category"
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    placeholder="e.g., Architecture, Product Design, etc."
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveImage}
                    disabled={!uploadName.trim() || createImageMutation.isPending}
                    className="flex-1"
                  >
                    {createImageMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPendingUpload(null)}
                    disabled={createImageMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Image View Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-full p-0">
          {selectedImage && (
            <div className="relative">
              <img
                src={selectedImage.filePath}
                alt={selectedImage.name}
                className="w-full h-auto rounded-lg"
              />
              <div className="absolute bottom-4 left-4 bg-black/50 text-white p-4 rounded-lg backdrop-blur-sm">
                <h4 className="font-semibold">{selectedImage.name}</h4>
                {selectedImage.category && (
                  <p className="text-sm opacity-80">{selectedImage.category}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
