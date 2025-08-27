"use client";

import { Canvas } from "@react-three/fiber";
import CuteRobot from "../3d/Cute_robot";

const MainScene = () => {
  return (
    <div className="snap-start w-full min-w-[1024px] h-screen">
      
      <Canvas camera={{ position: [100, 1, 4], fov: 50 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[1, 1, 2]} />
        <mesh scale={1} position={[-2, 0.4, 0]} rotation={[-0.2, 1, 0.05]}>
          <CuteRobot />
        </mesh>
      </Canvas>
    </div>
  );
};

export default MainScene;
