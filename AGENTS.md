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

- Material catalog and order pricing/validation live in src/lib/materials.ts and are shared by the UI and the /api/public/* routes; why: one source of truth, server never trusts client prices.
- Orders persist in public.orders with unique request_id; why: duplicate requestId must return the original order.
