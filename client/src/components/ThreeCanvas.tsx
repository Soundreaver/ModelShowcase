import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface ThreeCanvasProps {
  modelUrl?: string;
  onModelLoad?: (info: { vertices: number; triangles: number }) => void;
  onError?: (error: string) => void;
}

export function ThreeCanvas({ modelUrl, onModelLoad, onError }: ThreeCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<OrbitControls>();
  const currentModelRef = useRef<THREE.Group>();
  const [isWireframe, setIsWireframe] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    rendererRef.current = renderer;

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 100;
    controls.minDistance = 1;
    controlsRef.current = controls;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x8B4513, 0.3);
    scene.add(hemisphereLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    mountRef.current.appendChild(renderer.domElement);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!modelUrl || !sceneRef.current) return;
    
    console.log("Loading model from URL:", modelUrl);

    // Remove previous model
    if (currentModelRef.current) {
      sceneRef.current.remove(currentModelRef.current);
    }

    const loader = new FBXLoader();
    loader.load(
      modelUrl,
      (object: THREE.Group) => {
        // Calculate model info
        let vertices = 0;
        let triangles = 0;

        object.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            if (child.geometry) {
              const geometry = child.geometry;
              vertices += geometry.attributes.position?.count || 0;
              triangles += geometry.index ? geometry.index.count / 3 : vertices / 3;
            }
          }
        });

        // Center and scale the model
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 5 / maxDim;

        object.scale.setScalar(scale);
        object.position.sub(center.multiplyScalar(scale));
        object.position.y = 0;

        sceneRef.current?.add(object);
        currentModelRef.current = object;

        onModelLoad?.({ vertices: Math.round(vertices), triangles: Math.round(triangles) });
      },
      (progress: ProgressEvent) => {
        console.log("Loading progress:", (progress.loaded / progress.total) * 100 + "%");
      },
      (error: unknown) => {
        console.error("Error loading FBX:", error);
        onError?.("Failed to load 3D model");
      }
    );
  }, [modelUrl, onModelLoad, onError]);

  const resetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    
    cameraRef.current.position.set(5, 5, 5);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };

  const toggleWireframe = () => {
    if (!currentModelRef.current) return;

    setIsWireframe(!isWireframe);
    currentModelRef.current.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        if (child.material && typeof (child.material as any).wireframe !== 'undefined') {
          (child.material as any).wireframe = !isWireframe;
        }
      }
    });
  };

  const toggleFullscreen = () => {
    if (!mountRef.current) return;

    if (!document.fullscreenElement) {
      mountRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Floating Controls */}
      <div className="absolute top-6 right-6 space-y-3">
        <div className="bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="flex flex-col space-y-2">
            <button
              onClick={resetCamera}
              className="p-2 text-subtle hover:text-primary dark:text-white/70 dark:hover:text-white transition-colors"
              title="Reset View"
            >
              <i className="fas fa-home"></i>
            </button>
            <button
              onClick={toggleWireframe}
              className={`p-2 transition-colors ${
                isWireframe 
                  ? "text-accent" 
                  : "text-subtle hover:text-primary dark:text-white/70 dark:hover:text-white"
              }`}
              title="Wireframe"
            >
              <i className="fas fa-project-diagram"></i>
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-subtle hover:text-primary dark:text-white/70 dark:hover:text-white transition-colors"
              title="Fullscreen"
            >
              <i className="fas fa-expand"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
