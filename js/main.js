/* ══════════════════════════════════════════════
   Deni W. — Portfolio
   Draggable infinite canvas · blur-to-discover tiles
   ══════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ── Config ─────────────────────────────── */
  const NUM_COLS = 7;          // unique columns
  const TILES_PER_COL = 6;     // unique tiles per column
  const TOTAL = NUM_COLS * TILES_PER_COL;
  let GAP = 16;                // jarak dasar antar tile (lebih rapat di HP)

  // vertical parallax speed per unique column
  const COL_SPEEDS = [0.65, 0.9, 1.1, 0.75, 1.0, 0.7, 0.85];
  // vertical start offset per unique column (stagger like a masonry)
  const COL_OFFSETS = [0, 210, 90, 300, 150, 260, 40];

  /* ══════════════════════════════════════════════════════════════
     KATALOG KONTEN — cukup ubah angka di bawah untuk menambah karya
     ══════════════════════════════════════════════════════════════
     Penamaan file (semua di folder images/):

       Menu GRAPHIC   gambar : graphic-01.jpg    graphic-02.jpg   ...
                      video  : graphicvid-01.mp4 graphicvid-02.mp4 ...

       Menu PROJECT   gambar : project-01.jpg    project-02.jpg   ...
                      video  : projectvid-01.mp4 projectvid-02.mp4 ...

     Menu "All" menampilkan gabungan keduanya.
     Nomor file HARUS berurutan mulai dari 01 tanpa lompat.
     Kalau file belum ada, tile-nya tampil sebagai placeholder gradien.
  */
  const CATALOG = {
    graphic: { images: 50, videos: 14 },
    project: { images: 12, videos: 4 },
  };

  const CAT_META = {
    graphic: { label: "Graphic", img: "graphic-", vid: "graphicvid-" },
    project: { label: "Project", img: "project-", vid: "projectvid-" },
  };

  /* Bentuk tile di canvas MENGIKUTI rasio asli file yang diupload.
     Angka di bawah hanya cadangan kalau ukuran file belum diketahui. */
  const RATIOS_IMG = [1, 0.6, 1, 0.75, 1.1, 0.8, 1.45, 0.7, 0.9, 1.25, 0.65, 1.2];
  const RATIOS_VID = [1.6, 0.62, 1.8, 0.72, 1.45, 0.56, 1.7, 0.66];

  /* Pengaman rasio: file ekstrem panjang/lebar tetap dibatasi supaya
     satu tile tidak memenuhi seluruh kolom. 0.18 ≈ 1:5.5 */
  const MIN_RATIO = 0.18;
  const MAX_RATIO = 4.5;

  /* Jarak acak tambahan antar tile (px), di atas GAP normal — supaya
     susunan terasa acak tapi tidak pernah menganga lebar. */
  const GAP_EXTRA_MAX = 18;

  /* Teks bawaan untuk karya yang belum diberi judul/deskripsi sendiri. */
  const DEFAULT_INFO =
    "I made this project for the Mothers Day season event in Kuwait. 2025";

  /* ══════════════════════════════════════════════════════════════
     JUDUL & DESKRIPSI TIAP KARYA
     ══════════════════════════════════════════════════════════════
     Kuncinya = NAMA FILE tanpa ekstensi. Tambahkan sebanyak yang
     kamu mau — karya yang tidak ada di daftar ini otomatis memakai
     judul bawaan ("Graphic 01" dst.) dan teks DEFAULT_INFO di atas.

     Format tiap karya (semua baris selain title & info boleh dihapus
     kalau tidak dipakai — baris kosong otomatis disembunyikan):

       "nama-file": {
         title:    "Judul karya",
         info:     "Deskripsi singkat.",
         software: "Photoshop, Illustrator",
         collab:   "Nama orang / studio",
         scope:    "Packaging, Print Design",
       },
  */
  const PROJECT_DETAILS = {
    "graphic-01": {
      title: "Premium Gift Box & Unboxing Experience – Mother's Day 2026",
      info: "Designed an exclusive gift box packaging aimed at elevating the unboxing experience for the Mother's Day season in Kuwait.",
      software: "Adobe Photoshop, Adobe Illustrator",
      collab: "Mr. Baker Kuwait",
      scope: "Packaging Artwork, Brand Implementation, Pattern Design, Print & Die-cut Setup",
    },
    "graphic-02": {
      title: "Custom Acrylic Cake Display Setup – Graduation 2026",
      info: "A custom-designed acrylic tray and signage set created for the graduation season event in Kuwait.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Product Design, Laser Cutting",
    },
    "graphic-03": {
      title: "Custom Acrylic Cake Display Setup – Graduation 2026",
      info: "A custom-designed acrylic tray and signage set created for the graduation season event in Kuwait.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Product Design, Laser Cutting",
    },
    "graphic-04": {
      title: "Pet Vaccination Passport Cover Design",
      info: "A custom-designed, classic passport-style cover featuring vector silhouettes and a crest logo for Pawsitive Animal Clinic.",
      software: "Adobe Illustrator, Canva",
      collab: "Pawsitive Animal Clinic",
      scope: "Print Design, Vector Illustration, Branding",
    },
     "graphic-05": {
      title: "Free Vaccination Campaign Event Banner",
      info: "A promotional wide banner designed for Pawsitive Animal Clinic's 4th-anniversary free vaccination event.",
      software: "Adobe Illustrator",
      collab: "Pawsitive Animal Clinic",
      scope: "Banner Design, Layout Design, Vector Illustration",
    },
    "graphic-06": {
      title: "Premium Gift Box & Unboxing Experience – Mother's Day 2026",
      info: "Designed an exclusive gift box packaging aimed at elevating the unboxing experience for the Mother's Day season in Kuwait.",
      software: "Adobe Photoshop, Adobe Illustrator",
      collab: "Mr. Baker Kuwait",
      scope: "Packaging Artwork, Brand Implementation, Pattern Design, Print & Die-cut Setup",
    },
    "graphic-07": {
      title: "Custom Cake Toppers - Kuwait Liberation Day 2026",
      info: "Designed and prepared production files for multi-layered cake toppers. The Kuwait flag and city skyline silhouette were vectorized for laser cutting, while the Arabic typography was specifically set up for precision waterjet cutting.",
      software: "Adobe Illustrator, RDWorks Laser, Waterjet Cut",
      collab: "Mr. Baker Kuwait",
      scope: "Vector Design, Laser Cutting Setup, Waterjet Cutting Setup",
    },
    "graphic-08": {
      title: "Pet Vaccination Passport Cover Design",
      info: "An alternative textured paw-print background patterns cover design for Pawsitive Animal Clinic's pet passport.",
      software: "Adobe Illustrator, Canva",
      collab: "Pawsitive Animal Clinic",
      scope: "Print Design, Vector Illustration, Branding",
    },
    "graphic-09": {
      title: "Luxury Acrylic Chocolate Box Collection - Eid 2026",
      info: "End-to-end design, laser cutting, and manual assembly of multi-compartment clear acrylic gift boxes engineered with precise tolerances for a premium chocolate collection. The design features a unique interlocking lid mechanism.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Product Design, Laser Cutting, Acrylic Fabrication, Assembly",
    },
    "graphic-10": {
      title: "Rabies Vaccination Promotional Social Media Banner",
      info: "A promotional discount poster for Pawsitive Animal Clinic's rabies vaccination and free consultation campaign,",
      software: "Adobe Photoshop, Canva",
      collab: "Pawsitive Animal Clinic",
      scope: "Poster Design, Promotional Layout, Photo Editing",
    },
    "graphic-11": {
      title: "Luxury Acrylic Chocolate Box Collection - Ramadan & Eid 2026",
      info: "End-to-end design, laser cutting, and manual assembly of multi-compartment clear acrylic gift boxes engineered with precise tolerances for a premium chocolate collection. The design features a unique interlocking lid mechanism.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Product Design, Laser Cutting, Acrylic Fabrication, Assembly",
    },
    "graphic-12": {
      title: "Multivitamin Promotional Social Media Banner",
      info: "A promotional digital banner designed for Pawsitive Animal Clinic's Transfer Factor Plus multivitamin sale.",
      software: "Adobe Photoshop, Canva",
      collab: "Pawsitive Animal Clinic",
      scope: "Digital Marketing Design, Typography Layout, Photo Retouching",
    },
    "graphic-13": {
      title: "2-Tier Acrylic Drawer Gift Box - Ramadan & Eid 2026",
      info: "Designed, laser cut, and assembled a multi-tiered clear acrylic gift box featuring a bottom sliding drawer, top open display, and a laser-cut crescent moon handle for Mr. Baker's Ramadan & Eid chocolate collection.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Product Design, Laser Cutting, Acrylic Fabrication, Structural Assembly",
    },
    "graphic-14": {
      title: "3-Tier Acrylic Drawer Gift Box - Ramadan & Eid 2026",
      info: "Designed, laser cut, and assembled an expanded 3-tier clear acrylic luxury gift box featuring two pull-out sliding drawers, a top display section, and a custom laser-cut crescent moon handle for Mr. Baker's Ramadan collection.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Product Design, Laser Cutting, Acrylic Fabrication, Structural Assembly",
    },
    "graphic-15": {
      title: "Log Cake Custom Topper & Cookies Cutters - Christmas 2025",
      info: "Designed the laser-cut 'Merry Christmas' topper and programmed precision waterjet cut-paths for the snowflake cookie shapes featured on Mr. Baker's seasonal Yule log cake.",
      software: "Adobe Illustrator, RDWorks Laser, Waterjet Cut",
      collab: "Mr. Baker Kuwait",
      scope: "Topper Design, Laser Cutting, Waterjet Programming, Vector Layout",
    },
    "graphic-16": {
      title: "Gingerbread House Cake & Cookie Cutters - Christmas 2025",
      info: "Designed vector templates for the 3D gingerbread house, pine trees, and snowflakes in Illustrator, then programmed precision waterjet cut-paths via WaterCut for Mr. Baker's winter collection cake.",
      software: "Adobe Illustrator, Waterjet Cut",
      collab: "Mr. Baker Kuwait",
      scope: "Vector Design, Waterjet Programming, 3D Cookie Template Design",
    },
    "graphic-17": {
      title: "New Year 2026 Celebration Cake Topper Set - New Year 2026",
      info: "Designed vector templates in Illustrator and prepared precise laser-cut files for the 'Happy New Year' script, '2026' numerals, and Roman numeral countdown clock topper featured on Mr. Baker's celebration cake.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Topper Design, Vector Layout, Laser Cutting",
    },
    "graphic-18": {
      title: "Log Cake Custom Topper & Cookies Cutters - Christmas 2025",
      info: "Designed the laser-cut 'Merry Christmas' topper and programmed precision waterjet cut-paths for the snowflake cookie shapes featured on Mr. Baker's seasonal Yule log cake.",
      software: "Adobe Illustrator, RDWorks Laser, Waterjet Cut",
      collab: "Mr. Baker Kuwait",
      scope: "Topper Design, Laser Cutting, Waterjet Programming, Vector Layout",
    },
    "graphic-19": {
      title: "Custom Acrylic Cake Display Setup – Graduation 2026",
      info: "A custom-designed acrylic tray and signage set created for the graduation season event in Kuwait.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Product Design, Laser Cutting",
    },
    "graphic-20": {
      title: "Custom Acrylic Cake Display Setup – Graduation 2026",
      info: "A custom-designed acrylic tray and signage set created for the graduation season event in Kuwait.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Product Design, Laser Cutting",
    },
    "graphic-21": {
      title: "5-Layer 3D Acrylic Shadowbox Topper - Mother's Day 2026",
      info: "Designed, laser cut, and assembled a 5-layer acrylic shadowbox cake topper creating an arched silhouette diorama of a mother and children with dynamic visual depth.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Product Design, Vector Illustration, Layered 3D Diorama, Laser Cutting, Acrylic Fabrication",
    },
    "graphic-22": {
      title: "Floral Vase Acrylic Cake Display - Mother's Day 2026",
      info: "Designed, laser cut, and fabricated a bespoke clear acrylic cake stand integrated with 9 tube flower vases arranged radially to blend fresh floral arrangements seamlessly.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Product Engineering, Structural Layout, Laser Cutting, Acrylic Fabrication",
    },
    "graphic-23": {
      title: "Elevating Surprise Gift Box Packaging - Mother's Day 2026",
      info: "Designed a cylindrical gift box packaging integrated with an internal acrylic cake stand mechanism, designed to pull upward and reveal a dual-tier presentation of chocolate tulip flowers and a celebration cake for Mr. Baker.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Structural Packaging, Mechanism Design, Laser Cutting, Acrylic Fabrication",
    },
    "graphic-24": {
      title: "Custom Acrylic Cake Display Setup – Graduation 2026",
      info: "A custom-designed acrylic tray and signage set created for the graduation season event in Kuwait.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Product Design, Laser Cutting",
    },
    "graphic-25": {
      title: "Kuwait Map Cake Cut-Path & Flag Topper - Kuwait Liberation Day 2026",
      info: "Vectorized the geographical map contour of Kuwait and programmed precision waterjet cut-paths to shape the cake and chocolate layers, complemented by a laser-cut acrylic Kuwait flag topper.",
      software: "Adobe Illustrator, WaterCut, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Vector Mapping, Waterjet Programming, Topper Design, Laser Cutting",
    },
    "graphic-26": {
      title: "Kuwait Map Cake Cut-Path & Flag Topper - Kuwait Liberation Day 2026",
      info: "Vectorized the geographical map contour of Kuwait and programmed precision waterjet cut-paths to shape the cake and chocolate layers, complemented by a laser-cut acrylic Kuwait flag topper.",
      software: "Adobe Illustrator, WaterCut, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Vector Mapping, Waterjet Programming, Topper Design, Laser Cutting",
    },
    "graphic-27": {
      title: "Tiered Dessert Display & Slider System - New Year 2025",
      info: "Engineered an interactive multi-level acrylic dessert display featuring pull-out sliding drawers and a laser-cut gear-and-clock themed celebratory backdrop.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Structural Engineering, Acrylic Fabrication, Laser Cutting, Mechanism Design",
    },
    "graphic-28": {
      title: "Pet Boarding Guidelines Infographic Poster",
      info: "Designed an informative step-by-step guideline infographic for Pawsitive Animal Clinic's pet hotel boarding policy, utilizing custom vector icons, sequential timeline hierarchy, and clear typography.",
      software: "Adobe Illustrator, Canva",
      collab: "Pawsitive Animal Clinic",
      scope: "Infographic Design, Vector Illustration, Layout Design",
    },
    "graphic-29": {
      title: "Independence Day Free Spay & Neuter Campaign Post",
      info: "Illustrated a custom vector scene for Pawsitive Animal Clinic's Indonesian Independence Day promotional campaign, featuring custom character vectors, animal illustrations, and celebratory event branding.",
      software: "Adobe Illustrator, Canva",
      collab: "Pawsitive Animal Clinic",
      scope: "Vector Illustration, Social Media Design, Character Design",
    },
    "graphic-30": {
      title: "COVID-19 Health Protocol Infographic Poster",
      info: "Designed a safety guideline infographic poster for Pawsitive Animal Clinic, utilizing a segmented color-block grid, custom vector character illustrations, and structured safety protocols.",
      software: "Adobe Illustrator, Canva",
      collab: "Pawsitive Animal Clinic",
      scope: "Infographic Design, Vector Illustration, Layout Design",
    },
    "graphic-31": {
      title: "Rabies Awareness Educational Social Media Post",
      info: "Designed an educational social media post framed within a retro web-browser UI layout, featuring custom handwritten-style typography and a vector illustration of a rabid dog for Pawsitive Animal Clinic.",
      software: "Adobe Illustrator, Canva",
      collab: "Pawsitive Animal Clinic",
      scope: "Social Media Design, Vector Illustration, Educational Infographic",
    },
        "graphic-32": {
      title: "2-Tier Acrylic Drawer Gift Box - Ramadan & Eid 2026",
      info: "Designed, laser cut, and assembled a multi-tiered clear acrylic gift box featuring a bottom sliding drawer, top open display, and a laser-cut crescent moon handle for Mr. Baker's Ramadan & Eid chocolate collection.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Product Design, Laser Cutting, Acrylic Fabrication, Structural Assembly",
    },
    "graphic-33": {
      title: "Free Toxoplasmosis Screening Campaign Post",
      info: "Designed a social media promotional campaign banner for Pawsitive Animal Clinic's free Toxoplasma testing event.",
      software: "Adobe Illustrator, Canva",
      collab: "Pawsitive Animal Clinic",
      scope: "Campaign Design, Social Media Design, Vector Illustration",
    },
    "graphic-34": {
      title: "COVID-19 Health Protocol Infographic Poster",
      info: "Designed a safety guideline infographic poster for Pawsitive Animal Clinic, utilizing a segmented color-block grid, custom vector character illustrations, and structured safety protocols.",
      software: "Adobe Illustrator, Canva",
      collab: "Pawsitive Animal Clinic",
      scope: "Infographic Design, Vector Illustration, Layout Design",
    },
    "graphic-35": {
      title: "Pet Boarding Guidelines Infographic Poster",
      info: "Designed an informative step-by-step guideline infographic for Pawsitive Animal Clinic's pet hotel boarding policy, utilizing custom vector icons, sequential timeline hierarchy, and clear typography.",
      software: "Adobe Illustrator, Canva",
      collab: "Pawsitive Animal Clinic",
      scope: "Infographic Design, Vector Illustration, Layout Design",
    },
    "graphic-36": {
      title: "Multivitamin Promotional Social Media Banner",
      info: "A promotional digital banner designed for Pawsitive Animal Clinic's Transfer Factor Plus multivitamin sale.",
      software: "Adobe Photoshop, Canva",
      collab: "Pawsitive Animal Clinic",
      scope: "Digital Marketing Design, Typography Layout, Photo Retouching",
    },
    "graphic-37": {
      title: "Rabies Vaccination Promotional Social Media Banner",
      info: "A promotional discount poster for Pawsitive Animal Clinic's rabies vaccination and free consultation campaign,",
      software: "Adobe Photoshop, Canva",
      collab: "Pawsitive Animal Clinic",
      scope: "Poster Design, Promotional Layout, Photo Editing",
    },
    "graphic-38": {
      title: "Independence Day Free Spay & Neuter Campaign Post",
      info: "Illustrated a custom vector scene for Pawsitive Animal Clinic's Indonesian Independence Day promotional campaign, featuring custom character vectors, animal illustrations, and celebratory event branding.",
      software: "Adobe Illustrator, Canva",
      collab: "Pawsitive Animal Clinic",
      scope: "Vector Illustration, Social Media Design, Character Design",
    },
    "graphic-39": {
      title: "Pet Grooming Service Price List Poster",
      info: "Designed a clean, structured grooming service and pricing menu poster for Pawsitive Animal Clinic, combining elegant script typography, organized price list tables, and playful grooming vector illustrations.",
      software: "Adobe Illustrator, Canva",
      collab: "Pawsitive Animal Clinic",
      scope: "Poster Design, Typography Layout, Vector Illustration, Menu Design",
    },
    "graphic-40": {
      title: "2022 Annual Calendar Wall Poster",
      info: "Designed a 12-month annual wall calendar poster for Pawsitive Animal Clinic, combining custom vet-and-pet vector character illustrations, clinic branding, complete national holiday schedules, and structured grid typography.",
      software: "Adobe Illustrator, Canva",
      collab: "Pawsitive Animal Clinic",
      scope: "Calendar Design, Poster Layout, Vector Illustration, Typography",
    },
    "graphic-41": {
      title: "Discount Voucher Design",
      info: "Designed a clean, promotional voucher for Pawsitive Animal Clinic's Transfer Factor Plus multivitamin, featuring integrated product photography, scannable barcode layout, and bold discount typography.",
      software: "Adobe Illustrator, Adobe Photoshop",
      collab: "Pawsitive Animal Clinic",
      scope: "Voucher Design, Promotional Layout, Photo Integration, Barcode Generation",
    },
    "graphic-42": {
      title: "Vaccination Discount Voucher Design",
      info: "Designed a promotional ticket voucher for Pawsitive Animal Clinic's rabies vaccination campaign, combining promotional typography, custom vector discount badges, clinical pet photography, and a scannable barcode element.",
      software: "Adobe Illustrator, Adobe Photoshop",
      collab: "Pawsitive Animal Clinic",
      scope: "Voucher Design, Promotional Layout, Photo Editing, Print Design",
    },
    "graphic-43": {
      title: "Seamless Carousel Campaign Post",
      info: "Designed an educational multi-slide seamless carousel post for Pawsitive Animal Clinic explaining Feline Panleukopenia Virus (FPV), featuring continuous vector framing, microscopic pathology imagery, and structured medical infoboxes across split artboards.",
      software: "Adobe Illustrator, Canva",
      collab: "Pawsitive Animal Clinic",
      scope: "Social Media Design, Seamless Carousel, Medical Infographic, Typography Layout",
    },
    "graphic-44": {
      title: "FPV Transmission & Symptoms Seamless Carousel Post",
      info: "Designed a multi-slide seamless carousel educational post for Pawsitive Animal Clinic detailing FPV transmission vectors and clinical symptoms, featuring medical symptom checklists, 3D virus particle visuals, and clinical case photography.",
      software: "Adobe Illustrator, Canva",
      collab: "Pawsitive Animal Clinic",
      scope: "Social Media Design, Seamless Carousel, Educational Infographic, Medical Illustration",
    },
    "graphic-45": {
      title: "Custom Acrylic Cake Display Setup – Graduation 2026",
      info: "A custom-designed acrylic tray and signage set created for the graduation season event in Kuwait.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Product Design, Laser Cutting",
    },
    "graphic-46": {
      title: "Luxury Acrylic Chocolate Box Collection - Eid 2026",
      info: "End-to-end design, laser cutting, and manual assembly of multi-compartment clear acrylic gift boxes engineered with precise tolerances for a premium chocolate collection. The design features a unique interlocking lid mechanism.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Product Design, Laser Cutting, Acrylic Fabrication, Assembly",
    },
    "graphic-47": {
      title: "3-Tier Acrylic Drawer Gift Box - Ramadan & Eid 2026",
      info: "Designed, laser cut, and assembled an expanded 3-tier clear acrylic luxury gift box featuring two pull-out sliding drawers, a top display section, and a custom laser-cut crescent moon handle for Mr. Baker's Ramadan collection.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Product Design, Laser Cutting, Acrylic Fabrication, Structural Assembly",
    },
    "graphic-48": {
      title: "Profile Website Hero Illustration",
      info: "Illustrated a playful hero banner for a designer portfolio website.",
      software: "Canva",
      collab: "Personal Project",
      scope: "Vector Illustration, Web Asset Design, Character Design, UI/UX Concept Art",
    },
    "graphic-49": {
      title: "Profile Website Hero Illustration",
      info: "Illustrated a playful hero banner for a designer portfolio website.",
      software: "Canva",
      collab: "Personal Project",
      scope: "Vector Illustration, Web Asset Design, Character Design, UI/UX Concept Art",
    },
    "graphic-50": {
      title: "Profile Website Hero Illustration",
      info: "Illustrated a playful hero banner for a designer portfolio website.",
      software: "Canva",
      collab: "Personal Project",
      scope: "Vector Illustration, Web Asset Design, Character Design, UI/UX Concept Art",
    },





    "graphicvid-01": {
      title: "Custom Acrylic Cake Display Setup – Graduation 2026",
      info: "A custom-designed acrylic tray and signage set created for the graduation season event in Kuwait.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Product Design, Laser Cutting",
    },
    "graphicvid-02": {
      title: "New Year 2026 Celebration Cake Topper Set - New Year 2026",
      info: "Designed vector templates in Illustrator and prepared precise laser-cut files for the 'Happy New Year' script, '2026' numerals, and Roman numeral countdown clock topper featured on Mr. Baker's celebration cake.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Topper Design, Vector Layout, Laser Cutting",
    },
    "graphicvid-03": {
      title: "Kuwait National Day Acrylic Treat Display & Slider Box",
      info: "Designed, laser cut, and assembled a multi-tiered clear acrylic confectionery display stand featuring a laser-cut Kuwait cityscape silhouette backdrop with flag, dedicated lollipop slot tiers, and pull-out sliding chocolate drawers for Mr. Baker.",
      software: "Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Product Engineering, Silhouette Vector Design, Laser Cutting, Acrylic Fabrication, Structural Assembly",
    },
    "graphicvid-04": {
      title: "Tiered Dessert Display & Slider System - New Year 2025",
      info: "Engineered an interactive multi-level acrylic dessert display featuring pull-out sliding drawers and a laser-cut gear-and-clock themed celebratory backdrop.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Structural Engineering, Acrylic Fabrication, Laser Cutting, Mechanism Design",
    },
    "graphicvid-05": {
      title: "5-Layer 3D Acrylic Shadowbox Topper - Mother's Day 2026",
      info: "Designed, laser cut, and assembled a 5-layer acrylic shadowbox cake topper creating an arched silhouette diorama of a mother and children with dynamic visual depth.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Product Design, Vector Illustration, Layered 3D Diorama, Laser Cutting, Acrylic Fabrication",
    },
    "graphicvid-06": {
      title: "Floral Vase Acrylic Cake Display - Mother's Day 2026",
      info: "Designed, laser cut, and fabricated a bespoke clear acrylic cake stand integrated with 9 tube flower vases arranged radially to blend fresh floral arrangements seamlessly.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Product Engineering, Structural Layout, Laser Cutting, Acrylic Fabrication",
    },
    "graphicvid-07": {
      title: "Luxury Acrylic Chocolate Box Collection - Eid 2026",
      info: "End-to-end design, laser cutting, and manual assembly of multi-compartment clear acrylic gift boxes engineered with precise tolerances for a premium chocolate collection. The design features a unique interlocking lid mechanism.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Product Design, Laser Cutting, Acrylic Fabrication, Assembly",
    },
    "graphicvid-08": {
      title: "Custom Acrylic Cake Display Setup – Graduation 2026",
      info: "A custom-designed acrylic tray and signage set created for the graduation season event in Kuwait.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Product Design, Laser Cutting",
    },
    "graphicvid-09": {
      title: "Luxury Acrylic Chocolate Box Collection - Eid 2026",
      info: "End-to-end design, laser cutting, and manual assembly of multi-compartment clear acrylic gift boxes engineered with precise tolerances for a premium chocolate collection. The design features a unique interlocking lid mechanism.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Product Design, Laser Cutting, Acrylic Fabrication, Assembly",
    },
    "graphicvid-10": {
      title: "New Year 2026 Celebration Cake Topper Set - New Year 2026",
      info: "Designed vector templates in Illustrator and prepared precise laser-cut files for the 'Happy New Year' script, '2026' numerals, and Roman numeral countdown clock topper featured on Mr. Baker's celebration cake.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Topper Design, Vector Layout, Laser Cutting",
    },
    "graphicvid-11": {
      title: "Valentine's 'With Love' Acrylic Topper",
      info: "Designed the elegant cursive vector typography and prepared high-precision laser-cut files for the gold mirror acrylic 'With Love' topper featured on Mr. Baker's Valentine's Day artisan chocolate cake.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Topper Design, Typography Layout, Vector Design, Laser Cutting",
    },
    "graphicvid-12": {
      title: "Tiered Acrylic Drawer Gift Box - Ramadan & Eid 2026",
      info: "Designed, laser cut, and assembled an expanded tiered clear acrylic luxury gift box featuring two pull-out sliding drawers, a top display section, and a custom laser-cut crescent moon handle for Mr. Baker's Ramadan collection.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Product Design, Laser Cutting, Acrylic Fabrication, Structural Assembly",
    },
    "graphicvid-13": {
      title: "Elevating Surprise Gift Box Packaging - Mother's Day 2026",
      info: "Designed a cylindrical gift box packaging integrated with an internal acrylic cake stand mechanism, designed to pull upward and reveal a dual-tier presentation of chocolate tulip flowers and a celebration cake for Mr. Baker.",
      software: "Adobe Illustrator, RDWorks Laser",
      collab: "Mr. Baker Kuwait",
      scope: "Structural Packaging, Mechanism Design, Laser Cutting, Acrylic Fabrication",
    },
    "graphicvid-14": {
      title: "Premium Gift Box & Unboxing Experience – Mother's Day 2026",
      info: "Designed an exclusive gift box packaging aimed at elevating the unboxing experience for the Mother's Day season in Kuwait.",
      software: "Adobe Photoshop, Adobe Illustrator",
      collab: "Mr. Baker Kuwait",
      scope: "Packaging Artwork, Brand Implementation, Pattern Design, Print & Die-cut Setup",
    },




    
    "project-01": {
      title: "Digital Guestbook Web App",
      info: "Developed a digital guestbook web application for SMKN 1 Cirebon featuring guest registration forms, automated real-time timestamp recording, visitor statistical dashboards, and guest list management.",
      software: "PHP, CodeIgniter, MySQL, Bootstrap",
      collab: "(Personal Project)",
      scope: "Full-Stack Web Development, Database Management, UI/UX Implementation, CRUD System",
    },
    "project-02": {
      title: "Digital Guestbook Web App",
      info: "Developed a digital guestbook web application for SMKN 1 Cirebon featuring guest registration forms, automated real-time timestamp recording, visitor statistical dashboards, and guest list management.",
      software: "PHP, CodeIgniter, MySQL, Bootstrap",
      collab: "(Personal Project)",
      scope: "Full-Stack Web Development, Database Management, UI/UX Implementation, CRUD System",
    },
    "project-03": {
      title: "Digital Guestbook Web App",
      info: "Developed a digital guestbook web application for SMKN 1 Cirebon featuring guest registration forms, automated real-time timestamp recording, visitor statistical dashboards, and guest list management.",
      software: "PHP, CodeIgniter, MySQL, Bootstrap",
      collab: "(Personal Project)",
      scope: "Full-Stack Web Development, Database Management, UI/UX Implementation, CRUD System",
    },
    "project-04": {
      title: "Kopi Nusantara Web Profile & Article Portal",
      info: "Built a responsive company profile and article management web application for Kopi Nusantara featuring user-facing informative pages, contact integration, and an administrative CRUD panel.",
      software: "PHP, CodeIgniter, MySQL, Bootstrap",
      collab: "(Personal Project)",
      scope: "Full-Stack Web Development, Database Design, Responsive Web Design, MVC Architecture",
    },
    "project-05": {
      title: "Digi-Library Management System & Analytics Dashboard",
      info: "Engineered a digital library management system featuring real-time borrowing and return analytics charts, book inventory management, member registration, and full CRUD administrative workflows.",
      software: "PHP, CodeIgniter, MySQL, Chart.js, Bootstrap",
      collab: "(Personal Project)",
      scope: "Full-Stack Web Development, Dashboard UI/UX Design, Data Visualization, Database Architecture",
    },
    "project-06": {
      title: "Kopi Nusantara Web Profile & Article Portal",
      info: "Built a responsive company profile and article management web application for Kopi Nusantara featuring user-facing informative pages, contact integration, and an administrative CRUD panel.",
      software: "PHP, CodeIgniter, MySQL, Bootstrap",
      collab: "(Personal Project)",
      scope: "Full-Stack Web Development, Database Design, Responsive Web Design, MVC Architecture",
    },
    "project-07": {
      title: "Digi-Library Management System & Analytics Dashboard",
      info: "Engineered a digital library management system featuring real-time borrowing and return analytics charts, book inventory management, member registration, and full CRUD administrative workflows.",
      software: "PHP, CodeIgniter, MySQL, Chart.js, Bootstrap",
      collab: "(Personal Project)",
      scope: "Full-Stack Web Development, Dashboard UI/UX Design, Data Visualization, Database Architecture",
    },
    "project-08": {
      title: "Coffee Bean Pattern Background Asset",
      info: "Designed seamless multi-tone vector coffee bean patterns and textured background illustrations tailored for Kopi Nusantara's brand identity and website hero section.",
      software: "Canva",
      collab: "Kopi Nusantara",
      scope: "Pattern Design, Vector Illustration, Web Asset Design, Brand Identity",
    },
    "project-09": {
      title: "Coffee Bean Pattern Background Asset",
      info: "Designed seamless multi-tone vector coffee bean patterns and textured background illustrations tailored for Kopi Nusantara's brand identity and website hero section.",
      software: "Canva",
      collab: "Kopi Nusantara",
      scope: "Pattern Design, Vector Illustration, Web Asset Design, Brand Identity",
    },
    "project-10": {
      title: "Coffee Bean Pattern Background Asset",
      info: "Designed seamless multi-tone vector coffee bean patterns and textured background illustrations tailored for Kopi Nusantara's brand identity and website hero section.",
      software: "Canva",
      collab: "Kopi Nusantara",
      scope: "Pattern Design, Vector Illustration, Web Asset Design, Brand Identity",
    },
    "project-11": {
      title: "Kopi Nusantara Web Profile & Article Portal",
      info: "Built a responsive company profile and article management web application for Kopi Nusantara featuring user-facing informative pages, contact integration, and an administrative CRUD panel.",
      software: "PHP, CodeIgniter, MySQL, Bootstrap",
      collab: "(Personal Project)",
      scope: "Full-Stack Web Development, Database Design, Responsive Web Design, MVC Architecture",
    },
    "project-12": {
      title: "Digi-Library Management System & Analytics Dashboard",
      info: "Engineered a digital library management system featuring real-time borrowing and return analytics charts, book inventory management, member registration, and full CRUD administrative workflows.",
      software: "PHP, CodeIgniter, MySQL, Chart.js, Bootstrap",
      collab: "(Personal Project)",
      scope: "Full-Stack Web Development, Dashboard UI/UX Design, Data Visualization, Database Architecture",
    },




    "projectvid-01": {
      title: "Kopi Nusantara Web Profile & Article Portal",
      info: "Built a responsive company profile and article management web application for Kopi Nusantara featuring user-facing informative pages, contact integration, and an administrative CRUD panel.",
      software: "PHP, CodeIgniter, MySQL, Bootstrap",
      collab: "(Personal Project)",
      scope: "Full-Stack Web Development, Database Design, Responsive Web Design, MVC Architecture",
    },
    "projectvid-02": {
      title: "Digi-Library Management System & Analytics Dashboard",
      info: "Engineered a digital library management system featuring real-time borrowing and return analytics charts, book inventory management, member registration, and full CRUD administrative workflows.",
      software: "PHP, CodeIgniter, MySQL, Chart.js, Bootstrap",
      collab: "(Personal Project)",
      scope: "Full-Stack Web Development, Dashboard UI/UX Design, Data Visualization, Database Architecture",
    },
    "projectvid-03": {
      title: "Digital Guestbook Web App",
      info: "Developed a digital guestbook web application for SMKN 1 Cirebon featuring guest registration forms, automated real-time timestamp recording, visitor statistical dashboards, and guest list management.",
      software: "PHP, CodeIgniter, MySQL, Bootstrap",
      collab: "(Personal Project)",
      scope: "Full-Stack Web Development, Database Management, UI/UX Implementation, CRUD System",
    },
    "projectvid-04": {
      title: "Digi-Library Management System & Analytics Dashboard",
      info: "Engineered a digital library management system featuring real-time borrowing and return analytics charts, book inventory management, member registration, and full CRUD administrative workflows.",
      software: "PHP, CodeIgniter, MySQL, Chart.js, Bootstrap",
      collab: "(Personal Project)",
      scope: "Full-Stack Web Development, Dashboard UI/UX Design, Data Visualization, Database Architecture",
    },
    // "graphic-03": { title: "...", info: "...", software: "...", collab: "...", scope: "..." },
    // "project-01": { title: "...", info: "...", software: "...", collab: "...", scope: "..." },
    // "projectvid-01": { title: "...", info: "...", software: "...", collab: "...", scope: "..." },
  };

  /* Angka acak yang selalu sama tiap dibuka (biar tata letak stabil,
     tapi tidak berpola/segaris). */
  function seededRand(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  const projects = [];
  Object.keys(CATALOG).forEach((cat, catIdx) => {
    const cfg = CATALOG[cat];
    const meta = CAT_META[cat];
    const total = cfg.images + cfg.videos;

    /* Sebar posisi video secara acak. Penting: posisi TIDAK boleh
       berjarak kelipatan jumlah kolom, karena tile dibagi ke kolom
       secara berurutan (i % NUM_COLS) — kalau berpola, semua video
       jatuh di kolom yang sama dan tampak sejajar ke bawah. */
    const rand = seededRand(9781 + catIdx * 3571);
    const vidSlots = new Set();
    const usedCols = new Set();
    const bucket = cfg.videos > 0 ? total / cfg.videos : total;
    for (let v = 0; v < cfg.videos; v++) {
      let pos = -1;
      for (let attempt = 0; attempt < 24; attempt++) {
        let p = Math.floor(v * bucket + rand() * bucket);
        p = Math.max(0, Math.min(p, total - 1));
        while (vidSlots.has(p)) p = (p + 1) % total;
        // kolom tempat tile ini akan jatuh (juga berlaku di menu "All",
        // karena menu itu hanya menggeser semua indeks dengan angka tetap)
        const col = p % NUM_COLS;
        // pilih kolom yang belum dipakai selama masih ada yang kosong
        if (!usedCols.has(col) || usedCols.size >= NUM_COLS) {
          usedCols.add(col);
          pos = p;
          break;
        }
        pos = p; // cadangan kalau semua percobaan bentrok
      }
      vidSlots.add(pos);
    }

    let imgN = 0, vidN = 0;
    for (let i = 0; i < total; i++) {
      const hue = (projects.length * 47) % 360;
      if (vidSlots.has(i) && vidN < cfg.videos) {
        vidN++;
        const nn = String(vidN).padStart(2, "0");
        const d = PROJECT_DETAILS[meta.vid + nn] || {};
        projects.push({
          id: cat + "-v" + nn,
          title: d.title || meta.label + " Video " + nn,
          cat: cat,
          video: true,
          vid: "images/" + meta.vid + nn + ".mp4",
          img: null,
          // bentuk tile video diacak (ada yang lebar, ada yang tinggi)
          ratio: RATIOS_VID[Math.floor(rand() * RATIOS_VID.length)],
          gapExtra: Math.round(rand() * GAP_EXTRA_MAX),
          hue: hue,
          info: d.info || DEFAULT_INFO,
          software: d.software || "",
          collab: d.collab || "",
          scope: d.scope || "",
        });
      } else {
        imgN++;
        const nn = String(imgN).padStart(2, "0");
        const d = PROJECT_DETAILS[meta.img + nn] || {};
        projects.push({
          id: cat + "-i" + nn,
          title: d.title || meta.label + " " + nn,
          cat: cat,
          video: false,
          vid: null,
          img: "images/" + meta.img + nn + ".jpg",
          ratio: RATIOS_IMG[(imgN - 1) % RATIOS_IMG.length],
          gapExtra: Math.round(rand() * GAP_EXTRA_MAX),
          hue: hue,
          info: d.info || DEFAULT_INFO,
          software: d.software || "",
          collab: d.collab || "",
          scope: d.scope || "",
        });
      }
    }
  });

  /* ── Skills shown in the About modal.
     Drop icons into images/skills/ named e.g. figma.jpg (or .png) —
     until then a letter placeholder is shown. */
  const SKILLS = [
    "HTML", "CSS", "C++", "JavaScript",
    "Bootstrap", "Node JS", "MySQL", "Figma",
    "VS Code", "Visual Studio", "Git", "Framer",
    "Photoshop", "Illustrator", "Procreate", "Capcut",
    "Davinci Resolve", "RDWorks Laser", "Waterjet Cut",
  ];

  /* ── Clients shown in the Clients modal.
     Drop logos into images/clients/ named client-01.jpg ... */
  const NUM_CLIENTS = 10;

  /* ── DOM refs ───────────────────────────── */
  const canvas = document.getElementById("canvas");
  const world = document.getElementById("world");
  const counterEl = document.getElementById("counter");
  const preloader = document.getElementById("preloader");
  const percentEl = preloader.querySelector(".preloader-percent");
  const barFillEl = preloader.querySelector(".loader-bar-fill");
  const lightbox = document.getElementById("lightbox");

  /* ── State ──────────────────────────────── */
  let tileW = 300;
  let colW = 316;               // tileW + GAP
  let stripW = 0;               // width of one full set of columns
  let colHeights = [];          // wrap period of each unique column
  let currentCat = "all";       // "all" | "graphic" | "project"
  let targetX = 0, targetY = 0;
  let curX = 1e9, curY = 1e9;   // forces first paint
  let velX = 0, velY = 0;
  let dragging = false;
  let movedDist = 0;
  let lastPX = 0, lastPY = 0;
  const colEls = [];            // { el, unique }

  /* ── Helpers ────────────────────────────── */
  const mod = (v, m) => ((v % m) + m) % m;

  function computeTileW() {
    const w = window.innerWidth;
    if (w < 420) return 150;      // HP kecil
    if (w < 700) return 175;      // HP
    if (w < 1024) return 240;     // tablet
    if (w < 1440) return 300;
    if (w < 1920) return 340;
    return 430;
  }

  function computeGap() {
    return window.innerWidth < 700 ? 10 : 16;
  }

  /* ── Rasio asli file ─────────────────────
     Diambil dari js/media-sizes.js (dibuat oleh tools/gen-media-sizes.js)
     sehingga website TIDAK perlu mengunduh gambar dulu hanya untuk tahu
     bentuknya. File yang belum terdaftar diukur sendiri oleh browser. */
  const MEASURED = {};          // url -> w/h
  (function seedSizes() {
    const M = window.MEDIA_SIZES;
    if (!M) return;
    Object.keys(M).forEach((k) => {
      const wh = M[k];
      if (wh && wh[0] > 0 && wh[1] > 0) MEASURED[k] = wh[0] / wh[1];
    });
  })();

  function mediaURL(p) {
    return p.video && p.vid ? p.vid : p.img;
  }

  /* Karya yang file aslinya .png dicatat di MEDIA_ALIAS, jadi browser
     langsung meminta file yang benar tanpa percobaan .jpg yang gagal. */
  function realURL(url) {
    const A = window.MEDIA_ALIAS;
    return (A && A[url]) || url;
  }

  function ratioOf(p) {
    const url = mediaURL(p);
    const r = (url && MEASURED[url]) || p.ratio;
    return Math.max(MIN_RATIO, Math.min(MAX_RATIO, r));
  }

  function tileHeight(p) {
    return Math.round(tileW / ratioOf(p));
  }

  function gradientCSS(p) {
    return (
      "linear-gradient(135deg, hsl(" + p.hue + ", 62%, 74%), hsl(" +
      ((p.hue + 45) % 360) + ", 68%, 52%))"
    );
  }

  /* ── Build the world ────────────────────── */
  function makeTileEl(p) {
    const h = tileHeight(p);
    const tile = document.createElement("div");
    tile.className = "tile intro";
    tile.dataset.id = p.id;
    tile.style.height = h + "px";
    // jarak acak tambahan (di atas GAP normal)
    tile.style.marginBottom = p.gapExtra + "px";
    // dipakai bersama content-visibility:auto — browser tahu ukuran tile
    // di luar layar tanpa perlu merendernya, jadi tata letak tidak bergeser
    tile.style.containIntrinsicSize = tileW + "px " + h + "px";

    const media = document.createElement("div");
    media.className = "tile-media";

    const ph = document.createElement("div");
    ph.className = "tile-ph";
    ph.style.background = gradientCSS(p);
    ph.textContent = p.title;
    media.appendChild(ph);

    if (p.img) {
      const img = document.createElement("img");
      img.alt = "";
      img.draggable = false;
      img.decoding = "async";
      // catatan: JANGAN pakai loading="lazy" di sini — deteksi lazy
      // Chrome tidak bekerja untuk tile di dalam canvas ber-transform,
      // akibatnya gambar tidak pernah dimuat sama sekali
      /* Gambar BARU diunduh saat tile-nya mendekati layar (lihat
         syncMedia). loading="lazy" bawaan browser tidak bisa dipakai
         karena salah membaca posisi tile di canvas ber-transform. */
      img.dataset.src = realURL(p.img);
      // try .jpg first, then .png, then give up (gradient placeholder stays)
      img.onerror = function () {
        if (this.src.endsWith(".jpg")) {
          this.src = this.src.replace(/\.jpg$/, ".png");
        } else {
          this.remove();
        }
      };
      media.appendChild(img);
    }

    // MP4 autoplay-loop di atas gambar/placeholder; kalau file-nya belum
    // ada, elemen dihapus dan fallback di bawahnya yang tampil
    if (p.video && p.vid) {
      const vid = document.createElement("video");
      vid.muted = true;
      vid.loop = true;
      vid.playsInline = true;
      vid.setAttribute("muted", "");
      vid.setAttribute("playsinline", "");
      // JANGAN autoplay/preload semua — dengan banyak video itu membuat
      // browser berat. syncMedia() yang memuat & memutar HANYA video
      // yang sedang terlihat di layar.
      vid.preload = "none";
      vid.src = p.vid;
      vid.addEventListener("error", () => vid.remove());
      media.appendChild(vid);
    }
    tile.appendChild(media);

    if (p.video) {
      const badge = document.createElement("div");
      badge.className = "video-badge";
      badge.textContent = "video";
      tile.appendChild(badge);
    }

    // judul yang muncul naik dari bawah saat kursor di atas tile
    const cap = document.createElement("div");
    cap.className = "tile-title";
    cap.innerHTML = "<span></span>";
    cap.firstChild.textContent = p.title;
    tile.appendChild(cap);

    return tile;
  }

  function filteredProjects() {
    return currentCat === "all"
      ? projects
      : projects.filter((p) => p.cat === currentCat);
  }

  /* Gambar & video hanya dimuat / diputar saat tile-nya dekat layar.
     Canvas digerakkan dengan transform, jadi posisinya dicek langsung
     (IntersectionObserver salah membaca elemen ber-transform). */
  let videoEls = [];
  let pendingImgs = [];         // gambar yang belum diunduh

  function syncMedia() {
    const H = window.innerHeight, W = window.innerWidth;
    const small = W < 768;

    // 1. mulai unduh gambar yang sudah mendekat, supaya sudah siap
    //    sebelum benar-benar terlihat
    if (pendingImgs.length) {
      const MI = small ? 350 : 600;
      const still = [];
      for (let i = 0; i < pendingImgs.length; i++) {
        const im = pendingImgs[i];
        const r = im.getBoundingClientRect();
        if (r.bottom > -MI && r.top < H + MI && r.right > -MI && r.left < W + MI) {
          im.src = im.dataset.src;
          im.removeAttribute("data-src");
        } else {
          still.push(im);
        }
      }
      pendingImgs = still;
    }

    /* 2. Video: LANGSUNG diputar begitu tile-nya terlihat — tanpa
       jeda tunggu — baik di web maupun HP. Yang di luar layar
       dihentikan supaya tidak membebani. */
    const MV = 200;                    // margin: mulai sedikit lebih awal
    for (let i = 0; i < videoEls.length; i++) {
      const v = videoEls[i];
      const r = v.getBoundingClientRect();
      const onScreen =
        r.bottom > -MV && r.top < H + MV && r.right > -MV && r.left < W + MV;
      if (onScreen) {
        if (v.paused) v.play().catch(() => {});
      } else if (!v.paused) {
        v.pause();
      }
    }
  }

  /* Gambar di dalam modal (skill & client) baru diunduh saat modal-nya
     dibuka — tidak ikut membebani saat website pertama dibuka. */
  function loadDeferredImages(root) {
    root.querySelectorAll("img[data-src]").forEach((im) => {
      im.src = im.dataset.src;
      im.removeAttribute("data-src");
    });
  }

  function build() {
    tileW = computeTileW();
    GAP = computeGap();
    colW = tileW + GAP;
    document.documentElement.style.setProperty("--tileW", tileW + "px");
    document.documentElement.style.setProperty("--gap", GAP + "px");

    world.innerHTML = "";
    colEls.length = 0;
    colHeights = [];

    // distribute the (filtered) projects round-robin into columns
    const list = filteredProjects();
    const nCols = Math.min(NUM_COLS, Math.max(1, list.length));
    const cols = Array.from({ length: nCols }, () => []);
    list.forEach((p, i) => cols[i % nCols].push(p));
    stripW = nCols * colW;

    // wrap period of each column
    colHeights = cols.map((colList) =>
      colList.reduce((h, p) => h + tileHeight(p) + GAP + p.gapExtra, 0)
    );

    /* Pengaman: kalau viewport sempat terbaca 0 (mis. tab belum tampil),
       pakai ukuran minimum supaya salinan kolom tetap cukup untuk
       perulangan tanpa celah. */
    const vw = Math.max(window.innerWidth, 320);
    const vh = Math.max(window.innerHeight, 480);
    const copiesH = Math.ceil(vw / stripW) + 1;
    for (let s = 0; s < copiesH; s++) {
      for (let c = 0; c < nCols; c++) {
        const col = document.createElement("div");
        col.className = "col";
        const copiesV = Math.ceil(vh / colHeights[c]) + 1;
        for (let v = 0; v < copiesV; v++) {
          cols[c].forEach((p) => col.appendChild(makeTileEl(p)));
        }
        world.appendChild(col);
        colEls.push({ el: col, unique: c });
      }
    }
    videoEls = Array.from(world.querySelectorAll(".tile video"));
    pendingImgs = Array.from(world.querySelectorAll(".tile img[data-src]"));
    syncMedia();               // muat yang sudah terlihat sekarang juga
    curX = curY = 1e9; // force repaint
  }

  /* ── Render loop ────────────────────────── */
  function render() {
    // canvas belum dibangun (masih loading) — tunggu
    if (!colEls.length || !stripW) {
      requestAnimationFrame(render);
      return;
    }
    if (!dragging) {
      targetX += velX;
      targetY += velY;
      velX *= 0.94;
      velY *= 0.94;
    }
    const nx = curX === 1e9 ? targetX : curX + (targetX - curX) * 0.11;
    const ny = curY === 1e9 ? targetY : curY + (targetY - curY) * 0.11;

    if (Math.abs(nx - curX) > 0.01 || Math.abs(ny - curY) > 0.01 || curX === 1e9) {
      curX = nx;
      curY = ny;
      world.style.transform =
        "translate3d(" + (mod(curX, stripW) - stripW) + "px, 0, 0)";
      for (let i = 0; i < colEls.length; i++) {
        const u = colEls[i].unique;
        const y = mod(curY * COL_SPEEDS[u] + COL_OFFSETS[u], colHeights[u]) - colHeights[u];
        colEls[i].el.style.transform = "translate3d(0, " + y + "px, 0)";
      }
    }
    requestAnimationFrame(render);
  }

  /* ── Dragging ───────────────────────────── */
  canvas.addEventListener("pointerdown", (e) => {
    dragging = true;
    movedDist = 0;
    lastPX = e.clientX;
    lastPY = e.clientY;
    velX = velY = 0;
    canvas.classList.add("grabbing");
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastPX;
    const dy = e.clientY - lastPY;
    lastPX = e.clientX;
    lastPY = e.clientY;
    targetX += dx;
    targetY += dy;
    velX = dx * 0.9;
    velY = dy * 0.9;
    movedDist += Math.abs(dx) + Math.abs(dy);
  });

  function endDrag() {
    dragging = false;
    canvas.classList.remove("grabbing");
  }
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  // wheel / trackpad panning
  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      targetX -= e.deltaX;
      targetY -= e.deltaY;
    },
    { passive: false }
  );

  /* ── Counter (jumlah karya kategori aktif) ── */
  function updateCounter() {
    counterEl.textContent = filteredProjects().length + " works";
  }

  /* ── Lightbox ───────────────────────────── */
  canvas.addEventListener("click", (e) => {
    if (movedDist > 6) return; // it was a drag, not a click
    // pointer capture retargets the click to #canvas, so hit-test manually
    const hit = document.elementFromPoint(e.clientX, e.clientY);
    const tile = hit && hit.closest(".tile");
    if (!tile) return;
    const p = projects.find((x) => x.id === tile.dataset.id);
    if (!p) return;

    const media = lightbox.querySelector(".lightbox-media");
    media.innerHTML = "";
    // rasio frame diisi dari ukuran ASLI file setelah selesai dimuat
    media.classList.remove("has-ratio");

    const ph = document.createElement("div");
    ph.className = "tile-ph";
    ph.style.background = gradientCSS(p);
    media.appendChild(ph);
    if (p.video && p.vid) {
      // putar MP4 project yang sama dengan tile yang diklik —
      // klik = user gesture, jadi autoplay dengan suara diizinkan
      const vid = document.createElement("video");
      vid.src = p.vid;
      vid.autoplay = true;
      vid.loop = true;
      vid.controls = true;
      vid.playsInline = true;
      vid.addEventListener("error", () => vid.remove());
      // frame mengikuti ukuran asli video begitu metadata-nya terbaca
      vid.addEventListener("loadedmetadata", () =>
        applyRatio(media, vid.videoWidth, vid.videoHeight)
      );
      if (vid.videoWidth) applyRatio(media, vid.videoWidth, vid.videoHeight);
      // klik pada player (play/pause/seek) jangan menutup lightbox
      vid.addEventListener("click", (e) => e.stopPropagation());
      media.appendChild(vid);
    } else {
      const img = tile.querySelector("img");
      if (img) {
        const big = document.createElement("img");
        big.src = img.src;
        big.alt = p.title;
        // frame mengikuti ukuran asli gambar
        big.addEventListener("load", () =>
          applyRatio(media, big.naturalWidth, big.naturalHeight)
        );
        if (img.naturalWidth) applyRatio(media, img.naturalWidth, img.naturalHeight);
        media.appendChild(big);
      }
    }
    lightbox.querySelector(".lightbox-title").textContent = p.title;
    lightbox.querySelector(".lightbox-info").textContent = p.info || "";
    fillMetaRows(p);
    lightbox.classList.add("open");
  });

  /* Pasang rasio asli file ke frame lightbox. */
  function applyRatio(media, w, h) {
    if (!w || !h) return;
    media.style.setProperty("--ar-w", w);
    media.style.setProperty("--ar-h", h);
    media.classList.add("has-ratio");
  }

  /* Isi baris Software / Collaboration with / Scope.
     Baris yang datanya kosong otomatis disembunyikan. */
  function fillMetaRows(p) {
    const wrap = lightbox.querySelector(".lightbox-meta");
    const values = { software: p.software, collab: p.collab, scope: p.scope };
    let shown = 0;
    wrap.querySelectorAll(".meta-row").forEach((row) => {
      const val = values[row.dataset.row];
      row.querySelector(".meta-value").textContent = val || "";
      row.classList.toggle("is-empty", !val);
      if (val) shown++;
    });
    wrap.classList.toggle("is-empty", shown === 0);
  }

  function closeLightbox() {
    if (!lightbox.classList.contains("open")) return;
    lightbox.classList.remove("open");
    // drop the embed after the fade so the video stops playing
    setTimeout(() => {
      if (!lightbox.classList.contains("open")) {
        lightbox.querySelector(".lightbox-media").innerHTML = "";
      }
    }, 420);
  }

  lightbox.addEventListener("click", closeLightbox);

  /* ── Overlays ───────────────────────────── */
  function bindOverlay(btnSel, overlayId) {
    const overlay = document.getElementById(overlayId);
    document.querySelector(btnSel).addEventListener("click", () => {
      // switching between menus: close whatever is open, then open this
      // one — both animate, giving a cross transition between boxes
      document.querySelectorAll(".overlay.open").forEach((o) => {
        if (o !== overlay) o.classList.remove("open");
      });
      closeLightbox();
      loadDeferredImages(overlay);   // baru unduh gambarnya sekarang
      overlay.classList.add("open");
    });
    overlay.querySelectorAll("[data-close]").forEach((el) =>
      el.addEventListener("click", () => overlay.classList.remove("open"))
    );
  }
  bindOverlay(".nav-about", "about");
  bindOverlay(".nav-clients", "clients");
  bindOverlay(".nav-contact", "contact");

  const homeTip = document.getElementById("home-tip");
  let homeTipTimer;
  document.querySelector(".nav-home").addEventListener("click", () => {
    document.querySelectorAll(".overlay.open").forEach((o) =>
      o.classList.remove("open")
    );
    closeLightbox();
    // glide back home
    targetX = 0;
    targetY = 0;
    velX = velY = 0;
    // flash the hint bubble
    homeTip.classList.add("show");
    clearTimeout(homeTipTimer);
    homeTipTimer = setTimeout(() => homeTip.classList.remove("show"), 2200);
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".overlay.open").forEach((o) =>
        o.classList.remove("open")
      );
      closeLightbox();
    }
  });

  /* ── About: skills grid ─────────────────── */
  function buildSkills() {
    const grid = document.getElementById("skills-grid");
    SKILLS.forEach((name) => {
      const slug = name.toLowerCase().replace(/\s+/g, "-");
      const item = document.createElement("div");
      item.className = "skill";

      const icon = document.createElement("div");
      icon.className = "skill-icon";
      const letter = document.createElement("span");
      letter.textContent = name.charAt(0);
      icon.appendChild(letter);

      const img = document.createElement("img");
      img.alt = name;
      img.dataset.src = "images/skills/" + slug + ".jpg";
      img.onerror = function () {
        if (this.src.endsWith(".jpg")) {
          this.src = this.src.replace(/\.jpg$/, ".png");
        } else {
          this.remove();
        }
      };
      icon.appendChild(img);

      const label = document.createElement("div");
      label.className = "skill-label";
      label.textContent = name;

      item.appendChild(icon);
      item.appendChild(label);
      grid.appendChild(item);
    });
  }

  /* ── Clients grid (mini home-style tiles) ── */
  function buildClients() {
    const grid = document.getElementById("clients-grid");
    for (let i = 0; i < NUM_CLIENTS; i++) {
      const n = String(i + 1).padStart(2, "0");
      const tile = document.createElement("div");
      tile.className = "client-tile";

      const media = document.createElement("div");
      media.className = "tile-media";

      const ph = document.createElement("div");
      ph.className = "tile-ph";
      ph.style.background =
        "linear-gradient(135deg, hsl(" + ((i * 61) % 360) + ", 55%, 74%), hsl(" +
        ((i * 61 + 50) % 360) + ", 60%, 54%))";
      ph.textContent = "Client " + n;
      media.appendChild(ph);

      const img = document.createElement("img");
      img.alt = "Client " + n;
      img.dataset.src = "images/clients/client-" + n + ".jpg";
      img.onerror = function () {
        if (this.src.endsWith(".jpg")) {
          this.src = this.src.replace(/\.jpg$/, ".png");
        } else {
          this.remove();
        }
      };
      media.appendChild(img);

      tile.appendChild(media);
      grid.appendChild(tile);
    }
  }

  /* ── Category segmented control (iOS style) ── */
  const seg = document.getElementById("category-seg");
  const segBtns = Array.from(seg.querySelectorAll(".seg-btn"));
  const segThumb = seg.querySelector(".seg-thumb");

  function placeThumb() {
    const btn = seg.querySelector(".seg-btn.active");
    segThumb.style.width = btn.offsetWidth + "px";
    segThumb.style.transform = "translateX(" + btn.offsetLeft + "px)";
  }

  function setCategory(cat) {
    segBtns.forEach((b) => b.classList.toggle("active", b.dataset.cat === cat));
    placeThumb();
    if (cat === currentCat) return;
    currentCat = cat;

    // fade the canvas out, rebuild with the filtered set, pop back in
    world.style.opacity = "0";
    setTimeout(() => {
      build();
      world.querySelectorAll(".tile.intro").forEach((t) => {
        t.style.transitionDelay = (Math.random() * 0.35).toFixed(2) + "s";
        t.classList.remove("intro");
      });
      setTimeout(() => {
        world.querySelectorAll(".tile").forEach((t) => (t.style.transitionDelay = ""));
      }, 1200);
      world.style.opacity = "1";
      updateCounter();
    }, 260);
  }

  // tap OR drag/slide the thumb — released nearest segment wins
  let segDrag = null;
  seg.addEventListener("pointerdown", (e) => {
    segDrag = { startX: e.clientX, moved: false };
    seg.setPointerCapture(e.pointerId);
  });
  seg.addEventListener("pointermove", (e) => {
    if (!segDrag) return;
    if (Math.abs(e.clientX - segDrag.startX) > 6) segDrag.moved = true;
    if (segDrag.moved) {
      seg.classList.add("dragging");
      const rect = seg.getBoundingClientRect();
      let px = e.clientX - rect.left - segThumb.offsetWidth / 2;
      px = Math.max(4, Math.min(px, seg.clientWidth - segThumb.offsetWidth - 4));
      segThumb.style.transform = "translateX(" + px + "px)";
    }
  });
  function segEnd(e) {
    if (!segDrag) return;
    seg.classList.remove("dragging");
    const rect = seg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let best = segBtns[0], bd = Infinity;
    segBtns.forEach((b) => {
      const d = Math.abs(b.offsetLeft + b.offsetWidth / 2 - x);
      if (d < bd) { bd = d; best = b; }
    });
    setCategory(best.dataset.cat);
    segDrag = null;
  }
  seg.addEventListener("pointerup", segEnd);
  seg.addEventListener("pointercancel", () => {
    seg.classList.remove("dragging");
    placeThumb();
    segDrag = null;
  });

  /* ── Theme toggle ───────────────────────── */
  const themeBtn = document.getElementById("theme-toggle");
  if (localStorage.getItem("theme") === "dark") {
    document.documentElement.classList.add("dark");
  }
  themeBtn.addEventListener("click", () => {
    const dark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", dark ? "dark" : "light");
  });

  /* ── Mengukur ukuran asli file (cadangan) ──
     Hanya dipakai untuk file yang belum terdaftar di media-sizes.js */
  function measureImage(url) {
    return new Promise((done) => {
      const im = new Image();
      let triedPng = false;
      im.onload = () => {
        if (im.naturalWidth) MEASURED[url] = im.naturalWidth / im.naturalHeight;
        done();
      };
      im.onerror = () => {
        if (!triedPng && url.endsWith(".jpg")) {
          triedPng = true;
          im.src = url.replace(/\.jpg$/, ".png");
        } else {
          done();
        }
      };
      im.src = url;
    });
  }

  function measureVideo(url) {
    return new Promise((done) => {
      const v = document.createElement("video");
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        v.removeAttribute("src");   // lepaskan unduhan, jangan ditahan
        v.load();
        done();
      };
      v.preload = "metadata";       // cuma header, bukan seluruh video
      v.muted = true;
      v.addEventListener("loadedmetadata", () => {
        if (v.videoWidth) MEASURED[url] = v.videoWidth / v.videoHeight;
        finish();
      });
      v.addEventListener("error", finish);
      setTimeout(finish, 5000);     // jangan menggantung kalau file besar
      v.src = url;
    });
  }

  /* ── Preloader + intro ────────────────────
     Kalau js/media-sizes.js sudah lengkap, tidak ada yang perlu diukur
     sehingga website langsung siap tanpa mengunduh apa pun dulu. */
  function runPreloader() {
    const MIN_MS = 800;           // biar animasi loader sempat terlihat
    const DEADLINE_MS = 6000;     // jangan menunggu selamanya

    const todo = [];
    const seen = {};
    projects.forEach((p) => {
      const u = mediaURL(p);
      if (u && !seen[u]) {
        seen[u] = 1;
        if (!MEASURED[u]) todo.push({ url: u, video: !!(p.video && p.vid) });
      }
    });

    const total = todo.length;
    let measured = 0;
    let finished = false;
    let lateTimer;

    todo.forEach((it) => {
      (it.video ? measureVideo(it.url) : measureImage(it.url)).then(() => {
        measured++;
        // file yang selesai SETELAH canvas terlanjur dibangun:
        // susun ulang sekali saja supaya rasionya ikut benar
        if (finished) {
          clearTimeout(lateTimer);
          lateTimer = setTimeout(() => {
            build();
            revealTiles();
          }, 900);
        }
      });
    });

    const start = performance.now();
    let shown = 0;
    // interval (bukan rAF) supaya tetap jalan walau tab di-throttle
    const iv = setInterval(() => {
      const elapsed = performance.now() - start;
      const real = total === 0 ? elapsed / MIN_MS : measured / total;
      shown += Math.min(0.04, Math.max(0, real - shown));
      if ((measured >= total && elapsed >= MIN_MS) || elapsed >= DEADLINE_MS) {
        shown = 1;
      }
      const pct = Math.round(shown * 100);
      percentEl.textContent = pct + "%";
      if (barFillEl) barFillEl.style.width = pct + "%";

      if (shown >= 1) {
        clearInterval(iv);
        finished = true;
        build();                  // disusun saat rasio sudah diketahui
        updateCounter();
        preloader.classList.add("done");
        introTiles();
      }
    }, 1000 / 60);
  }

  function revealTiles() {
    world.querySelectorAll(".tile.intro").forEach((t) =>
      t.classList.remove("intro")
    );
  }

  function introTiles() {
    const tiles = world.querySelectorAll(".tile.intro");
    tiles.forEach((t) => {
      t.style.transitionDelay = (Math.random() * 0.55).toFixed(2) + "s";
      t.classList.remove("intro");
    });
    setTimeout(() => {
      tiles.forEach((t) => (t.style.transitionDelay = ""));
    }, 1600);
  }

  /* ── Resize ─────────────────────────────── */
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      build();
      // tiles rebuilt with .intro — reveal instantly (no re-intro on resize)
      world.querySelectorAll(".tile.intro").forEach((t) =>
        t.classList.remove("intro")
      );
      placeThumb();
    }, 250);
  });

  /* ── Go ─────────────────────────────────── */
  buildSkills();
  buildClients();
  updateCounter();
  placeThumb();
  // re-measure once fonts have settled
  setTimeout(placeThumb, 400);
  render();
  // build() dipanggil di dalam runPreloader, setelah rasio tiap file
  // diketahui — jadi canvas langsung tersusun dengan bentuk yang benar
  runPreloader();
  // interval (not rAF) so loading/playback keeps in sync even when the
  // browser throttles animation frames
  setInterval(syncMedia, 220);
})();
