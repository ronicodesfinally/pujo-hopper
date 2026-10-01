const sharp = require('sharp');
const fs = require('fs');

async function processImage() {
  const inputPath = '/Users/raunakghosal/.gemini/antigravity/brain/aa9865dd-c24f-4aa8-be80-feedcd397b27/.user_uploaded/media_1790855753868.png';
  const outputPath = '/Users/raunakghosal/.gemini/antigravity/scratch/pujo-hopper/public/icons/dhaak.png';

  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const width = metadata.width;
  const height = metadata.height;

  // Extract raw RGBA
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  console.log(`Image size: ${width}x${height}, channels: ${info.channels}`);

  // Create visited / background mask
  const isBg = new Uint8Array(width * height);
  const queue = [];

  // Check if a pixel is "white/near-white background"
  function isWhiteLike(idx) {
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    // Background is near white/light grey (check R, G, B > 230 and difference between channels is small)
    return r > 220 && g > 220 && b > 220 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20;
  }

  // Seed flood fill from all perimeter pixels
  for (let x = 0; x < width; x++) {
    // top edge
    let idxTop = (0 * width + x) * 4;
    if (isWhiteLike(idxTop)) {
      isBg[0 * width + x] = 1;
      queue.push(x, 0);
    }
    // bottom edge
    let idxBot = ((height - 1) * width + x) * 4;
    if (isWhiteLike(idxBot)) {
      isBg[(height - 1) * width + x] = 1;
      queue.push(x, height - 1);
    }
  }

  for (let y = 0; y < height; y++) {
    // left edge
    let idxLeft = (y * width + 0) * 4;
    if (isWhiteLike(idxLeft) && !isBg[y * width + 0]) {
      isBg[y * width + 0] = 1;
      queue.push(0, y);
    }
    // right edge
    let idxRight = (y * width + (width - 1)) * 4;
    if (isWhiteLike(idxRight) && !isBg[y * width + (width - 1)]) {
      isBg[y * width + (width - 1)] = 1;
      queue.push(width - 1, y);
    }
  }

  // BFS Flood Fill
  let head = 0;
  const dirs = [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [-1, -1], [1, -1], [-1, 1]
  ];

  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];

    for (const [dx, dy] of dirs) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const npos = ny * width + nx;
        if (!isBg[npos]) {
          const nidx = npos * 4;
          if (isWhiteLike(nidx)) {
            isBg[npos] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  // Set alpha = 0 for all background pixels
  let removedCount = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pos = y * width + x;
      if (isBg[pos]) {
        data[pos * 4 + 3] = 0;
        removedCount++;
      }
    }
  }

  console.log(`Flood-fill removed ${removedCount} background pixels out of ${width * height} (${Math.round(removedCount / (width * height) * 100)}%)`);

  // Ensure public/icons directory exists
  if (!fs.existsSync('/Users/raunakghosal/.gemini/antigravity/scratch/pujo-hopper/public/icons')) {
    fs.mkdirSync('/Users/raunakghosal/.gemini/antigravity/scratch/pujo-hopper/public/icons', { recursive: true });
  }

  // Save trimmed transparent PNG
  await sharp(data, {
    raw: {
      width,
      height,
      channels: 4
    }
  })
  .trim() // automatically trim extra empty transparent margins
  .png()
  .toFile(outputPath);

  console.log('Saved transparent dhaak icon to:', outputPath);
}

processImage().catch(console.error);
