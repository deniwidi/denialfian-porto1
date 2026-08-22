/* ══════════════════════════════════════════════════════════════
   Pembuat daftar ukuran file  ->  js/media-sizes.js
   ══════════════════════════════════════════════════════════════
   Membaca ukuran (lebar x tinggi) tiap gambar & video LANGSUNG dari
   file, lalu menyimpannya ke js/media-sizes.js. Dengan daftar ini,
   website tidak perlu mengunduh semua gambar dulu hanya untuk tahu
   bentuknya — canvas langsung tersusun benar dan terasa jauh ringan.

   CARA PAKAI (jalankan dari folder Scroll):

       node tools/gen-media-sizes.js

   Jalankan ULANG setiap kali menambah / mengganti gambar atau video.
   Kalau lupa, website tetap jalan (ukurannya diukur sendiri oleh
   browser), hanya sedikit lebih lambat saat dibuka.
   ══════════════════════════════════════════════════════════════ */

const fs = require("fs");
const path = require("path");

const IMG_DIR = path.join(__dirname, "..", "images");
const OUT = path.join(__dirname, "..", "js", "media-sizes.js");

/* ── JPEG: cari marker SOF, di situ ada tinggi & lebar ── */
function jpegSize(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i + 3 < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    // marker tanpa payload
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    if (marker === 0xd9) break;
    const len = buf.readUInt16BE(i + 2);
    const isSOF =
      marker >= 0xc0 && marker <= 0xcf &&
      marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSOF && i + 9 <= buf.length) {
      return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
    }
    i += 2 + len;
  }
  return null;
}

/* ── PNG: lebar & tinggi ada di header IHDR ── */
function pngSize(buf) {
  if (buf.length < 24) return null;
  if (buf.readUInt32BE(0) !== 0x89504e47) return null;
  return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
}

/* ── MP4: telusuri box moov > trak > tkhd ── */
function mp4Size(buf) {
  function walk(start, end) {
    let p = start;
    while (p + 8 <= end) {
      let size = buf.readUInt32BE(p);
      const type = buf.toString("latin1", p + 4, p + 8);
      let hdr = 8;
      if (size === 1) {
        if (p + 16 > end) break;
        size = Number(buf.readBigUInt64BE(p + 8));
        hdr = 16;
      }
      if (size === 0) size = end - p;
      if (size < hdr || p + size > end) break;

      if (type === "moov" || type === "trak") {
        const found = walk(p + hdr, p + size);
        if (found) return found;
      } else if (type === "tkhd") {
        const version = buf[p + hdr];
        let off = p + hdr + 4; // version (1) + flags (3)
        off += version === 1 ? 8 + 8 + 4 + 4 + 8 : 4 + 4 + 4 + 4 + 4;
        off += 8 + 2 + 2 + 2 + 2; // reserved, layer, altGroup, volume, reserved
        if (off + 36 + 8 > end) { p += size; continue; }
        const m = [];
        for (let k = 0; k < 9; k++) m.push(buf.readInt32BE(off + k * 4));
        off += 36;
        let w = buf.readUInt32BE(off) / 65536;
        let h = buf.readUInt32BE(off + 4) / 65536;
        // video yang direkam miring 90/270 derajat -> tukar lebar & tinggi
        if (m[0] === 0 && m[4] === 0 && (m[1] !== 0 || m[3] !== 0)) {
          const t = w; w = h; h = t;
        }
        if (w > 0 && h > 0) return [Math.round(w), Math.round(h)];
      }
      p += size;
    }
    return null;
  }
  return walk(0, buf.length);
}

function sizeOf(file) {
  const ext = path.extname(file).toLowerCase();
  const buf = fs.readFileSync(path.join(IMG_DIR, file));
  if (ext === ".jpg" || ext === ".jpeg") return jpegSize(buf);
  if (ext === ".png") return pngSize(buf);
  if (ext === ".mp4") return mp4Size(buf);
  return null;
}

const files = fs
  .readdirSync(IMG_DIR)
  .filter((f) => /\.(jpe?g|png|mp4)$/i.test(f))
  .sort();

const sizes = {};
const alias = {};   // nama .jpg yang diminta website -> nama file sebenarnya
let ok = 0;
const failed = [];

files.forEach((f) => {
  let wh = null;
  try {
    wh = sizeOf(f);
  } catch (e) {
    wh = null;
  }
  if (!wh) { failed.push(f); return; }
  ok++;
  sizes["images/" + f] = wh;
  /* Website menyusun nama file sebagai .jpg. Untuk karya yang
     sebenarnya .png, catat penggantinya supaya browser langsung
     meminta file yang benar (tidak ada percobaan gagal / 404). */
  if (/\.png$/i.test(f)) {
    const asJpg = "images/" + f.replace(/\.png$/i, ".jpg");
    if (!fs.existsSync(path.join(IMG_DIR, f.replace(/\.png$/i, ".jpg")))) {
      alias[asJpg] = "images/" + f;
      sizes[asJpg] = wh;
    }
  }
});

function dump(obj, fmt) {
  return Object.keys(obj)
    .sort()
    .map((k) => '  "' + k + '": ' + fmt(obj[k]))
    .join(",\n");
}

const body =
  "/* DIBUAT OTOMATIS oleh tools/gen-media-sizes.js — jangan diedit tangan.\n" +
  "   Jalankan ulang:  node tools/gen-media-sizes.js  */\n" +
  "window.MEDIA_SIZES = {\n" +
  dump(sizes, (v) => "[" + v[0] + ", " + v[1] + "]") +
  "\n};\n" +
  "window.MEDIA_ALIAS = {\n" +
  dump(alias, (v) => '"' + v + '"') +
  "\n};\n";

fs.writeFileSync(OUT, body, "utf8");

console.log("Terbaca : " + ok + " dari " + files.length + " file");
if (failed.length) console.log("Gagal   : " + failed.join(", "));
console.log("Alias   : " + Object.keys(alias).length + " file .png");
console.log("Ditulis : js/media-sizes.js");
