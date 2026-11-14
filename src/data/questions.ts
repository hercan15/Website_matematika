export type OptionKey = 'A' | 'B' | 'C' | 'D';
export const OPTION_KEYS: OptionKey[] = ['A', 'B', 'C', 'D'];

export type Visual =
  | { kind: 'shape'; shape: 'square' | 'rectangle' | 'triangle' | 'parallelogram' | 'trapezoid' | 'rhombus' | 'kite' | 'pentagon' | 'combined'; labels?: string[] }
  | { kind: 'angle'; degrees: number }
  | { kind: 'fraction'; filled: number; total: number }
  | { kind: 'table'; headers: string[]; rows: string[][] }
  | { kind: 'bars'; title: string; labels: string[]; values: number[]; secondary?: number[]; legends?: string[]; horizontal?: boolean }
  | { kind: 'pictogram'; labels: string[]; values: number[]; unit: number };

export interface Question {
  id: string;
  chapter: number;
  question: string;
  options: Record<OptionKey, string>;
  duration: 60;
  difficulty: 'Mudah' | 'Sedang' | 'Menantang';
  visual?: Visual;
}

export interface Chapter {
  id: number;
  title: string;
  shortTitle: string;
  description: string;
  color: string;
  icon: string;
  topics: string[];
  questions: Question[];
}

type QuestionInput = [string, [string, string, string, string], Visual?];

function makeQuestions(chapter: number, items: QuestionInput[]): Question[] {
  return items.map(([question, options, visual], index) => ({
    id: `bab-${chapter}-soal-${index + 1}`,
    chapter,
    question,
    options: { A: options[0], B: options[1], C: options[2], D: options[3] },
    duration: 60,
    difficulty: index < 8 ? 'Mudah' : index < 18 ? 'Sedang' : 'Menantang',
    ...(visual ? { visual } : {}),
  }));
}

const chapter1: QuestionInput[] = [
  ['Berapakah hasil dari 25.000 + 15.000?', ['30.000', '35.000', '40.000', '45.000']],
  ['Bagaimana cara membaca bilangan 47.305?', ['Empat puluh tujuh ribu tiga ratus lima', 'Empat puluh tujuh ribu tiga puluh lima', 'Empat ribu tujuh ratus tiga puluh lima', 'Empat puluh ribu tujuh ratus lima']],
  ['Angka 6 pada bilangan 68.241 menempati nilai tempat ...', ['Ribuan', 'Ratusan', 'Puluh ribuan', 'Puluhan']],
  ['Berapakah nilai angka 7 pada bilangan 52.734?', ['7', '70', '7.000', '700']],
  ['Manakah bilangan yang paling besar?', ['38.502', '38.250', '38.520', '38.205']],
  ['Tanda yang tepat untuk 71.050 ... 71.500 adalah ...', ['>', '<', '=', '+']],
  ['Bilangan dari 40.000 + 7.000 + 300 + 20 + 5 adalah ...', ['47.325', '47.235', '43.725', '47.352']],
  ['Berapakah hasil dari 68.000 - 23.000?', ['35.000', '43.000', '45.000', '55.000']],
  ['Urutan bilangan dari yang terkecil adalah ...', ['24.310, 24.130, 24.301', '24.130, 24.301, 24.310', '24.301, 24.130, 24.310', '24.310, 24.301, 24.130']],
  ['Bilangan "delapan puluh dua ribu enam puluh sembilan" ditulis ...', ['82.609', '80.269', '82.690', '82.069']],
  ['Bentuk panjang dari 56.408 adalah ...', ['50.000 + 6.000 + 400 + 8', '50.000 + 6.000 + 40 + 8', '50.000 + 600 + 400 + 8', '5.000 + 6.000 + 400 + 8']],
  ['Berapakah hasil dari 36.475 + 12.368?', ['48.743', '48.833', '48.843', '49.843']],
  ['Berapakah hasil dari 70.000 - 28.650?', ['42.350', '41.350', '41.450', '51.350']],
  ['Bilangan yang tepat sebelum 60.000 adalah ...', ['59.990', '59.900', '60.001', '59.999']],
  ['Bilangan yang tepat sesudah 89.999 adalah ...', ['89.998', '90.000', '90.009', '99.000']],
  ['Isilah titik-titik: 63.250 = 60.000 + ... + 200 + 50.', ['300', '30.000', '3.000', '30']],
  ['Perpustakaan memiliki 15.750 buku dan menerima 2.685 buku baru. Berapa jumlah buku sekarang?', ['18.435 buku', '17.435 buku', '18.345 buku', '18.535 buku']],
  ['Urutan 45.670, 45.760, dan 45.607 dari yang terbesar adalah ...', ['45.607, 45.670, 45.760', '45.670, 45.760, 45.607', '45.760, 45.607, 45.670', '45.760, 45.670, 45.607']],
  ['Tabungan Rani Rp48.500. Ia membeli buku Rp17.750 dan menerima uang Rp12.000. Berapa tabungannya sekarang?', ['Rp41.750', 'Rp42.750', 'Rp43.750', 'Rp54.250']],
  ['Sebuah gudang memiliki 75.250 pensil. Sebanyak 28.475 pensil dikirim, lalu datang 16.800 pensil. Berapa pensil di gudang sekarang?', ['62.575 pensil', '63.475 pensil', '63.575 pensil', '64.575 pensil']],
  ['Jumlah dua bilangan adalah 90.000. Jika salah satunya 37.685, bilangan lainnya adalah ...', ['52.315', '53.315', '52.415', '62.315']],
  ['Bentuklah bilangan lima angka terbesar dari angka 2, 9, 0, 5, dan 7. Setiap angka dipakai satu kali.', ['97.250', '95.720', '97.502', '97.520']],
  ['Bentuklah bilangan lima angka terkecil dari angka 3, 0, 8, 1, dan 6. Setiap angka dipakai satu kali.', ['01.368', '10.368', '13.068', '10.638']],
  ['Selisih nilai angka 8 pada 84.280 dan nilai angka 8 pada 35.807 adalah ...', ['79.920', '72.000', '79.200', '7.200']],
  ['Sekolah menargetkan 50.000 lembar kertas. Kelas V mengumpulkan 18.750 lembar dan kelas VI 22.680 lembar. Berapa lembar lagi yang dibutuhkan?', ['8.570 lembar', '9.570 lembar', '8.670 lembar', '9.430 lembar']],
];

const chapter2: QuestionInput[] = [
  ['Manakah yang merupakan kelipatan 6?', ['14', '16', '18', '20']],
  ['Lima kelipatan positif pertama dari 4 adalah ...', ['0, 4, 8, 12, 16', '4, 8, 12, 16, 20', '4, 6, 8, 10, 12', '1, 2, 4, 8, 16']],
  ['Manakah yang merupakan faktor dari 18?', ['5', '7', '8', '9']],
  ['Manakah bilangan prima berikut?', ['11', '15', '21', '27']],
  ['KPK dari 3 dan 4 adalah ...', ['6', '8', '12', '24']],
  ['FPB dari 8 dan 12 adalah ...', ['2', '4', '6', '8']],
  ['Faktor dari 10 adalah ...', ['1, 2, 5, 10', '1, 3, 5, 10', '2, 4, 6, 10', '1, 2, 4, 10']],
  ['Bilangan 1 bukan bilangan prima karena ...', ['Bilangan 1 adalah bilangan genap', 'Bilangan 1 memiliki tiga faktor', 'Bilangan 1 lebih besar dari 2', 'Bilangan 1 hanya memiliki satu faktor']],
  ['KPK dari 6 dan 8 adalah ...', ['12', '24', '36', '48']],
  ['FPB dari 24 dan 36 adalah ...', ['6', '8', '12', '18']],
  ['Faktorisasi prima dari 60 adalah ...', ['2 x 3 x 5', '2 x 2 x 3 x 3', '2 x 2 x 5 x 5', '2 x 2 x 3 x 5']],
  ['Kelipatan persekutuan positif terkecil dari 5 dan 7 adalah ...', ['35', '12', '25', '70']],
  ['Faktor persekutuan dari 16 dan 24 adalah ...', ['1, 2, 3, 8', '1, 2, 4, 8', '2, 4, 8, 16', '1, 4, 6, 8']],
  ['Manakah pasangan bilangan yang keduanya prima?', ['9 dan 11', '15 dan 17', '13 dan 19', '21 dan 23']],
  ['KPK dari 12 dan 18 adalah ...', ['24', '30', '72', '36']],
  ['FPB dari 45 dan 60 adalah ...', ['15', '5', '10', '30']],
  ['Faktorisasi prima dari 72 adalah ...', ['2 x 2 x 3 x 3', '2 x 2 x 2 x 3 x 3', '2 x 3 x 3 x 3', '2 x 2 x 2 x 3']],
  ['Dina berlatih setiap 4 hari, Riko setiap 6 hari. Mereka berlatih bersama hari ini. Berapa hari lagi mereka berlatih bersama untuk pertama kali?', ['8 hari', '10 hari', '12 hari', '24 hari']],
  ['Ibu membagi 24 jeruk dan 36 apel ke beberapa kantong. Setiap kantong berisi jumlah jeruk dan apel yang sama. Berapa kantong paling banyak yang dapat dibuat?', ['6 kantong', '8 kantong', '18 kantong', '12 kantong']],
  ['Tiga lampu berkedip setiap 6, 8, dan 12 detik. Jika berkedip bersama sekarang, kapan ketiganya pertama kali berkedip bersama lagi?', ['24 detik', '36 detik', '48 detik', '72 detik']],
  ['FPB dari 36, 48, dan 60 adalah ...', ['6', '8', '12', '24']],
  ['KPK dari 8, 10, dan 12 adalah ...', ['60', '120', '160', '240']],
  ['Ada 42 pensil dan 56 penghapus. Keduanya dibagi rata ke paket sebanyak mungkin. Berapa pensil dan penghapus dalam setiap paket?', ['2 pensil dan 3 penghapus', '4 pensil dan 3 penghapus', '6 pensil dan 8 penghapus', '3 pensil dan 4 penghapus']],
  ['Bus A berangkat setiap 15 menit, bus B setiap 20 menit. Keduanya berangkat pukul 07.00. Pukul berapa keduanya berangkat bersama lagi pertama kali?', ['08.00', '07.30', '07.45', '08.30']],
  ['Pita sepanjang 84 cm dan 126 cm dipotong sama panjang tanpa sisa. Berapa panjang terbesar setiap potongan?', ['21 cm', '28 cm', '42 cm', '63 cm']],
];

const chapter3: QuestionInput[] = [
  ['Pecahan yang menyatakan bagian berwarna pada gambar adalah ...', ['1/4', '2/4', '3/4', '4/4'], { kind: 'fraction', filled: 3, total: 4 }],
  ['Pada pecahan 5/8, angka 8 disebut ...', ['Pembilang', 'Penyebut', 'Bilangan bulat', 'Hasil bagi']],
  ['Manakah pecahan yang lebih besar?', ['2/7', '1/7', '3/7', '5/7']],
  ['Pecahan yang senilai dengan 1/2 adalah ...', ['2/4', '1/4', '2/3', '3/4']],
  ['Bentuk paling sederhana dari 6/8 adalah ...', ['2/3', '3/8', '3/4', '1/2']],
  ['Berapakah hasil 2/9 + 4/9?', ['6/18', '6/9', '2/9', '8/9']],
  ['Berapakah hasil 7/10 - 3/10?', ['4/10', '10/10', '4/20', '3/10']],
  ['Manakah yang merupakan pecahan campuran?', ['3/5', '7/4', '0,5', '2 1/3']],
  ['Tanda yang tepat untuk 3/4 ... 2/3 adalah ...', ['<', '=', '>', '+']],
  ['Urutan pecahan dari yang terkecil adalah ...', ['3/4, 1/2, 1/4', '1/4, 1/2, 3/4', '1/2, 1/4, 3/4', '1/4, 3/4, 1/2']],
  ['Bentuk pecahan biasa dari 2 3/5 adalah ...', ['5/5', '10/5', '12/5', '13/5']],
  ['Bentuk pecahan campuran dari 17/4 adalah ...', ['4 1/4', '3 1/4', '4 3/4', '5 1/4']],
  ['Berapakah hasil 1/2 + 1/3?', ['2/5', '2/6', '5/6', '3/6']],
  ['Berapakah hasil 3/4 - 1/6?', ['2/10', '7/12', '2/12', '5/12']],
  ['Bentuk paling sederhana dari 18/24 adalah ...', ['2/3', '3/8', '6/8', '3/4']],
  ['Berapakah hasil 1 1/4 + 2 1/4?', ['3 1/2', '3 1/4', '4 1/2', '2 1/2']],
  ['Rina makan 2/8 bagian kue dan Budi makan 3/8 bagian kue yang sama. Berapa bagian kue yang dimakan keduanya?', ['1/8', '5/16', '5/8', '6/8']],
  ['Pita sepanjang 5/6 meter dipotong 1/3 meter. Berapa meter pita yang tersisa?', ['2/3 meter', '1/2 meter', '4/3 meter', '1/3 meter']],
  ['Berapakah hasil 2 2/3 + 1 3/4?', ['3 5/7', '4 1/12', '3 5/12', '4 5/12']],
  ['Berapakah hasil 5 1/2 - 2 3/4?', ['2 3/4', '3 1/4', '2 1/4', '3 3/4']],
  ['Ibu mempunyai 3/4 kg tepung. Ia membeli lagi 2/3 kg, lalu memakai 1/2 kg. Berapa kg tepung yang tersisa?', ['7/12 kg', '1 1/12 kg', '11/12 kg', '5/12 kg']],
  ['Urutan 5/6, 3/4, dan 7/12 dari yang terbesar adalah ...', ['7/12, 3/4, 5/6', '5/6, 3/4, 7/12', '3/4, 5/6, 7/12', '5/6, 7/12, 3/4']],
  ['Bak terisi 2/5 bagian pada pagi hari dan ditambah 1/4 bagian pada siang hari. Berapa bagian bak yang masih kosong?', ['13/20', '9/20', '3/20', '7/20']],
  ['Sebuah tali panjangnya 4 1/5 meter. Sebanyak 1 3/10 meter dipakai. Berapa meter tali yang tersisa?', ['2 9/10 meter', '3 1/10 meter', '2 7/10 meter', '3 9/10 meter']],
  ['Sari membaca 1/3 bagian buku pada Senin dan 1/4 bagian pada Selasa. Berapa bagian buku yang belum dibaca?', ['7/12', '1/12', '5/12', '2/7']],
];

const chapter4: QuestionInput[] = [
  ['Sebuah persegi memiliki sisi 6 cm. Berapakah kelilingnya?', ['12 cm', '18 cm', '24 cm', '36 cm'], { kind: 'shape', shape: 'square', labels: ['6 cm'] }],
  ['Panjang persegi panjang 8 cm dan lebarnya 5 cm. Kelilingnya adalah ...', ['13 cm', '26 cm', '40 cm', '20 cm'], { kind: 'shape', shape: 'rectangle', labels: ['8 cm', '5 cm'] }],
  ['Keliling bangun datar adalah ...', ['Panjang seluruh sisi pembatas bangun', 'Banyaknya titik sudut bangun', 'Luas bagian dalam bangun', 'Panjang salah satu sisi bangun']],
  ['Satuan yang tepat untuk keliling meja adalah ...', ['cm persegi', 'Liter', 'Kilogram', 'cm']],
  ['Segitiga memiliki sisi 5 cm, 6 cm, dan 7 cm. Kelilingnya adalah ...', ['16 cm', '17 cm', '18 cm', '19 cm'], { kind: 'shape', shape: 'triangle', labels: ['5 cm', '6 cm', '7 cm'] }],
  ['Keliling segitiga sama sisi dengan panjang sisi 9 cm adalah ...', ['18 cm', '27 cm', '36 cm', '81 cm']],
  ['Persegi memiliki keliling 32 cm. Panjang sisinya adalah ...', ['8 cm', '4 cm', '16 cm', '12 cm']],
  ['Segi lima beraturan memiliki 5 sisi sama panjang. Jika satu sisinya 4 cm, kelilingnya adalah ...', ['9 cm', '16 cm', '25 cm', '20 cm'], { kind: 'shape', shape: 'pentagon', labels: ['4 cm'] }],
  ['Keliling persegi panjang dengan panjang 14 cm dan lebar 9 cm adalah ...', ['23 cm', '36 cm', '46 cm', '126 cm']],
  ['Segitiga sama kaki memiliki dua sisi masing-masing 10 cm dan alas 12 cm. Kelilingnya adalah ...', ['22 cm', '32 cm', '34 cm', '40 cm']],
  ['Jajargenjang memiliki dua sisi berdekatan 12 cm dan 7 cm. Kelilingnya adalah ...', ['19 cm', '24 cm', '84 cm', '38 cm'], { kind: 'shape', shape: 'parallelogram', labels: ['12 cm', '7 cm'] }],
  ['Belah ketupat memiliki panjang sisi 11 cm. Kelilingnya adalah ...', ['44 cm', '22 cm', '33 cm', '121 cm']],
  ['Trapesium memiliki panjang sisi 8 cm, 6 cm, 12 cm, dan 6 cm. Berapa kelilingnya?', ['28 cm', '30 cm', '32 cm', '34 cm']],
  ['Persegi panjang memiliki keliling 50 cm dan panjang 15 cm. Berapakah lebarnya?', ['20 cm', '10 cm', '25 cm', '35 cm']],
  ['Keliling segitiga 42 cm. Dua sisinya masing-masing 15 cm dan 13 cm. Berapa panjang sisi ketiga?', ['12 cm', '13 cm', '16 cm', '14 cm']],
  ['Kebun persegi memiliki sisi 18 m. Berapa meter pagar untuk mengelilingi kebun satu kali?', ['72 m', '36 m', '54 m', '324 m']],
  ['Segi enam beraturan memiliki sisi 7 cm. Kelilingnya adalah ...', ['35 cm', '49 cm', '42 cm', '28 cm']],
  ['Keliling layang-layang dengan dua sisi pendek 6 cm dan dua sisi panjang 11 cm adalah ...', ['17 cm', '34 cm', '24 cm', '44 cm']],
  ['Taman berukuran 20 m x 12 m akan dipagar. Tersedia pintu masuk selebar 3 m yang tidak dipagar. Berapa meter pagar yang dibutuhkan?', ['64 m', '67 m', '58 m', '61 m']],
  ['Dua persegi bersisi 5 cm disatukan pada satu sisi penuh sehingga menjadi persegi panjang. Berapa keliling bangun gabungannya?', ['30 cm', '40 cm', '20 cm', '50 cm']],
  ['Rina berlari 3 putaran mengelilingi lapangan berukuran 30 m x 20 m. Berapa total jarak larinya?', ['150 m', '200 m', '300 m', '600 m']],
  ['Keliling persegi sama dengan keliling persegi panjang berukuran 16 cm x 10 cm. Berapa panjang sisi persegi?', ['12 cm', '13 cm', '14 cm', '26 cm']],
  ['Kawat sepanjang 120 cm dibuat menjadi 3 persegi sama besar tanpa sisa. Berapa panjang sisi setiap persegi?', ['15 cm', '20 cm', '30 cm', '10 cm']],
  ['Dari persegi panjang berukuran 12 cm x 8 cm, sudut kanan atas dipotong persegi panjang 4 cm x 3 cm. Berapa keliling bangun berbentuk L yang tersisa?', ['40 cm', '33 cm', '47 cm', '54 cm'], { kind: 'shape', shape: 'combined', labels: ['12 cm', '8 cm', '4 cm', '3 cm'] }],
  ['Taman persegi bersisi 15 m dipagari dengan biaya Rp5.000 per meter. Berapa seluruh biaya pagar?', ['Rp150.000', 'Rp225.000', 'Rp300.000', 'Rp450.000']],
];

const chapter5: QuestionInput[] = [
  ['Persegi memiliki sisi 7 cm. Berapakah luasnya?', ['14 cm2', '28 cm2', '49 cm2', '21 cm2'], { kind: 'shape', shape: 'square', labels: ['7 cm'] }],
  ['Luas persegi panjang berukuran 9 cm x 4 cm adalah ...', ['26 cm2', '36 cm2', '13 cm2', '18 cm2'], { kind: 'shape', shape: 'rectangle', labels: ['9 cm', '4 cm'] }],
  ['Luas daerah bangun datar menyatakan ...', ['Panjang seluruh sisi bangun', 'Jumlah titik sudut bangun', 'Jarak dua titik pada bangun', 'Besar daerah yang ditutupi bangun']],
  ['Satuan yang tepat untuk luas halaman adalah ...', ['Meter persegi', 'Meter', 'Liter', 'Kilogram']],
  ['Luas segitiga dengan alas 8 cm dan tinggi 6 cm adalah ...', ['48 cm2', '14 cm2', '24 cm2', '28 cm2'], { kind: 'shape', shape: 'triangle', labels: ['8 cm', 'tinggi 6 cm'] }],
  ['Sebuah bangun menutupi 18 persegi satuan tanpa celah. Luas bangun itu adalah ...', ['9 satuan persegi', '18 satuan persegi', '36 satuan persegi', '6 satuan persegi']],
  ['Rumus luas persegi panjang adalah ...', ['Panjang + lebar', '2 x (panjang + lebar)', '4 x sisi', 'Panjang x lebar']],
  ['Persegi memiliki luas 64 cm2. Panjang sisinya adalah ...', ['8 cm', '16 cm', '32 cm', '6 cm']],
  ['Luas persegi panjang dengan panjang 15 cm dan lebar 8 cm adalah ...', ['46 cm2', '60 cm2', '120 cm2', '150 cm2']],
  ['Segitiga memiliki alas 12 cm dan tinggi 9 cm. Berapa luasnya?', ['108 cm2', '54 cm2', '42 cm2', '21 cm2']],
  ['Luas jajargenjang dengan alas 14 cm dan tinggi 5 cm adalah ...', ['38 cm2', '35 cm2', '19 cm2', '70 cm2'], { kind: 'shape', shape: 'parallelogram', labels: ['14 cm', 'tinggi 5 cm'] }],
  ['Persegi panjang memiliki luas 96 cm2 dan panjang 12 cm. Lebarnya adalah ...', ['8 cm', '6 cm', '9 cm', '10 cm']],
  ['Trapesium memiliki sisi sejajar 8 cm dan 12 cm, serta tinggi 6 cm. Berapa luasnya?', ['120 cm2', '48 cm2', '60 cm2', '72 cm2'], { kind: 'shape', shape: 'trapezoid', labels: ['8 cm', '12 cm', 'tinggi 6 cm'] }],
  ['Belah ketupat memiliki diagonal 10 cm dan 8 cm. Luasnya adalah ...', ['80 cm2', '40 cm2', '36 cm2', '18 cm2']],
  ['Layang-layang memiliki diagonal 12 cm dan 9 cm. Berapakah luasnya?', ['108 cm2', '42 cm2', '21 cm2', '54 cm2']],
  ['Luas segitiga 45 cm2 dan alasnya 10 cm. Berapa tingginya?', ['9 cm', '4,5 cm', '5 cm', '18 cm']],
  ['Lantai berukuran 6 m x 4 m. Berapa luas lantai itu?', ['20 m2', '10 m2', '24 m2', '12 m2']],
  ['Dua persegi dengan sisi masing-masing 6 cm dan 4 cm tidak saling menumpuk. Berapa luas totalnya?', ['100 cm2', '52 cm2', '40 cm2', '48 cm2']],
  ['Persegi panjang 12 cm x 8 cm dipotong di sudutnya seluas persegi 3 cm x 3 cm. Berapa luas daerah yang tersisa?', ['90 cm2', '93 cm2', '84 cm2', '87 cm2']],
  ['Bangun gabungan terdiri atas persegi panjang 10 cm x 6 cm dan segitiga beralas 10 cm dengan tinggi 4 cm tanpa tumpang tindih. Berapa luas totalnya?', ['80 cm2', '100 cm2', '70 cm2', '64 cm2']],
  ['Kebun 20 m x 15 m memiliki kolam berukuran 8 m x 5 m di dalamnya. Berapa luas kebun di luar kolam?', ['300 m2', '340 m2', '260 m2', '280 m2']],
  ['Sebuah persegi memiliki keliling 36 cm. Berapa luasnya?', ['72 cm2', '81 cm2', '144 cm2', '324 cm2']],
  ['Dua persegi panjang memiliki keliling sama, yaitu 28 cm. Ukurannya 10 cm x 4 cm dan 8 cm x 6 cm. Berapa selisih luas keduanya?', ['4 cm2', '12 cm2', '16 cm2', '8 cm2']],
  ['Lantai luasnya 12 m2 ditutup ubin yang luasnya masing-masing 1/4 m2. Berapa ubin yang diperlukan tanpa sisa?', ['48 ubin', '24 ubin', '36 ubin', '60 ubin']],
  ['Taman persegi bersisi 12 m ditanami rumput seharga Rp10.000 per m2. Berapa seluruh biaya rumput?', ['Rp480.000', 'Rp1.200.000', 'Rp1.440.000', 'Rp1.560.000']],
];

const chapter6: QuestionInput[] = [
  ['Dua sinar garis yang bertemu pada satu titik membentuk ...', ['Sisi', 'Sudut', 'Luas', 'Keliling']],
  ['Titik tempat bertemunya dua kaki sudut disebut ...', ['Titik tengah', 'Titik akhir', 'Titik sudut', 'Titik pusat lingkaran']],
  ['Besar sudut siku-siku adalah ...', ['90 derajat', '45 derajat', '180 derajat', '360 derajat']],
  ['Sudut 35 derajat termasuk sudut ...', ['Tumpul', 'Lurus', 'Refleks', 'Lancip'], { kind: 'angle', degrees: 35 }],
  ['Sudut 120 derajat termasuk sudut ...', ['Lancip', 'Tumpul', 'Siku-siku', 'Nol'], { kind: 'angle', degrees: 120 }],
  ['Besar sudut lurus adalah ...', ['0 derajat', '90 derajat', '180 derajat', '270 derajat']],
  ['Alat untuk mengukur besar sudut adalah ...', ['Busur derajat', 'Jangka', 'Timbangan', 'Meteran kain']],
  ['Sudut yang kedua kakinya berimpit tanpa putaran memiliki besar ...', ['90 derajat', '180 derajat', '360 derajat', '0 derajat']],
  ['Manakah yang termasuk sudut refleks?', ['75 derajat', '225 derajat', '150 derajat', '180 derajat']],
  ['Manakah sudut yang paling besar?', ['45 derajat', '90 derajat', '135 derajat', '60 derajat']],
  ['Sudut pada pojok buku berbentuk persegi panjang adalah ...', ['Siku-siku', 'Lancip', 'Tumpul', 'Refleks']],
  ['Pada sudut ABC, titik sudutnya adalah ...', ['A', 'C', 'A dan C', 'B']],
  ['Pada sudut PQR, kedua kaki sudutnya adalah ...', ['PQ dan PR', 'QP dan QR', 'RP dan RQ', 'PR dan QR']],
  ['Saat mengukur sudut, titik pusat busur derajat harus diletakkan pada ...', ['Ujung kaki terpanjang', 'Sembarang titik', 'Titik sudut', 'Angka 90 pada busur']],
  ['Satu kaki sudut tepat pada skala 0 derajat dan kaki lain pada 65 derajat. Besar sudutnya adalah ...', ['65 derajat', '115 derajat', '35 derajat', '155 derajat']],
  ['Sudut A besarnya 80 derajat dan sudut B 110 derajat. Selisih keduanya adalah ...', ['20 derajat', '40 derajat', '190 derajat', '30 derajat']],
  ['Dua sudut siku-siku yang digabung tanpa tumpang tindih membentuk sudut ...', ['Nol', 'Lurus', 'Lancip', 'Refleks']],
  ['Urutan sudut dari yang terkecil adalah ...', ['120, 90, 30 derajat', '90, 30, 120 derajat', '30, 90, 120 derajat', '30, 120, 90 derajat']],
  ['Sebuah sudut lurus dibagi menjadi sudut 65 derajat dan satu sudut lain. Berapa besar sudut lainnya?', ['115 derajat', '25 derajat', '125 derajat', '245 derajat']],
  ['Sudut siku-siku dibagi menjadi dua sudut. Salah satunya 37 derajat. Besar sudut lainnya adalah ...', ['43 derajat', '63 derajat', '127 derajat', '53 derajat']],
  ['Sudut terkecil antara jarum jam tepat pukul 03.00 adalah ...', ['60 derajat', '90 derajat', '120 derajat', '180 derajat']],
  ['Pada busur terdapat dua angka pada garis yang sama: 40 dan 140. Kaki awal berada di 0 skala dalam, dan kaki lain berada di 40 skala dalam. Besar sudutnya adalah ...', ['140 derajat', '100 derajat', '40 derajat', '180 derajat']],
  ['Satu putaran penuh 360 derajat. Jika sudah berputar 135 derajat, berapa derajat lagi untuk satu putaran penuh?', ['225 derajat', '135 derajat', '180 derajat', '245 derajat']],
  ['Untuk melukis sudut 55 derajat setelah menggambar kaki pertama dan meletakkan busur dengan benar, langkah berikutnya adalah ...', ['Menarik garis pada angka 180', 'Memindahkan titik sudut', 'Mengukur panjang kaki kedua 55 cm', 'Memberi tanda pada skala 55 lalu menghubungkannya ke titik sudut']],
  ['Sudut refleks besarnya 300 derajat. Berapa besar sudut yang lebih kecil di antara kedua kakinya?', ['30 derajat', '60 derajat', '120 derajat', '150 derajat']],
];

const chapter7: QuestionInput[] = [
  ['Berapa banyak sisi pada segitiga?', ['2', '4', '3', '5']],
  ['Segitiga dengan ketiga sisi sama panjang disebut ...', ['Segitiga sama sisi', 'Segitiga sama kaki', 'Segitiga sembarang', 'Segitiga siku-siku']],
  ['Segitiga yang memiliki satu sudut 90 derajat disebut ...', ['Segitiga lancip', 'Segitiga siku-siku', 'Segitiga tumpul', 'Segitiga sama sisi']],
  ['Bangun dengan empat sisi sama panjang dan empat sudut siku-siku adalah ...', ['Trapesium', 'Layang-layang', 'Jajargenjang', 'Persegi'], { kind: 'shape', shape: 'square' }],
  ['Berapa jumlah sudut dalam sebuah segitiga?', ['90 derajat', '270 derajat', '180 derajat', '360 derajat']],
  ['Segi empat dengan tepat satu pasang sisi sejajar disebut ...', ['Trapesium', 'Persegi', 'Belah ketupat', 'Persegi panjang'], { kind: 'shape', shape: 'trapezoid' }],
  ['Pada persegi panjang, sisi-sisi yang berhadapan ...', ['Selalu berbeda panjang', 'Sama panjang dan sejajar', 'Saling tegak lurus', 'Tidak sejajar']],
  ['Bangun yang memiliki dua pasang sisi berdekatan sama panjang, dengan panjang pasangan berbeda, adalah ...', ['Persegi', 'Persegi panjang', 'Trapesium', 'Layang-layang'], { kind: 'shape', shape: 'kite' }],
  ['Segitiga dengan panjang sisi 5 cm, 5 cm, dan 8 cm termasuk ...', ['Segitiga sama sisi', 'Segitiga sembarang', 'Segitiga sama kaki', 'Segitiga siku-siku']],
  ['Segitiga memiliki sudut 40, 60, dan 80 derajat. Berdasarkan sudutnya, segitiga tersebut adalah ...', ['Segitiga lancip', 'Segitiga tumpul', 'Segitiga siku-siku', 'Segitiga refleks']],
  ['Segitiga memiliki sudut 110, 40, dan 30 derajat. Jenisnya adalah ...', ['Segitiga lancip', 'Segitiga tumpul', 'Segitiga siku-siku', 'Segitiga sama sisi']],
  ['Ciri yang dimiliki persegi dan belah ketupat adalah ...', ['Semua sudut selalu siku-siku', 'Kedua diagonal selalu sama panjang', 'Hanya satu pasang sisi sejajar', 'Keempat sisi sama panjang']],
  ['Ciri yang selalu dimiliki jajargenjang adalah ...', ['Keempat sisi sama panjang', 'Keempat sudut siku-siku', 'Sisi berhadapan sama panjang dan sejajar', 'Hanya satu pasang sisi sejajar'], { kind: 'shape', shape: 'parallelogram' }],
  ['Diagonal persegi panjang memiliki sifat ...', ['Sama panjang dan saling membagi dua', 'Selalu tegak lurus', 'Selalu berbeda panjang', 'Tidak berpotongan']],
  ['Diagonal belah ketupat saling ...', ['Sejajar', 'Tegak lurus', 'Berimpit', 'Tidak berpotongan'], { kind: 'shape', shape: 'rhombus' }],
  ['Berapa jumlah sudut dalam segi empat?', ['90 derajat', '180 derajat', '270 derajat', '360 derajat']],
  ['Segitiga sembarang adalah segitiga yang ...', ['Semua sisinya sama panjang', 'Dua sisinya sama panjang', 'Ketiga sisinya berbeda panjang', 'Selalu memiliki sudut 90 derajat']],
  ['Persamaan persegi dan persegi panjang adalah ...', ['Sama-sama memiliki empat sudut siku-siku', 'Semua sisinya selalu sama panjang', 'Diagonal selalu tegak lurus', 'Hanya memiliki satu pasang sisi sejajar']],
  ['Dua sudut segitiga adalah 55 dan 65 derajat. Sudut ketiganya adalah ...', ['50 derajat', '60 derajat', '70 derajat', '120 derajat']],
  ['Segitiga sama kaki memiliki sudut puncak 40 derajat. Berapa besar masing-masing sudut alasnya?', ['40 derajat', '60 derajat', '80 derajat', '70 derajat']],
  ['Pada jajargenjang, satu sudut besarnya 65 derajat. Sudut yang berdekatan dengannya adalah ...', ['65 derajat', '105 derajat', '115 derajat', '125 derajat']],
  ['Tiga sudut segi empat adalah 90, 85, dan 95 derajat. Besar sudut keempat adalah ...', ['90 derajat', '80 derajat', '100 derajat', '110 derajat']],
  ['Bangun memiliki empat sisi sama panjang, tetapi sudutnya 60 dan 120 derajat. Bangun itu adalah ...', ['Persegi', 'Belah ketupat', 'Persegi panjang', 'Trapesium siku-siku']],
  ['Pernyataan yang tepat tentang persegi adalah ...', ['Setiap persegi panjang pasti persegi', 'Persegi tidak memiliki sisi sejajar', 'Persegi hanya memiliki dua sudut siku-siku', 'Setiap persegi juga merupakan persegi panjang']],
  ['Segitiga sama kaki mempunyai dua sudut alas masing-masing 45 derajat. Berdasarkan sudutnya, segitiga itu adalah ...', ['Segitiga lancip', 'Segitiga tumpul', 'Segitiga siku-siku', 'Segitiga refleks']],
];

const fruitTable: Visual = { kind: 'table', headers: ['Buah kesukaan', 'Jumlah siswa'], rows: [['Apel', '8'], ['Jeruk', '6'], ['Mangga', '10'], ['Pisang', '4']] };
const booksBars: Visual = { kind: 'bars', title: 'Buku yang dibaca selama satu minggu', labels: ['Ayu', 'Bima', 'Cici', 'Doni'], values: [4, 6, 3, 5] };
const attendanceTable: Visual = { kind: 'table', headers: ['Hari', 'Siswa hadir'], rows: [['Senin', '28'], ['Selasa', '30'], ['Rabu', '29'], ['Kamis', '27'], ['Jumat', '30']] };
const libraryBars: Visual = { kind: 'bars', title: 'Pengunjung perpustakaan', labels: ['Sen', 'Sel', 'Rab', 'Kam'], values: [20, 30, 25, 35], horizontal: true };
const doubleBars: Visual = { kind: 'bars', title: 'Peserta klub olahraga', labels: ['Renang', 'Basket', 'Bulu tangkis'], values: [8, 12, 10], secondary: [10, 8, 12], legends: ['Laki-laki', 'Perempuan'] };
const pictogram: Visual = { kind: 'pictogram', labels: ['Kelas VA', 'Kelas VB', 'Kelas VC'], values: [4, 6, 5], unit: 2 };

const chapter8: QuestionInput[] = [
  ['Untuk mengetahui buah kesukaan teman sekelas, cara mengumpulkan data yang tepat adalah ...', ['Menebak sendiri', 'Mengukur tinggi badan', 'Bertanya kepada setiap teman', 'Menghitung meja kelas']],
  ['Menurut tabel, berapa siswa yang menyukai apel?', ['8 siswa', '6 siswa', '10 siswa', '4 siswa'], fruitTable],
  ['Buah yang paling banyak disukai siswa adalah ...', ['Apel', 'Mangga', 'Jeruk', 'Pisang'], fruitTable],
  ['Buah yang paling sedikit disukai siswa adalah ...', ['Mangga', 'Jeruk', 'Apel', 'Pisang'], fruitTable],
  ['Pada diagram, siapa yang membaca 6 buku?', ['Ayu', 'Cici', 'Bima', 'Doni'], booksBars],
  ['Berapa buku yang dibaca Ayu?', ['4 buku', '3 buku', '5 buku', '6 buku'], booksBars],
  ['Dalam tabel frekuensi, frekuensi berarti ...', ['Nama kegiatan', 'Banyaknya kemunculan suatu data', 'Judul tabel', 'Urutan huruf']],
  ['Setiap gambar buku mewakili 2 buku. Berapa buku yang dikumpulkan Kelas VA?', ['4 buku', '6 buku', '10 buku', '8 buku'], pictogram],
  ['Berapa jumlah seluruh siswa pada tabel buah kesukaan?', ['24 siswa', '26 siswa', '28 siswa', '30 siswa'], fruitTable],
  ['Selisih jumlah penyuka mangga dan jeruk adalah ...', ['4 siswa', '2 siswa', '6 siswa', '8 siswa'], fruitTable],
  ['Berapa jumlah buku yang dibaca keempat anak?', ['16 buku', '18 buku', '20 buku', '22 buku'], booksBars],
  ['Berapa selisih buku yang dibaca Bima dan Cici?', ['1 buku', '2 buku', '4 buku', '3 buku'], booksBars],
  ['Pada hari apa jumlah siswa hadir paling sedikit?', ['Senin', 'Rabu', 'Kamis', 'Jumat'], attendanceTable],
  ['Berapa jumlah kehadiran pada Senin dan Selasa?', ['58 kehadiran', '57 kehadiran', '59 kehadiran', '60 kehadiran'], attendanceTable],
  ['Menurut diagram batang horizontal, berapa pengunjung perpustakaan pada Rabu?', ['20 orang', '25 orang', '30 orang', '35 orang'], libraryBars],
  ['Selisih pengunjung perpustakaan hari Kamis dan Senin adalah ...', ['5 orang', '10 orang', '20 orang', '15 orang'], libraryBars],
  ['Setiap gambar mewakili 2 buku. Berapa buku yang dikumpulkan Kelas VB?', ['6 buku', '10 buku', '12 buku', '14 buku'], pictogram],
  ['Berapa jumlah peserta perempuan pada klub basket?', ['8 siswa', '10 siswa', '12 siswa', '20 siswa'], doubleBars],
  ['Berdasarkan tabel buah, jumlah penyuka apel dan pisang dibandingkan penyuka mangga adalah ...', ['Lebih sedikit 2 siswa', 'Lebih banyak 2 siswa', 'Sama banyak', 'Lebih banyak 4 siswa'], fruitTable],
  ['Jika ada 30 siswa di kelas setiap hari, berapa total ketidakhadiran selama lima hari?', ['4 ketidakhadiran', '5 ketidakhadiran', '8 ketidakhadiran', '6 ketidakhadiran'], attendanceTable],
  ['Berapa jumlah pengunjung perpustakaan selama empat hari?', ['100 orang', '105 orang', '110 orang', '115 orang'], libraryBars],
  ['Setiap gambar mewakili 2 buku. Berapa jumlah buku dari ketiga kelas?', ['30 buku', '15 buku', '24 buku', '32 buku'], pictogram],
  ['Berapa total peserta laki-laki dan perempuan pada klub bulu tangkis?', ['20 siswa', '22 siswa', '24 siswa', '18 siswa'], doubleBars],
  ['Klub manakah yang jumlah peserta perempuannya lebih banyak daripada laki-laki?', ['Hanya renang', 'Hanya basket', 'Basket dan bulu tangkis', 'Renang dan bulu tangkis'], doubleBars],
  ['Jika setiap anak pada diagram menambah bacaan sebanyak 2 buku, berapa jumlah buku yang dibaca semuanya?', ['20 buku', '24 buku', '26 buku', '28 buku'], booksBars],
];

const chapter9: QuestionInput[] = [
  ['Bagaimana membaca bilangan 325.000?', ['Tiga ratus dua puluh lima ribu', 'Tiga puluh dua ribu lima ratus', 'Tiga ratus lima puluh dua ribu', 'Tiga juta dua puluh lima ribu']],
  ['Bilangan "enam ratus ribu" ditulis ...', ['60.000', '6.000', '600.000', '6.000.000']],
  ['Angka 7 pada 754.321 menempati nilai tempat ...', ['Puluh ribuan', 'Ratus ribuan', 'Ribuan', 'Jutaan']],
  ['Nilai angka 4 pada 248.615 adalah ...', ['4.000', '400', '400.000', '40.000']],
  ['Manakah bilangan terbesar?', ['450.020', '405.200', '450.200', '405.020']],
  ['Tanda yang tepat untuk 680.000 ... 608.000 adalah ...', ['>', '<', '=', '-']],
  ['Bilangan sesudah 999.999 adalah ...', ['999.998', '1.000.000', '990.000', '1.000.001']],
  ['500.000 + 30.000 + 2.000 + 400 + 10 + 6 membentuk bilangan ...', ['523.416', '532.461', '534.216', '532.416']],
  ['Bilangan "empat ratus tujuh ribu delapan puluh" ditulis ...', ['470.080', '407.800', '407.080', '400.780']],
  ['Bentuk panjang dari 806.205 adalah ...', ['800.000 + 6.000 + 200 + 5', '800.000 + 60.000 + 200 + 5', '80.000 + 6.000 + 200 + 5', '800.000 + 6.000 + 20 + 5']],
  ['Urutan dari yang terkecil adalah ...', ['315.420, 315.240, 315.402', '315.240, 315.402, 315.420', '315.402, 315.420, 315.240', '315.420, 315.402, 315.240']],
  ['Bilangan tepat sebelum 700.000 adalah ...', ['699.990', '699.900', '700.001', '699.999']],
  ['Angka 0 pada bilangan 520.476 berada di tempat ...', ['Ratusan', 'Puluhan', 'Ribuan', 'Puluh ribuan']],
  ['Isilah titik-titik: 934.608 = 900.000 + ... + 4.000 + 600 + 8.', ['30.000', '3.000', '300', '300.000']],
  ['Manakah bilangan yang terletak di antara 275.000 dan 276.000?', ['274.999', '275.500', '276.500', '277.000']],
  ['Pada bilangan 681.459, angka yang bernilai 80.000 adalah ...', ['6', '1', '4', '8']],
  ['Urutan 901.050, 910.005, dan 901.500 dari yang terbesar adalah ...', ['901.050, 901.500, 910.005', '901.500, 910.005, 901.050', '910.005, 901.500, 901.050', '910.005, 901.050, 901.500']],
  ['Bilangan yang memiliki 4 ratus ribuan, 6 ribuan, 2 ratusan, dan 9 satuan adalah ...', ['406.209', '460.209', '406.029', '400.629']],
  ['Bentuklah bilangan enam angka terbesar dari angka 1, 8, 0, 5, 3, dan 7. Setiap angka dipakai sekali.', ['875.130', '875.310', '873.510', '857.310']],
  ['Bentuklah bilangan enam angka terkecil dari angka 2, 0, 6, 4, 1, dan 9. Setiap angka dipakai sekali.', ['012.469', '120.469', '104.269', '102.469']],
  ['Pada 727.305, nilai angka 7 pertama adalah berapa kali nilai angka 7 kedua?', ['10 kali', '1.000 kali', '100 kali', '7 kali']],
  ['Bilangan memiliki angka 6 di ratus ribuan, 3 di puluh ribuan, 0 di ribuan, 8 di ratusan, 2 di puluhan, dan 5 di satuan. Bilangan itu adalah ...', ['630.825', '638.025', '603.825', '630.285']],
  ['Jika angka puluh ribuan dan ribuan pada 452.718 ditukar, bilangan yang terbentuk adalah ...', ['452.178', '425.718', '542.718', '457.218']],
  ['Bilangan enam angka memiliki angka 9 di ratus ribuan. Semua angka lain 0 kecuali angka 5 di puluhan. Bilangan itu adalah ...', ['900.500', '905.000', '950.000', '900.050']],
  ['Kota A berpenduduk 875.240, kota B 875.420, dan kota C 857.420. Urutan kota dari penduduk paling sedikit adalah ...', ['A, B, C', 'B, A, C', 'C, A, B', 'C, B, A']],
];

export const chapters: Chapter[] = [
  { id: 1, title: 'Bilangan Cacah Sampai 100.000', shortTitle: 'Bilangan Cacah', description: 'Kenali nilai tempat, urutan, dan operasi bilangan sampai 100.000.', color: 'blue', icon: 'numbers', topics: ['Membaca dan menulis bilangan', 'Nilai tempat dan perbandingan', 'Komposisi dan dekomposisi', 'Penjumlahan dan pengurangan'], questions: makeQuestions(1, chapter1) },
  { id: 2, title: 'KPK dan FPB', shortTitle: 'KPK dan FPB', description: 'Temukan kelipatan, faktor, dan cara memakainya sehari-hari.', color: 'purple', icon: 'network', topics: ['Kelipatan dan faktor', 'KPK dan FPB', 'Bilangan dan faktorisasi prima', 'Soal cerita sehari-hari'], questions: makeQuestions(2, chapter2) },
  { id: 3, title: 'Bilangan Pecahan', shortTitle: 'Bilangan Pecahan', description: 'Jelajahi pecahan, bandingkan, lalu hitung dengan percaya diri.', color: 'orange', icon: 'fraction', topics: ['Membandingkan dan mengurutkan', 'Pecahan biasa dan campuran', 'Menyederhanakan pecahan', 'Penjumlahan dan pengurangan'], questions: makeQuestions(3, chapter3) },
  { id: 4, title: 'Keliling Bangun Datar', shortTitle: 'Keliling Bangun Datar', description: 'Ayo berkeliling dan menghitung panjang sisi berbagai bentuk.', color: 'teal', icon: 'perimeter', topics: ['Konsep keliling', 'Keliling segitiga dan segi empat', 'Segi banyak dan bangun gabungan', 'Penerapan dalam kehidupan'], questions: makeQuestions(4, chapter4) },
  { id: 5, title: 'Luas Daerah Bangun Datar', shortTitle: 'Luas Bangun Datar', description: 'Cari tahu luas sebuah daerah dari persegi hingga bangun gabungan.', color: 'pink', icon: 'area', topics: ['Konsep luas dan satuan persegi', 'Luas persegi dan persegi panjang', 'Luas segitiga dan bangun lainnya', 'Luas gabungan dan keliling'], questions: makeQuestions(5, chapter5) },
  { id: 6, title: 'Sudut', shortTitle: 'Sudut', description: 'Kenali jenis sudut dan belajar mengukur besar sudut.', color: 'amber', icon: 'angle', topics: ['Titik sudut dan kaki sudut', 'Jenis-jenis sudut', 'Menggunakan busur derajat', 'Membandingkan dan melukis sudut'], questions: makeQuestions(6, chapter6) },
  { id: 7, title: 'Membandingkan Ciri-Ciri Bangun Datar', shortTitle: 'Ciri-Ciri Bangun Datar', description: 'Temukan persamaan dan perbedaan dari bentuk di sekitarmu.', color: 'violet', icon: 'shapes', topics: ['Jenis-jenis segitiga', 'Jumlah sudut segitiga', 'Ciri-ciri segi empat', 'Membandingkan sifat bangun'], questions: makeQuestions(7, chapter7) },
  { id: 8, title: 'Data', shortTitle: 'Data', description: 'Baca cerita di balik angka lewat tabel, piktogram, dan diagram.', color: 'cyan', icon: 'chart', topics: ['Mengumpulkan dan membaca data', 'Tabel frekuensi dan piktogram', 'Diagram batang', 'Menganalisis dan membandingkan'], questions: makeQuestions(8, chapter8) },
  { id: 9, title: 'Bilangan Cacah Sampai 1.000.000', shortTitle: 'Bilangan Sampai 1.000.000', description: 'Melangkah lebih jauh dengan bilangan hingga satu juta.', color: 'indigo', icon: 'million', topics: ['Membaca dan menulis sampai satu juta', 'Nilai tempat', 'Membandingkan dan mengurutkan', 'Komposisi dan dekomposisi'], questions: makeQuestions(9, chapter9) },
];

// Fail early if a content edit accidentally leaves an incomplete chapter.
const allIds = new Set<string>();
for (const chapter of chapters) {
  if (chapter.questions.length !== 25) throw new Error(`Bab ${chapter.id} harus memiliki 25 soal.`);
  for (const question of chapter.questions) {
    if (allIds.has(question.id)) throw new Error(`ID soal berulang: ${question.id}`);
    allIds.add(question.id);
    if (new Set(Object.values(question.options)).size !== 4 || Object.values(question.options).some(option => !option.trim())) {
      throw new Error(`Pilihan jawaban tidak lengkap atau berulang: ${question.id}`);
    }
  }
}

export const TOTAL_QUESTIONS = chapters.reduce((sum, chapter) => sum + chapter.questions.length, 0);