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
