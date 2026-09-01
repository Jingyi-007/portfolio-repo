# Jing Yi — Portfolio

A personal portfolio site built with plain HTML, CSS, and JavaScript (no framework, no build step).

## Live sections

0. **Landing** — "Jing Yi's Portfolio" with scattered stickers that collect toward the center as you move your cursor
1. **About / Experience** — intro, lanyard card, experience timeline
2. **Projects / Skills** — project cards, certificate strip, skill tags
3. **Beyond Academic** — films & photography, duotone gallery
4. **Connect** — social links + visitor guestbook

## Structure

```
.
├── index.html              # the site
├── css/
│   └── style.css           # all styles
├── js/
│   └── main.js              # scroll reveal, pipeline nav, lanyard physics,
│                             # sticker collect/scatter, guestbook, etc.
├── assets/
│   ├── images/
│   │   ├── projects/       # screenshots / thumbnails for project cards
│   │   ├── gallery/        # photos & film stills for "Beyond Academic"
│   │   └── stickers/       # the 6 landing-page stickers (cassette, camera,
│   │                        # star, heart, capybara, "I'm awesome" barcode)
│   └── resume/
│       └── resume.pdf      # add your resume here and link it from index.html
└── README.md
```

## Editing

Open this folder in VS Code (or Cursor) and use the **Live Server** extension (right-click `index.html` → "Open with Live Server") to preview changes instantly as you save.

Everything in `[brackets]` throughout the HTML is placeholder content — swap in your real bio, project details, links, and images.

## Color palette

| Name       | Hex       | Used for                          |
|------------|-----------|------------------------------------|
| Cream      | `#FFF7EC` | Background                         |
| Grey Brown | `#442F2A` | Headlines, buttons, accents        |
| Blush      | `#F5CBD7` | Soft highlights, tags              |
| Noir/Graphite | `#161A1D` | Beyond Academic section background |

Defined as CSS variables at the top of `css/style.css` (`:root { ... }`) — change them there and the whole site updates.

## Fonts

- **Playfair Display** — most headlines (serif, editorial)
- **Space Grotesk** — hero name and landing page tag (bold grotesk)
- **Inter** — body text
- **JetBrains Mono** — tags, labels, nav

Loaded via Google Fonts CDN in the `<head>` — no local font files needed.

## Notable interactions

- **Landing page stickers**: pop outward from center on load, then collect back toward the center as your cursor approaches it (mouse-based; no touch equivalent yet — worth adding before considering this section "done" for mobile).
- **Lanyard card** (About section): draggable ID badge on a physics-simulated strap (Verlet integration rope).
- **Pipeline nav**: the dot-and-line nav on the right fills in as you scroll and reflects which section you're in.

## Deploying

This is a static site, so it deploys as-is to:
- **[Vercel](https://vercel.com)** — connect this repo, no build command needed, output directory is the project root
- **GitHub Pages** — enable Pages in repo Settings → Pages, set source to the root of the `main` branch

## Notes on the guestbook

The visitor guestbook on the Connect section uses Claude's built-in artifact storage, which only works while previewing inside Claude. Once deployed to Vercel/GitHub Pages, you'll need to swap it for a real backend (e.g. a free tier of [Formspree](https://formspree.io) or [Supabase](https://supabase.com)) to keep comments working.
