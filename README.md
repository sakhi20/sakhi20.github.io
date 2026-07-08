# sakhi20.github.io

Personal portfolio of **Sakhi Patel** — MS Computer Science (Data Science track) at NC State University, and painter.

- `index.html` — main portfolio (work, projects, contact)
- `art.html` — the paintings, twelve works
- Pure static HTML/CSS/JS. No build step, no dependencies beyond Google Fonts.

## Deploy to GitHub Pages

1. Create a **public** repo named exactly `sakhi20.github.io`.
2. Push this folder's contents to the repo root on `main`:
   ```
   git remote add origin git@github.com:sakhi20/sakhi20.github.io.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment** — Source: *Deploy from a branch*, Branch: `main`, Folder: `/ (root)`. Save.
4. Site goes live at **https://sakhi20.github.io** within a couple of minutes.

## Editing painting captions

Titles/media live in two places per painting in `art.html`: the `<figcaption>` and the `data-title` / `data-medium` attributes on the `<button class="frame">` (used by the lightbox). Keep them in sync.
