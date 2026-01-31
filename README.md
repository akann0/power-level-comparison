# Power Level Comparison Generator

A web application that compares two entities (people, characters, objects) using Wikipedia data and NLP analysis to generate "versus" style power level breakdowns.

## Features

- **Dual Search Interface**: Search for any Wikipedia entity with autocomplete
- **Attribute Extraction**: Automatically extracts height, weight, age, achievements, and experience
- **Visual Comparison**: Animated bar charts showing head-to-head attribute scores
- **Overall Winner**: Calculates aggregate power levels and declares a winner
- **Evidence Display**: Click attributes to see source data from Wikipedia

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **APIs**: Wikipedia API for entity data

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Development

The app runs at `http://localhost:5173` by default.

## Architecture

```
src/
├── components/
│   ├── SearchBox.tsx       # Autocomplete entity search
│   ├── ProfileCard.tsx     # Entity profile display
│   ├── AttributeBar.tsx    # Comparison bar visualization
│   ├── ComparisonResults.tsx # Full results page
│   └── LoadingScreen.tsx   # Loading animation
├── services/
│   ├── wikipediaApi.ts     # Wikipedia API integration
│   ├── attributeExtractor.ts # Basic attribute extraction
│   └── huggingfaceApi.ts   # BERT integration (Phase 2)
├── types/
│   └── index.ts            # TypeScript interfaces
├── App.tsx                 # Main application component
└── main.tsx                # Entry point

## Backend Server

- `server/` hosts a FastAPI service that wraps the Hugging Face inference endpoint.
- Run `uvicorn server.app:app --host 0.0.0.0 --port 8080` after setting `HF_API_TOKEN` in `server/.env`.
```

## Future Enhancements (Phase 2+)

- BERT-powered semantic analysis via Hugging Face
- Radar chart visualization
- Shareable comparison URLs
- User accounts and comparison history
- AI-generated commentary

## Attribution

This project uses data from [Wikipedia](https://wikipedia.org) via their public API.

## Disclaimer

This tool is for entertainment purposes only. Comparisons are based on publicly available Wikipedia data and AI interpretation. Results should not be taken as definitive or factual rankings.
