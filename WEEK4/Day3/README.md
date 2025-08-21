# Brainrot Dev Feed

A dynamic, API-driven feed of **programmer memes**, **programming jokes**, and **tech quotes** — built with **Next.js 14 + RTK Query + Tailwind**.

## APIs Used (all free)
- **Memes**: https://meme-api.com/gimme/ProgrammerHumor (Reddit-based, JSON)
- **Jokes**: https://v2.jokeapi.dev/joke/Programming (programming jokes)
- **Quotes**: https://api.quotable.io/quotes?tags=technology,computers (tech quotes)

## Run locally
```bash
npm install
npm run dev
# open http://localhost:3000
```

## Notes
- All network requests are handled via **RTK Query**.
- Uses **lazy queries** for memes & jokes to support "Load more" and simple pagination for quotes.
- Uses plain `<img>` to avoid Next Image remote domain config.
- Clean, responsive Tailwind UI with tabs and a feed grid.
