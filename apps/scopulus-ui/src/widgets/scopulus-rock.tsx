"use client";

import { useEffect, useRef, useState } from "react";

import { ScopulusMark } from "./scopulus-mark";

/**
 * ScopulusUI 의 3D 암체. 마크 아티팩트에 있던 코드를 그대로 옮겼다.
 *
 * 시드 `20260911`, 같은 permutation 표, 같은 fbm, 구면에 흩은 크레이터 42개,
 * 아이코사헤드론 12,500면, 광원 넷, 붉은 정점색만 스스로 빛나는 셰이더 주입까지 같다.
 * **같은 시드는 언제나 같은 암체를 낸다.**
 *
 * three 는 `useEffect` 안에서 동적으로 받는다. 정적으로 import 하면 랜딩의 첫 로드에
 * 라이브러리가 통째로 들어가는데, 이 도형은 화면에 뜬 뒤에 나타나도 된다.
 *
 * **왜 암체인가:** scopulus 는 IAU 행성 지형 명명 용어다. 행성 표면의 불규칙하고 들쭉날쭉한
 * 절벽을 가리키며 화성·금성 지도에 쓰인다. 붉게 빛나는 자리가 그 지형이다.
 * 납작한 마크는 `scopulus-mark.tsx`, favicon 은 `app/icon.svg` 에 따로 있다.
 */
export function ScopulusRock({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  // WebGL 이 없으면 납작한 마크를 대신 보여 준다. 빈 상자를 남기지 않는다.
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const THREE = await import("three");
      if (disposed) return;

      function mulberry32(a: number) {
        return function () {
          a |= 0;
          a = (a + 0x6d2b79f5) | 0;
          let t = Math.imul(a ^ (a >>> 15), 1 | a);
          t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
      }
      const rand = mulberry32(20260911);

      const P = new Uint8Array(512);
      {
        const p = Array.from({ length: 256 }, (_, i) => i);
        for (let i = 255; i > 0; i--) {
          const j = Math.floor(rand() * (i + 1));
          const tmp = p[i];
          p[i] = p[j];
          p[j] = tmp;
        }
        for (let i = 0; i < 512; i++) P[i] = p[i & 255];
      }
      const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      const hash = (x: number, y: number, z: number) =>
        (P[(P[(P[x & 255] + y) & 255] + z) & 255] / 255) * 2 - 1;

      function noise(x: number, y: number, z: number) {
        const X = Math.floor(x);
        const Y = Math.floor(y);
        const Z = Math.floor(z);
        const xf = x - X;
        const yf = y - Y;
        const zf = z - Z;
        const u = fade(xf);
        const v = fade(yf);
        const w = fade(zf);
        const c = (i: number, j: number, k: number) =>
          hash(X + i, Y + j, Z + k);
        return lerp(
          lerp(
            lerp(c(0, 0, 0), c(1, 0, 0), u),
            lerp(c(0, 1, 0), c(1, 1, 0), u),
            v,
          ),
          lerp(
            lerp(c(0, 0, 1), c(1, 0, 1), u),
            lerp(c(0, 1, 1), c(1, 1, 1), u),
            v,
          ),
          w,
        );
      }

      function fbm(x: number, y: number, z: number) {
        let sum = 0;
        let amp = 1;
        let f = 1;
        for (let i = 0; i < 5; i++) {
          // 옥타브마다 회전 — 안 하면 value noise 의 축정렬 격자가 표면에 드러난다
          const a = 0.87 * i;
          const ca = Math.cos(a);
          const sa = Math.sin(a);
          const rx = x * ca - z * sa;
          const rz = x * sa + z * ca;
          const ry = y * ca - rz * sa * 0.35;
          sum +=
            noise(rx * f + i * 13.7, ry * f + i * 7.3, rz * f + i * 19.1) * amp;
          amp *= 0.5;
          f *= 2.07;
        }
        return sum;
      }

      const GOLDEN = Math.PI * (3 - Math.sqrt(5));
      const PITS: {
        dir: InstanceType<typeof THREE.Vector3>;
        radius: number;
        depth: number;
        glow: boolean;
      }[] = [];
      const N = 42;
      for (let i = 0; i < N; i++) {
        const y = 1 - (i / (N - 1)) * 2;
        const rr = Math.sqrt(Math.max(0, 1 - y * y));
        const th = GOLDEN * i + rand() * 0.5;
        const dir = new THREE.Vector3(
          Math.cos(th) * rr,
          y,
          Math.sin(th) * rr,
        ).normalize();
        const big = i % 11 === 3;
        const radius = big ? 0.22 + rand() * 0.1 : 0.055 + rand() * 0.075;
        PITS.push({
          dir,
          radius,
          depth: radius * (big ? 0.6 : 0.5),
          glow: big || rand() < 0.11,
        });
      }

      const geo = new THREE.IcosahedronGeometry(1, 24);
      const pos = geo.attributes.position;
      const colors = new Float32Array(pos.count * 3);
      const v = new THREE.Vector3();
      const ROCK_DARK = new THREE.Color("#2E353B");
      const ROCK_LIT = new THREE.Color("#A8B0B6");
      const PIT = new THREE.Color("#0E1114");
      const EMBER = new THREE.Color("#FF2334");

      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).normalize();
        let r =
          1 +
          fbm(v.x * 1.9, v.y * 1.9, v.z * 1.9) * 0.13 +
          fbm(v.x * 5.9, v.y * 5.9, v.z * 5.9) * 0.03 +
          fbm(v.x * 13.1, v.y * 13.1, v.z * 13.1) * 0.006;
        let glow = 0;
        let floor = 0;
        for (let k = 0; k < PITS.length; k++) {
          const c = PITS[k];
          const d = Math.acos(Math.min(1, Math.max(-1, v.dot(c.dir))));
          if (d < c.radius) {
            const t = d / c.radius;
            const bowl = Math.pow(1 - t * t, 0.55); // 가파른 사면에 평평한 바닥
            r -= c.depth * bowl;
            floor = Math.max(floor, bowl);
            if (c.glow) glow = Math.max(glow, Math.pow(1 - t * t, 2.2));
          } else if (d < c.radius * 1.26) {
            const t = (d - c.radius) / (c.radius * 0.26);
            r += c.depth * 0.46 * Math.sin((1 - t) * Math.PI); // 림 융기
          }
        }
        pos.setXYZ(i, v.x * r, v.y * r, v.z * r);

        const grain = (fbm(v.x * 9, v.y * 9, v.z * 9) + 1) * 0.5;
        const col = ROCK_DARK.clone().lerp(ROCK_LIT, grain * 0.85);
        col.lerp(PIT, Math.pow(floor, 0.8) * 0.78);
        if (glow > 0) col.lerp(EMBER, Math.pow(glow, 1.15));
        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
      }
      geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      geo.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.94,
        metalness: 0.04,
        flatShading: true,
      });
      // 붉은 정점색만 스스로 빛나게 한다 — emissiveMap 없이 정점 단위 발광을 얻는 길
      mat.onBeforeCompile = (shader) => {
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <emissivemap_fragment>",
          "#include <emissivemap_fragment>\n" +
            "float ember = clamp((vColor.r - max(vColor.g, vColor.b)) * 2.6, 0.0, 1.0);\n" +
            "totalEmissiveRadiance += vec3(1.0, 0.10, 0.14) * ember * 1.6;",
        );
      };

      const rock = new THREE.Mesh(geo, mat);
      rock.rotation.set(0.38, 0.6, 0.12);
      const scene = new THREE.Scene();
      scene.add(rock);
      scene.add(new THREE.AmbientLight(0x3c434a, 1.0));
      const key = new THREE.DirectionalLight(0xfff7f2, 2.9);
      key.position.set(-3.2, 3.4, 2.6);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x9fb6c8, 0.75);
      rim.position.set(3.4, -1.4, -2.6);
      scene.add(rim);
      const pl = new THREE.PointLight(0xff2a3c, 0.45, 5, 2);
      pl.position.set(-0.4, 0.3, 1.9);
      scene.add(pl);

      const cam = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
      cam.position.set(0, 0, 5.15);

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        setFailed(true);
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const size = () => {
        const w = host.clientWidth || 380;
        renderer.setSize(w, w, false);
      };
      size();
      const canvas = renderer.domElement;
      canvas.className = "block h-full w-full";
      canvas.setAttribute("role", "img");
      canvas.setAttribute(
        "aria-label",
        "ScopulusUI 암체. 크레이터가 패고 붉게 빛나는 자리가 있다. 드래그해 돌린다.",
      );
      host.appendChild(canvas);
      const ro = new ResizeObserver(size);
      ro.observe(host);

      // 드래그로 돌린다
      let dragging = false;
      let lastX = 0;
      let lastY = 0;
      let spin = 0.6;
      let tilt = 0.38;
      const vel = 0.0024;
      const still = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const onDown = (e: PointerEvent) => {
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        host.setPointerCapture(e.pointerId);
      };
      const onMove = (e: PointerEvent) => {
        if (!dragging) return;
        spin += (e.clientX - lastX) * 0.007;
        tilt = Math.max(
          -1.2,
          Math.min(1.2, tilt + (e.clientY - lastY) * 0.006),
        );
        lastX = e.clientX;
        lastY = e.clientY;
      };
      const stop = (e: PointerEvent) => {
        dragging = false;
        if (e.pointerId != null && host.hasPointerCapture(e.pointerId))
          host.releasePointerCapture(e.pointerId);
      };
      host.addEventListener("pointerdown", onDown);
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerup", stop);
      host.addEventListener("pointercancel", stop);

      let raf = 0;
      const loop = () => {
        raf = requestAnimationFrame(loop);
        if (!dragging && !still) spin += vel;
        rock.rotation.y = spin;
        rock.rotation.x = tilt;
        renderer.render(scene, cam);
      };
      loop();

      // 화면 밖으로 나가면 멈춘다. 다른 자리를 보는 동안 GPU 를 계속 쓸 이유가 없다.
      const io = new IntersectionObserver(([e]) => {
        cancelAnimationFrame(raf);
        if (e.isIntersecting) loop();
      });
      io.observe(host);

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        host.removeEventListener("pointerdown", onDown);
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerup", stop);
        host.removeEventListener("pointercancel", stop);
        canvas.remove();
        geo.dispose();
        mat.dispose();
        renderer.dispose();
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  if (failed) return <ScopulusMark className={className} />;

  return (
    <div
      ref={hostRef}
      className={`${className ?? ""} cursor-grab touch-pan-y active:cursor-grabbing`}
    />
  );
}
