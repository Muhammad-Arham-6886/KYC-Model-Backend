const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function compressFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.js', '.css', '.html'].includes(ext)) return;

  const file = fs.readFileSync(filePath);

  // gzip
  const gz = zlib.gzipSync(file, { level: 9 });
  fs.writeFileSync(filePath + '.gz', gz);

  // brotli
  if (zlib.brotliCompressSync) {
    const br = zlib.brotliCompressSync(file, {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
      },
    });
    fs.writeFileSync(filePath + '.br', br);
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else compressFile(full);
  }
}

const dist = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(dist)) {
  console.error('dist directory not found. Run `npm run build` first.');
  process.exit(1);
}

console.log('Compressing dist files (gzip + brotli)...');
walk(dist);
console.log('Compression complete.');
