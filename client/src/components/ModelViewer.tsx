import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Html } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { MOUSE } from 'three';

interface ModelProps {
  url: string;
}

const Model: React.FC<ModelProps> = ({ url }) => {
  const fbx = useLoader(FBXLoader, url, (loader: FBXLoader) => {
    loader.setCrossOrigin('anonymous');
  });
  return <primitive object={fbx} scale={0.02} />;
};

const Loader = () => {
  return (
    <Html center>
      <div className="flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-white"></div>
      </div>
    </Html>
  );
};

interface ModelViewerProps {
  modelUrl?: string;
}

export const ModelViewer: React.FC<ModelViewerProps> = ({ modelUrl }) => {
  // If no modelUrl is provided, show a placeholder or upload interface
  if (!modelUrl) {
    return (
      <div className="relative w-full h-[70vh] rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h3 className="text-xl mb-4">No 3D Model Selected</h3>
          <p className="text-gray-400">Upload a 3D model to view it here</p>
        </div>
      </div>
    );
  }
  return (
    <div className="relative w-full h-[70vh] rounded-lg overflow-hidden bg-gray-800">
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <Model url={modelUrl} />
          <Grid infiniteGrid />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            mouseButtons={{
              LEFT: MOUSE.DOLLY,
              MIDDLE: MOUSE.PAN,
              RIGHT: MOUSE.ROTATE,
            }}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
