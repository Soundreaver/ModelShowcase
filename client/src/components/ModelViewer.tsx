import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'three';

interface ModelProps {
  url: string;
}

const Model: React.FC<ModelProps> = ({ url }) => {
  const fbx = useLoader(FBXLoader, url, (loader) => {
    loader.setCrossOrigin('anonymous');
  });
  return <primitive object={fbx} scale={0.02} />;
};

interface ModelViewerProps {
  modelUrl: string;
}

export const ModelViewer: React.FC<ModelViewerProps> = ({ modelUrl }) => {
  return (
    <div className="relative w-full h-[70vh] rounded-lg overflow-hidden bg-gray-800">
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <Model url={modelUrl} />
          <Grid infiniteGrid />
          <OrbitControls
            enablePan={true}
            mouseButtons={{
              MIDDLE: THREE.MOUSE.PAN,
              RIGHT: THREE.MOUSE.ROTATE,
            }}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
