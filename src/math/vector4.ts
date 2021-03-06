export type Vector4 = [x: number, y: number, z: number, w: number];

export function set(out: Vector4, x: number, y: number, z: number, w: number) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}

export function copy(out: Vector4, a: Vector4) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}

export function add(out: Vector4, a: Vector4, b: Vector4) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  return out;
}

export function subtract(out: Vector4, a: Vector4, b: Vector4) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  return out;
}

export function scale(out: Vector4, a: Vector4, b: number) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  return out;
}
