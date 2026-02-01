# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EventPilot is a Next.js 16+ event guide assistant application that provides attendees with AI-powered chat, voice interaction, and real-time updates for navigating events. The app uses Firebase for authentication and data, Google Gemini for AI chat, and ElevenLabs for voice synthesis.

## Development Commands

```bash
npm run dev     # Start development server on localhost:3000
npm run build   # Production build
npm run start   # Start production server
npm run lint    # Run ESLint
```

## Architecture

### Core Stack
- **Framework**: Next.js 16 with App Router, React 19, TypeScript
- **AI/ML**: Google Gemini 1.5 Flash (via Vercel AI SDK), ElevenLabs (voice synthesis)
- **Backend**: Firebase (Firestore + Anonymous Auth)
- **Styling**: Tailwind CSS 4, Radix UI components
- **Compiler**: React Compiler enabled

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts      # Streaming chat API with Gemini + tool calls
│   │   └── voice/route.ts     # ElevenLabs TTS endpoint
│   ├── layout.tsx
│   └── page.tsx               # Entry point -> EventChat component
├── components/
│   ├── ui/                    # Radix UI primitives (tabs, cards, buttons, etc.)
│   ├── event-chat.tsx         # Main tabbed interface container
│   ├── text-chat.tsx          # Text chat interface
│   ├── voice-chat.tsx         # Voice chat with 11labs/react
│   └── get-updates.tsx        # Event updates feed (currently mock data)
├── hooks/
│   ├── useAuth.ts             # Firebase anonymous auth hook
│   ├── useChat.ts             # Chat state + streaming response handler
│   └── useVoice.ts            # ElevenLabs voice synthesis hook
└── lib/
    ├── firebase.ts            # Firebase initialization & exports
    └── utils.ts               # Tailwind class utilities
```

### Key Architecture Patterns

**AI Chat Flow**:
1. `useChat` hook manages message state and streaming
2. POST to `/api/chat` with message history
3. Server uses Vercel AI SDK's `streamText` with Gemini model
4. Includes two tools: `findStall` and `getDirections` for querying Firestore
5. Streaming response parsed on client (format: `0:{JSON}` per line)

**Firebase Integration**:
- Anonymous authentication auto-triggers on mount via `useAuth`
- Firestore schema: `stalls` collection with fields: `name`, `nameLower`, `category`, `location`, `description`, `directions`, `coordinates`
- Tools query by name prefix match (`>=` and `<=` with `\uf8ff`) or exact category match

**Voice Synthesis**:
- Client calls `/api/voice` with text
- Server streams audio from ElevenLabs API (voice ID: Rachel, model: eleven_flash_v2_5)
- Returns audio/mpeg stream, played via HTML5 Audio API

**Component Architecture**:
- Main app wraps everything in Firebase auth check
- Tabbed interface (Text/Voice/Updates) using Radix Tabs
- All chat components are client-side (`"use client"`)
- Voice chat uses `@11labs/react` Conversation component

## Environment Variables

Required in `.env.local`:

```bash
# Firebase (all NEXT_PUBLIC_* for client-side access)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# AI Services (server-side only)
GOOGLE_GENERATIVE_AI_API_KEY=
ELEVENLABS_API_KEY=
```

## Important Implementation Details

- **Path Aliases**: `@/*` maps to `src/*` (configured in tsconfig.json)
- **Streaming Protocol**: Chat API uses Vercel AI SDK streaming format (not SSE) - parse lines starting with `0:`
- **Firestore Queries**: Case-insensitive search requires `nameLower` field with lowercase values
- **API Routes**: Both have `maxDuration = 30` for extended streaming responses
- **Anonymous Auth**: Automatically triggered if no user logged in - no manual login flow needed
- **Voice**: ElevenLabs streaming endpoint (`/stream`) returns audio directly, not JSON

## Testing Firestore Integration

When testing or adding features that interact with Firestore:
- Stall documents should have `nameLower` field for search functionality
- Both `findStall` and `getDirections` tools are exposed to the AI model
- Tool responses follow `{success: boolean, ...data}` pattern

## UI Components

Using shadcn-style Radix UI components in `components/ui/`:
- All are "use client" directives
- Styled with Tailwind using `class-variance-authority` and `tailwind-merge`
- Located in `src/components/ui/`
