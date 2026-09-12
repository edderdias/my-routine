import fs from 'node:fs';
import zlib from 'node:zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  const checksum = crc32(typeAndData);
  buf.writeUInt32BE(checksum, 8 + len);
  return buf;
}

function generatePNG(width, height) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA (6)
  ihdr[10] = 0; // Compression: 0
  ihdr[11] = 0; // Filter: 0
  ihdr[12] = 0; // Interlace: 0
  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw image data with 0 filter byte per row
  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowBytes);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // None filter
    const ny = y / height;

    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const pxOffset = rowOffset + 1 + x * 4;

      // Base squircle background: gradient from royal blue (37, 99, 235) to dark blue (15, 43, 122)
      let r = Math.round(37 * (1 - ny) + 15 * ny);
      let g = Math.round(99 * (1 - ny) + 43 * ny);
      let b = Math.round(235 * (1 - ny) + 122 * ny);
      let a = 255;

      // Check distance from center for squircle-like corner rounding (corner radius ~ 22%)
      const cx = 0.5, cy = 0.5;
      const dx = Math.abs(nx - cx);
      const dy = Math.abs(ny - cy);
      const cornerR = 0.22;
      const innerW = 0.48 - cornerR;
      const innerH = 0.48 - cornerR;

      if (dx > innerW && dy > innerH) {
        const cdx = dx - innerW;
        const cdy = dy - innerH;
        const dist = Math.sqrt(cdx * cdx + cdy * cdy);
        if (dist > cornerR) {
          a = 0; // Outside rounded squircle
        }
      }

      // White calendar sheet in center: nx 0.20..0.80, ny 0.24..0.76
      if (a > 0 && nx >= 0.20 && nx <= 0.80 && ny >= 0.24 && ny <= 0.76) {
        // Rounded card inside
        r = 255; g = 255; b = 255;

        // Calendar top header (ny 0.24..0.36)
        if (ny <= 0.36) {
          r = 37; g = 99; b = 235;
        }

        // Calendar grid points
        if (ny > 0.42 && ny < 0.70 && nx > 0.26 && nx < 0.74) {
          const col = Math.floor((nx - 0.26) / 0.16);
          const row = Math.floor((ny - 0.42) / 0.14);
          const colFrac = (nx - 0.26) % 0.16;
          const rowFrac = (ny - 0.42) % 0.14;
          if (colFrac > 0.02 && colFrac < 0.12 && rowFrac > 0.02 && rowFrac < 0.10) {
            r = 59; g = 130; b = 246; // Blue calendar cell
          }
        }
      }

      // Cyan circular checkmark badge bottom right: center around nx=0.72, ny=0.70, radius=0.18
      const badgeDx = nx - 0.72;
      const badgeDy = ny - 0.70;
      const badgeDist = Math.sqrt(badgeDx * badgeDx + badgeDy * badgeDy);
      if (badgeDist <= 0.18) {
        // Outer white border ring
        if (badgeDist >= 0.155) {
          r = 255; g = 255; b = 255; a = 255;
        } else {
          // Cyan badge gradient
          r = 6; g = 182; b = 212; a = 255;
          // Checkmark approximation
          if (
            (badgeDx >= -0.09 && badgeDx <= -0.02 && Math.abs(badgeDy - (badgeDx + 0.06)) < 0.022) ||
            (badgeDx >= -0.03 && badgeDx <= 0.09 && Math.abs(badgeDy - (-badgeDx * 0.9 + 0.02)) < 0.022)
          ) {
            r = 255; g = 255; b = 255;
          }
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const sizes = [
  { file: 'public/pwa-192x192.png', size: 192 },
  { file: 'public/pwa-512x512.png', size: 512 },
  { file: 'public/pwa-maskable-512x512.png', size: 512 },
  { file: 'public/apple-touch-icon.png', size: 180 },
];

for (const s of sizes) {
  const buf = generatePNG(s.size, s.size);
  fs.writeFileSync(s.file, buf);
  console.log(`Generated ${s.file} (${s.size}x${s.size})`);
}
