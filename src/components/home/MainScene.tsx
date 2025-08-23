"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Mesh } from "three";

function Box(props: any) {
  const ref = useRef<Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  useFrame((state, delta) => (ref.current.rotation.x += delta));

  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={() => setClicked(!clicked)}
      onPointerOver={(event) => (event.stopPropagation(), setHovered(true))}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}

const MainScene = () => {
  return (
    <div style={{ width: "100%", height: "500px" }}>
      <Canvas>
        <ambientLight intensity={0.8} />
        <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        <mesh
          visible
          userData={{ hello: "world" }}
          position={[0, 0, -4]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="hotpink" transparent />
        </mesh>
      </Canvas>
    </div>
  );
};

export default MainScene;
