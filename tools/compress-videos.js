/* ══════════════════════════════════════════════════════════════
   Pengecil video  ->  images/*.mp4  (720p, siap streaming)
   ══════════════════════════════════════════════════════════════
   Video mentah dari kamera/editor bisa 10 MB lebih per klip. Di
   canvas ukurannya cuma beberapa ratus piksel, jadi sangat boros.
   Script ini mengecilkannya ke 720p dan menaruh "moov atom" di awal
   file (faststart) supaya video mulai jalan tanpa menunggu seluruh
   file terunduh.

   File ASLI dipindahkan ke folder  video-original/  (tidak ikut
   ter-deploy), jadi tetap aman kalau sewaktu-waktu dibutuhkan.

   Sekalian dibuatkan POSTER (gambar frame pertama) supaya tile
   langsung menampilkan gambar sebelum videonya selesai dimuat.

   CARA PAKAI (jalankan dari folder Scroll):

       node tools/compress-videos.js

   Jalankan ULANG setiap kali menambah / mengganti video.
   ══════════════════════════════════════════════════════════════ */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const ffmpeg = require("ffmpeg-static");

const IMG = path.join(__dirname, "..", "images");
const THUMBS = path.join(IMG, "thumbs");
const BACKUP = path.join(__dirname, "..", "..", "video-original");

const MAX_H = 1280;      // tinggi maksimal (video tegak 720x1280)
const CRF = 28;          // makin besar makin kecil filenya
const TARGET_KB = 400;   // di bawah ini dianggap sudah kecil

if (!fs.existsSync(THUMBS)) fs.mkdirSync(THUMBS, { recursive: true });
if (!fs.existsSync(BACKUP)) fs.mkdirSync(BACKUP, { recursive: true });

const files = fs.readdirSync(IMG).filter((f) => /\.mp4$/i.test(f)).sort();

let before = 0, after = 0, done = 0, skipped = 0;

for (const f of files) {
  const src = path.join(IMG, f);
  const size = fs.statSync(src).size;
  const base = f.replace(/\.mp4$/i, "");
  const tmp = path.join(IMG, base + ".__tmp.mp4");

  // sudah kecil -> lewati kompresnya, tapi posternya tetap dibuat
  if (size / 1024 < TARGET_KB * 3) {
    const poster = path.join(THUMBS, base + ".jpg");
    if (!fs.existsSync(poster)) {
      try {
        execFileSync(ffmpeg, [
          "-y", "-i", src, "-ss", "0.5", "-frames:v", "1",
          "-vf", "scale=800:-2", poster,
        ], { stdio: "pipe" });
      } catch (e) { /* biarkan, tile tetap tampil tanpa poster */ }
    }
    console.log("  lewati (sudah kecil): " + f);
    skipped++;
    continue;
  }

  try {
    execFileSync(ffmpeg, [
      "-y", "-i", src,
      "-vf", "scale='trunc(oh*a/2)*2':'min(" + MAX_H + ",ih)'",
      "-c:v", "libx264", "-crf", String(CRF), "-preset", "veryfast",
      "-profile:v", "main", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "64k",
      "-movflags", "+faststart",
      tmp,
    ], { stdio: "pipe" });

    // poster: ambil frame di detik ke-0.5
    execFileSync(ffmpeg, [
      "-y", "-i", tmp, "-ss", "0.5", "-frames:v", "1",
      "-vf", "scale=800:-2",
      path.join(THUMBS, base + ".jpg"),
    ], { stdio: "pipe" });

    fs.renameSync(src, path.join(BACKUP, f));   // simpan aslinya
    fs.renameSync(tmp, src);                     // pakai versi kecil

    before += size;
    after += fs.statSync(src).size;
    done++;
    console.log("  " + f + ": " + (size / 1048576).toFixed(1) + " MB -> " +
                (fs.statSync(src).size / 1048576).toFixed(1) + " MB");
  } catch (e) {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    console.log("  GAGAL: " + f);
  }
}

const mb = (n) => (n / 1048576).toFixed(1) + " MB";
console.log("");
console.log("Dikompres : " + done + " video" + (skipped ? " (" + skipped + " dilewati)" : ""));
if (done) {
  console.log("Ukuran    : " + mb(before) + "  ->  " + mb(after));
  console.log("Hemat     : " + Math.round((1 - after / before) * 100) + "%");
  console.log("File asli : disimpan di folder video-original/");
}
