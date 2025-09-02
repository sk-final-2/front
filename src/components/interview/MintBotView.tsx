"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

// 눈 노드명 하드코딩
const EYE_LEFT_NAME = "Object_3001"; // 왼쪽 눈
const EYE_RIGHT_NAME = "Object_3003"; // 오른쪽 눈

type Props = {
  talking?: boolean;
  /** TTS onEnergy(0~1)에서 넘어온 값 */
  amp?: number;
};

/** 고정 경로: public/assets/glb/flying_robot.glb 에 배치 */
const GLB_URL = "/assets/glb/flying_robot.glb";

export default function MintBotView({ talking = false, amp = 0 }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // 렌더 루프에서 참조할 값들
  const specRef = useRef<number[]>(new Array(96).fill(0));
  const ampRef = useRef<number>(0);
  useEffect(() => {
    ampRef.current = Math.max(0, Math.min(1, amp));
  }, [amp]);

  const talkingRef = useRef<boolean>(false);
  useEffect(() => {
    talkingRef.current = talking;
  }, [talking]);

  // 깜빡임(무작위)
  const blinkRef = useRef<number>(1);
  useEffect(() => {
    let alive = true;
    (async () => {
      while (alive) {
        await new Promise((r) => setTimeout(r, 2200 + Math.random() * 1800));
        blinkRef.current = 0.08;
        await new Promise((r) => setTimeout(r, 110));
        blinkRef.current = 1;
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 🔵 amp 기반 합성 스펙트럼 생성기 (오디오 없이도 동작)
  useEffect(() => {
    const bins = 40;
    const decay = 0.86;
    specRef.current = new Array(bins).fill(0);
    const id = setInterval(() => {
      const a = ampRef.current / 3; // 0~1
      const prev = specRef.current;
      const next = prev.map((v, i) => {
        const band = i / bins;
        const tilt = band < 0.25 ? 0.9 : band > 0.8 ? 1.1 : 1.0; // 저역 살짝↓, 고역 살짝↑
        const noise =
          (Math.random() * 0.6 +
            Math.random() * 0.2 * Math.sin(Date.now() / 120 + i)) *
          a *
          tilt;
        const nv = v * decay + noise;
        return Math.max(0, Math.min(1, nv));
      });
      specRef.current = next;
    }, 50);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const el = wrapRef.current!;
    if (!el) return;

    // --- THREE 기본 세팅 ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#F3F4F6");

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    // CSS는 우리가 고정: 캔버스를 절대채움으로
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    // DPR은 리사이즈 때마다 갱신 (DevTools 토글/OS scale 대비)
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    // setSize는 updateStyle=false (CSS는 위에서 고정했으므로)
    renderer.setSize(el.clientWidth || 1, el.clientHeight || 1, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(
      40,
      Math.max(1, el.clientWidth) / Math.max(1, el.clientHeight),
      0.1,
      100,
    );
    camera.position.set(0, 0.6, 6);

    // 라이트
    const hemi = new THREE.HemisphereLight(0xe6f0ff, 0x0b1020, 1.0);
    const dir = new THREE.DirectionalLight(0xffffff, 1.1);
    dir.position.set(2, 4, 5);
    scene.add(hemi, dir);

    // 루트 그룹(로봇)
    const root = new THREE.Group();
    scene.add(root);

    /* ✅ 추가: 모델을 화면 안에 'Contain' 하도록 카메라를 자동 프레이밍 */
    const fitCameraToObject = (object: THREE.Object3D, fitOffset = 1.2) => {
      const box = new THREE.Box3().setFromObject(object);
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      const fov = THREE.MathUtils.degToRad(camera.fov);
      const dist = (sphere.radius * fitOffset) / Math.sin(fov / 2);

      camera.position.set(sphere.center.x, sphere.center.y, dist);
      camera.near = Math.max(0.01, dist / 100);
      camera.far = dist * 100;
      camera.updateProjectionMatrix();
      camera.lookAt(sphere.center);
    };

    // --- 배경 스펙트럼 (카메라 고정 풀스크린 메쉬 + CanvasTexture) ---
    const bgCanvas = document.createElement("canvas");
    const bgCtx = bgCanvas.getContext("2d", { alpha: false })!;
    const bgTex = new THREE.CanvasTexture(bgCanvas);
    bgTex.colorSpace = THREE.SRGBColorSpace;
    bgTex.minFilter = THREE.LinearFilter;
    bgTex.magFilter = THREE.LinearFilter;

    const overscan = 1.25;
    const buildBgQuad = () => {
      const d = 1;
      const h =
        2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * d * overscan;
      const w = h * camera.aspect;
      const geom = new THREE.PlaneGeometry(w, h);
      const mat = new THREE.MeshBasicMaterial({
        map: bgTex,
        depthTest: false,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.renderOrder = -1000;
      mesh.position.set(0, 0, -d);
      return mesh;
    };
    const bgMesh = buildBgQuad();
    camera.add(bgMesh);
    scene.add(camera);

    // GLB 로드(경로 고정)
    const loader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
    loader.setDRACOLoader(draco);

    let eyeL: THREE.Object3D | null = null;
    let eyeR: THREE.Object3D | null = null;

    const findByName = (root: THREE.Object3D, name?: string) => {
      if (!name) return null;
      let found: THREE.Object3D | null = null;
      root.traverse((o) => {
        if (!found && o.name === name) found = o;
      });
      return found;
    };

    const afterLoad = (model: THREE.Object3D) => {
      // ✅ 화면에 꽉 차되 잘리지 않도록 카메라 프레이밍
      root.add(model);
      fitCameraToObject(model);
      // 1) 이름 우선 매핑
      eyeL = findByName(model, EYE_LEFT_NAME);
      eyeR = findByName(model, EYE_RIGHT_NAME);

      // 2) 실패 시 폴백(eye/눈 정규식 + X좌표로 좌/우 분리)
      if (!eyeL || !eyeR) {
        const candidates: THREE.Object3D[] = [];
        model.traverse((o) => {
          if (o.name && /eye|눈/i.test(o.name)) candidates.push(o);
        });
        if (candidates.length >= 2) {
          const withX = candidates
            .map((o) => {
              const p = new THREE.Vector3();
              o.getWorldPosition(p);
              return { o, x: p.x };
            })
            .sort((a, b) => a.x - b.x);
          eyeL = eyeL || withX[0].o;
          eyeR = eyeR || withX[withX.length - 1].o;
        }
      }
    };

    loader.load(
      GLB_URL,
      (gltf) => afterLoad(gltf.scene),
      undefined,
      () => {
        // 폴백: 간단한 로봇 헤드 + 눈
        const white = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.25,
          metalness: 0.15,
        });
        const headGroup = new THREE.Group();
        const head = new THREE.Mesh(
          new THREE.SphereGeometry(1.4, 48, 48),
          white,
        );
        headGroup.add(head);
        const eyeGeom = new THREE.CircleGeometry(0.16, 32);
        const eyeMat = new THREE.MeshStandardMaterial({
          color: 0x3b82f6,
          emissive: 0x3b82f6,
          emissiveIntensity: 1.4,
        });
        const eL = new THREE.Mesh(eyeGeom, eyeMat);
        const eR = new THREE.Mesh(eyeGeom, eyeMat);
        eL.position.set(-0.5, 0.2, 1.05);
        eR.position.set(0.5, 0.2, 1.05);
        headGroup.add(eL, eR);
        root.add(headGroup);
        eyeL = eL;
        eyeR = eR;
      },
    );

    // 리사이즈 + 캔버스 리사이즈
    const resizeAll = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      // ⚠️ 레이아웃 전환 직후 0 값 방어
      if (!w || !h) return;
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      /* ✅ 추가: 사이즈/비율 바뀔 때도 자동 재프레이밍 */
      if (root.children.length > 0) {
        fitCameraToObject(root.children[0]);
      }

      const dpr = window.devicePixelRatio || 1;
      bgCanvas.width = Math.max(2, Math.floor(w * dpr * overscan));
      bgCanvas.height = Math.max(2, Math.floor(h * dpr * overscan));

      // 풀스크린 쿼드도 갱신
      const d = 1;
      const ph =
        2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * d * overscan;
      const pw = ph * camera.aspect;
      bgMesh.geometry.dispose();
      bgMesh.geometry = new THREE.PlaneGeometry(pw, ph);
      bgMesh.position.set(0, 0, -d);
    };
    const ro = new ResizeObserver(resizeAll);
    ro.observe(el);
    // DPR 변화/스크롤바 변화 등 엘리먼트 크기와 별개 상황도 케어
    window.addEventListener("resize", resizeAll);
    resizeAll();

    // 배경 그리기
    const drawBackground = (bins: number[]) => {
      const w = bgCanvas.width,
        h = bgCanvas.height;
      bgCtx.fillStyle = "#F3F4F6";
      bgCtx.fillRect(0, 0, w, h);

      const n = bins.length || 96;
      const barW = w / n;
      const padPx = Math.max(0, barW * 0.02);
      const r = Math.min(6, barW * 0.3);

      bgCtx.fillStyle = "#97fab8ff";
      for (let i = 0; i < n; i++) {
        const v = Math.min(1, Math.max(0, bins[i] ?? 0));
        const bh = (0.02 + v * 0.98) * h;
        const x = i * barW;
        const top = h - bh;
        roundRect(bgCtx, x, top, barW - padPx, bh, r);
        bgCtx.fill();
      }
    };

    function roundRect(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      rr: number,
    ) {
      const r = Math.min(rr, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    // 애니메이션 루프
    let raf = 0;
    const loop = (t: number) => {
      // 로봇 idle 모션
      root.rotation.y = Math.sin(t * 0.0008) * 0.12;
      root.position.y = 0.4 + Math.sin(t * 0.0018) * 0.08;

      // 눈: 랜덤 깜빡임
      if (eyeL && eyeR) {
        const open = blinkRef.current;
        const sYL = THREE.MathUtils.lerp(eyeL.scale.y || 1, open, 0.25);
        const sYR = THREE.MathUtils.lerp(eyeR.scale.y || 1, open, 0.25);
        eyeL.scale.set(1, sYL, 1);
        eyeR.scale.set(1, sYR, 1);
      }

      // 배경 업데이트
      drawBackground(specRef.current);
      bgTex.needsUpdate = true;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", resizeAll);
      try {
        el.removeChild(renderer.domElement);
      } catch {}
      renderer.dispose();
      try {
        bgMesh.geometry.dispose();
        (bgMesh.material as THREE.Material).dispose();
      } catch {}
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative w-full aspect-video rounded-2xl overflow-hidden"
      style={{ background: "#F3F4F6" }}
    />
  );
}
