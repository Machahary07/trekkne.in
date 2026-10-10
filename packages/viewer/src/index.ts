import * as THREE from "three";
import { DEFAULT_FOV, WORLD_TO_THREE, type Quat } from "@trekne/db";

export interface ViewerFrame {
  url: string;
  q: Quat;
}

export interface ViewerOptions {
  hfov?: number;
  vfov?: number;
  background?: string;
  /** Called once every frame texture has loaded or failed. */
  onReady?: (loaded: number, failed: number) => void;
}

const RADIUS = 10;

/** Soft-edged alpha mask so overlapping photos blend instead of showing hard seams. */
function featherMask(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  const edge = 0.14;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / (size - 1);
      const v = y / (size - 1);
      const fx = Math.min(1, Math.min(u, 1 - u) / edge);
      const fy = Math.min(1, Math.min(v, 1 - v) / edge);
      const a = Math.round(255 * fx * fy);
      const i = (y * size + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = a;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Mounts an interactive 360 view into `container`: drag to look around, wheel / pinch to zoom.
 * Each frame is a photo placed on a sphere by the device orientation it was captured with.
 */
export function mountPanorama(container: HTMLElement, frames: ViewerFrame[], opts: ViewerOptions = {}) {
  const hfov = opts.hfov ?? DEFAULT_FOV.hfov;
  const vfov = opts.vfov ?? DEFAULT_FOV.vfov;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);
  renderer.domElement.style.display = "block";
  renderer.domElement.style.touchAction = "none";
  renderer.domElement.style.cursor = "grab";

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(opts.background ?? "#10131F");
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
  camera.rotation.order = "YXZ";

  const mask = featherMask();
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");
  const toThree = new THREE.Quaternion(...WORLD_TO_THREE);
  const width = 2 * RADIUS * Math.tan(THREE.MathUtils.degToRad(hfov) / 2);
  const height = 2 * RADIUS * Math.tan(THREE.MathUtils.degToRad(vfov) / 2);
  const geometry = new THREE.PlaneGeometry(width, height);
  const disposables: { dispose(): void }[] = [geometry, mask];

  let loaded = 0;
  let failed = 0;
  const settle = () => {
    if (loaded + failed === frames.length) opts.onReady?.(loaded, failed);
    invalidate();
  };

  frames.forEach((f, i) => {
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      alphaMap: mask,
      depthWrite: false,
      side: THREE.DoubleSide,
      opacity: 0,
    });
    disposables.push(material);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, -RADIUS);
    mesh.renderOrder = i;
    const holder = new THREE.Object3D();
    holder.quaternion.copy(toThree).multiply(new THREE.Quaternion(...f.q));
    holder.add(mesh);
    scene.add(holder);
    loader.load(
      f.url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        material.map = tex;
        material.opacity = 1;
        material.needsUpdate = true;
        disposables.push(tex);
        loaded++;
        settle();
      },
      undefined,
      () => {
        failed++;
        settle();
      },
    );
  });
  if (frames.length === 0) opts.onReady?.(0, 0);

  // ---------- look controls ----------
  let lon = 0;
  let lat = 0;
  let fov = 75;
  const pointers = new Map<number, { x: number; y: number }>();
  let pinchStart = 0;
  let fovStart = fov;

  const apply = () => {
    lat = Math.max(-89, Math.min(89, lat));
    camera.rotation.set(THREE.MathUtils.degToRad(lat), THREE.MathUtils.degToRad(lon), 0);
    camera.fov = fov;
    camera.updateProjectionMatrix();
    invalidate();
  };

  const onDown = (e: PointerEvent) => {
    renderer.domElement.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    renderer.domElement.style.cursor = "grabbing";
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchStart = Math.hypot(a.x - b.x, a.y - b.y);
      fovStart = fov;
    }
  };
  const onMove = (e: PointerEvent) => {
    const prev = pointers.get(e.pointerId);
    if (!prev) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchStart > 0) fov = Math.max(30, Math.min(100, (fovStart * pinchStart) / d));
    } else {
      const k = fov / container.clientHeight;
      lon += (e.clientX - prev.x) * k;
      lat += (e.clientY - prev.y) * k;
    }
    apply();
  };
  const onUp = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchStart = 0;
    if (pointers.size === 0) renderer.domElement.style.cursor = "grab";
  };
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    fov = Math.max(30, Math.min(100, fov + e.deltaY * 0.05));
    apply();
  };
  const el = renderer.domElement;
  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", onUp);
  el.addEventListener("pointercancel", onUp);
  el.addEventListener("wheel", onWheel, { passive: false });

  // ---------- sizing + on-demand rendering ----------
  let raf = 0;
  function invalidate() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      renderer.render(scene, camera);
    });
  }
  const resize = () => {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    invalidate();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();
  apply();

  return {
    /** Look in a direction (degrees, world yaw / pitch). */
    look(yaw: number, pitch: number) {
      lon = -yaw;
      lat = pitch;
      apply();
    },
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("wheel", onWheel);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      el.remove();
    },
  };
}
