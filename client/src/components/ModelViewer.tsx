import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ThreeCanvas } from "./ThreeCanvas";
import { ObjectUploader } from "./ObjectUploader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Model } from "@shared/schema";
import type { UploadResult } from "@uppy/core";

export function ModelViewer() {
  const [currentModel, setCurrentModel] = useState<Model | null>(null);
  const [modelInfo, setModelInfo] = useState<{ vertices: number; triangles: number } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: models = [] } = useQuery<Model[]>({
    queryKey: ["/api/models"],
  });

  // Auto-select the first model when models are loaded
  useEffect(() => {
    if (models.length > 0 && !currentModel) {
      setCurrentModel(models[0]);
    }
  }, [models, currentModel]);

  const createModelMutation = useMutation({
    mutationFn: async (modelData: { name: string; filePath: string; fileSize: number; vertices?: number; triangles?: number }) => {
      const response = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modelData),
      });
      if (!response.ok) throw new Error("Failed to create model");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/models"] });
      toast({
        title: "Success",
        description: "3D model uploaded successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload 3D model",
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    const response = await fetch("/api/objects/upload", { method: "POST" });
    if (!response.ok) throw new Error("Failed to get upload URL");
    const { uploadURL } = await response.json();
    return { method: "PUT" as const, url: uploadURL };
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    const uploadedFile = result.successful?.[0];
    if (uploadedFile) {
      const fileName = uploadedFile.name || "Unknown Model";
      const fileSize = uploadedFile.size || 0;
      
      createModelMutation.mutate({
        name: fileName.replace(/\.[^/.]+$/, ""), // Remove file extension
        filePath: uploadedFile.uploadURL || "",
        fileSize,
        vertices: modelInfo?.vertices,
        triangles: modelInfo?.triangles,
      });
    }
  };

  const handleModelSelect = (model: Model) => {
    setCurrentModel(model);
    setModelInfo(null);
  };

  const handleModelLoad = (info: { vertices: number; triangles: number }) => {
    setModelInfo(info);
  };

  const handleError = (error: string) => {
    toast({
      title: "Error",
      description: error,
      variant: "destructive",
    });
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <section className="h-screen bg-primary dark:bg-black relative overflow-hidden">
      <ThreeCanvas
        modelUrl={currentModel?.filePath}
        onModelLoad={handleModelLoad}
        onError={handleError}
      />

      {/* No Model State */}
      {!currentModel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-32 h-32 mx-auto mb-6 bg-white/10 rounded-lg flex items-center justify-center">
              <i className="fas fa-cube text-4xl text-white/50"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">No Model Loaded</h3>
            <p className="text-white/70 mb-6">Upload an FBX file to begin viewing</p>
            <ObjectUploader
              maxNumberOfFiles={1}
              maxFileSize={50 * 1024 * 1024} // 50MB
              onGetUploadParameters={handleGetUploadParameters}
              onComplete={handleUploadComplete}
              buttonClassName="bg-accent hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Upload 3D Model
            </ObjectUploader>
          </div>
        </div>
      )}

      {/* Upload Control */}
      {currentModel && (
        <div className="absolute top-6 left-6">
          <div className="bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <ObjectUploader
              maxNumberOfFiles={1}
              maxFileSize={50 * 1024 * 1024}
              onGetUploadParameters={handleGetUploadParameters}
              onComplete={handleUploadComplete}
              buttonClassName="p-2 text-accent hover:text-blue-600 transition-colors"
            >
              <i className="fas fa-upload"></i>
            </ObjectUploader>
          </div>
        </div>
      )}

      {/* Model Info Panel */}
      {currentModel && (
        <div className="absolute bottom-6 left-6 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-sm">
          <h4 className="font-semibold text-primary dark:text-white mb-2">{currentModel.name}</h4>
          <div className="text-sm text-subtle dark:text-white/70 space-y-1">
            {modelInfo && (
              <>
                <p><span className="font-medium">Vertices:</span> {modelInfo.vertices.toLocaleString()}</p>
                <p><span className="font-medium">Triangles:</span> {modelInfo.triangles.toLocaleString()}</p>
              </>
            )}
            <p><span className="font-medium">File Size:</span> {formatFileSize(currentModel.fileSize)}</p>
          </div>
        </div>
      )}

      {/* Model Selection Sidebar (if multiple models) */}
      {models.length > 1 && (
        <div className="absolute top-20 left-6 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs max-h-80 overflow-y-auto">
          <h4 className="font-semibold text-primary dark:text-white mb-3">Models</h4>
          <div className="space-y-2">
            {models.map((model) => (
              <Button
                key={model.id}
                variant={currentModel?.id === model.id ? "default" : "ghost"}
                size="sm"
                onClick={() => handleModelSelect(model)}
                className="w-full justify-start text-left"
              >
                <i className="fas fa-cube mr-2"></i>
                <span className="truncate">{model.name}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
