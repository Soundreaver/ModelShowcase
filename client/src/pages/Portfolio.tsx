import { useState } from "react";
import { ModelViewer } from "@/components/ModelViewer";
import { ImageGallery } from "@/components/ImageGallery";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

type Tab = "models" | "gallery";

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState<Tab>("models");
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-primary dark:text-white">3D Portfolio</h1>
              {!isMobile && (
                <nav className="flex space-x-6">
                  <Button
                    variant="ghost"
                    onClick={() => setActiveTab("models")}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      activeTab === "models"
                        ? "text-accent border-b-2 border-accent"
                        : "text-subtle hover:text-primary dark:text-white/70 dark:hover:text-white"
                    }`}
                  >
                    3D Models
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setActiveTab("gallery")}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      activeTab === "gallery"
                        ? "text-accent border-b-2 border-accent"
                        : "text-subtle hover:text-primary dark:text-white/70 dark:hover:text-white"
                    }`}
                  >
                    Gallery
                  </Button>
                </nav>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 text-subtle hover:text-primary dark:text-white/70 dark:hover:text-white transition-colors"
              >
                <i className={`fas ${theme === "light" ? "fa-moon" : "fa-sun"} text-lg`}></i>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {activeTab === "models" && <ModelViewer />}
        {activeTab === "gallery" && <ImageGallery />}
      </main>

      {/* Mobile Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 z-40">
          <div className="flex items-center justify-around py-2">
            <Button
              variant="ghost"
              onClick={() => setActiveTab("models")}
              className={`flex flex-col items-center p-3 transition-colors ${
                activeTab === "models"
                  ? "text-accent"
                  : "text-subtle dark:text-white/70"
              }`}
            >
              <i className="fas fa-cube text-lg"></i>
              <span className="text-xs mt-1 font-medium">3D Models</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("gallery")}
              className={`flex flex-col items-center p-3 transition-colors ${
                activeTab === "gallery"
                  ? "text-accent"
                  : "text-subtle dark:text-white/70"
              }`}
            >
              <i className="fas fa-images text-lg"></i>
              <span className="text-xs mt-1 font-medium">Gallery</span>
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}
