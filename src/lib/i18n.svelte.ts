// The pages in the languages of the people who use them: Malaysian learning centres (Malay), Rohingya and other
// Myanmar learners (Burmese), Afghan learners in Indonesia (Dari, right to left), Indonesian centres. Rohingya itself
// has no script that phones render by default, so Rohingya learners get Burmese or Malay. The translations other than
// English were written by an AI and still need native speakers to review them (the page says so).
export const LANGS = { en: "English", ms: "Bahasa Melayu", id: "Bahasa Indonesia", my: "မြန်မာ", prs: "دری" } as const
export type Lang = keyof typeof LANGS
const RTL: Lang[] = ["prs"]

type Dict = Record<string, string>
const en: Dict = {
    vNoRecognition: "✗ No body the verifier trusts has recognised this centre's key on the registry",
    navCentre: "Centre", navWallet: "Wallet", navVerify: "Verify", language: "Language",
    reviewNote: "This translation was written by AI and has not yet been checked by a native speaker.",
    // wallet
    wTitle: "My learning records", wLead: "Kept on this phone only. You choose what to show, and to whom.",
    wRecords: "Records", wNone: "No records yet. When your centre gives you one, scan its code with this phone's camera, or add it below.",
    wFrom: "from", wShow: "Show", wNotOnRegistry: "a centre not on the registry", wRemove: "Remove", wRemoveAsk: "Remove this record from this phone? You can only get it back from your centre or a backup.",
    wShowTitle: "Show", wAlways: "What was learned is always shown. Your details stay hidden unless you tick them.",
    wShowName: "Show my name", wShowBirth: "Show my birth year", wMake: "Make the code", wValid: "Valid for 15 minutes", wOnlyHere: ", and only from this wallet",
    wScanHint: "The verifier scans it with any phone camera.", wCopy: "Copy link", wOpen: "Open the check", wBack: "Back",
    wCodeTitle: "My wallet code", wCodeLead: "Show this to your centre when they issue a record, so only this wallet can show it.", wAsText: "As text",
    wAddTitle: "Add a record", wAddLabel: "Record link or code", wNotRecord: "That is not a Bekal record.",
    wBackupTitle: "Backup", wBackupLead: "Phones get lost. Keep a backup file somewhere safe (a trusted relative's phone, a USB stick). It contains your wallet key: whoever has it can show your records.",
    wDownload: "Download backup", wRestore: "Restore a backup", wRestoreAsk: "Restore this backup? It replaces the wallet key on this phone.",
    wSaved: "Saved: {x}.", wAlready: "This record is already in your wallet.", wRestored: "Restored {n} record(s).", wRemoved: "Removed.",
    presentationQr: "Presentation QR code", walletQr: "My wallet code",
    // verify
    vTitle: "Check a learning record", vLead: "Scan the code the learner shows you. You see what they chose to show and whether it is genuine; nothing about them is looked up anywhere.",
    vChecking: "Checking the signature and the public registry…", vNotBekal: "That is not a Bekal record or presentation.",
    vOk: "✓ Genuine record from a recognised centre", vRevoked: "✗ Withdrawn by the centre", vNoWallet: "✗ Not shown from the learner's wallet", vForged: "✗ Not a genuine record", vUnrecognised: "✗ Not from a recognised centre",
    vCompleted: "Completed {d}", vHours: "{n} hours", vRef: "centre record {r}", vName: "Name: {x}", vBorn: "Born {x}", vHidden: "{n} of the learner's details kept private",
    vSigned: "Signed by the centre's key, and every claim shown matches what it signed", vIssued: "(issued {d})",
    vRecognised: "Recognised centre: {name}, {place}. Vouched for by {by}", vOnRegistry: "on the registry",
    vNotWithdrawn: "✓ Not withdrawn by the centre", vWithdrawn: "✗ The centre has withdrawn this record",
    vKbValid: "✓ Shown from the learner's own wallet, in the last 15 minutes", vKbMissing: "✗ This record belongs to a wallet, and this showing has no proof from it", vCard: "✓ A printed card (not tied to a phone)",
    vFreshness: "Withdrawals are read straight from the chain; if that fails, from the EAS index, which trails it by about a minute.",
    vScanTitle: "Scan a code", vScanLabel: "Presentation link or code",
    // scan
    sPaste: "Paste the link or code here", sUse: "Use this", sCamera: "Scan with camera", sPhoto: "Upload a photo",
    sNoQr: "No QR code found in that photo. Try a sharper, closer one.", sNoCamera: "The camera is not available here ({e}). Upload a photo or paste the link instead.",
    // issuer
    iTitle: "Issue a learning record", iLead: "For learning centres. The record is signed in this browser and handed to the learner; nothing about the learner is sent anywhere or written to a blockchain.",
    iCentre: "Your centre", iOwn: "My own centre (a new key, kept in this browser)", iKey: "Key", iChecking: "Checking the public registry…",
    iRecognised: "Recognised: {name}, {place}. Vouched for by {by}.", iNotRecognised: "Not recognised: {reason}. Records from this key will verify as signed, but not as from a recognised centre.",
    iRegistryDown: "The registry could not be read right now ({e}).", iPilotNote: "In a pilot, a recognised body (for example UNHCR, which already recognises learning centres, or an NGO consortium) vouches for this key on the registry.",
    iRecord: "The record", iCourse: "What was learned", iCoursePh: "e.g. Mathematics, Grade 6", iLevel: "Level or result", iLevelPh: "e.g. Completed, B1", iHours: "Hours", iDone: "Completed on", iRef: "Centre's record number", iOptional: "optional",
    iLearner: "The learner (optional, hidden unless they choose to show it)", iName: "Name", iBirth: "Birth year",
    iGiveTo: "Give it to", iBound: "The learner's wallet {a}: only that wallet can show this record.", iUseCard: "Use a printed card instead",
    iCardNote: "Without a wallet code, the record is a printed card anyone holding it can show, like paper.", iWalletCode: "Learner's wallet code",
    iBadCode: "That is not a Bekal wallet code. Ask the learner to open their wallet and show “My wallet code”.",
    iSign: "Sign and issue", iWriteCourse: "Write what was learned.", iIssuedBound: "Issued, bound to the learner's wallet. Let them scan the code.", iIssuedCard: "Issued as a printed card: print it and give it to the learner.",
    iScanThis: "Let the learner scan this", iCardTitle: "Printed card", iBoundHint: "Scanning it with the learner's phone opens their wallet and saves the record.", iCardHint: "Scanning it opens a Bekal wallet and saves the record there; keep the paper safe as a backup.",
    iPrint: "Print", iSigned: "The signed record (SD-JWT VC)", iIssuedList: "Issued from this key", iWallet: "wallet", iCard: "card", iRevoke: "Revoke", iRevoked: "Revoked",
    iRevokeAsk: "Revoke “{x}”? This is permanent and public.", iRevoking: "Writing the withdrawal to the registry…", iRevokedMsg: "Withdrawn. Verifiers see it as soon as the block is mined.", iCouldNot: "Could not: {e}",
    iKeyBackup: "Back up this centre's key", iKeyBackupNote: "Without its key a centre cannot withdraw the records it issued. Keep the file offline; whoever has it can issue as this centre.",
    iKeyRestore: "Restore a centre key", recordQr: "Learning record QR code", cardFrom: "Issued by", cardCompleted: "Completed"
}

const ms: Dict = {
    vNoRecognition: "✗ Tiada badan yang dipercayai telah mengiktiraf kunci pusat ini dalam daftar",
    navCentre: "Pusat", navWallet: "Dompet", navVerify: "Semak", language: "Bahasa",
    reviewNote: "Terjemahan ini ditulis oleh AI dan belum disemak oleh penutur asli.",
    wTitle: "Rekod pembelajaran saya", wLead: "Disimpan di telefon ini sahaja. Anda memilih apa yang ditunjukkan, dan kepada siapa.",
    wRecords: "Rekod", wNone: "Belum ada rekod. Apabila pusat anda memberikannya, imbas kodnya dengan kamera telefon ini, atau tambah di bawah.",
    wFrom: "daripada", wShow: "Tunjuk", wNotOnRegistry: "pusat yang tiada dalam daftar", wRemove: "Buang", wRemoveAsk: "Buang rekod ini dari telefon ini? Anda hanya boleh mendapatkannya semula daripada pusat anda atau sandaran.",
    wShowTitle: "Tunjuk", wAlways: "Apa yang dipelajari sentiasa ditunjukkan. Butiran anda kekal tersembunyi kecuali anda menandakannya.",
    wShowName: "Tunjukkan nama saya", wShowBirth: "Tunjukkan tahun lahir saya", wMake: "Buat kod", wValid: "Sah selama 15 minit", wOnlyHere: ", dan hanya dari dompet ini",
    wScanHint: "Penyemak mengimbasnya dengan kamera telefon apa-apa.", wCopy: "Salin pautan", wOpen: "Buka semakan", wBack: "Kembali",
    wCodeTitle: "Kod dompet saya", wCodeLead: "Tunjukkan ini kepada pusat anda semasa mereka mengeluarkan rekod, supaya hanya dompet ini boleh menunjukkannya.", wAsText: "Sebagai teks",
    wAddTitle: "Tambah rekod", wAddLabel: "Pautan atau kod rekod", wNotRecord: "Itu bukan rekod Bekal.",
    wBackupTitle: "Sandaran", wBackupLead: "Telefon boleh hilang. Simpan fail sandaran di tempat selamat (telefon saudara yang dipercayai, pemacu USB). Ia mengandungi kunci dompet anda: sesiapa yang memilikinya boleh menunjukkan rekod anda.",
    wDownload: "Muat turun sandaran", wRestore: "Pulihkan sandaran", wRestoreAsk: "Pulihkan sandaran ini? Ia menggantikan kunci dompet di telefon ini.",
    wSaved: "Disimpan: {x}.", wAlready: "Rekod ini sudah ada dalam dompet anda.", wRestored: "{n} rekod dipulihkan.", wRemoved: "Dibuang.",
    presentationQr: "Kod QR pembentangan", walletQr: "Kod dompet saya",
    vTitle: "Semak rekod pembelajaran", vLead: "Imbas kod yang ditunjukkan oleh pelajar. Anda melihat apa yang mereka pilih untuk ditunjukkan dan sama ada ia tulen; tiada apa-apa tentang mereka dicari di mana-mana.",
    vChecking: "Menyemak tandatangan dan daftar awam…", vNotBekal: "Itu bukan rekod atau pembentangan Bekal.",
    vOk: "✓ Rekod tulen daripada pusat yang diiktiraf", vRevoked: "✗ Ditarik balik oleh pusat", vNoWallet: "✗ Tidak ditunjukkan dari dompet pelajar", vForged: "✗ Bukan rekod tulen", vUnrecognised: "✗ Bukan daripada pusat yang diiktiraf",
    vCompleted: "Selesai {d}", vHours: "{n} jam", vRef: "rekod pusat {r}", vName: "Nama: {x}", vBorn: "Lahir {x}", vHidden: "{n} butiran pelajar dirahsiakan",
    vSigned: "Ditandatangani oleh kunci pusat, dan setiap tuntutan yang ditunjukkan sepadan dengan yang ditandatangani", vIssued: "(dikeluarkan {d})",
    vRecognised: "Pusat yang diiktiraf: {name}, {place}. Dijamin oleh {by}", vOnRegistry: "dalam daftar",
    vNotWithdrawn: "✓ Tidak ditarik balik oleh pusat", vWithdrawn: "✗ Pusat telah menarik balik rekod ini",
    vKbValid: "✓ Ditunjukkan dari dompet pelajar sendiri, dalam 15 minit terakhir", vKbMissing: "✗ Rekod ini milik sebuah dompet, dan tunjukan ini tiada bukti daripadanya", vCard: "✓ Kad bercetak (tidak terikat pada telefon)",
    vFreshness: "Penarikan balik dibaca terus dari rantaian; jika gagal, dari indeks EAS, yang lewat kira-kira seminit.",
    vScanTitle: "Imbas kod", vScanLabel: "Pautan atau kod pembentangan",
    sPaste: "Tampal pautan atau kod di sini", sUse: "Guna ini", sCamera: "Imbas dengan kamera", sPhoto: "Muat naik foto",
    sNoQr: "Tiada kod QR dalam foto itu. Cuba foto yang lebih jelas dan dekat.", sNoCamera: "Kamera tidak tersedia di sini ({e}). Muat naik foto atau tampal pautan.",
    iTitle: "Keluarkan rekod pembelajaran", iLead: "Untuk pusat pembelajaran. Rekod ditandatangani dalam pelayar ini dan diserahkan kepada pelajar; tiada apa-apa tentang pelajar dihantar ke mana-mana atau ditulis ke blockchain.",
    iCentre: "Pusat anda", iOwn: "Pusat saya sendiri (kunci baharu, disimpan dalam pelayar ini)", iKey: "Kunci", iChecking: "Menyemak daftar awam…",
    iRecognised: "Diiktiraf: {name}, {place}. Dijamin oleh {by}.", iNotRecognised: "Tidak diiktiraf: {reason}. Rekod daripada kunci ini akan disahkan sebagai ditandatangani, tetapi bukan daripada pusat yang diiktiraf.",
    iRegistryDown: "Daftar tidak dapat dibaca sekarang ({e}).", iPilotNote: "Dalam rintis, badan yang diiktiraf (contohnya UNHCR, yang sudah mengiktiraf pusat pembelajaran, atau konsortium NGO) menjamin kunci ini dalam daftar.",
    iRecord: "Rekod", iCourse: "Apa yang dipelajari", iCoursePh: "cth. Matematik, Darjah 6", iLevel: "Tahap atau keputusan", iLevelPh: "cth. Selesai, B1", iHours: "Jam", iDone: "Selesai pada", iRef: "Nombor rekod pusat", iOptional: "pilihan",
    iLearner: "Pelajar (pilihan, tersembunyi kecuali mereka memilih untuk menunjukkannya)", iName: "Nama", iBirth: "Tahun lahir",
    iGiveTo: "Berikan kepada", iBound: "Dompet pelajar {a}: hanya dompet itu boleh menunjukkan rekod ini.", iUseCard: "Guna kad bercetak",
    iCardNote: "Tanpa kod dompet, rekod ialah kad bercetak yang boleh ditunjukkan oleh sesiapa yang memegangnya, seperti kertas.", iWalletCode: "Kod dompet pelajar",
    iBadCode: "Itu bukan kod dompet Bekal. Minta pelajar membuka dompet mereka dan menunjukkan “Kod dompet saya”.",
    iSign: "Tandatangan dan keluarkan", iWriteCourse: "Tulis apa yang dipelajari.", iIssuedBound: "Dikeluarkan, terikat pada dompet pelajar. Biarkan mereka mengimbas kod.", iIssuedCard: "Dikeluarkan sebagai kad bercetak: cetak dan berikan kepada pelajar.",
    iScanThis: "Biarkan pelajar mengimbas ini", iCardTitle: "Kad bercetak", iBoundHint: "Mengimbasnya dengan telefon pelajar membuka dompet mereka dan menyimpan rekod.", iCardHint: "Mengimbasnya membuka dompet Bekal dan menyimpan rekod di sana; simpan kertas ini dengan selamat sebagai sandaran.",
    iPrint: "Cetak", iSigned: "Rekod yang ditandatangani (SD-JWT VC)", iIssuedList: "Dikeluarkan daripada kunci ini", iWallet: "dompet", iCard: "kad", iRevoke: "Tarik balik", iRevoked: "Ditarik balik",
    iRevokeAsk: "Tarik balik “{x}”? Ini kekal dan awam.", iRevoking: "Menulis penarikan balik ke daftar…", iRevokedMsg: "Ditarik balik. Penyemak melihatnya sebaik sahaja blok dilombong.", iCouldNot: "Tidak dapat: {e}",
    iKeyBackup: "Sandarkan kunci pusat ini", iKeyBackupNote: "Tanpa kuncinya, pusat tidak dapat menarik balik rekod yang dikeluarkannya. Simpan fail di luar talian; sesiapa yang memilikinya boleh mengeluarkan rekod sebagai pusat ini.",
    iKeyRestore: "Pulihkan kunci pusat", recordQr: "Kod QR rekod pembelajaran", cardFrom: "Dikeluarkan oleh", cardCompleted: "Selesai"
}

const id: Dict = {
    vNoRecognition: "✗ Belum ada lembaga tepercaya yang mengakui kunci pusat ini di daftar",
    navCentre: "Pusat", navWallet: "Dompet", navVerify: "Periksa", language: "Bahasa",
    reviewNote: "Terjemahan ini ditulis oleh AI dan belum diperiksa oleh penutur asli.",
    wTitle: "Catatan belajar saya", wLead: "Disimpan hanya di ponsel ini. Anda yang memilih apa yang ditunjukkan, dan kepada siapa.",
    wRecords: "Catatan", wNone: "Belum ada catatan. Saat pusat belajar Anda memberikannya, pindai kodenya dengan kamera ponsel ini, atau tambahkan di bawah.",
    wFrom: "dari", wShow: "Tunjukkan", wNotOnRegistry: "pusat yang tidak ada di daftar", wRemove: "Hapus", wRemoveAsk: "Hapus catatan ini dari ponsel ini? Anda hanya bisa mendapatkannya lagi dari pusat belajar Anda atau dari cadangan.",
    wShowTitle: "Tunjukkan", wAlways: "Apa yang dipelajari selalu ditampilkan. Data diri Anda tetap tersembunyi kecuali Anda mencentangnya.",
    wShowName: "Tampilkan nama saya", wShowBirth: "Tampilkan tahun lahir saya", wMake: "Buat kode", wValid: "Berlaku 15 menit", wOnlyHere: ", dan hanya dari dompet ini",
    wScanHint: "Pemeriksa memindainya dengan kamera ponsel apa saja.", wCopy: "Salin tautan", wOpen: "Buka pemeriksaan", wBack: "Kembali",
    wCodeTitle: "Kode dompet saya", wCodeLead: "Tunjukkan ini ke pusat belajar Anda saat mereka menerbitkan catatan, supaya hanya dompet ini yang bisa menunjukkannya.", wAsText: "Sebagai teks",
    wAddTitle: "Tambah catatan", wAddLabel: "Tautan atau kode catatan", wNotRecord: "Itu bukan catatan Bekal.",
    wBackupTitle: "Cadangan", wBackupLead: "Ponsel bisa hilang. Simpan file cadangan di tempat aman (ponsel kerabat yang dipercaya, flashdisk). Isinya kunci dompet Anda: siapa pun yang memilikinya bisa menunjukkan catatan Anda.",
    wDownload: "Unduh cadangan", wRestore: "Pulihkan cadangan", wRestoreAsk: "Pulihkan cadangan ini? Kunci dompet di ponsel ini akan diganti.",
    wSaved: "Tersimpan: {x}.", wAlready: "Catatan ini sudah ada di dompet Anda.", wRestored: "{n} catatan dipulihkan.", wRemoved: "Dihapus.",
    presentationQr: "Kode QR untuk ditunjukkan", walletQr: "Kode dompet saya",
    vTitle: "Periksa catatan belajar", vLead: "Pindai kode yang ditunjukkan pelajar. Anda melihat apa yang mereka pilih untuk ditunjukkan dan apakah itu asli; tidak ada data tentang mereka yang dicari di mana pun.",
    vChecking: "Memeriksa tanda tangan dan daftar publik…", vNotBekal: "Itu bukan catatan atau kode tunjuk Bekal.",
    vOk: "✓ Catatan asli dari pusat yang diakui", vRevoked: "✗ Ditarik oleh pusat", vNoWallet: "✗ Tidak ditunjukkan dari dompet pelajar", vForged: "✗ Bukan catatan asli", vUnrecognised: "✗ Bukan dari pusat yang diakui",
    vCompleted: "Selesai {d}", vHours: "{n} jam", vRef: "nomor catatan pusat {r}", vName: "Nama: {x}", vBorn: "Lahir {x}", vHidden: "{n} data pelajar dirahasiakan",
    vSigned: "Ditandatangani kunci pusat, dan setiap klaim yang ditampilkan cocok dengan yang ditandatangani", vIssued: "(diterbitkan {d})",
    vRecognised: "Pusat yang diakui: {name}, {place}. Dijamin oleh {by}", vOnRegistry: "di daftar",
    vNotWithdrawn: "✓ Tidak ditarik oleh pusat", vWithdrawn: "✗ Pusat telah menarik catatan ini",
    vKbValid: "✓ Ditunjukkan dari dompet pelajar sendiri, dalam 15 menit terakhir", vKbMissing: "✗ Catatan ini milik sebuah dompet, dan penunjukan ini tidak punya bukti dari dompet itu", vCard: "✓ Kartu cetak (tidak terikat ke ponsel)",
    vFreshness: "Penarikan dibaca langsung dari chain; jika gagal, dari indeks EAS, yang tertinggal sekitar satu menit.",
    vScanTitle: "Pindai kode", vScanLabel: "Tautan atau kode tunjuk",
    sPaste: "Tempel tautan atau kode di sini", sUse: "Gunakan ini", sCamera: "Pindai dengan kamera", sPhoto: "Unggah foto",
    sNoQr: "Tidak ada kode QR di foto itu. Coba foto yang lebih tajam dan dekat.", sNoCamera: "Kamera tidak tersedia di sini ({e}). Unggah foto atau tempel tautannya.",
    iTitle: "Terbitkan catatan belajar", iLead: "Untuk pusat belajar. Catatan ditandatangani di browser ini dan diserahkan ke pelajar; tidak ada data pelajar yang dikirim ke mana pun atau ditulis ke blockchain.",
    iCentre: "Pusat Anda", iOwn: "Pusat saya sendiri (kunci baru, disimpan di browser ini)", iKey: "Kunci", iChecking: "Memeriksa daftar publik…",
    iRecognised: "Diakui: {name}, {place}. Dijamin oleh {by}.", iNotRecognised: "Tidak diakui: {reason}. Catatan dari kunci ini akan terverifikasi sebagai bertanda tangan, tetapi bukan dari pusat yang diakui.",
    iRegistryDown: "Daftar tidak bisa dibaca sekarang ({e}).", iPilotNote: "Dalam uji coba, lembaga yang diakui (misalnya UNHCR, yang sudah mengakui pusat-pusat belajar, atau konsorsium LSM) menjamin kunci ini di daftar.",
    iRecord: "Catatan", iCourse: "Apa yang dipelajari", iCoursePh: "mis. Matematika, Kelas 6", iLevel: "Tingkat atau hasil", iLevelPh: "mis. Lulus, B1", iHours: "Jam", iDone: "Selesai pada", iRef: "Nomor catatan pusat", iOptional: "opsional",
    iLearner: "Pelajar (opsional, tersembunyi kecuali mereka memilih menunjukkannya)", iName: "Nama", iBirth: "Tahun lahir",
    iGiveTo: "Berikan kepada", iBound: "Dompet pelajar {a}: hanya dompet itu yang bisa menunjukkan catatan ini.", iUseCard: "Gunakan kartu cetak saja",
    iCardNote: "Tanpa kode dompet, catatan menjadi kartu cetak yang bisa ditunjukkan siapa pun yang memegangnya, seperti kertas.", iWalletCode: "Kode dompet pelajar",
    iBadCode: "Itu bukan kode dompet Bekal. Minta pelajar membuka dompetnya dan menunjukkan “Kode dompet saya”.",
    iSign: "Tandatangani dan terbitkan", iWriteCourse: "Tulis apa yang dipelajari.", iIssuedBound: "Diterbitkan, terikat ke dompet pelajar. Biarkan mereka memindai kodenya.", iIssuedCard: "Diterbitkan sebagai kartu cetak: cetak dan berikan ke pelajar.",
    iScanThis: "Biarkan pelajar memindai ini", iCardTitle: "Kartu cetak", iBoundHint: "Memindainya dengan ponsel pelajar membuka dompet mereka dan menyimpan catatan.", iCardHint: "Memindainya membuka dompet Bekal dan menyimpan catatan di sana; simpan kertas ini baik-baik sebagai cadangan.",
    iPrint: "Cetak", iSigned: "Catatan bertanda tangan (SD-JWT VC)", iIssuedList: "Diterbitkan dari kunci ini", iWallet: "dompet", iCard: "kartu", iRevoke: "Tarik", iRevoked: "Ditarik",
    iRevokeAsk: "Tarik “{x}”? Ini permanen dan publik.", iRevoking: "Menulis penarikan ke daftar…", iRevokedMsg: "Ditarik. Pemeriksa melihatnya begitu bloknya ditambang.", iCouldNot: "Tidak bisa: {e}",
    iKeyBackup: "Cadangkan kunci pusat ini", iKeyBackupNote: "Tanpa kuncinya, pusat tidak bisa menarik catatan yang diterbitkannya. Simpan file secara offline; siapa pun yang memilikinya bisa menerbitkan atas nama pusat ini.",
    iKeyRestore: "Pulihkan kunci pusat", recordQr: "Kode QR catatan belajar", cardFrom: "Diterbitkan oleh", cardCompleted: "Selesai"
}

const my: Dict = {
    vNoRecognition: "✗ ယုံကြည်ရသော အဖွဲ့အစည်းတစ်ခုမျှ ဤစင်တာ၏သော့ကို မှတ်ပုံတင်စာရင်းတွင် အသိအမှတ်မပြုရသေးပါ",
    navCentre: "စင်တာ", navWallet: "ပိုက်ဆံအိတ်", navVerify: "စစ်ဆေးရန်", language: "ဘာသာစကား",
    reviewNote: "ဤဘာသာပြန်ကို AI က ရေးသားထားပြီး မိခင်ဘာသာစကားပြောသူ မစစ်ဆေးရသေးပါ။",
    wTitle: "ကျွန်ုပ်၏ သင်ယူမှုမှတ်တမ်းများ", wLead: "ဤဖုန်းတွင်သာ သိမ်းဆည်းထားသည်။ ဘာကိုပြမည်၊ မည်သူ့ကိုပြမည်ကို သင်ကိုယ်တိုင် ရွေးချယ်သည်။",
    wRecords: "မှတ်တမ်းများ", wNone: "မှတ်တမ်း မရှိသေးပါ။ သင့်စင်တာက ပေးသည့်အခါ ၎င်း၏ကုဒ်ကို ဤဖုန်းကင်မရာဖြင့် စကင်ဖတ်ပါ၊ သို့မဟုတ် အောက်တွင် ထည့်ပါ။",
    wFrom: "ထုတ်ပေးသူ", wShow: "ပြရန်", wNotOnRegistry: "မှတ်ပုံတင်စာရင်းတွင် မပါသော စင်တာ", wRemove: "ဖယ်ရှားရန်", wRemoveAsk: "ဤမှတ်တမ်းကို ဤဖုန်းမှ ဖယ်ရှားမလား။ သင့်စင်တာ သို့မဟုတ် အရန်ဖိုင်မှသာ ပြန်ရနိုင်ပါသည်။",
    wShowTitle: "ပြရန်", wAlways: "သင်ယူခဲ့သည့်အရာကို အမြဲပြသည်။ သင့်ကိုယ်ရေးအချက်အလက်များကို အမှန်ခြစ်မထားလျှင် ဝှက်ထားသည်။",
    wShowName: "ကျွန်ုပ်၏အမည်ကို ပြရန်", wShowBirth: "ကျွန်ုပ်၏ မွေးနှစ်ကို ပြရန်", wMake: "ကုဒ်ပြုလုပ်ရန်", wValid: "၁၅ မိနစ်ကြာ အကျုံးဝင်သည်", wOnlyHere: "၊ ဤပိုက်ဆံအိတ်မှသာ",
    wScanHint: "စစ်ဆေးသူက မည်သည့်ဖုန်းကင်မရာဖြင့်မဆို စကင်ဖတ်နိုင်သည်။", wCopy: "လင့်ခ်ကူးရန်", wOpen: "စစ်ဆေးမှုကို ဖွင့်ရန်", wBack: "နောက်သို့",
    wCodeTitle: "ကျွန်ုပ်၏ ပိုက်ဆံအိတ်ကုဒ်", wCodeLead: "စင်တာက မှတ်တမ်းထုတ်ပေးသည့်အခါ ဤကုဒ်ကို ပြပါ၊ ထို့ကြောင့် ဤပိုက်ဆံအိတ်သာ ၎င်းကို ပြနိုင်မည်။", wAsText: "စာသားအဖြစ်",
    wAddTitle: "မှတ်တမ်းထည့်ရန်", wAddLabel: "မှတ်တမ်း လင့်ခ် သို့မဟုတ် ကုဒ်", wNotRecord: "၎င်းသည် Bekal မှတ်တမ်း မဟုတ်ပါ။",
    wBackupTitle: "အရန်ဖိုင်", wBackupLead: "ဖုန်းများ ပျောက်တတ်သည်။ အရန်ဖိုင်ကို လုံခြုံသောနေရာတွင် သိမ်းပါ (ယုံကြည်ရသော ဆွေမျိုး၏ဖုန်း၊ USB)။ ၎င်းတွင် သင့်ပိုက်ဆံအိတ်သော့ ပါဝင်သည်- ၎င်းကိုရရှိသူမည်သူမဆို သင့်မှတ်တမ်းများကို ပြနိုင်သည်။",
    wDownload: "အရန်ဖိုင် ဒေါင်းလုဒ်လုပ်ရန်", wRestore: "အရန်ဖိုင်မှ ပြန်ယူရန်", wRestoreAsk: "ဤအရန်ဖိုင်မှ ပြန်ယူမလား။ ဤဖုန်းပေါ်ရှိ ပိုက်ဆံအိတ်သော့ကို အစားထိုးမည်။",
    wSaved: "သိမ်းပြီး- {x}။", wAlready: "ဤမှတ်တမ်းသည် သင့်ပိုက်ဆံအိတ်တွင် ရှိပြီးသားဖြစ်သည်။", wRestored: "မှတ်တမ်း {n} ခု ပြန်ယူပြီး။", wRemoved: "ဖယ်ရှားပြီး။",
    presentationQr: "ပြသရန် QR ကုဒ်", walletQr: "ကျွန်ုပ်၏ ပိုက်ဆံအိတ်ကုဒ်",
    vTitle: "သင်ယူမှုမှတ်တမ်းကို စစ်ဆေးရန်", vLead: "သင်ယူသူ ပြသည့်ကုဒ်ကို စကင်ဖတ်ပါ။ ၎င်းတို့ ပြရန်ရွေးသည့်အရာနှင့် စစ်မှန်မှုကို သင်မြင်ရသည်၊ ၎င်းတို့အကြောင်း မည်သည့်နေရာတွင်မျှ ရှာဖွေခြင်းမရှိပါ။",
    vChecking: "လက်မှတ်နှင့် အများပြည်သူ မှတ်ပုံတင်စာရင်းကို စစ်ဆေးနေသည်…", vNotBekal: "၎င်းသည် Bekal မှတ်တမ်း သို့မဟုတ် ပြသချက် မဟုတ်ပါ။",
    vOk: "✓ အသိအမှတ်ပြုထားသော စင်တာမှ စစ်မှန်သော မှတ်တမ်း", vRevoked: "✗ စင်တာက ပြန်ရုပ်သိမ်းထားသည်", vNoWallet: "✗ သင်ယူသူ၏ ပိုက်ဆံအိတ်မှ ပြသခြင်း မဟုတ်ပါ", vForged: "✗ စစ်မှန်သော မှတ်တမ်း မဟုတ်ပါ", vUnrecognised: "✗ အသိအမှတ်ပြုထားသော စင်တာမှ မဟုတ်ပါ",
    vCompleted: "{d} တွင် ပြီးဆုံး", vHours: "{n} နာရီ", vRef: "စင်တာမှတ်တမ်း {r}", vName: "အမည်- {x}", vBorn: "မွေးနှစ် {x}", vHidden: "သင်ယူသူ အချက်အလက် {n} ခုကို လျှို့ဝှက်ထားသည်",
    vSigned: "စင်တာ၏သော့ ဖြင့် လက်မှတ်ထိုးထားပြီး ပြသသည့် အချက်တိုင်းသည် လက်မှတ်ထိုးထားသည်နှင့် ကိုက်ညီသည်", vIssued: "({d} တွင် ထုတ်ပေး)",
    vRecognised: "အသိအမှတ်ပြု စင်တာ- {name}၊ {place}။ {by} က အာမခံသည်", vOnRegistry: "မှတ်ပုံတင်စာရင်းတွင်",
    vNotWithdrawn: "✓ စင်တာက ပြန်မရုပ်သိမ်းပါ", vWithdrawn: "✗ စင်တာက ဤမှတ်တမ်းကို ပြန်ရုပ်သိမ်းထားသည်",
    vKbValid: "✓ သင်ယူသူ၏ ကိုယ်ပိုင်ပိုက်ဆံအိတ်မှ နောက်ဆုံး ၁၅ မိနစ်အတွင်း ပြသခဲ့သည်", vKbMissing: "✗ ဤမှတ်တမ်းသည် ပိုက်ဆံအိတ်တစ်ခုနှင့် ချိတ်ထားပြီး ဤပြသမှုတွင် ၎င်း၏ အထောက်အထား မပါပါ", vCard: "✓ ပုံနှိပ်ကတ် (ဖုန်းနှင့် မချိတ်ထားပါ)",
    vFreshness: "ပြန်ရုပ်သိမ်းမှုများကို blockchain မှ တိုက်ရိုက်ဖတ်သည်၊ မအောင်မြင်ပါက EAS အညွှန်းမှ ဖတ်သည် (တစ်မိနစ်ခန့် နောက်ကျနိုင်သည်)။",
    vScanTitle: "ကုဒ် စကင်ဖတ်ရန်", vScanLabel: "ပြသချက် လင့်ခ် သို့မဟုတ် ကုဒ်",
    sPaste: "လင့်ခ် သို့မဟုတ် ကုဒ်ကို ဤနေရာတွင် ကူးထည့်ပါ", sUse: "ဤအရာကို သုံးရန်", sCamera: "ကင်မရာဖြင့် စကင်ဖတ်ရန်", sPhoto: "ဓာတ်ပုံ တင်ရန်",
    sNoQr: "ထိုဓာတ်ပုံတွင် QR ကုဒ် မတွေ့ပါ။ ပိုမိုပြတ်သားပြီး နီးကပ်သော ဓာတ်ပုံဖြင့် ကြိုးစားပါ။", sNoCamera: "ဤနေရာတွင် ကင်မရာ မရနိုင်ပါ ({e})။ ဓာတ်ပုံတင်ပါ သို့မဟုတ် လင့်ခ်ကို ကူးထည့်ပါ။",
    iTitle: "သင်ယူမှုမှတ်တမ်း ထုတ်ပေးရန်", iLead: "သင်ကြားရေးစင်တာများအတွက်။ မှတ်တမ်းကို ဤ browser တွင် လက်မှတ်ထိုးပြီး သင်ယူသူထံ ပေးအပ်သည်၊ သင်ယူသူအကြောင်း မည်သည့်အရာကိုမျှ မည်သည့်နေရာသို့မျှ မပို့ပါ၊ blockchain ပေါ်တွင်လည်း မရေးပါ။",
    iCentre: "သင့်စင်တာ", iOwn: "ကျွန်ုပ်၏ ကိုယ်ပိုင်စင်တာ (ဤ browser တွင် သိမ်းထားသော သော့အသစ်)", iKey: "သော့", iChecking: "အများပြည်သူ မှတ်ပုံတင်စာရင်းကို စစ်ဆေးနေသည်…",
    iRecognised: "အသိအမှတ်ပြုထားသည်- {name}၊ {place}။ {by} က အာမခံသည်။", iNotRecognised: "အသိအမှတ်ပြုမထားပါ- {reason}။ ဤသော့မှ မှတ်တမ်းများကို လက်မှတ်ထိုးထားသည်ဟု စစ်ဆေးနိုင်သော်လည်း အသိအမှတ်ပြု စင်တာမှဟု မဖော်ပြပါ။",
    iRegistryDown: "မှတ်ပုံတင်စာရင်းကို ယခု ဖတ်၍မရပါ ({e})။", iPilotNote: "စမ်းသပ်မှုတွင် အသိအမှတ်ပြု အဖွဲ့အစည်း (ဥပမာ သင်ကြားရေးစင်တာများကို အသိအမှတ်ပြုပြီးဖြစ်သော UNHCR သို့မဟုတ် NGO အဖွဲ့ပေါင်း) က ဤသော့ကို မှတ်ပုံတင်စာရင်းတွင် အာမခံသည်။",
    iRecord: "မှတ်တမ်း", iCourse: "သင်ယူခဲ့သည့်အရာ", iCoursePh: "ဥပမာ သင်္ချာ၊ ၆ တန်း", iLevel: "အဆင့် သို့မဟုတ် ရလဒ်", iLevelPh: "ဥပမာ ပြီးဆုံး၊ B1", iHours: "နာရီ", iDone: "ပြီးဆုံးသည့်ရက်", iRef: "စင်တာ၏ မှတ်တမ်းနံပါတ်", iOptional: "မဖြစ်မနေမဟုတ်",
    iLearner: "သင်ယူသူ (မဖြစ်မနေမဟုတ်၊ ၎င်းတို့ ပြရန်မရွေးလျှင် ဝှက်ထားသည်)", iName: "အမည်", iBirth: "မွေးနှစ်",
    iGiveTo: "ပေးအပ်ရန်", iBound: "သင်ယူသူ၏ ပိုက်ဆံအိတ် {a}- ထိုပိုက်ဆံအိတ်သာ ဤမှတ်တမ်းကို ပြနိုင်သည်။", iUseCard: "ပုံနှိပ်ကတ်ကို အစားသုံးရန်",
    iCardNote: "ပိုက်ဆံအိတ်ကုဒ် မပါလျှင် မှတ်တမ်းသည် စက္ကူကဲ့သို့ ကိုင်ဆောင်သူ မည်သူမဆို ပြနိုင်သော ပုံနှိပ်ကတ် ဖြစ်သည်။", iWalletCode: "သင်ယူသူ၏ ပိုက်ဆံအိတ်ကုဒ်",
    iBadCode: "၎င်းသည် Bekal ပိုက်ဆံအိတ်ကုဒ် မဟုတ်ပါ။ သင်ယူသူအား ၎င်း၏ပိုက်ဆံအိတ်ကို ဖွင့်ပြီး “ကျွန်ုပ်၏ ပိုက်ဆံအိတ်ကုဒ်” ကို ပြရန် တောင်းဆိုပါ။",
    iSign: "လက်မှတ်ထိုး၍ ထုတ်ပေးရန်", iWriteCourse: "သင်ယူခဲ့သည့်အရာကို ရေးပါ။", iIssuedBound: "သင်ယူသူ၏ ပိုက်ဆံအိတ်နှင့် ချိတ်၍ ထုတ်ပေးပြီး။ ကုဒ်ကို စကင်ဖတ်ခိုင်းပါ။", iIssuedCard: "ပုံနှိပ်ကတ်အဖြစ် ထုတ်ပေးပြီး- ပုံနှိပ်၍ သင်ယူသူထံ ပေးပါ။",
    iScanThis: "သင်ယူသူအား ဤကုဒ်ကို စကင်ဖတ်ခိုင်းပါ", iCardTitle: "ပုံနှိပ်ကတ်", iBoundHint: "သင်ယူသူ၏ဖုန်းဖြင့် စကင်ဖတ်လျှင် ၎င်းတို့၏ ပိုက်ဆံအိတ်ကို ဖွင့်ပြီး မှတ်တမ်းကို သိမ်းသည်။", iCardHint: "စကင်ဖတ်လျှင် Bekal ပိုက်ဆံအိတ်ကို ဖွင့်ပြီး မှတ်တမ်းကို ထိုနေရာတွင် သိမ်းသည်၊ စက္ကူကို အရန်အဖြစ် လုံခြုံစွာ သိမ်းထားပါ။",
    iPrint: "ပုံနှိပ်ရန်", iSigned: "လက်မှတ်ထိုးထားသော မှတ်တမ်း (SD-JWT VC)", iIssuedList: "ဤသော့မှ ထုတ်ပေးခဲ့သည်များ", iWallet: "ပိုက်ဆံအိတ်", iCard: "ကတ်", iRevoke: "ပြန်ရုပ်သိမ်းရန်", iRevoked: "ပြန်ရုပ်သိမ်းပြီး",
    iRevokeAsk: "“{x}” ကို ပြန်ရုပ်သိမ်းမလား။ ၎င်းသည် ထာဝရဖြစ်ပြီး အများပြည်သူ မြင်နိုင်သည်။", iRevoking: "ပြန်ရုပ်သိမ်းမှုကို မှတ်ပုံတင်စာရင်းသို့ ရေးနေသည်…", iRevokedMsg: "ပြန်ရုပ်သိမ်းပြီး။ block တူးပြီးသည်နှင့် စစ်ဆေးသူများ မြင်ရမည်။", iCouldNot: "မလုပ်နိုင်ပါ- {e}",
    iKeyBackup: "ဤစင်တာ၏ သော့ကို အရန်ကူးရန်", iKeyBackupNote: "သော့မရှိလျှင် စင်တာသည် ၎င်းထုတ်ပေးခဲ့သော မှတ်တမ်းများကို ပြန်မရုပ်သိမ်းနိုင်ပါ။ ဖိုင်ကို အော့ဖ်လိုင်းတွင် သိမ်းပါ၊ ၎င်းကိုရရှိသူ မည်သူမဆို ဤစင်တာအဖြစ် ထုတ်ပေးနိုင်သည်။",
    iKeyRestore: "စင်တာသော့ကို ပြန်ယူရန်", recordQr: "သင်ယူမှုမှတ်တမ်း QR ကုဒ်", cardFrom: "ထုတ်ပေးသူ", cardCompleted: "ပြီးဆုံး"
}

const prs: Dict = {
    vNoRecognition: "✗ هیچ نهاد مورد اعتمادی کلید این مرکز را در فهرست به رسمیت نشناخته است",
    navCentre: "مرکز", navWallet: "کیف", navVerify: "بررسی", language: "زبان",
    reviewNote: "این ترجمه را هوش مصنوعی نوشته است و هنوز توسط یک گویندهٔ بومی بررسی نشده است.",
    wTitle: "سوابق آموزشی من", wLead: "فقط روی همین تلفن نگهداری می‌شود. شما انتخاب می‌کنید چه چیزی را به چه کسی نشان دهید.",
    wRecords: "سوابق", wNone: "هنوز سابقه‌ای ندارید. وقتی مرکز شما سابقه‌ای می‌دهد، کد آن را با کمرهٔ همین تلفن اسکن کنید، یا آن را در پایین اضافه کنید.",
    wFrom: "از", wShow: "نشان دادن", wNotOnRegistry: "مرکزی که در فهرست ثبت نیست", wRemove: "حذف", wRemoveAsk: "این سابقه از این تلفن حذف شود؟ فقط از مرکز خود یا از فایل پشتیبان می‌توانید دوباره آن را بگیرید.",
    wShowTitle: "نشان دادن", wAlways: "آنچه آموخته‌اید همیشه نشان داده می‌شود. مشخصات شما پنهان می‌ماند مگر آن‌ها را علامت بزنید.",
    wShowName: "نامم را نشان بده", wShowBirth: "سال تولدم را نشان بده", wMake: "ساختن کد", wValid: "برای ۱۵ دقیقه معتبر است", wOnlyHere: "، و فقط از همین کیف",
    wScanHint: "بررسی‌کننده آن را با کمرهٔ هر تلفنی اسکن می‌کند.", wCopy: "کاپی لینک", wOpen: "باز کردن بررسی", wBack: "بازگشت",
    wCodeTitle: "کد کیف من", wCodeLead: "وقتی مرکز برایتان سابقه صادر می‌کند این را نشان دهید، تا فقط همین کیف بتواند آن را نشان دهد.", wAsText: "به صورت متن",
    wAddTitle: "افزودن سابقه", wAddLabel: "لینک یا کد سابقه", wNotRecord: "این یک سابقهٔ بکال نیست.",
    wBackupTitle: "پشتیبان", wBackupLead: "تلفن‌ها گم می‌شوند. یک فایل پشتیبان را در جای امن نگه دارید (تلفن یک خویشاوند مورد اعتماد، یک فلش USB). کلید کیف شما در آن است: هر کس آن را داشته باشد می‌تواند سوابق شما را نشان دهد.",
    wDownload: "دانلود پشتیبان", wRestore: "بازیابی پشتیبان", wRestoreAsk: "این پشتیبان بازیابی شود؟ کلید کیف روی این تلفن جایگزین می‌شود.",
    wSaved: "ذخیره شد: {x}.", wAlready: "این سابقه از قبل در کیف شماست.", wRestored: "{n} سابقه بازیابی شد.", wRemoved: "حذف شد.",
    presentationQr: "کد QR برای نشان دادن", walletQr: "کد کیف من",
    vTitle: "بررسی یک سابقهٔ آموزشی", vLead: "کدی را که آموزنده نشان می‌دهد اسکن کنید. آنچه او برای نشان دادن انتخاب کرده و اصل بودن آن را می‌بینید؛ هیچ چیزی دربارهٔ او در جایی جستجو نمی‌شود.",
    vChecking: "در حال بررسی امضا و فهرست عمومی…", vNotBekal: "این یک سابقه یا ارائهٔ بکال نیست.",
    vOk: "✓ سابقهٔ اصلی از یک مرکز شناخته‌شده", vRevoked: "✗ مرکز آن را پس گرفته است", vNoWallet: "✗ از کیف آموزنده نشان داده نشده است", vForged: "✗ سابقهٔ اصلی نیست", vUnrecognised: "✗ از یک مرکز شناخته‌شده نیست",
    vCompleted: "تکمیل در {d}", vHours: "{n} ساعت", vRef: "شمارهٔ سابقهٔ مرکز {r}", vName: "نام: {x}", vBorn: "تولد {x}", vHidden: "{n} مشخصهٔ آموزنده پنهان ماند",
    vSigned: "با کلید مرکز امضا شده است، و هر ادعای نشان‌داده‌شده با آنچه امضا شده مطابقت دارد", vIssued: "(صادر شده در {d})",
    vRecognised: "مرکز شناخته‌شده: {name}، {place}. تضمین‌شده توسط {by}", vOnRegistry: "در فهرست ثبت",
    vNotWithdrawn: "✓ مرکز آن را پس نگرفته است", vWithdrawn: "✗ مرکز این سابقه را پس گرفته است",
    vKbValid: "✓ از کیف خود آموزنده، در ۱۵ دقیقهٔ گذشته نشان داده شده است", vKbMissing: "✗ این سابقه متعلق به یک کیف است و این نمایش هیچ اثباتی از آن ندارد", vCard: "✓ یک کارت چاپی (به تلفن وابسته نیست)",
    vFreshness: "پس‌گرفتن‌ها مستقیم از زنجیره خوانده می‌شوند؛ اگر نشد، از فهرست EAS که حدود یک دقیقه عقب است.",
    vScanTitle: "اسکن یک کد", vScanLabel: "لینک یا کد ارائه",
    sPaste: "لینک یا کد را این‌جا بچسبانید", sUse: "استفاده از این", sCamera: "اسکن با کمره", sPhoto: "بارگذاری عکس",
    sNoQr: "در این عکس کد QR پیدا نشد. یک عکس واضح‌تر و نزدیک‌تر امتحان کنید.", sNoCamera: "کمره این‌جا در دسترس نیست ({e}). یک عکس بارگذاری کنید یا لینک را بچسبانید.",
    iTitle: "صدور سابقهٔ آموزشی", iLead: "برای مراکز آموزشی. سابقه در همین مرورگر امضا شده و به آموزنده داده می‌شود؛ هیچ چیزی دربارهٔ آموزنده به جایی فرستاده یا روی بلاک‌چین نوشته نمی‌شود.",
    iCentre: "مرکز شما", iOwn: "مرکز خودم (یک کلید جدید که در همین مرورگر نگه داشته می‌شود)", iKey: "کلید", iChecking: "در حال بررسی فهرست عمومی…",
    iRecognised: "شناخته‌شده: {name}، {place}. تضمین‌شده توسط {by}.", iNotRecognised: "شناخته‌شده نیست: {reason}. سوابق این کلید امضاشده تأیید می‌شوند، اما نه به عنوان سوابق یک مرکز شناخته‌شده.",
    iRegistryDown: "فهرست ثبت اکنون خوانده نمی‌شود ({e}).", iPilotNote: "در یک آزمایش، یک نهاد شناخته‌شده (مثلاً UNHCR که مراکز آموزشی را به رسمیت می‌شناسد، یا ائتلافی از سازمان‌های غیردولتی) این کلید را در فهرست تضمین می‌کند.",
    iRecord: "سابقه", iCourse: "آنچه آموخته شد", iCoursePh: "مثلاً ریاضی، صنف ۶", iLevel: "سطح یا نتیجه", iLevelPh: "مثلاً تکمیل شد، B1", iHours: "ساعت", iDone: "تاریخ تکمیل", iRef: "شمارهٔ سابقهٔ مرکز", iOptional: "اختیاری",
    iLearner: "آموزنده (اختیاری، پنهان مگر خودش نشان دادن را انتخاب کند)", iName: "نام", iBirth: "سال تولد",
    iGiveTo: "دادن به", iBound: "کیف آموزنده {a}: فقط همین کیف می‌تواند این سابقه را نشان دهد.", iUseCard: "به جای آن از کارت چاپی استفاده شود",
    iCardNote: "بدون کد کیف، سابقه یک کارت چاپی است که هر کسی آن را در دست داشته باشد می‌تواند نشان دهد، مانند کاغذ.", iWalletCode: "کد کیف آموزنده",
    iBadCode: "این یک کد کیف بکال نیست. از آموزنده بخواهید کیفش را باز کند و «کد کیف من» را نشان دهد.",
    iSign: "امضا و صدور", iWriteCourse: "بنویسید چه چیزی آموخته شد.", iIssuedBound: "صادر شد، وابسته به کیف آموزنده. بگذارید کد را اسکن کند.", iIssuedCard: "به صورت کارت چاپی صادر شد: آن را چاپ کرده و به آموزنده بدهید.",
    iScanThis: "بگذارید آموزنده این را اسکن کند", iCardTitle: "کارت چاپی", iBoundHint: "اسکن آن با تلفن آموزنده کیف او را باز کرده و سابقه را ذخیره می‌کند.", iCardHint: "اسکن آن یک کیف بکال را باز کرده و سابقه را در آن ذخیره می‌کند؛ کاغذ را به عنوان پشتیبان در جای امن نگه دارید.",
    iPrint: "چاپ", iSigned: "سابقهٔ امضاشده (SD-JWT VC)", iIssuedList: "صادرشده با این کلید", iWallet: "کیف", iCard: "کارت", iRevoke: "پس گرفتن", iRevoked: "پس گرفته شد",
    iRevokeAsk: "«{x}» پس گرفته شود؟ این کار دائمی و عمومی است.", iRevoking: "در حال نوشتن پس‌گرفتن در فهرست…", iRevokedMsg: "پس گرفته شد. بررسی‌کنندگان به محض ثبت بلاک آن را می‌بینند.", iCouldNot: "ممکن نشد: {e}",
    iKeyBackup: "پشتیبان‌گیری از کلید این مرکز", iKeyBackupNote: "بدون کلیدش، مرکز نمی‌تواند سوابقی را که صادر کرده پس بگیرد. فایل را آفلاین نگه دارید؛ هر کس آن را داشته باشد می‌تواند به نام این مرکز صادر کند.",
    iKeyRestore: "بازیابی کلید مرکز", recordQr: "کد QR سابقهٔ آموزشی", cardFrom: "صادرکننده", cardCompleted: "تکمیل"
}

const DICTS: Record<Lang, Dict> = { en, ms, id, my, prs }

function initial(): Lang {
    try {
        const saved = localStorage.getItem("bekal-lang") as Lang | null
        if (saved && saved in LANGS) return saved
    } catch {}
    for (const l of navigator.languages ?? []) {
        const code = l.toLowerCase()
        if (code.startsWith("fa") || code.startsWith("prs")) return "prs"
        const base = code.split("-")[0] as Lang
        if (base in LANGS) return base
    }
    return "en"
}

export const ui = $state({ lang: "en" as Lang })
if (typeof window !== "undefined") apply((ui.lang = initial()))

export function apply(l: Lang) {
    ui.lang = l
    document.documentElement.lang = l === "prs" ? "fa-AF" : l
    document.documentElement.dir = RTL.includes(l) ? "rtl" : "ltr"
    try { localStorage.setItem("bekal-lang", l) } catch {}
}

/** The string for `key` in the chosen language (English when missing), with {placeholders} filled. */
export function t(key: string, vars: Record<string, string | number> = {}): string {
    const s = DICTS[ui.lang][key] ?? en[key] ?? key
    return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""))
}

export const keysOf = (l: Lang) => Object.keys(DICTS[l])
