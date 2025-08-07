import React, { useState } from "react";
import ModelUploader from "./components/ModelUploader.tsx";
import { ModelViewer } from "./components/ModelViewer";
import { motion, AnimatePresence } from "framer-motion";

const App: React.FC = () => {
  const [modelUrl, setModelUrl] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center">
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full bg-gray-800 p-4 shadow-md"
      >
        <h1 className="text-3xl font-bold text-center">3D Model Viewer</h1>
      </motion.header>
      <main className="flex-grow container mx-auto p-4 flex flex-col items-center">
        <ModelUploader setModelUrl={setModelUrl} />
        <AnimatePresence>
          {modelUrl && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full flex-grow mt-4"
            >
              <ModelViewer modelUrl={modelUrl} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
