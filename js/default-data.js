// ============================================================================
// DEFAULT DATA & HELPERS (PIRATE TREASURE EDITION — 5 TIM DEFAULT)
// ============================================================================
window.TMD = window.TMD || {};

window.TMD.generateUuid = function generateUuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

window.TMD.hexToRgba = function hexToRgba(hex, alpha) {
  const clean = (hex || '#EF4444').replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((ch) => ch + ch).join('')
    : clean.padEnd(6, '0').slice(0, 6);
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

window.TMD.createDefaultDataset = function createDefaultDataset() {
  const TEAM_IDS = {
    1: '11111111-1111-4111-8111-000000000001',
    2: '11111111-1111-4111-8111-000000000002',
    3: '11111111-1111-4111-8111-000000000003',
    4: '11111111-1111-4111-8111-000000000004',
    5: '11111111-1111-4111-8111-000000000005'
  };

  const POS_IDS = {
    1: '22222222-2222-4222-8222-000000000001',
    2: '22222222-2222-4222-8222-000000000002',
    3: '22222222-2222-4222-8222-000000000003',
    4: '22222222-2222-4222-8222-000000000004'
  };

  const teams = [
    {
      id: TEAM_IDS[1],
      sort_order: 1,
      name: 'Kelompok 01',
      division_title: 'Kapal Merah',
      color_name: 'Merah',
      accent_hex: '#EF4444',
      route_code: 'Rute A',
      hero_first: 'KAPAL',
      hero_second: 'MERAH',
      image_url: 'pirate-red'
    },
    {
      id: TEAM_IDS[2],
      sort_order: 2,
      name: 'Kelompok 02',
      division_title: 'Armada Biru',
      color_name: 'Biru',
      accent_hex: '#38BDF8',
      route_code: 'Rute B',
      hero_first: 'ARMADA',
      hero_second: 'BIRU',
      image_url: 'pirate-blue'
    },
    {
      id: TEAM_IDS[3],
      sort_order: 3,
      name: 'Kelompok 03',
      division_title: 'Kompas Emas',
      color_name: 'Emas',
      accent_hex: '#E69B19',
      route_code: 'Rute C',
      hero_first: 'KOMPAS',
      hero_second: 'EMAS',
      image_url: 'pirate-gold'
    },
    {
      id: TEAM_IDS[4],
      sort_order: 4,
      name: 'Kelompok 04',
      division_title: 'Zamrud Laut',
      color_name: 'Hijau',
      accent_hex: '#10B981',
      route_code: 'Rute D',
      hero_first: 'ZAMRUD',
      hero_second: 'LAUT',
      image_url: 'pirate-green'
    },
    {
      id: TEAM_IDS[5],
      sort_order: 5,
      name: 'Kelompok 05',
      division_title: 'Harta Ungu',
      color_name: 'Ungu',
      accent_hex: '#8B5CF6',
      route_code: 'Rute E',
      hero_first: 'HARTA',
      hero_second: 'UNGU',
      image_url: 'pirate-purple'
    }
  ];

  const checkpoints = [
    {
      id: POS_IDS[1],
      pos_number: 1,
      title: 'POS 1',
      category_label: 'KUIS POS 1',
      xp_reward: 150,
      is_convergence: false
    },
    {
      id: POS_IDS[2],
      pos_number: 2,
      title: 'POS 2',
      category_label: 'KUIS POS 2',
      xp_reward: 150,
      is_convergence: false
    },
    {
      id: POS_IDS[3],
      pos_number: 3,
      title: 'POS 3',
      category_label: 'KUIS POS 3',
      xp_reward: 200,
      is_convergence: false
    },
    {
      id: POS_IDS[4],
      pos_number: 4,
      title: 'POS 4',
      category_label: 'KUIS POS 4',
      xp_reward: 250,
      is_convergence: true
    }
  ];

  const questions = [
    // ================= POS 1 (10 SOAL) =================
    {
      id: '33333333-3333-4333-8333-000000000101',
      checkpoint_id: POS_IDS[1],
      team_id: null,
      question_text: 'Mengapa masyarakat membutuhkan aturan (norma) dalam kehidupan bersama?',
      option_a: 'Agar setiap orang bebas bertindak sesuka hati tanpa batas',
      option_b: 'Untuk mencegah kekacauan (chaos), benturan kepentingan, dan rasa tidak aman',
      option_c: 'Supaya hanya kelompok tertentu yang berkuasa di sekolah dan jalan raya',
      option_d: 'Agar tidak ada lagi perbedaan pendapat di masyarakat',
      correct_option: 'B'
    },
    {
      id: '33333333-3333-4333-8333-000000000102',
      checkpoint_id: POS_IDS[1],
      team_id: null,
      question_text: 'Segala sesuatu yang dianggap berharga, berguna, penting, dan menjadi cita-cita luhur yang ingin dicapai bersama oleh masyarakat disebut...',
      option_a: 'Norma',
      option_b: 'Sanksi',
      option_c: 'Nilai',
      option_d: 'Hukum',
      correct_option: 'C'
    },
    {
      id: '33333333-3333-4333-8333-000000000103',
      checkpoint_id: POS_IDS[1],
      team_id: null,
      question_text: 'Secara mendasar, konsep Nilai menjawab pertanyaan apa dalam kehidupan bermasyarakat?',
      option_a: '“Apa yang dianggap penting?”',
      option_b: '“Siapa yang membuat aturan?”',
      option_c: '“Berapa denda bagi pelanggar?”',
      option_d: '“Kapan aturan mulai berlaku?”',
      correct_option: 'A'
    },
    {
      id: '33333333-3333-4333-8333-000000000104',
      checkpoint_id: POS_IDS[1],
      team_id: null,
      question_text: 'Menurut Prof. Notonagoro, nilai sosial dibagi menjadi tiga golongan utama, yaitu...',
      option_a: 'Nilai hukum, nilai adat, dan nilai agama',
      option_b: 'Nilai material, nilai vital, dan nilai kerohanian',
      option_c: 'Nilai pribadi, nilai kelompok, dan nilai negara',
      option_d: 'Nilai kebenaran, nilai keindahan, dan nilai moral',
      correct_option: 'B'
    },
    {
      id: '33333333-3333-4333-8333-000000000105',
      checkpoint_id: POS_IDS[1],
      team_id: null,
      question_text: 'Makanan pokok, air minum, pakaian layak, dan tempat tinggal termasuk contoh dari...',
      option_a: 'Nilai vital',
      option_b: 'Nilai kerohanian',
      option_c: 'Nilai material',
      option_d: 'Nilai moral',
      correct_option: 'C'
    },
    {
      id: '33333333-3333-4333-8333-000000000106',
      checkpoint_id: POS_IDS[1],
      team_id: null,
      question_text: 'Cangkul bagi petani, jaring bagi nelayan, serta buku dan laptop bagi pelajar merupakan contoh Nilai Vital karena...',
      option_a: 'Hanya berguna untuk kebutuhan rohani dan ibadah',
      option_b: 'Bersumber dari perasaan estetika dan keindahan',
      option_c: 'Berguna bagi manusia untuk dapat menjalankan aktivitas atau usaha',
      option_d: 'Merupakan cita-cita tertinggi yang bersumber dari wahyu Tuhan',
      correct_option: 'C'
    },
    {
      id: '33333333-3333-4333-8333-000000000107',
      checkpoint_id: POS_IDS[1],
      team_id: null,
      question_text: 'Nilai kerohanian yang bersumber dari akal pikir, logika, dan rasio manusia—seperti fakta ilmu pengetahuan dan keadilan hukum—disebut...',
      option_a: 'Nilai kebenaran',
      option_b: 'Nilai keindahan',
      option_c: 'Nilai moral/kebaikan',
      option_d: 'Nilai religius',
      correct_option: 'A'
    },
    {
      id: '33333333-3333-4333-8333-000000000108',
      checkpoint_id: POS_IDS[1],
      team_id: null,
      question_text: 'Lukisan pemandangan, karya musik, dan seni ukir merupakan wujud dari nilai kerohanian jenis...',
      option_a: 'Nilai kebenaran',
      option_b: 'Nilai keindahan (estetika)',
      option_c: 'Nilai vital',
      option_d: 'Nilai religius',
      correct_option: 'B'
    },
    {
      id: '33333333-3333-4333-8333-000000000109',
      checkpoint_id: POS_IDS[1],
      team_id: null,
      question_text: 'Kebiasaan menolong sesama dan bersikap sopan santun bersumber dari kehendak baik dan karsa manusia (etika). Hal ini termasuk...',
      option_a: 'Nilai material',
      option_b: 'Nilai kebenaran',
      option_c: 'Nilai moral/kebaikan',
      option_d: 'Nilai keindahan',
      correct_option: 'C'
    },
    {
      id: '33333333-3333-4333-8333-000000000110',
      checkpoint_id: POS_IDS[1],
      team_id: null,
      question_text: 'Manakah nilai tertinggi dan mutlak menurut Prof. Notonagoro yang bersumber langsung dari wahyu Tuhan Yang Maha Esa?',
      option_a: 'Nilai vital',
      option_b: 'Nilai kebenaran',
      option_c: 'Nilai moral',
      option_d: 'Nilai religius',
      correct_option: 'D'
    },

    // ================= POS 2 (10 SOAL) =================
    {
      id: '33333333-3333-4333-8333-000000000201',
      checkpoint_id: POS_IDS[2],
      team_id: null,
      question_text: 'Kaidah, aturan, petunjuk, atau pedoman perilaku yang disepakati bersama untuk mengatur hubungan antarmanusia agar tercipta ketertiban dan keadilan disebut...',
      option_a: 'Nilai',
      option_b: 'Norma',
      option_c: 'Cita-cita',
      option_d: 'Logika',
      correct_option: 'B'
    },
    {
      id: '33333333-3333-4333-8333-000000000202',
      checkpoint_id: POS_IDS[2],
      team_id: null,
      question_text: 'Jika Nilai menjawab pertanyaan “Apa yang dianggap penting?”, maka Norma menjawab pertanyaan...',
      option_a: '“Bagaimana cara mewujudkan nilai tersebut?”',
      option_b: '“Mengapa manusia harus bekerja?”',
      option_c: '“Siapa yang paling berkuasa?”',
      option_d: '“Apa hasil karya seni terbaik?”',
      correct_option: 'A'
    },
    {
      id: '33333333-3333-4333-8333-000000000203',
      checkpoint_id: POS_IDS[2],
      team_id: null,
      question_text: 'Perbedaan sifat mendasar antara Nilai dan Norma adalah...',
      option_a: 'Nilai bersifat tertulis, sedangkan norma tidak tertulis',
      option_b: 'Nilai bersifat cita-cita/tujuan batiniah, sedangkan norma bersifat tindakan nyata/aturan tingkah laku',
      option_c: 'Nilai hanya berlaku di sekolah, sedangkan norma hanya di jalan raya',
      option_d: 'Nilai dibuat oleh DPR, sedangkan norma dibuat oleh pelajar',
      correct_option: 'B'
    },
    {
      id: '33333333-3333-4333-8333-000000000204',
      checkpoint_id: POS_IDS[2],
      team_id: null,
      question_text: 'Mematuhi rambu lalu lintas, memakai helm SNI, dan berhenti saat lampu merah adalah bentuk norma yang mewujudkan...',
      option_a: 'Nilai keindahan',
      option_b: 'Nilai kebersihan',
      option_c: 'Nilai keselamatan',
      option_d: 'Nilai kejujuran',
      correct_option: 'C'
    },
    {
      id: '33333333-3333-4333-8333-000000000205',
      checkpoint_id: POS_IDS[2],
      team_id: null,
      question_text: 'Tindakan nyata yang mencerminkan Norma untuk mewujudkan Nilai Kejujuran di sekolah adalah...',
      option_a: 'Membuang sampah pada tempatnya dan piket kelas',
      option_b: 'Mengerjakan ujian sendiri tanpa menyontek dan mengembalikan barang temuan',
      option_c: 'Memakai helm SNI saat dibonceng orang tua',
      option_d: 'Mencium tangan orang tua saat berpamitan',
      correct_option: 'B'
    },
    {
      id: '33333333-3333-4333-8333-000000000206',
      checkpoint_id: POS_IDS[2],
      team_id: null,
      question_text: 'Seorang siswa rajin melaksanakan piket kelas dan selalu membuang sampah pada tempatnya. Tindakan tersebut merupakan penerapan norma dari...',
      option_a: 'Nilai keselamatan',
      option_b: 'Nilai kebersihan',
      option_c: 'Nilai religius',
      option_d: 'Nilai rasa hormat',
      correct_option: 'B'
    },
    {
      id: '33333333-3333-4333-8333-000000000207',
      checkpoint_id: POS_IDS[2],
      team_id: null,
      question_text: 'Berbicara santun, mencium tangan orang tua saat pamit, dan menyapa guru di sekolah adalah norma untuk mewujudkan...',
      option_a: 'Nilai rasa hormat',
      option_b: 'Nilai material',
      option_c: 'Nilai vital',
      option_d: 'Nilai kebenaran',
      correct_option: 'A'
    },
    {
      id: '33333333-3333-4333-8333-000000000208',
      checkpoint_id: POS_IDS[2],
      team_id: null,
      question_text: 'Mengapa aturan (norma) di sekolah dan masyarakat harus disepakati dan dipatuhi bersama?',
      option_a: 'Agar siswa tidak boleh keluar kelas sama sekali',
      option_b: 'Supaya terwujud ketertiban, keamanan, dan keadilan dalam kehidupan bersama',
      option_c: 'Untuk menambah beban tugas pelajar setiap hari',
      option_d: 'Agar kendaraan bisa saling serobot di jalan raya',
      correct_option: 'B'
    },
    {
      id: '33333333-3333-4333-8333-000000000209',
      checkpoint_id: POS_IDS[2],
      team_id: null,
      question_text: 'Manakah pasangan Nilai dan Norma yang PALING TEPAT berikut ini?',
      option_a: 'Nilai Keselamatan — Tidak menyontek saat ulangan',
      option_b: 'Nilai Kebersihan — Berhenti saat lampu merah',
      option_c: 'Nilai Kejujuran — Mengembalikan dompet teman yang ditemukan',
      option_d: 'Nilai Rasa Hormat — Melaksanakan piket kelas setiap pagi',
      correct_option: 'C'
    },
    {
      id: '33333333-3333-4333-8333-000000000210',
      checkpoint_id: POS_IDS[2],
      team_id: null,
      question_text: 'Pernyataan yang benar mengenai hubungan timbal balik antara Nilai dan Norma adalah...',
      option_a: 'Nilai dapat terwujud nyata tanpa memerlukan norma sama sekali',
      option_b: 'Norma adalah pedoman praktis agar nilai-nilai luhur yang dijunjung masyarakat dapat terwujud nyata',
      option_c: 'Norma selalu bertentangan dengan nilai yang diyakini masyarakat',
      option_d: 'Nilai dan norma hanya berlaku bagi orang dewasa',
      correct_option: 'B'
    },

    // ================= POS 3 (10 SOAL) =================
    {
      id: '33333333-3333-4333-8333-000000000301',
      checkpoint_id: POS_IDS[3],
      team_id: null,
      question_text: 'Norma yang bersumber dari wahyu atau firman Tuhan Yang Maha Esa yang termaktub dalam kitab suci adalah...',
      option_a: 'Norma Kesusilaan',
      option_b: 'Norma Kesopanan',
      option_c: 'Norma Agama',
      option_d: 'Norma Hukum',
      correct_option: 'C'
    },
    {
      id: '33333333-3333-4333-8333-000000000302',
      checkpoint_id: POS_IDS[3],
      team_id: null,
      question_text: 'Sanksi bagi pelanggar Norma Agama bersifat tidak langsung di dunia, yaitu berupa...',
      option_a: 'Denda uang dan kurungan penjara',
      option_b: 'Teguran dan cemoohan tetangga',
      option_c: 'Rasa berdosa serta pembalasan di akhirat kelak',
      option_d: 'Penyitaan barang oleh aparat negara',
      correct_option: 'C'
    },
    {
      id: '33333333-3333-4333-8333-000000000303',
      checkpoint_id: POS_IDS[3],
      team_id: null,
      question_text: 'Norma yang bersumber dari suara hati nurani (sanubari) manusia untuk membedakan baik dan buruk adalah...',
      option_a: 'Norma Kesusilaan',
      option_b: 'Norma Kesopanan',
      option_c: 'Norma Hukum',
      option_d: 'Norma Agama',
      correct_option: 'A'
    },
    {
      id: '33333333-3333-4333-8333-000000000304',
      checkpoint_id: POS_IDS[3],
      team_id: null,
      question_text: 'Ketika seseorang berbohong kepada temannya, ia merasa gelisah, malu pada diri sendiri, dan menyesal dalam hati. Sanksi tersebut berasal dari pelanggaran...',
      option_a: 'Norma Hukum',
      option_b: 'Norma Kesusilaan',
      option_c: 'Norma Kesopanan',
      option_d: 'Norma Adat tertulis',
      correct_option: 'B'
    },
    {
      id: '33333333-3333-4333-8333-000000000305',
      checkpoint_id: POS_IDS[3],
      team_id: null,
      question_text: 'Norma Kesopanan bersumber dari tata krama, adat kebiasaan, dan pergaulan masyarakat setempat. Oleh karena itu, Norma Kesopanan bersifat...',
      option_a: 'Memaksa dengan hukuman penjara',
      option_b: 'Mutlak sama di seluruh dunia',
      option_c: 'Relatif (berbeda-beda standarnya di setiap daerah atau budaya)',
      option_d: 'Hanya berlaku di dalam gedung pengadilan',
      correct_option: 'C'
    },
    {
      id: '33333333-3333-4333-8333-000000000306',
      checkpoint_id: POS_IDS[3],
      team_id: null,
      question_text: 'Sanksi yang diterima oleh seseorang yang melanggar Norma Kesopanan—seperti tidak mengucap salam saat bertamu atau meludah sembarangan—adalah...',
      option_a: 'Pidana penjara dan denda uang',
      option_b: 'Teguran, cemoohan, celaan, atau dikucilkan dari pergaulan sosial',
      option_c: 'Penyitaan kendaraan bermotor',
      option_d: 'Rasa berdosa dan siksa akhirat saja',
      correct_option: 'B'
    },
    {
      id: '33333333-3333-4333-8333-000000000307',
      checkpoint_id: POS_IDS[3],
      team_id: null,
      question_text: 'Norma yang dibuat oleh lembaga negara yang berwenang (Pemerintah/DPR), berbentuk tertulis, dan bersifat memaksa bagi setiap warga negara adalah...',
      option_a: 'Norma Agama',
      option_b: 'Norma Kesusilaan',
      option_c: 'Norma Kesopanan',
      option_d: 'Norma Hukum',
      correct_option: 'D'
    },
    {
      id: '33333333-3333-4333-8333-000000000308',
      checkpoint_id: POS_IDS[3],
      team_id: null,
      question_text: 'Manakah yang merupakan contoh penerapan Norma Hukum dalam kehidupan bernegara?',
      option_a: 'Mengakui kesalahan secara kesatria di hadapan sahabat',
      option_b: 'Membayar pajak, mematuhi aturan lalu lintas, dan tidak merusak fasilitas umum',
      option_c: 'Mengucapkan permisi saat melewati orang yang lebih tua',
      option_d: 'Melaksanakan sholat atau kebaktian tepat waktu',
      correct_option: 'B'
    },
    {
      id: '33333333-3333-4333-8333-000000000309',
      checkpoint_id: POS_IDS[3],
      team_id: null,
      question_text: 'Sanksi bagi pelanggar Norma Hukum berbeda dengan norma lainnya karena bersifat tegas dan nyata, yaitu berupa...',
      option_a: 'Denda uang, penyitaan, kurungan, atau pidana penjara',
      option_b: 'Penyesalan mendalam di dalam hati',
      option_c: 'Bahan gunjingan di lingkungan sekitar',
      option_d: 'Rasa gelisah dan malu pada diri sendiri',
      correct_option: 'A'
    },
    {
      id: '33333333-3333-4333-8333-000000000310',
      checkpoint_id: POS_IDS[3],
      team_id: null,
      question_text: 'Mengakui kesalahan secara kesatria, jujur saat ujian, dan menolong orang yang sedang kesulitan merupakan contoh penerapan dari...',
      option_a: 'Norma Hukum',
      option_b: 'Norma Kesopanan',
      option_c: 'Norma Kesusilaan',
      option_d: 'Norma Lalu Lintas',
      correct_option: 'C'
    },

    // ================= POS 4 PUNCAK =================
    {
      id: '33333333-3333-4333-8333-000000000401',
      checkpoint_id: POS_IDS[4],
      team_id: null,
      question_text: '“Kini seluruh kelompok telah melewati berbagai pos tantangan dan berkumpul di titik puncak bersama. Apa makna utama dari ketaatan terhadap keempat norma (Agama, Kesusilaan, Kesopanan, dan Hukum) bagi kehidupan bermasyarakat dan bernegara?”',
      option_a: 'Agar setiap warga negara takut kepada aparat sehingga tidak berani menyampaikan pendapat',
      option_b: 'Supaya masyarakat hanya mematuhi aturan hukum negara dan mengabaikan tata krama setempat',
      option_c: 'Sebagai wujud nyata profil pelajar Pancasila dalam mewujudkan nilai-nilai luhur demi menjaga ketertiban, keutuhan, dan ketenteraman hidup berbangsa dan bernegara',
      option_d: 'Karena norma hanyalah syarat formalitas di sekolah yang tidak berpengaruh di lingkungan masyarakat',
      correct_option: 'C'
    }
  ];

  const route_clues = [
    // POS 1 -> Petunjuk menuju POS 2
    { id: '44444444-4444-4444-8444-000000000101', checkpoint_id: POS_IDS[1], team_id: TEAM_IDS[1], access_token: 'KAPAL-01', next_clue_text: 'Dari Terasmu, naiklah ke lantai 2 menuju LBS Besar (Muga). Carilah penjaga pos di area LBS Besar Muga Lantai 2 untuk mendapatkan kata sandi Pos 02!', distance_label: 'MUGA LT. 2' },
    { id: '44444444-4444-4444-8444-000000000102', checkpoint_id: POS_IDS[1], team_id: TEAM_IDS[2], access_token: 'ARMADA-01', next_clue_text: 'Dari Garden Muga, melangkahlah naik ke Hall Lantai 2. Temui penjaga pos di area Hall Lantai 2 untuk membuka tantangan Pos 02!', distance_label: 'HALL LT. 2' },
    { id: '44444444-4444-4444-8444-000000000103', checkpoint_id: POS_IDS[1], team_id: TEAM_IDS[3], access_token: 'KOMPAS-01', next_clue_text: 'Dari lapangan depan masjid (ring basket), masuklah menuju MCC Lantai 1. Periksa bagian ujung dekat rak untuk menemukan Pos 02!', distance_label: 'MCC LT. 1' },
    { id: '44444444-4444-4444-8444-000000000104', checkpoint_id: POS_IDS[1], team_id: TEAM_IDS[4], access_token: 'ZAMRUD-01', next_clue_text: 'Dari Mulan Music Corner, bergeraklah menuju lorong di belakang Hall Lantai 1. Penjaga Pos 02 menunggumu di lorong tersebut!', distance_label: 'HALL LT. 1' },
    { id: '44444444-4444-4444-8444-000000000105', checkpoint_id: POS_IDS[1], team_id: TEAM_IDS[5], access_token: 'HARTA-01', next_clue_text: 'Dari LBS Bu Ella di Hall, berjalanlah dengan tenang menuju Mulan Lounge di dekat rak depan ruang guru. Pos 02 ada di sana!', distance_label: 'MULAN LOUNGE' },

    // POS 2 -> Petunjuk menuju POS 3
    { id: '44444444-4444-4444-8444-000000000201', checkpoint_id: POS_IDS[2], team_id: TEAM_IDS[1], access_token: 'KAPAL-02', next_clue_text: 'Dari LBS Besar Muga Lantai 2, turun dan arahkan langkahmu menuju Lobby Muma. Temukan Pos 03 di area lobby tersebut!', distance_label: 'LOBBY MUMA' },
    { id: '44444444-4444-4444-8444-000000000202', checkpoint_id: POS_IDS[2], team_id: TEAM_IDS[2], access_token: 'ARMADA-02', next_clue_text: 'Dari Hall Lantai 2, turunlah menuju Lobby Muga. Penjaga Pos 03 sudah menunggu kedatangan kelompokmu di Lobby Muga!', distance_label: 'LOBBY MUGA' },
    { id: '44444444-4444-4444-8444-000000000203', checkpoint_id: POS_IDS[2], team_id: TEAM_IDS[3], access_token: 'KOMPAS-02', next_clue_text: 'Dari MCC Lantai 1, bergeraklah menuju masjid dan naik ke lantai 2. Cek teras depan masjid dekat tempat wudhu untuk membuka Pos 03!', distance_label: 'MASJID LT. 2' },
    { id: '44444444-4444-4444-8444-000000000204', checkpoint_id: POS_IDS[2], team_id: TEAM_IDS[4], access_token: 'ZAMRUD-02', next_clue_text: 'Dari lorong belakang Hall Lantai 1, berjalanlah dengan tertib menuju Masjid Lantai 1. Cari pos di samping lemari mukena depan tempat wudhu!', distance_label: 'MASJID LT. 1' },
    { id: '44444444-4444-4444-8444-000000000205', checkpoint_id: POS_IDS[2], team_id: TEAM_IDS[5], access_token: 'HARTA-02', next_clue_text: 'Dari Mulan Lounge, melangkahlah menuju Terasmu di Lorong 6 Ibnu Sina. Kata sandi Pos 03 menunggumu di sana!', distance_label: 'TERASMU' },

    // POS 3 -> Petunjuk menuju BENDERA (LAB IPA LANTAI 4)
    { id: '44444444-4444-4444-8444-000000000301', checkpoint_id: POS_IDS[3], team_id: TEAM_IDS[1], access_token: 'KAPAL-03', next_clue_text: 'POS TERAKHIR! Dari Lobby Muma, bergeraklah bersama seluruh anggota menuju Lab IPA Lantai 4 (Titik Bendera Akhir) untuk menyelesaikan Pos 04!', distance_label: 'LAB IPA LT. 4' },
    { id: '44444444-4444-4444-8444-000000000302', checkpoint_id: POS_IDS[3], team_id: TEAM_IDS[2], access_token: 'ARMADA-03', next_clue_text: 'POS TERAKHIR! Dari Lobby Muga, bergeraklah bersama seluruh anggota menuju Lab IPA Lantai 4 (Titik Bendera Akhir) untuk menyelesaikan Pos 04!', distance_label: 'LAB IPA LT. 4' },
    { id: '44444444-4444-4444-8444-000000000303', checkpoint_id: POS_IDS[3], team_id: TEAM_IDS[3], access_token: 'KOMPAS-03', next_clue_text: 'POS TERAKHIR! Dari teras Masjid Lantai 2, bergeraklah bersama seluruh anggota menuju Lab IPA Lantai 4 (Titik Bendera Akhir) untuk menyelesaikan Pos 04!', distance_label: 'LAB IPA LT. 4' },
    { id: '44444444-4444-4444-8444-000000000304', checkpoint_id: POS_IDS[3], team_id: TEAM_IDS[4], access_token: 'ZAMRUD-03', next_clue_text: 'POS TERAKHIR! Dari Masjid Lantai 1, bergeraklah bersama seluruh anggota menuju Lab IPA Lantai 4 (Titik Bendera Akhir) untuk menyelesaikan Pos 04!', distance_label: 'LAB IPA LT. 4' },
    { id: '44444444-4444-4444-8444-000000000305', checkpoint_id: POS_IDS[3], team_id: TEAM_IDS[5], access_token: 'HARTA-03', next_clue_text: 'POS TERAKHIR! Dari Terasmu (Lorong 6 Ibnu Sina), bergeraklah bersama seluruh anggota menuju Lab IPA Lantai 4 (Titik Bendera Akhir) untuk menyelesaikan Pos 04!', distance_label: 'LAB IPA LT. 4' },

    // POS 4 -> Selesai di Lab IPA Lantai 4
    { id: '44444444-4444-4444-8444-000000000401', checkpoint_id: POS_IDS[4], team_id: TEAM_IDS[1], access_token: 'PUNCAK-04', next_clue_text: 'SELAMAT! Kelompok 01 (Kapal Merah) telah menyelesaikan seluruh Pos Treasure Hunt dan tiba di Bendera Akhir (Lab IPA Lantai 4)!', distance_label: 'SELESAI' },
    { id: '44444444-4444-4444-8444-000000000402', checkpoint_id: POS_IDS[4], team_id: TEAM_IDS[2], access_token: 'PUNCAK-04', next_clue_text: 'SELAMAT! Kelompok 02 (Armada Biru) telah menyelesaikan seluruh Pos Treasure Hunt dan tiba di Bendera Akhir (Lab IPA Lantai 4)!', distance_label: 'SELESAI' },
    { id: '44444444-4444-4444-8444-000000000403', checkpoint_id: POS_IDS[4], team_id: TEAM_IDS[3], access_token: 'PUNCAK-04', next_clue_text: 'SELAMAT! Kelompok 03 (Kompas Emas) telah menyelesaikan seluruh Pos Treasure Hunt dan tiba di Bendera Akhir (Lab IPA Lantai 4)!', distance_label: 'SELESAI' },
    { id: '44444444-4444-4444-8444-000000000404', checkpoint_id: POS_IDS[4], team_id: TEAM_IDS[4], access_token: 'PUNCAK-04', next_clue_text: 'SELAMAT! Kelompok 04 (Zamrud Laut) telah menyelesaikan seluruh Pos Treasure Hunt dan tiba di Bendera Akhir (Lab IPA Lantai 4)!', distance_label: 'SELESAI' },
    { id: '44444444-4444-4444-8444-000000000405', checkpoint_id: POS_IDS[4], team_id: TEAM_IDS[5], access_token: 'PUNCAK-04', next_clue_text: 'SELAMAT! Kelompok 05 (Harta Ungu) telah menyelesaikan seluruh Pos Treasure Hunt dan tiba di Bendera Akhir (Lab IPA Lantai 4)!', distance_label: 'SELESAI' }
  ];

  const team_progress = teams.map((t, idx) => ({
    id: `55555555-5555-4555-8555-00000000000${idx + 1}`,
    team_id: t.id,
    checkpoint_id: POS_IDS[1],
    token_verified: true,
    quiz_solved: false,
    selected_option: null,
    verified_at: new Date().toISOString(),
    solved_at: null
  }));

  return { teams, checkpoints, questions, route_clues, team_progress };
};
