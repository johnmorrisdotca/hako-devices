// A fine brush, drawn as a normal map in code. No picture file: the viewer makes it as a DataTexture, so no address is ever fetched.

/** Lines of a brush, as the bytes of a tangent-space normal map (RGBA, size by size). The same bytes every time. */
export function brushNormalData(size = 32): Uint8Array {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    const tilt = Math.sin((y / size) * Math.PI * 16);
    const green = 128 + Math.round(tilt * 28);
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      data[i] = 128;
      data[i + 1] = green;
      data[i + 2] = 250;
      data[i + 3] = 255;
    }
  }
  return data;
}
