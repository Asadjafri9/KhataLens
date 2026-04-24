import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Branded palette — themed to match the landing page.
 * 3 faces in deep burgundy, 3 faces in premium gray.
 */
const COLORS = {
  burgundy: "#990011",
  burgundyDeep: "#700009",
  burgundyMid: "#820010",
  grayLight: "#d6cfce",
  gray: "#9a9092",
  grayDark: "#5b5356",
  ink: "#1a1013",
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
        roughness={0.55}
        metalness={0.08}
      />
    </mesh>
  );
}

function Cubie({
  basePos,
  cubieRef,
}: {
  basePos: Vec3;
  cubieRef: (m: THREE.Group | null) => void;
}) {
  const size = 0.48;
  const offset = size / 2 + 0.006;
  const [x, y, z] = basePos;

  // 3 burgundy faces (front, top, right) | 3 gray faces (back, bottom, left)
  const faceFront = z > 0 ? COLORS.burgundy : null;
  const faceTop = y > 0 ? COLORS.burgundyDeep : null;
  const faceRight = x > 0 ? COLORS.burgundyMid : null;

  const faceBack = z < 0 ? COLORS.gray : null;
  const faceBottom = y < 0 ? COLORS.grayDark : null;
  const faceLeft = x < 0 ? COLORS.grayLight : null;

  return (
    <group ref={cubieRef} position={basePos}>
      <RoundedBox args={[size, size, size]} radius={0.06} smoothness={4}>
        <meshStandardMaterial
          color={COLORS.ink}
          roughness={0.85}
          metalness={0.05}
        />
      </RoundedBox>

      {faceFront && <Sticker position={[0, 0, offset]} color={faceFront} />}
      {faceBack && (
        <Sticker position={[0, 0, -offset]} rotation={[0, Math.PI, 0]} color={faceBack} />
      )}
      {faceRight && (
        <Sticker position={[offset, 0, 0]} rotation={[0, Math.PI / 2, 0]} color={faceRight} />
      )}
      {faceLeft && (
        <Sticker position={[-offset, 0, 0]} rotation={[0, -Math.PI / 2, 0]} color={faceLeft} />
      )}
      {faceTop && (
        <Sticker position={[0, offset, 0]} rotation={[-Math.PI / 2, 0, 0]} color={faceTop} />
      )}
      {faceBottom && (
        <Sticker position={[0, -offset, 0]} rotation={[Math.PI / 2, 0, 0]} color={faceBottom} />
      )}
    </group>
  );
}

function CubeModel({ scrollEl }: { scrollEl?: HTMLElement | null }) {
  const group = useRef<THREE.Group>(null!);
  const cubieRefs = useRef<(THREE.Group | null)[]>([]);
  const progressRef = useRef(0); // scroll 0..1
  const introDoneRef = useRef(false);

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

  // Intro assembly: cubies start scattered + invisible, ease into place
  useEffect(() => {
    const groups = cubieRefs.current.filter(Boolean) as THREE.Group[];
    if (groups.length === 0) return;

    groups.forEach((g, i) => {
      const base = cubies[i];
      g.position.set(base[0] * 4, base[1] * 4 + 2, base[2] * 4);
      g.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      g.scale.setScalar(0.3);
    });

    const tl = gsap.timeline({
      onComplete: () => {
        introDoneRef.current = true;
        ScrollTrigger.refresh();
      },
    });

    groups.forEach((g, i) => {
      const base = cubies[i];
      tl.to(
        g.position,
        { x: base[0], y: base[1], z: base[2], duration: 0.9, ease: "power3.out" },
        i * 0.025
      );
      tl.to(g.rotation, { x: 0, y: 0, z: 0, duration: 0.9, ease: "power3.out" }, i * 0.025);
      tl.to(g.scale, { x: 1, y: 1, z: 1, duration: 0.9, ease: "power3.out" }, i * 0.025);
    });

    return () => {
      tl.kill();
    };
  }, [cubies]);

  // Scroll-scrubbed disassembly tied to hero section
  useEffect(() => {
    if (!scrollEl) return;
    const st = ScrollTrigger.create({
      trigger: scrollEl,
      start: "top top",
      end: "bottom top",
      scrub: 0.6,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });
    return () => st.kill();
  }, [scrollEl]);

  // Apply scroll-driven offsets each frame (no idle motion after intro)
  useFrame(() => {
    if (!group.current || !introDoneRef.current) return;
    const p = progressRef.current;

    // gentle gimbal tilt based on scroll only
    group.current.rotation.x = 0.45 + p * 0.25;
    group.current.rotation.y = 0.6 + p * 0.6;
    group.current.rotation.z = p * 0.08;

    const groups = cubieRefs.current;
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      if (!g) continue;
      const base = cubies[i];
      // explode outward along base vector, capped distance
      const k = 0.9 * p;
      g.position.x = base[0] * (1 + k);
      g.position.y = base[1] * (1 + k);
      g.position.z = base[2] * (1 + k);
      // each cubie rotates a touch as it disassembles
      g.rotation.x = base[0] * p * 1.2;
      g.rotation.y = base[2] * p * 1.4;
      g.rotation.z = base[1] * p * 0.8;
    }
  });

  return (
    <group ref={group}>
      {cubies.map((p, i) => (
        <Cubie
          key={i}
          basePos={p}
          cubieRef={(m) => (cubieRefs.current[i] = m)}
        />
      ))}
    </group>
  );
}

function Scene({ scrollEl }: { scrollEl?: HTMLElement | null }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 5]} intensity={1.0} color={"#fcf6f5"} />
      <directionalLight position={[-4, -2, -3]} intensity={0.3} color={"#990011"} />
      <pointLight position={[0, 0, 4]} intensity={0.35} color={"#fcf6f5"} />
      <CubeModel scrollEl={scrollEl} />
    </>
  );
}

export default function BrandedRubiksCube({
  className = "",
  scrollTriggerEl,
}: {
  className?: string;
  scrollTriggerEl?: HTMLElement | null;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      className={
        "relative w-full h-full pointer-events-none select-none " + className
      }
    >
      {/* soft burgundy glow behind cube */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 blur-3xl opacity-50"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.3), transparent 65%)",
        }}
      />
      {mounted && (
        <Canvas
          camera={{ position: [3.0, 2.4, 3.4], fov: 32 }}
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true }}
          style={{ background: "transparent" }}
        >
          <Scene scrollEl={scrollTriggerEl} />
        </Canvas>
      )}
    </div>
  );
}
