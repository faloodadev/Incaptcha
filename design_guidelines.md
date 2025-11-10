# InCaptcha Design Guidelines

## Design Approach
**Dual Theme System**: This application requires two complete, production-ready themes with distinct visual languages. Both themes must be fully implemented with a theme switcher.

---

## Theme 1: macOS (Light, Apple-inspired)

### Visual Language
- **Cards**: Frosted glass effect with backdrop blur
- **Corners**: Rounded 14-20px border radius throughout
- **Shadows**: Soft drop shadows for depth, subtle elevation
- **Texture**: Subtle noise overlay on glass surfaces
- **Typography**: San Francisco-like sans-serif (use Inter or Manrope)

### Color Palette
- **Primary Accent**: Warm saffron for CTAs and interactive elements
- **Background**: Neutral grays with high luminosity
- **Text**: High contrast for readability
- **Surfaces**: Translucent whites with blur

### Microinteractions
- Framer Motion for all animations
- Spring physics (bounce) for draggable elements
- Smooth scaling on hover (scale: 1.02-1.05)
- Haptic-like success animations (subtle pulse + scale)
- Magnet snap behavior for puzzle pieces

### Iconography
- 2px stroke line icons (use Lucide React)
- Small rounded status indicators (8-12px circles)
- Minimal, clean style

---

## Theme 2: Discord (Dark, Neon accent)

### Visual Language
- **Cards**: Flat surfaces, no gradients
- **Colors**: Deep grays (#1e1e1e to #2d2d2d range)
- **Accent**: Neon electric-blue (#5865F2 or similar)
- **Spacing**: Compact, efficient use of space
- **Typography**: System sans with monospace badges

### Microinteractions
- Quick fade transitions (150-200ms)
- Snappy tile selection feedback
- Dark-palette confetti on success
- Minimal spring physics, prefer linear/ease-out

### Status Elements
- Monospace-like badges for status indicators
- Sharp, precise feedback states
- Neon glow effects on active elements

---

## Widget Component Structure

### Header Section
- **Brand Logo**: Top-left positioning, 32-40px height
- **Prompt Text**: Center-aligned, localized, 16-18px weight 500
- **Timer Circle**: Top-right, 60-second countdown, circular progress indicator

### Challenge Grid (3×3 Images Mode)
- 3×3 grid layout with equal spacing (8-12px gap)
- Images: Lazy-loaded, aspect ratio 1:1
- Selection state: Bold border (3-4px) + checkmark overlay
- Hover state: Subtle scale or brightness increase

### Puzzle Mode (Draggable)
- Missing slice rendered as outlined area
- Draggable piece with magnet snap behavior
- Progress bar showing completion percentage
- Spring physics for drag interaction

### Accessibility Features
- **Keyboard Navigation**: Arrow keys for grid focus, Space to toggle
- **ARIA**: Proper roles on grid items, live regions for status
- **Focus States**: High-contrast 3px outline with offset
- **Audio Alternative**: Fallback with synthesized prompt readout
- **Screen Readers**: Visually hidden descriptive text

---

## Layout System

### Spacing Scale (Tailwind)
- **Primary units**: 2, 4, 8, 12, 16, 24, 32 (p-2, m-4, gap-8, etc.)
- **Widget padding**: p-6 to p-8
- **Grid gaps**: gap-3 or gap-4
- **Section spacing**: py-8 to py-12

### Responsive Breakpoints
- **Mobile**: Single column, full-width widget (max 400px)
- **Tablet**: Widget max-width 480px, centered
- **Desktop**: Widget max-width 520px, centered in viewport

---

## Typography Hierarchy

### macOS Theme
- **Font Family**: Inter or Manrope
- **Heading (Prompt)**: 18px, weight 600, letter-spacing -0.02em
- **Body Text**: 14-16px, weight 400
- **Timer**: 14px, weight 500, tabular numbers

### Discord Theme
- **Font Family**: System sans-serif stack
- **Heading**: 16px, weight 600, tight line-height
- **Body**: 14px, weight 400
- **Status Badges**: 12px, monospace font

---

## Animation Specifications

### macOS Animations
- **Hover**: Scale 1.03, duration 200ms, spring damping 20
- **Success**: Pulse scale 1.1 → 1.0, duration 600ms, ease-out
- **Drag**: Spring physics with stiffness 300, damping 30
- **Transitions**: Smooth 300ms ease-in-out

### Discord Animations
- **Selection**: Quick fade 150ms linear
- **Success**: Dark confetti particles (low opacity)
- **Hover**: Brightness increase 110%, duration 100ms
- **Transitions**: Fast 150-200ms ease-out

---

## Component States

### Interactive Elements
- **Default**: Base styling per theme
- **Hover**: Scale or brightness change
- **Active**: Pressed state (scale 0.98)
- **Selected**: Bold border + checkmark icon
- **Disabled**: 50% opacity, no pointer events
- **Focus**: 3px outline, 2px offset, theme-appropriate color

### Feedback States
- **Loading**: Spinner (24px) centered, semi-transparent overlay
- **Success**: Green checkmark + success message, 2s display
- **Error**: Red border pulse + error text below widget
- **Expired**: Timer turns red at <10s, subtle pulse

---

## Admin Dashboard

### Layout
- Sidebar navigation (200px wide)
- Main content area with cards for metrics
- Data tables with sortable columns
- Charts for solve rates over time

### Visual Treatment
- Match selected theme (macOS/Discord)
- Card-based layout for stats
- Responsive grid: 1-2-3 columns based on viewport

---

## Discord Bot UI

### In-App Modal
- Compact widget (360px width)
- Simplified header (no logo)
- Quick verification flow
- Theme: Always Discord dark theme

### DM Link Experience
- Short URL with ?discord_user=<snowflake> parameter
- Auto-detect Discord context, apply dark theme
- Success message includes return-to-Discord CTA

---

## Accessibility Standards (WCAG AA)

- **Color Contrast**: Minimum 4.5:1 for text, 3:1 for UI components
- **Focus Management**: Visible focus indicators, logical tab order
- **Keyboard Navigation**: Full functionality without mouse
- **Screen Readers**: Descriptive labels, status announcements
- **Audio Alternative**: For visual challenges
- **Motion**: Respect prefers-reduced-motion

---

## Images & Assets

### Widget Imagery
- Challenge images: 300x300px minimum resolution
- Categories: street food, temples, yellow buses, rangoli patterns
- Source: Royalty-free (Unsplash, Pexels) for development
- Lazy loading with blur-up placeholder

### Iconography
- Lucide React icon set (2px stroke weight)
- Checkmarks, timers, error states, audio indicators
- Size: 20-24px for primary, 16-18px for secondary

### Brand Logo
- SVG format for scalability
- Height: 32-40px in widget header
- Monochrome or theme-adapted color

---

## Key Design Principles

1. **Dual Identity**: Both themes must feel native to their platform
2. **Smooth Interactions**: All user actions should feel responsive and delightful
3. **Accessibility First**: Every feature must work with keyboard and screen readers
4. **Performance**: Lazy load images, optimize animations
5. **Security Visibility**: Visual feedback for secure operations (token generation, verification)