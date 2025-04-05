# CSS Styling Documentation for Memory in a Jar

This document provides an overview of the CSS styling implementation for the Memory in a Jar project, featuring a minimal and clean design with pastel light colors.

## File Structure

The CSS styling is organized into the following files:

1. **global.css** - Contains CSS variables, base element styling, and utility classes
2. **components.css** - Styles for reusable components (header, footer, cards, forms, etc.)
3. **pages.css** - Page-specific styles for each view in the application
4. **responsive.css** - Media queries and responsive design optimizations
5. **index.css** - Main entry point that imports all other CSS files
6. **App.css** - Application-level styling and animations

## Design System

### Color Palette

The styling uses a pastel light color scheme:

- Primary: `#7eb8b8` (Pastel teal)
- Secondary: `#e6f7ff` (Light blue)
- Accent: `#ffb6b9` (Pastel pink)
- Text: `#5a5a5a` (Soft gray)
- Background: `#ffffff` (White)

Additional pastel colors are available as CSS variables:
- Pastel Yellow: `#fff2cc`
- Pastel Green: `#d1e7dd`
- Pastel Purple: `#e2d8f3`
- Pastel Orange: `#ffe5d0`

### Typography

- Font Family: 'Roboto', 'Helvetica Neue', sans-serif
- Font Sizes: Small (0.875rem), Medium (1rem), Large (1.25rem), XLarge (1.5rem), XXLarge (2rem)

### Spacing

Consistent spacing scale using CSS variables:
- XS: 0.25rem
- SM: 0.5rem
- MD: 1rem
- LG: 1.5rem
- XL: 2rem
- XXL: 3rem

### Components

The styling includes various components:
- Buttons (primary, secondary, accent, outline, link)
- Forms and input elements
- Cards (memory cards, relationship cards, feature cards)
- Navigation elements
- Alerts and notifications
- Modals
- Loaders and progress indicators

## Responsive Design

The styling is fully responsive across all devices:

- Mobile-first approach
- Breakpoints at 576px, 768px, and 992px
- Touch-optimized for mobile and tablet devices
- Orientation-specific adjustments
- Accessibility considerations (high contrast, reduced motion)
- Print styles for exporting content

## Implementation Notes

1. CSS variables are used extensively for consistency and easy theming
2. Utility classes provide flexibility for layout and spacing
3. BEM-inspired naming convention for component classes
4. Minimal use of shadows and subtle transitions for clean design
5. Optimized for performance with minimal animations

## Usage Instructions

1. The CSS files should be imported in the following order:
   - global.css
   - components.css
   - pages.css
   - responsive.css

2. The index.css file already handles these imports, so you only need to include it in your application.

3. To use the styling, apply the appropriate class names to your HTML elements as defined in the CSS files.

4. For custom components, use the existing CSS variables to maintain consistency with the design system.

## Customization

To customize the styling:

1. Modify the CSS variables in global.css to change colors, spacing, etc.
2. Add new component styles to components.css
3. Add new page-specific styles to pages.css
4. Update responsive.css for any new responsive behavior
