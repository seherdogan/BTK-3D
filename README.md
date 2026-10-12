# BTK-3D

Milano'daki bir dairenin 3D modelini web'de gezmeyi sağlayan Three.js + Vite projesi.

- **Scroll ile tur:** kaydırdıkça kamera odalar arasında ilerler (Genel Bakış → Salon → Yemek Alanı → Mutfak → Banyolar → Yatak Odaları).
- **Eşyaya odaklanma:** eşyalara veya turuncu noktalara tıklayınca kamera yaklaşır, eşyanın etrafında döndürülebilir. `Esc` ile tura dönülür.

## Çalıştırma

```bash
npm install
npm run dev
```

Ardından http://localhost:5173 adresini açın. Kat planını eşya kutularıyla görmek için: `/?top`

## Yapı

- `src/main.js` – sahne, model yükleme, arayüz
- `src/tour.js` – scroll turu
- `src/focus.js` – eşyaya odaklanma
- `src/rooms.js` – oda ve eşya tanımları
- `src/lighting.js` – ışıklandırma ve malzeme düzeltmeleri
- `public/models/apartment.glb` – kullanılan model

## Lisans / Atıf

This work is based on ["Trilocale Via Boncompagni Milano"](https://sketchfab.com/3d-models/trilocale-via-boncompagni-milano-dd261cf6c2e647cab915f015230bb15e) by [Fabio Siccardi](https://sketchfab.com/FabioSiccardi) licensed under [CC-BY-4.0](http://creativecommons.org/licenses/by/4.0/).
