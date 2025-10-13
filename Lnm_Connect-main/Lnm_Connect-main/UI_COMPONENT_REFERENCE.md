# Quick Reference: Professional UI Components

## 🎨 Color Palette

### Primary Colors
```css
Indigo: from-indigo-600 to-purple-600
Purple: from-purple-600 to-pink-600
```

### Accent Colors
```css
Success: from-green-500 to-emerald-500
Danger: from-red-500 to-pink-500
```

## 🔘 Button Styles

### Primary Button
```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
>
  Button Text
</motion.button>
```

### Secondary Button
```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="bg-white text-indigo-600 border-2 border-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-all duration-200"
>
  Button Text
</motion.button>
```

### Danger Button
```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
>
  Delete / Logout
</motion.button>
```

## 📦 Card Components

### Standard Card
```jsx
<div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200 p-6">
  {/* Card content */}
</div>
```

### Interactive Card
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-indigo-200 p-6 transform hover:-translate-y-1"
>
  {/* Card content */}
</motion.div>
```

### Gradient Card
```jsx
<div className="bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-lg border-2 border-indigo-200 p-6">
  {/* Card content */}
</div>
```

## 🏷️ Badge/Tag Components

### Primary Badge
```jsx
<motion.span
  whileHover={{ scale: 1.05 }}
  className="font-semibold text-indigo-700 bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-1.5 rounded-full text-xs uppercase tracking-wide border border-indigo-200 hover:border-indigo-400 transition-colors"
>
  #Tag
</motion.span>
```

### Status Badge
```jsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
  Active
</span>
```

## 📝 Input Fields

### Text Input
```jsx
<input
  type="text"
  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-indigo-300"
  placeholder="Enter text..."
/>
```

### Textarea
```jsx
<textarea
  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
  rows="5"
  placeholder="Write your thoughts..."
/>
```

### Select Dropdown
```jsx
<select className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white hover:border-indigo-400">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

## 🖼️ Avatar Components

### User Avatar (Image)
```jsx
<motion.img
  whileHover={{ scale: 1.1 }}
  src={avatarUrl}
  alt={userName}
  className="w-12 h-12 rounded-full ring-2 ring-indigo-100"
/>
```

### User Avatar (Initials)
```jsx
<div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
  {initials}
</div>
```

## 💬 Comment Section

### Comment Container
```jsx
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  className="flex items-start space-x-3 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
>
  {/* Avatar */}
  <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
    {initial}
  </div>
  
  {/* Content */}
  <div className="flex-1">
    <div className="flex items-center space-x-2">
      <span className="font-semibold text-gray-900 text-sm">{userName}</span>
      <span className="text-xs text-gray-400">{timestamp}</span>
    </div>
    <div className="text-gray-700 text-sm mt-1">{comment}</div>
  </div>
</motion.div>
```

## 🎭 Modal/Dialog

### Modal Overlay
```jsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.9, opacity: 0 }}
    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative"
  >
    {/* Close button */}
    <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
      <X className="w-5 h-5" />
    </button>
    
    {/* Modal content */}
    <h3 className="text-xl font-bold mb-4">Modal Title</h3>
    {/* ... */}
  </motion.div>
</div>
```

## 📱 Navigation

### Nav Link (Active)
```jsx
<Link to="/" className="relative group">
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
  >
    <Home className="w-5 h-5" />
    <span className="font-semibold">Home</span>
  </motion.div>
</Link>
```

### Nav Link (Inactive)
```jsx
<Link to="/" className="relative group">
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-indigo-600"
  >
    <Home className="w-5 h-5" />
    <span className="font-semibold">Home</span>
  </motion.div>
</Link>
```

## 🌟 Special Effects

### Gradient Text
```jsx
<h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
  Gradient Text
</h1>
```

### Glass Morphism
```jsx
<div className="bg-white/80 backdrop-blur-md border border-gray-200/50">
  {/* Content */}
</div>
```

### Hover Lift Effect
```jsx
<div className="transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
  {/* Content */}
</div>
```

## 🎨 Animation Patterns

### Fade In
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
  {/* Content */}
</motion.div>
```

### Scale In
```jsx
<motion.div
  initial={{ scale: 0.9, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
>
  {/* Content */}
</motion.div>
```

### Slide In
```jsx
<motion.div
  initial={{ x: -100, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
>
  {/* Content */}
</motion.div>
```

## 📚 Icon Usage

Import icons from Lucide React:
```jsx
import { Home, UserCircle, MessageCircle, Heart, Send, Sparkles } from "lucide-react";
```

Common icon sizes:
- Small: `w-4 h-4`
- Medium: `w-5 h-5`
- Large: `w-6 h-6`
- Extra Large: `w-8 h-8`

## 💡 Best Practices

1. **Always use motion components** for interactive elements
2. **Include hover states** on all clickable elements
3. **Use consistent spacing**: 
   - Small: `space-x-2` or `gap-2`
   - Medium: `space-x-4` or `gap-4`
   - Large: `space-x-6` or `gap-6`
4. **Shadow hierarchy**:
   - Default: `shadow-md`
   - Hover: `shadow-xl`
   - Modal: `shadow-2xl`
5. **Rounded corners**:
   - Buttons/Inputs: `rounded-lg`
   - Cards: `rounded-xl`
   - Modals: `rounded-2xl`
   - Pills/Badges: `rounded-full`

## 🚀 Performance Tips

1. Use `transform` for animations (GPU accelerated)
2. Keep transition durations between 200-300ms
3. Use `will-change` sparingly
4. Prefer CSS transitions over JavaScript animations
5. Use `AnimatePresence` for exit animations

---

**Remember**: Consistency is key! Use these components and patterns throughout the application for a cohesive user experience.
