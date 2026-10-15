<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Page texts/images live in `site_content` (keys `t:<key>:<sr|en>`, `img:<key>`); defaults in `src/lib/content-defaults.ts`. Why: mini page builder edits overrides only.
- Images are stored as compressed data URLs in the database because the workspace blocks public storage buckets.
- Admin = `user_roles` row; first signup becomes admin via trigger. Why: single-owner site.
- Chatbot knowledge is one row in `knowledge_base`, injected whole into the system prompt in `src/lib/ai/chat.server.ts`. Why: single document, no retrieval needed.
- Page layouts are JSON block lists in site_content (`layout:<slug>`, page list in `pages`, gallery lists in `gal:<id>`), rendered by src/components/page-builder.tsx. Why: reuse the single content table for the page builder.
- Flexible sections store nested columns/elements under `section:<id>` and appearance under `section-style:<id>` / `text-style:<key>`; the section editor renders a four-track grid that stacks on mobile. Why: extend existing content overrides without altering legacy layouts or requiring schema changes.
