
# Events Page Responsiveness and UI Improvements

## Problem Summary

The Events page has significant responsiveness issues, particularly on laptop screens:

1. **Single Column Grid**: The events grid uses `grid grid-cols-1` which displays only 1 card per row on all screen sizes, wasting space on larger screens
2. **Inconsistent Card Sizing**: EventCard has complex aspect ratio logic that doesn't adapt well
3. **Missing Visual Polish**: Compared to other pages (Jobs, Home), the Events page lacks hero section appeal and animations
4. **Poor Laptop Experience**: Large empty spaces on laptop/desktop screens

---

## Solution Overview

### 1. Fix Events Grid Layout

**Current (line 398 in Events.tsx):**
```tsx
<div className="grid grid-cols-1 gap-5">
```

**Updated:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
```

This creates:
- Mobile (< 640px): 1 column
- Tablet (640-1024px): 2 columns
- Laptop (1024-1280px): 3 columns
- Desktop (> 1280px): 4 columns

### 2. Redesign EventCard for Grid Layouts

The current EventCard is optimized for single-column mobile view. For multi-column grids, we need:

**Image Section:**
- Fixed aspect ratio: `aspect-[4/3]` for consistent card heights
- Use `object-cover` consistently (not switching between cover/contain)
- Add hover zoom effect on desktop

**Content Section:**
- Compact padding for grid view
- Better truncation for titles (2 lines max)
- Smaller icons and text for grid density

**Responsive Adaptations:**
```tsx
// Image container - consistent aspect ratio
<div className="relative w-full aspect-[4/3] overflow-hidden bg-muted/30">

// Image styling - always cover for consistency in grid
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
```

### 3. Enhanced Loading Skeleton Grid

Update loading skeleton to match new grid layout:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
  {[...Array(8)].map((_, i) => (
    <div key={i} className="bg-card rounded-2xl overflow-hidden animate-pulse shadow-md">
      <div className="aspect-[4/3] bg-muted" />
      <div className="p-4 space-y-3">
        ...
      </div>
    </div>
  ))}
</div>
```

### 4. Visual Improvements to Events Page

**Header Section Enhancements:**
- Add subtle gradient background to header
- Improve spacing and visual hierarchy
- Add event count badge

**Empty State:**
- Better visual appeal with illustrations
- More prominent CTA button

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Events.tsx` | Update grid layout, loading skeleton, improve header styling |
| `src/components/EventCard.tsx` | Simplify responsive logic, consistent aspect ratio, compact design for grids |

---

## Technical Details

### EventCard.tsx Changes

```tsx
// Simplified image container
<div className="relative w-full aspect-[4/3] overflow-hidden bg-muted/30">
  {hasPoster ? (
    <>
      <img
        src={poster_url || image}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
    </>
  ) : (
    // Gradient placeholder - unchanged
  )}
  
  // Badges positioned absolutely
</div>

// Content section - tighter spacing
<div className="p-3 sm:p-4 flex-1 flex flex-col">
  <h3 className="font-bold text-sm sm:text-base line-clamp-2 mb-2">
    {title}
  </h3>
  
  // Event details with smaller icons
  <div className="space-y-1.5 text-xs sm:text-sm flex-1">
    ...
  </div>
  
  // Button
  <Button size="sm" className="w-full mt-3 h-9">
    View Details
  </Button>
</div>
```

### Events.tsx Grid Changes

```tsx
// Main events grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
  {filteredEvents.map((event, index) => (
    <EventCard key={event.id} {...event} gradientIndex={index % 6} onClick={() => setSelectedEvent(event)} />
  ))}
</div>

// My Submissions grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  ...
</div>
```

---

## Visual Comparison

```text
BEFORE (Laptop 1440px wide):
+------------------------------------------+
|  [       Event Card (Full Width)       ] |
|  [       Event Card (Full Width)       ] |
|  [       Event Card (Full Width)       ] |
+------------------------------------------+
(Lots of wasted horizontal space)

AFTER (Laptop 1440px wide):
+------------------------------------------+
|  [Card 1]  [Card 2]  [Card 3]  [Card 4] |
|  [Card 5]  [Card 6]  [Card 7]  [Card 8] |
+------------------------------------------+
(Efficient use of space, consistent sizing)
```

---

## Expected Outcome

After implementation:
- Events display in a responsive grid (1/2/3/4 columns based on screen size)
- Consistent card heights due to fixed aspect ratio
- Better visual polish matching other pages in the app
- Improved laptop/desktop experience
- Cards look great on all screen sizes with proper image handling
