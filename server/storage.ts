import { randomUUID } from "crypto";

export interface Model {
  id: string;
  name: string;
  description: string | null;
  filePath: string;
  vertices: number | null;
  triangles: number | null;
  uploadedAt: Date;
}

export type InsertModel = Omit<Model, "id" | "uploadedAt">;

export interface Image {
  id: string;
  name: string;
  description: string | null;
  filePath: string;
  category: string | null;
  uploadedAt: Date;
}

export type InsertImage = Omit<Image, "id" | "uploadedAt">;

export interface IStorage {
  // Model methods
  getModel(id: string): Promise<Model | undefined>;
  getAllModels(): Promise<Model[]>;
  createModel(model: InsertModel): Promise<Model>;
  deleteModel(id: string): Promise<boolean>;

  // Image methods
  getImage(id: string): Promise<Image | undefined>;
  getAllImages(): Promise<Image[]>;
  createImage(image: InsertImage): Promise<Image>;
  deleteImage(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private models: Map<string, Model>;
  private images: Map<string, Image>;

  constructor() {
    this.models = new Map();
    this.images = new Map();
  }

  // Model methods
  async getModel(id: string): Promise<Model | undefined> {
    return this.models.get(id);
  }

  async getAllModels(): Promise<Model[]> {
    return Array.from(this.models.values()).sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  async createModel(insertModel: InsertModel): Promise<Model> {
    const id = randomUUID();
    const model: Model = {
      ...insertModel,
      id,
      uploadedAt: new Date(),
      vertices: insertModel.vertices ?? null,
      triangles: insertModel.triangles ?? null,
    };
    this.models.set(id, model);
    return model;
  }

  async deleteModel(id: string): Promise<boolean> {
    return this.models.delete(id);
  }

  // Image methods
  async getImage(id: string): Promise<Image | undefined> {
    return this.images.get(id);
  }

  async getAllImages(): Promise<Image[]> {
    return Array.from(this.images.values()).sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  async createImage(insertImage: InsertImage): Promise<Image> {
    const id = randomUUID();
    const image: Image = {
      ...insertImage,
      id,
      uploadedAt: new Date(),
      category: insertImage.category ?? null,
    };
    this.images.set(id, image);
    return image;
  }

  async deleteImage(id: string): Promise<boolean> {
    return this.images.delete(id);
  }
}

export const storage = new MemStorage();
