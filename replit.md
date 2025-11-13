# InCaptcha - Advanced CAPTCHA System

## Overview

InCaptcha is a production-ready, hybrid CAPTCHA verification system that combines AI-powered image recognition, behavioral analysis, and cryptographic security. The application provides interactive puzzle challenges with two distinct UI themes (macOS-inspired light theme and Discord-inspired dark theme). It features a reusable React widget that can be embedded in any web application or Discord bot integration.

The system uses novel verification methods including semantic image matching, behavioral biometrics tracking, device fingerprinting, and multi-factor scoring to distinguish humans from bots while maintaining excellent accessibility and user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, built on Vite for fast development and optimized production builds

**Routing**: Wouter for lightweight client-side routing with two main pages:
- Demo page (`/`) - Interactive widget demonstration
- Admin dashboard (`/admin`) - Real-time analytics and verification statistics

**State Management**: 
- TanStack Query (React Query) for server state management and caching
- React Context API for theme management (macOS vs Discord themes)
- Local component state for widget interaction tracking

**UI Component System**: 
- Radix UI primitives for accessible, unstyled components
- shadcn/ui design system with extensive customization
- Tailwind CSS for utility-first styling with custom theme variables
- Framer Motion for animations and microinteractions

**Dual Theme System**:
- **macOS Theme** (Light): Frosted glass effects with backdrop blur, rounded corners (14-20px), soft shadows, warm saffron accents, high-luminosity neutrals
- **Discord Theme** (Dark): Flat surfaces, deep grays (#1e1e1e-#2d2d2d), neon electric-blue accent (#5865F2), compact spacing, quick transitions

**Widget Components**:
- `InCaptchaWidget` - Main embeddable component with challenge lifecycle management
- `ImageSelectMode` - Grid-based image selection challenges
- `PuzzleMode` - Drag-and-drop puzzle piece verification with physics-based animations
- `Timer` - Visual countdown with warning states
- `SuccessAnimation` - Celebration animations with confetti effects

**Behavioral Tracking**: Custom React hook (`useBehaviorTracking`) that captures:
- Mouse movement patterns and velocity
- Click timing and interaction patterns
- Time to first interaction
- Dwell time and hesitation patterns

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js

**API Design**: RESTful endpoints under `/api/incaptcha/`:
- `POST /start` - Initialize new challenge with honeypot detection
- `POST /solve` - Submit solution with behavioral data
- `POST /verify` - Validate verification tokens
- `GET /admin/stats` - Retrieve analytics (recent attempts, success rates)

**Challenge Generation**:
- Dual-mode system: Image selection (grid of 6-9 images) or puzzle drag-and-drop
- Category-based image selection from curated Indian cultural themes
- Honeytrap challenges (unsolvable) to detect automated solvers
- Dynamic difficulty based on behavioral signals

**Security Layers**:
- JWT-based challenge tokens (HS512 algorithm, 60-second expiration)
- HMAC-signed verify tokens with cryptographic nonces
- Rate limiting per IP address (10 starts/minute, 3 solves/minute)
- Replay attack prevention through token single-use enforcement
- Challenge expiration (60 seconds from creation)

**Verification Algorithm**:
Multi-factor scoring system combining:
1. **Semantic Score** (0-100): Jaccard similarity between selected and correct image indices
2. **Behavior Score** (0-100): Analysis of mouse movements, velocity, timing patterns
3. **Device Trust Score** (0-100): Browser fingerprinting and session consistency
4. **Final Score**: Weighted fusion with configurable thresholds (default: 60% pass threshold)

**Honeytrap Logic**: Challenges marked as honeytraps have no correct answers; any selection indicates bot behavior

### Data Storage

**Database**: PostgreSQL via Neon serverless driver
- Connection pooling with WebSocket support for serverless environments
- Drizzle ORM for type-safe database operations
- Schema-driven migrations

**Tables**:
- `challenges` - Active CAPTCHA challenges with metadata (indexed by site_key, expires_at)
- `verification_attempts` - Solve attempts with scores and flags (indexed by challenge_id, ip_address, created_at)
- `verify_tokens` - Issued verification tokens with usage tracking
- `assets` - Curated image library with categories and tags
- `rate_limits` - IP-based request throttling
- `site_keys` - Multi-tenant support for different embedding domains

**Ephemeral Data**: In-memory challenge state with automatic cleanup of expired records

**Asset Management**: 
- Seeded image library with Indian cultural categories (street_food, temple, yellow_bus, rangoli, etc.)
- Unsplash integration for high-quality placeholder images
- Category-based random selection with configurable limits

### External Dependencies

**AI/ML Libraries** (Declared but implementation simplified for prototype):
- TensorFlow.js (`@tensorflow/tfjs`, `@tensorflow/tfjs-node`) - Client-side behavioral model (LSTM) and server-side image processing
- Planned integration: CLIP embeddings for semantic verification, YOLOv8 for object detection, SAM for segmentation, MobileNet for classification

**Authentication & Crypto**:
- `jsonwebtoken` - JWT signing and verification
- Node.js `crypto` - Nonce generation and HMAC operations

**Frontend Libraries**:
- `canvas-confetti` - Success celebration animations
- `@hello-pangea/dnd` - Drag-and-drop functionality (successor to react-beautiful-dnd)
- `framer-motion` - Animation engine for theme transitions and microinteractions
- `lucide-react` - Icon library (2px stroke, minimal style)
- `react-hook-form` + `@hookform/resolvers` - Form validation with Zod schemas

**Database & Hosting**:
- `@neondatabase/serverless` - PostgreSQL serverless driver with WebSocket support
- `drizzle-orm` - Type-safe ORM with Zod schema validation
- `drizzle-kit` - Migration tooling

**Development Tools**:
- Vite with React plugin for fast HMR
- Replit-specific plugins: runtime error overlay, cartographer (dev mode), dev banner
- TypeScript with strict mode and path aliases (`@/*`, `@shared/*`)
- PostCSS with Tailwind CSS and Autoprefixer

**Utilities**:
- `nanoid` - Cryptographically strong ID generation
- `clsx` + `tailwind-merge` - Conditional class name merging
- `class-variance-authority` - Type-safe variant management for components
- `zod` - Runtime schema validation

### Build & Deployment

**Development**: 
- `npm run dev` - Vite dev server with Express backend proxy
- Hot module replacement for instant updates
- Source maps enabled for debugging

**Production Build**:
- `npm run build` - Vite optimizes frontend, esbuild bundles backend
- Output: `dist/public` (frontend static files), `dist/index.js` (backend bundle)
- ESM format throughout for modern Node.js compatibility

**Environment Variables**:
- `DATABASE_URL` - PostgreSQL connection string (required, validated at startup)
- `INCAPTCHA_SECRET` - JWT signing key (falls back to development-only secret)
- `NODE_ENV` - Environment flag (development/production)