/* ══════════════════════════════════════════════════════════════
   Pembuat versi kecil gambar  ->  images/thumbs/
   ══════════════════════════════════════════════════════════════
   Gambar asli berukuran besar (1900px, ratusan KB) padahal di canvas
   hanya ditampilkan selebar 150-430px. Script ini membuat salinan
   kecilnya, jadi beranda jauh lebih cepat dibuka — terutama di HP.

   Gambar ASLI tetap dipakai saat karya diklik (tampilan besar).

   CARA PAKAI (jalankan dari folder Scroll):

       node tools/make-thumbs.js

   Jalankan ULANG setiap kali menambah / mengganti gambar.
   ══════════════════════════════════════════════════════════════ */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const IMG = path.join(__dirname, "..", "images");
const OUT = path.join(IMG, "thumbs");
const MAX_W = 800;      // cukup tajam walau di layar retina
const QUALITY = 74;

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const files = fs.readdirSync(IMG).filter((f) => /\.(jpe?g|png)$/i.test(f));

let before = 0, after = 0, made = 0;

(async () => {
  for (const f of files) {
    const src = path.join(IMG, f);
    const base = f.replace(/\.(jpe?g|png)$/i, "");
    const dstJpg = path.join(OUT, base + ".jpg");
    const dstWebp = path.join(OUT, base + ".webp");
    try {
      const meta = await sharp(src).metadata();
      const w = Math.min(meta.width || MAX_W, MAX_W);
      await sharp(src).resize({ width: w }).jpeg({ quality: QUALITY, mozjpeg: true }).toFile(dstJpg);
      await sharp(src).resize({ width: w }).webp({ quality: QUALITY }).toFile(dstWebp);
      before += fs.statSync(src).size;
      after += fs.statSync(dstWebp).size;
      made++;
    } catch (e) {
      console.log("  gagal: " + f + " (" + e.message + ")");
    }
  }
  const mb = (n) => (n / 1024 / 1024).toFixed(1) + " MB";
  console.log("Dibuat  : " + made + " gambar kecil (maks " + MAX_W + "px)");
  console.log("Ukuran  : " + mb(before) + "  ->  " + mb(after));
  console.log("Hemat   : " + Math.round((1 - after / before) * 100) + "%");
})();
