# My GPT Wrapped

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)

**Your AI Story, Beautifully Told**

Transform your ChatGPT history into a beautiful, shareable wrapped experience. Discover your AI personality, hidden patterns, and more — like Spotify Wrapped for your AI conversations.

---

## Features

- **14 insight screens**: Overview, Time Patterns, Topics, Categories, Personality, Achievements, Word Cloud, Mood Journey, Evolution, Power Metrics, Time Machine, Fun Facts, and shareable Summary
- **100% private**: All processing runs in your browser. Your data never leaves your device
- **Multi-language**: English, Spanish, and Portuguese
- **Share card**: Download or share your wrapped with OpenAI-themed design
- **AI friendship score**: Discover your level of connection with ChatGPT
- **Supabase integration** (optional): Upload and share images to LinkedIn, Twitter, etc.

---

## How to Use

1. Export your ChatGPT data: Settings → Data Controls → Export Data
2. Download the zip and extract `conversations.json`
3. Upload the file in the app
4. Explore your AI journey and share your wrapped!

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables (optional)

For Supabase features (image upload, sharing), create a `.env` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Charts and visualizations
- **i18next** - Internationalization (EN, ES, PT)
- **Supabase** - Optional storage for share images

---

## License

MIT

---

<div align="center">

**Made with ❤️ by [Luis Fernando Solis](https://beacons.ai/lfsolisnavarro)**

[🌐 My Links](https://beacons.ai/lfsolisnavarro)

</div>
