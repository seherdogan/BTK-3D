// Modelde isimli obje / kamera bulunmadığı için oda ve eşya bilgileri burada tanımlanır.
// Tüm koordinatlar modelin orijinal (3ds, Z-yukarı, santimetre) uzayındadır:
//   [x, y, z]  ->  z = yükseklik,  eşya kutusu: [minX, minY, minZ, maxX, maxY, maxZ]
// main.js bunları Three.js dünya koordinatına (metre, Y-yukarı) çevirir.
// Kat planını görmek için: http://localhost:5173/?top

export const OVERVIEW = {
  id: 'overview',
  name: 'Genel Bakış',
  subtitle: 'Kaydırarak daireyi gezin',
  aerial: true,
};

export const ROOMS = [
  {
    id: 'salon',
    name: 'Salon',
    subtitle: 'Kanepe ve kitaplık köşesi',
    eye: [-8110, 60, 150],
    target: [-7900, 230, 70],
    furniture: [
      {
        name: 'Kanepe',
        desc: 'Yeşil dokuma kumaş kaplı, geniş oturumlu üç kişilik kanepe.',
        box: [-7971, 132, 0, -7869, 374, 86],
      },
      {
        name: 'Kitaplık',
        desc: 'Siyah metal çerçeveli, çekmeceli merdiven tipi kitaplık.',
        box: [-7917, 0, 0, -7871, 101, 202],
      },
    ],
  },
  {
    id: 'yemek',
    name: 'Yemek Alanı',
    subtitle: 'Yuvarlak masa ve dört sandalye',
    eye: [-8090, 70, 150],
    target: [-8270, -60, 60],
    furniture: [
      {
        name: 'Yemek Masası',
        desc: 'Mermer görünümlü yuvarlak tabla, çapraz ahşap ayaklar.',
        box: [-8331, -122, 60, -8209, -1, 76],
      },
      {
        name: 'Sandalyeler',
        desc: 'Siyah metal iskeletli, deri oturumlu dört sandalye.',
        box: [-8363, -151, 0, -8183, 28, 80],
      },
      {
        name: 'Halı',
        desc: 'Yeşil bordürlü, desenli yuvarlak halı.',
        box: [-8364, -157, 0, -8172, 35, 2],
      },
    ],
  },
  {
    id: 'mutfak',
    name: 'Mutfak',
    subtitle: 'Ankastre ocak, fırın ve evye',
    eye: [-8340, 190, 160],
    target: [-8225, 340, 85],
    furniture: [
      {
        name: 'Ocak ve Fırın',
        desc: 'Ankastre seramik ocak, altında siyah cam kapaklı fırın.',
        box: [-8272, 314, 13, -8203, 391, 93],
      },
      {
        name: 'Evye ve Batarya',
        desc: 'Antrasit granit evye, siyah kuğu boyunlu batarya.',
        box: [-8262, 214, 60, -8203, 277, 122],
      },
      {
        name: 'Mutfak Tezgâhı',
        desc: 'Beyaz lake kapaklı alt dolaplar ve açık ahşap tezgâh.',
        box: [-8362, 282, 0, -8202, 451, 89],
      },
      {
        name: 'Kahvaltı Dolabı',
        desc: 'Tezgâhın arkasında, koyu renk alçak dolap ünitesi.',
        box: [-8194, 139, 4, -8142, 400, 57],
      },
      {
        name: 'Boy Dolabı',
        desc: 'Kiler olarak kullanılan yüksek dolap.',
        box: [-8194, 348, 56, -8162, 400, 209],
      },
    ],
  },
  {
    id: 'banyo1',
    name: 'Banyo',
    subtitle: 'Mozaik kaplı ana banyo',
    eye: [-8405, 15, 170],
    target: [-8545, -95, 70],
    furniture: [
      {
        name: 'Lavabo ve Ayna',
        desc: 'Seramik çanak lavabo, krom batarya ve boydan ayna.',
        box: [-8575, -60, 20, -8528, 5, 212],
      },
      {
        name: 'Klozet ve Bide',
        desc: 'Asma tip beyaz seramik vitrifiye.',
        box: [-8456, -125, 0, -8380, 1, 48],
      },
      {
        name: 'Duş',
        desc: 'Cam paravanlı, zemine gömme duş teknesi.',
        box: [-8573, -158, 0, -8465, -80, 200],
      },
    ],
  },
  {
    id: 'banyo2',
    name: 'İkinci Banyo',
    subtitle: 'Duşlu misafir banyosu ve çamaşır alanı',
    eye: [-8420, 285, 170],
    target: [-8560, 395, 70],
    furniture: [
      {
        name: 'Lavabo ve Ayna',
        desc: 'Seramik çanak lavabo, krom batarya ve ayna.',
        box: [-8575, 360, 20, -8528, 426, 212],
      },
      {
        name: 'Klozet ve Bide',
        desc: 'Asma tip beyaz seramik vitrifiye.',
        box: [-8481, 397, 0, -8424, 492, 48],
      },
      {
        name: 'Duş',
        desc: 'Cam paravanlı duş teknesi.',
        box: [-8478, 268, 0, -8380, 368, 200],
      },
      {
        name: 'Çamaşır Makinesi',
        desc: 'Koridordaki ön yüklemeli çamaşır makinesi.',
        box: [-8445, 187, 0, -8381, 250, 78],
      },
    ],
  },
  {
    id: 'yatak1',
    name: 'Yatak Odası',
    subtitle: 'Yatak, gardırop ve çalışma masası',
    eye: [-8620, 175, 165],
    target: [-8860, 380, 45],
    furniture: [
      {
        name: 'Yatak',
        desc: 'Açık mavi nevresimli, beyaz başlıklı yatak.',
        box: [-8909, 305, 0, -8799, 495, 69],
      },
      {
        name: 'Çalışma Masası',
        desc: 'Koyu renk çalışma masası ve tekerlekli sandalye.',
        box: [-8910, 140, 0, -8818, 265, 110],
      },
      {
        name: 'Gardırop',
        desc: 'Duvar boyu, kapaklı gardırop.',
        box: [-8645, 266, 0, -8580, 472, 212],
      },
    ],
  },
  {
    id: 'yatak2',
    name: 'Çocuk Odası',
    subtitle: 'Yatak ve çalışma köşesi',
    eye: [-8640, 60, 160],
    target: [-8800, -60, 45],
    furniture: [
      {
        name: 'Yatak',
        desc: 'Açık mavi nevresimli tek kişilik yatak.',
        box: [-8716, -152, 0, -8605, 38, 69],
      },
      {
        name: 'Çalışma Masası',
        desc: 'Beyaz çekmeceli masa ve tekerlekli sandalye.',
        box: [-8892, -158, 0, -8770, -55, 110],
      },
      {
        name: 'Gardırop',
        desc: 'Odayı bölen beyaz, kapaklı gardırop.',
        box: [-8905, 84, 0, -8737, 142, 212],
      },
    ],
  },
];
