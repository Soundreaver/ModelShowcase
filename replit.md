# Overview

This is a 3D portfolio application built with a full-stack architecture using React, TypeScript, Express.js, and PostgreSQL. The application allows users to upload, view, and manage 3D models and images in a portfolio-style interface. It features a Three.js-powered 3D model viewer, file upload capabilities with Google Cloud Storage integration, and a modern UI built with shadcn/ui components.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives with Tailwind CSS styling
- **State Management**: TanStack Query for server state management and caching
- **3D Rendering**: Three.js for 3D model visualization with FBX loader support
- **Routing**: Wouter for client-side routing
- **File Upload**: Uppy for handling file uploads with dashboard interface

## Backend Architecture
- **Server**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL support
- **File Storage**: Google Cloud Storage with ACL-based access control
- **Database**: Neon Database (PostgreSQL) for production, with fallback to in-memory storage
- **API Design**: RESTful endpoints for CRUD operations on models and images

## Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database with Drizzle ORM
- **Schema**: Two main entities - models and images with metadata tracking
- **File Storage**: Google Cloud Storage for binary file storage
- **Caching**: TanStack Query provides client-side caching for API responses

## Authentication and Authorization
- **Object Access Control**: Custom ACL system for fine-grained file access permissions
- **Storage Authentication**: Google Cloud Storage with service account credentials via Replit sidecar

## Design Patterns
- **Separation of Concerns**: Clear separation between client, server, and shared code
- **Repository Pattern**: Abstract storage interface with multiple implementations (memory and database)
- **Component Composition**: Modular React components with shadcn/ui design system
- **Type Safety**: Full TypeScript coverage across frontend and backend

# External Dependencies

## Cloud Services
- **Neon Database**: Serverless PostgreSQL database hosting
- **Google Cloud Storage**: Object storage for 3D models and images
- **Replit Infrastructure**: Development environment and deployment platform

## Third-Party Libraries
- **Three.js**: 3D graphics library for model rendering and visualization
- **Uppy**: Modern file upload library with dashboard UI
- **TanStack Query**: Data fetching and state management
- **Drizzle ORM**: Type-safe database ORM for PostgreSQL
- **shadcn/ui**: Pre-built UI component library based on Radix UI
- **Tailwind CSS**: Utility-first CSS framework for styling

## Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds