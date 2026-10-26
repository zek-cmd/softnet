# SOFTNET — News Backend (Strapi)

## Overview

This project is the content backend for the **SOFTNET Information Technology Center** website.
It stores the school's news stories and is the only place a story is written.

- It is built with **Strapi 5.57.0**, a tool that gives you a database, an admin panel and a
  ready-made web API without writing that code by hand.
- Stories are stored in **MySQL** (database name `softnet`).
- The **admin panel** is at `/admin` (default port `1337`), where a logged-in admin writes and
  publishes stories.
- The website is a separate project. This project only serves the data over HTTP; it does not
  show any public page itself.

### What it serves

| Address | What it is |
|---|---|
| `GET /api/news` | The list of stories |
| `GET /api/news/:id` | One story by its number |

Anyone can read stories. Only a logged-in admin can create, change or delete them.

---

## Dependencies

### Runtime requirements

- **Node.js** 20 up to 26
- **npm** 6 or newer
- **MySQL** database for the stories

### Main packages (`dependencies` in `package.json`)

| Package | Version | Purpose |
|---|---|---|
| `@strapi/strapi` | 5.57.0 | The Strapi core: API, admin panel and server |
| `@strapi/database` | 5.57.0 | Database layer used by Strapi |
| `@strapi/plugin-users-permissions` | 5.57.0 | Roles and permissions (public read, admin write) |
| `@strapi/plugin-cloud` | 5.57.0 | Strapi Cloud support |
| `mysql2` | ^3.20.0 | Connects Strapi to the MySQL database |
| `better-sqlite3` | ^13.0.3 | SQLite driver, available as a local option |
| `react` / `react-dom` | ^18.0.0 | Used by the admin panel |
| `react-router-dom` | ^6.30.3 | Page routing in the admin panel |
| `styled-components` | ^6.0.0 | Styling in the admin panel |
| `fs-extra` | ^10.0.0 | Easier file-system helpers |
| `mime-types` | ^2.1.27 | Detects file types for uploaded images |

### Commands

```bash
npm install         # install the dependencies
npm run develop     # development mode with auto-reload (admin at :1337/admin)
npm run start       # production mode
npm run build       # build the admin panel
npm run seed:example  # add sample stories (runs once)
```

---

## License

Released under the [MIT License](LICENSE).

Copyright (c) 2026 SOFTNET Information Technology Center, Inc.
