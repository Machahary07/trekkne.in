/**
 * Phone-captured 360 scenes.
 *
 * Capture: the app fuses gyroscope + gravity into an orientation quaternion (device → world),
 * guides the Ranger to a grid of target directions and stores each photo with its quaternion.
 * View: each photo is placed on a sphere by that quaternion (no server-side stitching), with
 * feathered edges so overlaps blend. Same data renders in the CRM, the website and the app.
 *
 * Frames
 *   device: x right, y up (top of phone), z out of the screen towards the user. Back camera looks along -z.
 *   world:  X right (east at start), Y forward (initial camera heading), Z up.
 */

export type Vec3 = [number, number, number];
/** [x, y, z, w] */
export type Quat = [number, number, number, number];

export interface PanoramaFrame {
  i: number;
  path: string;
  q: Quat;
}

export const DEFAULT_FOV = { hfov: 53, vfov: 67 } as const; // typical main camera, portrait, 4:3

// ---------- vector / quaternion helpers ----------
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

export function quatMul(a: Quat, b: Quat): Quat {
  const [ax, ay, az, aw] = a;
  const [bx, by, bz, bw] = b;
  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz,
  ];
}

export function quatNormalize(q: Quat): Quat {
  const l = Math.hypot(q[0], q[1], q[2], q[3]) || 1;
  return [q[0] / l, q[1] / l, q[2] / l, q[3] / l];
}

/** Rotate v by q (device → world when q is the device orientation). */
export function rotate(q: Quat, v: Vec3): Vec3 {
  const [x, y, z, w] = q;
  const u: Vec3 = [x, y, z];
  const t = cross(u, v).map((n) => 2 * n) as Vec3;
  const ut = cross(u, t);
  return [v[0] + w * t[0] + ut[0], v[1] + w * t[1] + ut[1], v[2] + w * t[2] + ut[2]];
}

export const conjugate = (q: Quat): Quat => [-q[0], -q[1], -q[2], q[3]];

/** Quaternion from a rotation matrix given as rows (world axes expressed in device coords). */
function quatFromRows(r: [Vec3, Vec3, Vec3]): Quat {
  const [m00, m01, m02] = r[0];
  const [m10, m11, m12] = r[1];
  const [m20, m21, m22] = r[2];
  const tr = m00 + m11 + m22;
  let q: Quat;
  if (tr > 0) {
    const s = Math.sqrt(tr + 1) * 2;
    q = [(m21 - m12) / s, (m02 - m20) / s, (m10 - m01) / s, 0.25 * s];
  } else if (m00 > m11 && m00 > m22) {
    const s = Math.sqrt(1 + m00 - m11 - m22) * 2;
    q = [0.25 * s, (m01 + m10) / s, (m02 + m20) / s, (m21 - m12) / s];
  } else if (m11 > m22) {
    const s = Math.sqrt(1 + m11 - m00 - m22) * 2;
    q = [(m01 + m10) / s, 0.25 * s, (m12 + m21) / s, (m02 - m20) / s];
  } else {
    const s = Math.sqrt(1 + m22 - m00 - m11) * 2;
    q = [(m02 + m20) / s, (m12 + m21) / s, 0.25 * s, (m10 - m01) / s];
  }
  return quatNormalize(q);
}

/**
 * Initial orientation from gravity only, with the current camera heading defined as yaw 0.
 * `up` is the world-up direction measured in device coordinates.
 */
export function orientationFromUp(upDevice: Vec3): Quat {
  const Z = norm(upDevice);
  const camera: Vec3 = [0, 0, -1];
  let Y = norm([camera[0] - dot(camera, Z) * Z[0], camera[1] - dot(camera, Z) * Z[1], camera[2] - dot(camera, Z) * Z[2]]);
  if (!Number.isFinite(Y[0]) || Math.abs(dot(camera, Z)) > 0.98) Y = norm(cross(Z, [1, 0, 0]));
  const X = cross(Y, Z);
  return quatFromRows([X, Y, Z]);
}

/**
 * Mahony-style complementary filter: integrates the gyroscope, pulls tilt towards measured gravity.
 * gyro: rad/s in device axes. up: measured world-up in device axes (any length). dt: seconds.
 */
export function fuse(q: Quat, gyro: Vec3, up: Vec3, dt: number, kp = 2.0): Quat {
  const measured = norm(up);
  const estimated = rotate(conjugate(q), [0, 0, 1]);
  const e = cross(measured, estimated);
  const w: Vec3 = [gyro[0] + kp * e[0], gyro[1] + kp * e[1], gyro[2] + kp * e[2]];
  const dq = quatMul(q, [w[0], w[1], w[2], 0]);
  return quatNormalize([q[0] + 0.5 * dq[0] * dt, q[1] + 0.5 * dq[1] * dt, q[2] + 0.5 * dq[2] * dt, q[3] + 0.5 * dq[3] * dt]);
}

// ---------- capture guidance ----------
export const deg = (r: number) => (r * 180) / Math.PI;
export const rad = (d: number) => (d * Math.PI) / 180;

export function directionOf(yawDeg: number, pitchDeg: number): Vec3 {
  const y = rad(yawDeg);
  const p = rad(pitchDeg);
  return [Math.cos(p) * Math.sin(y), Math.cos(p) * Math.cos(y), Math.sin(p)];
}

/** Camera heading, elevation and roll (degrees) for an orientation. */
export function cameraPose(q: Quat) {
  const d = rotate(q, [0, 0, -1]);
  const up = rotate(q, [0, 1, 0]);
  const yaw = deg(Math.atan2(d[0], d[1]));
  const pitch = deg(Math.asin(Math.max(-1, Math.min(1, d[2]))));
  // Roll: angle between the phone's top edge and the vertical plane through the view direction.
  const right = norm(cross(d, [0, 0, 1]));
  const roll = Number.isFinite(right[0]) ? deg(Math.asin(Math.max(-1, Math.min(1, -dot(up, right))))) : 0;
  return { yaw, pitch, roll, dir: d };
}

export interface CaptureTarget {
  id: string;
  yaw: number;
  pitch: number;
}

/** Quick = one horizon ring. Full = three rings + zenith (sphere minus the ground under the phone). */
export function captureTargets(mode: "quick" | "full"): CaptureTarget[] {
  const ring = (pitch: number, count: number) =>
    Array.from({ length: count }, (_, k) => ({ id: `${pitch}:${k}`, yaw: (360 / count) * k, pitch }));
  if (mode === "quick") return ring(0, 12);
  return [...ring(0, 12), ...ring(42, 8), ...ring(-42, 8), { id: "85:0", yaw: 0, pitch: 85 }];
}

/** Angle in degrees between the camera direction and a target. */
export function angleTo(q: Quat, t: CaptureTarget) {
  const d = rotate(q, [0, 0, -1]);
  return deg(Math.acos(Math.max(-1, Math.min(1, dot(d, directionOf(t.yaw, t.pitch))))));
}

/**
 * Where a target appears on a preview of size w×h showing the camera's full FOV.
 * Returns null when it is behind the camera.
 */
export function projectTarget(q: Quat, t: CaptureTarget, w: number, h: number, fov = DEFAULT_FOV) {
  const v = rotate(conjugate(q), directionOf(t.yaw, t.pitch));
  if (v[2] >= -0.05) return null;
  const x = v[0] / -v[2] / Math.tan(rad(fov.hfov) / 2);
  const y = v[1] / -v[2] / Math.tan(rad(fov.vfov) / 2);
  return { x: w / 2 + (x * w) / 2, y: h / 2 - (y * h) / 2, inView: Math.abs(x) <= 1 && Math.abs(y) <= 1 };
}

/** World (X right, Y forward, Z up) → three.js (x right, y up, z towards viewer): rotate -90° about X. */
export const WORLD_TO_THREE: Quat = [-Math.SQRT1_2, 0, 0, Math.SQRT1_2];
