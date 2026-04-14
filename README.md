# LinguaAI - AI Language Learning App

Monorepo gồm web (Next.js) và mobile (Expo React Native).

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Cấu hình OpenAI API Key
```bash
cp apps/web/.env.local.example apps/web/.env.local
# Mở file và điền OPENAI_API_KEY của bạn
```

### 3. Chạy Web App
```bash
npm run dev:web
# Mở http://localhost:3000
```

### 4. Chạy Mobile App
```bash
npm run dev:mobile
# Scan QR code bằng Expo Go app
# Trong Settings của app, đặt API URL = http://<your-local-ip>:3000
```

## Tính năng
- Chat hội thoại với AI tutor theo ngôn ngữ đang học
- AI tự động sửa lỗi ngữ pháp và giải thích bằng tiếng mẹ đẻ
- Lưu từ vựng mới thành flashcard chỉ 1 click
- Flashcard flip animation để ôn tập
- Hỗ trợ 8 ngôn ngữ, 6 cấp độ (A1-C2)
- Dark mode toàn bộ

## Cấu trúc
```
apps/
  web/      - Next.js 14 web app
  mobile/   - Expo React Native app
packages/
  shared/   - Types và constants dùng chung
```
