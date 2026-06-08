# figma-to-code

Implement a Figma design as production code in this project (web-app or mobile-app).

## When to use
- User provides a Figma URL and asks to implement it as code
- User says "implement this design", "code this screen", "convert to code"

## Steps

1. **Fetch the design** — call `get_design_context` with the node ID and file key from the URL.
   - Convert `node-id` from URL param (e.g. `123-456`) to colon form (`123:456`).
   - Read the returned screenshot and component metadata carefully.

2. **Map components** — for every UI element in the design, find the closest shadcn/ui component from this list:
   `accordion, alert-dialog, alert, avatar, badge, breadcrumb, button, calendar, card, chart, checkbox, data-table, date-range-picker, dialog, dropdown-menu, empty-state, field, input, label, pagination, popover, progress, radio-group, select, separator, sheet, sidebar, skeleton, sonner, spinner, stat-card, switch, table, tabs, textarea, tooltip`
   
   If no match exists, build it with Tailwind v4 tokens — no custom CSS, no hardcoded colors.

3. **Token mapping** — translate Figma color styles to semantic Tailwind tokens:
   - Background surfaces → `bg-background`, `bg-card`, `bg-muted`
   - Text → `text-foreground`, `text-muted-foreground`, `text-primary`
   - Borders → `border-border`, `border-input`
   - Interactive → `bg-primary text-primary-foreground`, `bg-secondary text-secondary-foreground`
   - Danger → `bg-destructive text-destructive-foreground`

4. **Target platform**:
   - **web-app**: Next.js App Router, prefer Server Components, use `cn()` from `@/lib/utils`, import from `@/components/ui/`
   - **mobile-app**: Expo + NativeWind, use shared tokens from `@shared/theme`

5. **Verify** — after implementing, run the relevant typecheck:
   - Web: `pnpm --filter web-app typecheck`
   - Mobile: `pnpm --filter mobile-app typecheck`

## Rules
- Never hardcode hex values — always use semantic Tailwind tokens.
- Font is Plus Jakarta Sans via `font-sans` class (web) or `fontFamily: 'PlusJakartaSans'` (mobile).
- Radius: use `rounded-sm`, `rounded-md`, `rounded-lg` (maps to CSS `--radius` variable).
- For icons, use `lucide-react` (web) or `lucide-react-native` (mobile).
- Do not install new packages without checking if the equivalent already exists in the project.
