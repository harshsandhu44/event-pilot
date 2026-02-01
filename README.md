# EventPilot Monorepo

EventPilot is a Next.js event guide assistant application that provides attendees with AI-powered chat, voice interaction, and real-time updates for navigating events.

## Monorepo Structure

```
eventpilot/
├── apps/
│   ├── web/          # Attendee-facing web app
│   └── admin/        # Admin dashboard (coming soon)
├── packages/
│   ├── types/        # Shared TypeScript types
│   ├── firebase/     # Firebase client & admin SDK
│   ├── ui/           # Shared UI components
│   └── utils/        # Shared utilities
└── firestore.rules   # Firestore security rules
```

## Tech Stack

- **Monorepo**: Turborepo + Bun workspaces
- **Framework**: Next.js 16 with App Router, React 19
- **AI/ML**: Google Gemini 1.5 Flash (via Vercel AI SDK), ElevenLabs
- **Backend**: Firebase (Firestore + Auth)
- **Styling**: Tailwind CSS 4, Radix UI
- **Language**: TypeScript

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) >= 1.1.46
- Node.js >= 18

### Installation

```bash
# Install all dependencies
bun install

# Run web app in development
bun run web:dev

# Build all apps
bun run build

# Run linting
bun run lint
```

### Environment Variables

See individual app directories for environment variable templates:
- `apps/web/.env.local.template`

## Data Model

The app uses a nested Firestore data model:

```
/events/{eventId}
  ├── /stalls/{stallId}         # Exhibitor booths/stalls
  ├── /schedule/{scheduleId}    # Event schedule
  └── /amenities/{amenityId}    # Facilities (restrooms, ATMs, etc.)
```

## Apps

### Web App (`apps/web`)

Attendee-facing application with:
- Text chat with AI assistant
- Voice interaction
- Real-time event updates
- Multi-event support

[See apps/web/README.md for details](apps/web/README.md)

### Admin Dashboard (`apps/admin`)

*Coming soon*

Event management dashboard for:
- Creating and managing events
- Adding stalls, schedule, and amenities
- Real-time status updates

## Packages

- **@eventpilot/types**: Shared TypeScript interfaces
- **@eventpilot/firebase**: Firebase client/admin SDK and query functions
- **@eventpilot/ui**: Radix UI components
- **@eventpilot/utils**: Utility functions

## Deployment

### Vercel (Web App)

```bash
# Project root: apps/web
# Build command: cd ../.. && bun install && bunx turbo run build --filter=@eventpilot/web
# Output directory: apps/web/.next
```

### Firestore Rules

```bash
firebase deploy --only firestore:rules
```

## Contributing

See [CLAUDE.md](CLAUDE.md) for development guidelines.

## License

MIT
