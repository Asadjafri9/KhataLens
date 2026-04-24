import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Branded palette — themed to match the KhataLens identity.
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
        roughness={0.4}
        metalness={0.2}
        emissive={color === COLORS.burgundy ? color : "#000"}
        emissiveIntensity={0.2}
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

  const faceFront = z > 0 ? COLORS.burgundy : null;
  const faceTop = y > 0 ? COLORS.gray : null;
  const faceRight = x > 0 ? COLORS.grayLight : null;

  const faceBack = z < 0 ? COLORS.burgundy : null;
  const faceBottom = y < 0 ? COLORS.grayDark : null;
  const faceLeft = x < 0 ? COLORS.grayLight : null;

  return (
    <group ref={cubieRef} position={basePos}>
      <RoundedBox args={[size, size, size]} radius={0.06} smoothness={4}>
        <meshStandardMaterial
          color={COLORS.ink}
          roughness={0.8}
          metalness={0.1}
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

function CubeModel({
  playIntro,
  onIntroComplete,
  variant = "landing",
  scrollTriggerEl,
}: {
  playIntro: boolean;
  onIntroComplete?: () => void;
  variant?: "landing" | "login";
  scrollTriggerEl?: HTMLElement | null;
}) {
  const group = useRef<THREE.Group>(null!);
  const cubieRefs = useRef<(THREE.Group | null)[]>([]);
  const introDoneRef = useRef(false);
  const introStartedRef = useRef(false);
  const progressRef = useRef(0);
  const spinRef = useRef(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  // Initial and Intro Logic
  useEffect(() => {
    const groups = cubieRefs.current.filter(Boolean) as THREE.Group[];
    if (groups.length === 0) return;

    if (variant === "landing") {
      // Restore landing scatter (further out and higher up)
      groups.forEach((g, i) => {
        const base = cubies[i];
        g.position.set(base[0] * 4, base[1] * 4 + 3, base[2] * 4);
        g.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        g.scale.setScalar(0.4);
      });
    } else {
      // Login scatter (perfectly centered for the 'zoom in' intro)
      groups.forEach((g, i) => {
        const base = cubies[i];
        g.position.set(base[0] * 12, base[1] * 12, base[2] * 12);
        g.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, 0);
        g.scale.setScalar(0.1);
      });
    }
  }, [cubies, variant]);

  useEffect(() => {
    if (!playIntro || introStartedRef.current) return;
    const groups = cubieRefs.current.filter(Boolean) as THREE.Group[];
    if (groups.length === 0) return;

    introStartedRef.current = true;

    if (variant === "login") {
      const tl = gsap.timeline({
        delay: 0.5,
        onComplete: () => {
          introDoneRef.current = true;
          gsap.to(group.current.rotation, {
            y: group.current.rotation.y + Math.PI * 2,
            duration: 1.2,
            ease: "power4.inOut",
            onComplete: () => {
              setIsTransitioning(true);
              onIntroComplete?.();
            }
          });
        },
      });

      groups.forEach((g, i) => {
        const base = cubies[i];
        tl.to(g.position, { x: base[0], y: base[1], z: base[2], duration: 1.2, ease: "expo.out" }, i * 0.01);
        tl.to(g.rotation, { x: 0, y: 0, z: 0, duration: 1.2, ease: "expo.out" }, i * 0.01);
        tl.to(g.scale, { x: 1, y: 1, z: 1, duration: 1.2, ease: "expo.out" }, i * 0.01);
      });
    } else {
      // Landing intro
      const tl = gsap.timeline({
        onComplete: () => {
          introDoneRef.current = true;
          ScrollTrigger.refresh();
        },
      });
      groups.forEach((g, i) => {
        const base = cubies[i];
        tl.to(g.position, { x: base[0], y: base[1], z: base[2], duration: 0.9, ease: "power3.out" }, i * 0.02);
        tl.to(g.rotation, { x: 0, y: 0, z: 0, duration: 0.9, ease: "power3.out" }, i * 0.02);
        tl.to(g.scale, { x: 1, y: 1, z: 1, duration: 0.9, ease: "power3.out" }, i * 0.02);
      });
    }
  }, [cubies, playIntro, variant, onIntroComplete]);

  // Scroll logic for landing page
  useEffect(() => {
    if (variant !== "landing" || !scrollTriggerEl) return;
    const st = ScrollTrigger.create({
      trigger: scrollTriggerEl,
      start: "top top",
      end: "bottom top",
      scrub: 0.6,
      onUpdate: (self) => { progressRef.current = self.progress; }
    });
    return () => st.kill();
  }, [variant, scrollTriggerEl]);

  useFrame((state, delta) => {
    if (!group.current || !introDoneRef.current) return;
    const t = state.clock.getElapsedTime();

    if (variant === "login") {
      if (isTransitioning) {
        group.current.rotation.y += delta * 10;
        group.current.scale.lerp(new THREE.Vector3(5, 5, 5), 0.05);
        cubieRefs.current.forEach((g, i) => {
          if (!g) return;
          const base = cubies[i];
          g.position.x += base[0] * delta * 20;
          g.position.y += base[1] * delta * 20;
          g.position.z += base[2] * delta * 20;
        });
      } else {
        group.current.rotation.y += delta * 0.5;
        group.current.position.y = Math.sin(t * 1.5) * 0.15;
      }
    } else {
      // Landing page movement (Scroll scrubbed disassembly)
      const p = progressRef.current;
      const idle = Math.max(0, 1 - p * 1.4);
      spinRef.current += delta * (0.3 + idle * 0.18);

      const targetX = 0.42 + Math.sin(t * 0.9) * 0.08 * idle + p * 0.24;
      const targetY = 0.58 + spinRef.current + Math.sin(t * 0.35) * 0.04 * idle + p * 0.18;
      const targetZ = Math.sin(t * 0.7) * 0.04 * idle + p * 0.08;

      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.08);
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.08);
      group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, targetZ, 0.08);
      group.current.position.y = Math.sin(t * 1.1) * 0.06 * idle;

      cubieRefs.current.forEach((g, i) => {
        if (!g) return;
        const base = cubies[i];
        const phase = i * 0.45;
        const swirl = Math.sin(t * 1.8 + phase) * 0.025 * idle;
        const bob = Math.cos(t * 1.6 + phase) * 0.03 * idle;
        const k = 0.9 * p;
        g.position.x = base[0] * (1 + k) + swirl * (base[2] || 1);
        g.position.y = base[1] * (1 + k) + bob;
        g.position.z = base[2] * (1 + k) + swirl * (base[0] || 1);
        g.rotation.x = base[0] * p * 1.2 + Math.sin(t * 1.2 + phase) * 0.06 * idle;
        g.rotation.y = base[2] * p * 1.4 + Math.cos(t * 1.3 + phase) * 0.06 * idle;
        g.rotation.z = base[1] * p * 0.8 + Math.sin(t * 1.1 + phase) * 0.04 * idle;
      });
    }
  });

  return (
    <group ref={group}>
      {cubies.map((p, i) => (
        <Cubie key={i} basePos={p} cubieRef={(m) => (cubieRefs.current[i] = m)} />
      ))}
    </group>
  );
}

export default function BrandedRubiksCube({
  className = "",
  playIntro = true,
  onIntroComplete,
  variant = "landing",
  scrollTriggerEl,
}: {
  className?: string;
  playIntro?: boolean;
  onIntroComplete?: () => void;
  variant?: "landing" | "login";
  scrollTriggerEl?: HTMLElement | null;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className={"relative w-full h-full pointer-events-none select-none " + className}>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 blur-[100px] opacity-60"
        style={{
          background: "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.4), transparent 70%)",
        }}
      />
      {mounted && (
        <Canvas
          camera={{ position: [4, 2, 5], fov: 40 }}
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color={COLORS.burgundy} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color={COLORS.grayLight} />
          <spotLight position={[0, 5, 0]} intensity={1} angle={0.5} penumbra={1} />
          <CubeModel 
            playIntro={playIntro} 
            onIntroComplete={onIntroComplete} 
            variant={variant}
            scrollTriggerEl={scrollTriggerEl}
          />
        </Canvas>
      )}
    </div>
  );
}
