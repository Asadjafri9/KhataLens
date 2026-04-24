import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Environment } from "@react-three/drei";
import { useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";

/**
 * Theme-mapped palette (HSL tokens converted to hex for three.js MeshStandardMaterial).
 * --background #fcf6f5  cream
 * --primary    #990011  burgundy
 * --primary-deep ~#700009
 * --ink        ~#1a1013 near-black with red undertone
 */
const COLORS = {
  cream: "#fcf6f5",
  creamSoft: "#f3e7e5",
  burgundy: "#990011",
  burgundyDeep: "#700009",
  ink: "#1a1013",
  charcoal: "#2a1f22",
};

type Vec3 = [number, number, number];

function Sticker({
  position,
  rotation = [0, 0, 0],
  color,
}: {
  position: Vec3;
  rotation?: Vec3;
  color: string;
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[0.4, 0.4]} />
      <meshStandardMaterial
        color={color}
        roughness={0.45}
        metalness={0.1}
        emissive={color}
        emissiveIntensity={0.04}
      />
    </mesh>
  );
}

function Cubie({ x, y, z }: { x: number; y: number; z: number }) {
  const size = 0.48;
  const offset = size / 2 + 0.006;

  // Face color rotation across cream / burgundy / ink for a branded Rubik's look
  const faceFront = z > 0 ? COLORS.cream : null;
  const faceBack = z < 0 ? COLORS.burgundy : null;
  const faceRight = x > 0 ? COLORS.ink : null;
  const faceLeft = x < 0 ? COLORS.creamSoft : null;
  const faceTop = y > 0 ? COLORS.burgundyDeep : null;
  const faceBottom = y < 0 ? COLORS.charcoal : null;

  return (
    <group position={[x, y, z]}>
      <RoundedBox args={[size, size, size]} radius={0.06} smoothness={4}>
        <meshStandardMaterial
          color={COLORS.ink}
          roughness={0.85}
          metalness={0.05}
        />
      </RoundedBox>

      {faceFront && <Sticker position={[0, 0, offset]} color={faceFront} />}
      {faceBack && (
        <Sticker
          position={[0, 0, -offset]}
          rotation={[0, Math.PI, 0]}
          color={faceBack}
        />
      )}
      {faceRight && (
        <Sticker
          position={[offset, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          color={faceRight}
        />
      )}
      {faceLeft && (
        <Sticker
          position={[-offset, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          color={faceLeft}
        />
      )}
      {faceTop && (
        <Sticker
          position={[0, offset, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          color={faceTop}
        />
      )}
      {faceBottom && (
        <Sticker
          position={[0, -offset, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          color={faceBottom}
        />
      )}
    </group>
  );
}

function CubeModel() {
  const group = useRef<THREE.Group>(null!);
  const scrollRef = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = Math.min(
        window.scrollY / Math.max(window.innerHeight, 1),
        1.5
      );
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cubies = useMemo(() => {
    const coords = [-0.56, 0, 0.56];
    const arr: Vec3[] = [];
    coords.forEach((x) =>
      coords.forEach((y) =>
        coords.forEach((z) => {
          arr.push([x, y, z]);
        })
      )
    );
    return arr;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const px = state.pointer.x;
    const py = state.pointer.y;
    const scroll = scrollRef.current;

    if (!group.current) return;

    group.current.rotation.x =
      0.45 + Math.sin(t * 0.8) * 0.05 + py * 0.18 + scroll * 0.1;
    group.current.rotation.y =
      0.6 + t * 0.28 + px * 0.25 + scroll * 0.5;
    group.current.rotation.z = Math.sin(t * 0.35) * 0.03;

    group.current.position.y = Math.sin(t * 1.15) * 0.08 - scroll * 0.25;
    group.current.position.x = px * 0.12;
  });

  return (
    <group ref={group}>
      {cubies.map((p, i) => (
        <Cubie key={i} x={p[0]} y={p[1]} z={p[2]} />
      ))}
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={1.1} color={"#fcf6f5"} />
      <directionalLight position={[-4, -2, -3]} intensity={0.35} color={"#990011"} />
      <pointLight position={[0, 0, 4]} intensity={0.4} color={"#fcf6f5"} />

      <Environment preset="studio" />

      <CubeModel />
    </>
  );
}

export default function BrandedRubiksCube({
  className = "",
}: {
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      className={
        "relative w-full aspect-square max-w-[420px] mx-auto " + className
      }
    >
      {/* soft burgundy glow */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 blur-3xl opacity-60"
        style={{
          background:
            "radial-gradient(circle at 50% 55%, hsl(var(--primary) / 0.35), transparent 65%)",
        }}
      />
      {mounted && (
        <Canvas
          camera={{ position: [2.8, 2.2, 3.2], fov: 35 }}
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true }}
          style={{ background: "transparent" }}
        >
          <Scene />
        </Canvas>
      )}
    </div>
  );
}
