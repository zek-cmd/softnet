# SOFTNET — news backend (Strapi)

The content backend for the **SOFTNET Information Technology Center** website. It holds the
school's news stories and the global/about content, and it is the only place a story is written
from.

The website itself is a separate project, in its own folder (`Documents\school1`). This project
serves data over HTTP; it does not render any public page.

| Item | Value |
|---|---|
| Strapi | 5.57.0 |
| Database | MySQL — `softnet` (see `config/database.js`, `.env`) |
| Admin | `/admin`, on the port in `.env` (default `1337`) |

---

## 1. What it serves

| Address | What it is |
|---|---|
| `GET /api/news` | The story list — paging, sorting and filtering |
| `GET /api/news/:id` | One story by its Strapi number |
| `GET /api/about` | The About page content (single type) |
| `GET /api/global` | Site name, favicon, description, default SEO (single type) |

Reading is open to everyone; writing needs a logged-in admin. **The public role must stay
read-only** — `find` and `findOne` on News, nothing more. A public role that can create, update
or delete is a way to publish stories without signing in.

### Content types

| Type | Kind | Fields |
|---|---|---|
| `news-item` (plural `news`) | collection | `title`, `slug`, `summary`, `content`, `category`, `tags`, `image`, `gallery` |
| `about` | single | `SOFTNET_Information_Technology_Center`, `blocks` |
| `global` | single | `siteName`, `favicon`, `siteDescription`, `defaultSeo` |

Shared components: `gallery-photo`, `media`, `quote`, `rich-text`, `seo`, `slider`.

The type is registered as `api::news.news-item` because Strapi does not allow `news` to be both
the singular and the plural name. Its `pluralName` is `news`, which is what makes the two
addresses above work (`src/api/news/routes/news.js`).

### The story body

`content` is a rich-text field. The site accepts either shape Strapi can store — Markdown text,
or a list of blocks — and turns it into HTML itself. Nothing about a story depends on which
editor the field uses.

---

## 2. How the website reads it

The site asks for stories on **every request** (it is rendered on the server), so a story
published or corrected in the admin appears on the next visit. Nothing is rebuilt or uploaded.

Two things the site relies on, and which must not be changed here without changing it too:

- **`slug` is the story's address.** A story with no slug falls back to its numeric id, so
  readable addresses are what should be filled in. The slug is lower-cased when matched.
- **Numeric ids still resolve.** Old links such as `/news/12` are matched against Strapi's own
  `id`.

⚠️ **`legacy_id` has been retired.** The field was meant to preserve ids from the old PHP
database, but it was never populated — every row was `NULL` — and that site resolved numeric
links by its own `id` anyway. The site no longer sends a filter on it, so filtering on a field
that does not exist cannot happen. The MySQL column may still be present; Strapi ignores it.

Uploaded photos are served from this project's `public/uploads`, so the site builds image
addresses against this host. If the two ever run on different hosts, that address is what the
site needs configured as its news API.

---

## 3. Commands

```bash
npm run develop   # dev with auto-reload — the admin is then at :1337/admin
npm run start     # production mode
npm run build     # build the admin panel
```

`npm run seed:example` runs `scripts/seed.js`, which imports `data/data.json`. **That seed is
stale**: it expects `categories`, `authors` and `articles`, which are no longer content types in
this project, so it should not be run against this database.

---

## 4. Data and backups

- **`data/data.json`** — seed content, not a backup of live stories.
- **`database/migrations/`** — Strapi's own migration records.
- **`backups/`** — manual backups, if any have been taken.

MySQL is the source of truth. The stories the website shows live in the `news` table of the
`softnet` database; `public/uploads` holds the photos they point at. **A database dump on its own
is not a full backup** — the uploads folder has to be copied as well, or the stories will survive
with their pictures missing.

---

## 5. Security

- **`.env` holds the secrets** — `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`,
  `TRANSFER_TOKEN_SALT`, `ENCRYPTION_KEY`, `STRAPI_LICENSE`, and the database password. It is in
  `.gitignore` and must never be committed or shared.
- **`STRAPI_LICENSE` is Strapi's own licence key**, not this project's licence. It used to live in
  a `license.txt` in this folder; it now sits in `.env`. Strapi reads `env.STRAPI_LICENSE` first
  and only falls back to `appDir/license.txt`, so the key is still found — see below.
- **The admin is the only way in.** There are no public write endpoints.

### Where the Strapi licence lives

Strapi's enterprise licence is a long base64 key. Its resolution order is:

1. `STRAPI_LICENSE` in the environment (or in `.env`) — **this is what the project uses**
2. `license.txt` in the project root

The key was moved into `.env` so it no longer sits loose in the project root, and `.env` is
already gitignored. Nothing has to be installed for this: the licence is only consulted by
`strapi deploy` and the enterprise packages, none of which are installed here.

The current key is a **silver trial** that expires **13 November 2026**. To restore it as a file
instead, or to renew it, see the Strapi billing page — an expired key makes any enterprise command
fail with `This Strapi license expired on …`, which does not affect running the site or the admin.

---

## License

Released under the [MIT License](LICENSE).

Copyright (c) 2026 SOFTNET Information Technology Center, Inc.
