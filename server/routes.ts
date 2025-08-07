import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { LocalStorageService } from "./localStorage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Use cloud storage if configured, otherwise fallback to local storage
  const useCloudStorage = process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.PRIVATE_OBJECT_DIR;
  const objectStorageService = useCloudStorage ? new ObjectStorageService() : null;
  const localStorageService = new LocalStorageService();

  // Serve static files from uploads directory
  const uploadsDir = path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsDir));

  // Serve public objects (images, models) - only if cloud storage is configured
  app.get("/public-objects/*", async (req, res) => {
    if (!objectStorageService) {
      return res.status(404).json({ error: "Cloud storage not configured" });
    }
    
    const filePath = req.path.replace('/public-objects/', '');
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve private objects - only if cloud storage is configured
  app.get("/objects/*", async (req, res) => {
    if (!objectStorageService) {
      return res.status(404).json({ error: "Cloud storage not configured" });
    }
    
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Get upload URL for objects
  app.post("/api/objects/upload", async (req, res) => {
    try {
      if (objectStorageService) {
        const uploadURL = await objectStorageService.getObjectEntityUploadURL();
        res.json({ uploadURL });
      } else {
        const uploadURL = await localStorageService.getUploadURL();
        res.json({ uploadURL });
      }
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Handle local file uploads
  app.put("/api/upload/:objectId", async (req, res) => {
    await localStorageService.handleUpload(req, res);
  });

  // Serve local files
  app.get("/api/files/:objectId", async (req, res) => {
    await localStorageService.serveFile(req, res);
  });

  // Model routes
  app.get("/api/models", async (req, res) => {
    try {
      const models = await storage.getAllModels();
      res.json(models);
    } catch (error) {
      console.error("Error fetching models:", error);
      res.status(500).json({ error: "Failed to fetch models" });
    }
  });

  app.post("/api/models", async (req, res) => {
    try {
      const { name, description, filePath, vertices, triangles } = req.body;
      
      // Normalize the file path if it's a full URL
      const objectPath = objectStorageService 
        ? objectStorageService.normalizeObjectEntityPath(filePath)
        : localStorageService.normalizeObjectEntityPath(filePath);
      
      const model = await storage.createModel({
        name,
        description,
        filePath: objectPath,
        vertices,
        triangles,
      });
      
      res.status(201).json(model);
    } catch (error) {
      console.error("Error creating model:", error);
      res.status(500).json({ error: "Failed to create model" });
    }
  });

  app.delete("/api/models/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteModel(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Model not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting model:", error);
      res.status(500).json({ error: "Failed to delete model" });
    }
  });

  // Image routes
  app.get("/api/images", async (req, res) => {
    try {
      const images = await storage.getAllImages();
      res.json(images);
    } catch (error) {
      console.error("Error fetching images:", error);
      res.status(500).json({ error: "Failed to fetch images" });
    }
  });

  app.post("/api/images", async (req, res) => {
    try {
      const { name, description, filePath, category } = req.body;
      
      // Normalize the file path if it's a full URL  
      const objectPath = objectStorageService 
        ? objectStorageService.normalizeObjectEntityPath(filePath)
        : localStorageService.normalizeObjectEntityPath(filePath);
      
      const image = await storage.createImage({
        name,
        description,
        filePath: objectPath,
        category,
      });
      
      res.status(201).json(image);
    } catch (error) {
      console.error("Error creating image:", error);
      res.status(500).json({ error: "Failed to create image" });
    }
  });

  app.delete("/api/images/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteImage(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Image not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ error: "Failed to delete image" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
