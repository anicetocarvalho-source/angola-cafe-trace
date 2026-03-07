

## Problem Analysis

The sidebar overlay (Sheet) stays open or overlaps content when navigating between menu items. This happens because:

1. **Sheet doesn't auto-close on route change** — `handleNavigation` only fires on click, but if the navigation completes before the Sheet animation finishes (or if the click doesn't properly propagate), the Sheet remains open.
2. **No `useEffect` watching `location`** — the standard pattern is to close the mobile Sheet whenever the route changes, as a safety net.
3. **Missing `SheetTitle`** — Radix Dialog requires a title for accessibility; its absence can cause rendering quirks in some browsers.

## Plan

### 1. Auto-close mobile Sheet on route change

Add a `useEffect` in `DashboardLayout.tsx` that watches `location.pathname` and sets `mobileMenuOpen` to `false` whenever the route changes. This guarantees the Sheet always closes after navigation, regardless of click timing.

### 2. Add SheetTitle for accessibility

Import `SheetTitle` from the Sheet component and add a visually hidden title inside `SheetContent` to prevent Radix Dialog warnings and potential rendering issues.

### 3. Ensure proper z-index layering

The header is `z-50` and the Sheet overlay is also `z-50` (from the Sheet component). The desktop sidebar has no explicit z-index. Add `z-40` to the desktop sidebar `<aside>` to ensure it layers correctly below the header and Sheet overlay.

### Files to modify

- **`src/components/DashboardLayout.tsx`** — add `useEffect` for location-based Sheet close, add `SheetTitle`, add `z-40` to desktop sidebar, import `useEffect` from React.

