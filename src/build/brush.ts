// A fine brush, drawn as a normal map in code. No picture file.

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c;
}

const crc32 = (data: Uint8Array): number => {
  let c = 0xffffffff;
  for (const byte of data) c = crcTable[(c ^ byte) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const adler32 = (data: Uint8Array): number => {
  let a = 1;
  let b = 0;
  for (const byte of data) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }
  return (b << 16) | a;
};

/** A PNG of one RGB image, stored rather than compressed, so it needs no library. */
function png(width: number, height: number, rgb: Uint8Array): Uint8Array {
  const raw = new Uint8Array(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 3)] = 0;
    raw.set(rgb.subarray(y * width * 3, (y + 1) * width * 3), y * (1 + width * 3) + 1);
  }
  const block = new Uint8Array(2 + 5 + raw.length + 4);
  block[0] = 0x78;
  block[1] = 0x01;
  block[2] = 0x01;
  block[3] = raw.length & 255;
  block[4] = (raw.length >> 8) & 255;
  block[5] = block[3] ^ 255;
  block[6] = block[4] ^ 255;
  block.set(raw, 7);
  const sum = adler32(raw);
  const end = 7 + raw.length;
  block[end] = (sum >>> 24) & 255;
  block[end + 1] = (sum >>> 16) & 255;
  block[end + 2] = (sum >>> 8) & 255;
  block[end + 3] = sum & 255;

  const ihdr = new Uint8Array(13);
  const view = new DataView(ihdr.buffer);
  view.setUint32(0, width);
  view.setUint32(4, height);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const chunk = (type: string, data: Uint8Array) => {
    const out = new Uint8Array(12 + data.length);
    const head = new DataView(out.buffer);
    head.setUint32(0, data.length);
    out.set(new TextEncoder().encode(type), 4);
    out.set(data, 8);
    const body = out.subarray(4, 8 + data.length);
    head.setUint32(8 + data.length, crc32(body));
    return out;
  };
  const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", block), chunk("IEND", new Uint8Array())];
  const all = new Uint8Array(parts.reduce((n, part) => n + part.length, 0));
  let at = 0;
  for (const part of parts) {
    all.set(part, at);
    at += part.length;
  }
  return all;
}

/** Lines of a brush, as a tangent-space normal map. The same bytes every time. */
export function brushNormalPng(size = 32): Uint8Array {
  const rgb = new Uint8Array(size * size * 3);
  for (let y = 0; y < size; y++) {
    const tilt = Math.sin((y / size) * Math.PI * 16);
    const green = 128 + Math.round(tilt * 28);
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 3;
      rgb[i] = 128;
      rgb[i + 1] = green;
      rgb[i + 2] = 250;
    }
  }
  return png(size, size, rgb);
}
