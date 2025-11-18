# Stream Voice Channel - Visual Guide

## 🎨 User Interface

### Voice Channel Button

```
Location: Bottom Left Corner
┌─────────────────────────────────────┐
│                                     │
│         Main Content Area           │
│                                     │
│                                     │
│                                     │
│  [💬 Chatbot]                       │ ← Bottom 6px, Left 6px
│  [📞 Voice]                         │ ← Bottom 24px, Left 6px
└─────────────────────────────────────┘

Button Specs:
- Size: 64x64 pixels (w-16 h-16)
- Color: Green gradient (green-500 → emerald-600)
- Icon: Phone (svg)
- Features: Draggable, Hover effect (scale 1.1)
- Z-index: 40
```

### Voice Channel Modal

```
┌────────────────────────────────────────┐
│ 📞 Voice Channel        👥 3 participants │ ← Header (Blue/Purple gradient)
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ 👤 John Doe                      │  │
│  │    🎤 Speaking...                │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ 👤 Jane Smith                    │  │
│  │    ✓ Connected                   │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ 👤 You                           │  │
│  │    ✓ Connected                   │  │
│  └──────────────────────────────────┘  │
│                                        │
├────────────────────────────────────────┤
│      [🎤]  [🔊]  [📞 Leave]            │ ← Controls
└────────────────────────────────────────┘

Modal Specs:
- Width: max-w-md (448px)
- Background: Dark gradient (slate-900 → slate-800)
- Border radius: 2xl (16px)
- Max height: 400px (scrollable)
- Animations: Framer Motion entrance/exit
```

## 🎨 Color Scheme

### Voice Channel Button
```css
Background: linear-gradient(to right, #10b981, #059669)
           /* green-500 → emerald-600 */

Hover: shadow-xl, scale(1.1)
Active: scale(0.95)
```

### Modal Theme
```css
Background: linear-gradient(to bottom-right, #0f172a, #1e293b)
           /* slate-900 → slate-800 */

Header: linear-gradient(to right, #2563eb, #9333ea)
        /* blue-600 → purple-600 */

Participant Cards: rgba(51, 65, 85, 0.5)
                  /* slate-700/50 */

Controls:
  Normal: #334155    /* slate-700 */
  Hover: #475569     /* slate-600 */
  Muted/Deafened: #ef4444  /* red-500 */
```

## 🎭 Component States

### Connection States

```
┌─────────────┐
│  ⏳ Initial  │ → "Connecting to voice channel..."
└─────────────┘
       ↓
┌─────────────┐
│ ⟳ Connecting│ → Loading spinner visible
└─────────────┘
       ↓
┌─────────────┐
│ ✓ Connected │ → Modal opens, participants visible
└─────────────┘
       ↓
┌─────────────┐
│  ❌ Error    │ → "Failed to connect" message
└─────────────┘
```

### Audio States

```
Microphone:
[🎤]  → Unmuted (default, slate-700 bg)
[🔇]  → Muted (red-500 bg)

Speaker:
[🔊]  → Undeafened (default, slate-700 bg)
[🔈]  → Deafened (red-500 bg)
```

### Participant States

```
Participant Card:
┌────────────────────────┐
│ 👤 Name                │
│    Status              │
└────────────────────────┘

Status Options:
- "🎤 Speaking..."      (actively speaking)
- "✓ Connected"         (connected, silent)
- "🔇 Muted"            (microphone off)
```

## 📐 Layout Dimensions

### Voice Button
```
Position: fixed
Bottom: 96px (24 * 0.25rem)
Left: 24px (6 * 0.25rem)
Width: 64px (16 * 0.25rem)
Height: 64px (16 * 0.25rem)
Z-index: 40

Drag Constraints:
- Left: 0px
- Right: window.innerWidth - 64px
- Top: 0px
- Bottom: window.innerHeight - 64px
```

### Modal
```
Position: fixed, centered
Width: 100% (max-w-md = 448px)
Margin: 16px horizontal
Z-index: 9999

Header: 
- Padding: 24px horizontal, 16px vertical
- Height: auto

Participants List:
- Padding: 24px
- Max Height: 400px
- Overflow: scroll (custom scrollbar)
- Gap: 12px between items

Controls:
- Padding: 24px horizontal, 20px vertical
- Height: auto
- Flex: row, center aligned
- Gap: 16px between buttons
```

### Button Sizes
```
Voice Button (Floating): 64x64px
Control Buttons: 48x48px (p-4)
Close Button: 40x40px (p-2)
```

## 🎬 Animations

### Modal Entrance
```javascript
initial: { opacity: 0, scale: 0.9 }
animate: { opacity: 1, scale: 1 }
exit: { opacity: 0, scale: 0.9 }
duration: 200ms
```

### Voice Button
```javascript
whileHover: { scale: 1.1 }
whileTap: { scale: 0.95 }
```

### Participant Cards
```javascript
initial: { opacity: 0, x: -20 }
animate: { opacity: 1, x: 0 }
stagger: 50ms per item
```

### Control Buttons
```javascript
whileHover: { scale: 1.05 }
whileTap: { scale: 0.95 }
```

## 🖼️ Icons

### Used Icons (from lucide-react)
```
Phone         → Voice button, Leave button
Mic           → Unmuted state
MicOff        → Muted state
Volume2       → Speaker on
VolumeX       → Speaker off
X             → Close modal
Users         → Participant count in header
```

### Icon Sizes
```
Voice Button Icon: 24x24px (w-6 h-6)
Control Icons: 24x24px (w-6 h-6)
Header Icons: 20x20px (w-5 h-5)
```

## 📱 Responsive Design

### Desktop (Default)
```
Modal: 448px width, centered
Button: Bottom-left corner
All features fully visible
```

### Mobile (< 768px)
```
Modal: Full width with 16px margin
Button: Same position
Touch-optimized button sizes
Scrollable participant list
```

## 🎯 Interactive Elements

### Clickable Areas
```
1. Voice Button (entire 64x64px area)
   → Opens voice modal

2. Close Button (X in header)
   → Closes modal, leaves call

3. Microphone Button
   → Toggles mute/unmute

4. Speaker Button
   → Toggles deafen/undeafen

5. Leave Button
   → Leaves call and closes modal

6. Background Overlay
   → Closes modal (click outside)
```

### Drag Functionality
```
Voice Button:
- Drag anywhere within window bounds
- Smooth elastic animation
- Cursor changes: grab → grabbing
- Returns to valid position if dragged outside
```

## 🎨 Custom Scrollbar

```css
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(51, 65, 85, 0.3);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.5);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.7);
}
```

## 🔢 Z-Index Hierarchy

```
Level 9999: Voice Modal (topmost)
Level 50: Chatbot Modal
Level 40: Voice Button
Level 30: Chatbot Button
Level 20: Modals (general)
Level 10: Dropdowns
Level 1: Base content
```

## 💡 Visual States

### Loading State
```
┌──────────────────────┐
│                      │
│   ⟳ (spinning)       │
│   Connecting to      │
│   voice channel...   │
│                      │
└──────────────────────┘
```

### Error State
```
┌──────────────────────┐
│                      │
│   ❌                 │
│   Failed to connect  │
│                      │
└──────────────────────┘
```

### Connected State (Normal)
```
┌─────────────────────────────┐
│ 📞 Voice Channel    👥 3     │
├─────────────────────────────┤
│ Participants scrollable...  │
├─────────────────────────────┤
│   [🎤]  [🔊]  [📞 Leave]    │
└─────────────────────────────┘
```

## 🎨 Gradient Definitions

### Header Gradient
```
from: #2563eb (blue-600)
to: #9333ea (purple-600)
direction: left to right
```

### Button Gradient
```
from: #10b981 (green-500)
to: #059669 (emerald-600)
direction: left to right
```

### Background Gradient
```
from: #0f172a (slate-900)
to: #1e293b (slate-800)
direction: bottom-right
```

### Avatar Gradient (Participants)
```
from: #3b82f6 (blue-500)
to: #a855f7 (purple-500)
direction: bottom-right
```

## 📏 Spacing System

```
Modal Padding: 24px (p-6)
Card Padding: 16px (p-4)
Button Padding: 16px (p-4)
Header Padding: 24px horizontal, 16px vertical
Control Padding: 24px horizontal, 20px vertical

Gaps:
- Between buttons: 16px (space-x-4)
- Between cards: 12px (space-y-3)
- Between header items: 12px (space-x-3)
```

## 🎯 Hit Targets

All interactive elements meet minimum touch target sizes:
- Voice Button: 64x64px ✓
- Control Buttons: 48x48px ✓
- Close Button: 40x40px ✓

## 🖥️ Browser Compatibility

Tested and works on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

Required features:
- CSS Grid/Flexbox
- WebRTC API (via Stream SDK)
- ES6+ JavaScript
- Framer Motion support
