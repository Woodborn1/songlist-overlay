# StreamerSonglist OBS Overlay & Web Service

Автономний веб-сервер та красивий оверлей для OBS Studio (Browser Source), створений спеціально для стрімера **ssofikooooo** (StreamerSonglist).

---

## ✨ Що це робить:
- Показує блок **«Зараз грає»** (Now Playing) з живим еквалайзером та зеленим індикатором Live.
- Показує блок **«Наступна»** (Next in Queue) — перший трек з актуальної черги замовлень.
- Працює **24/7 у хмарі (Render.com)**: стрімеру **НЕ потрібно** генерувати ніякі токени, не потрібно нічого натискати чи запускати. Тільки вставити URL в OBS.

---

## 🚀 Як розгорнути на Render.com (Безкоштовно)

### Крок 1: Створити репозиторій на GitHub
1. Перейдіть на [github.com/new](https://github.com/new) та створіть новий репозиторій (наприклад `songlist-overlay`).
2. Відкрийте термінал у цій папці (`songlist-overlay-web`) та виконайте:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ВАШ_НІКНЕЙМ/songlist-overlay.git
git push -u origin main
```

### Крок 2: Підключити до Render.com
1. Зайдіть на [render.com](https://render.com) (можна зайти через акаунт GitHub).
2. Натисніть кнопку **New +** -> **Web Service**.
3. Оберіть ваш репозиторій `songlist-overlay`.
4. Render автоматично підтягне параметри:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Натисніть **Deploy Web Service** (або **Create Web Service**).
6. Через 1-2 хвилини сервіс запуститься і ви отримаєте постійне посилання, наприклад:  
   `https://songlist-overlay-xxxx.onrender.com`

---

## 🎥 Як додати оверлей в OBS Studio стрімеру

1. В OBS у списку «Джерела» (Sources) натисніть **`+`** -> **`Браузер` (Browser)**.
2. У поле **URL** вставте ваше посилання з Render:  
   `https://songlist-overlay-xxxx.onrender.com`
3. Встановіть розміри:
   - **Ширина (Width):** `480`
   - **Висота (Height):** `200`
4. Поставте прапорець **«Оновлювати браузер, коли сцена стає активною»** (за бажанням).
5. Натисніть **OK** та розмістіть віджет у зручному місці на екрані.

---

## 🔌 API Endpoints
- `GET /` — Віджет для OBS Studio Browser Source.
- `GET /api/queue` — JSON дані (`playing`, `next`, `queueLength`).
- `GET /api/queue?streamer=інший_стрімер` — Можливість переглядати чергу будь-якого іншого стрімера.
