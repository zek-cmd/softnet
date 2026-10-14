'use strict';

/**
 * News routes.
 *
 * The type is registered as api::news.news-item (Strapi rules out "news" as
 * both the singular and the plural name), and its pluralName is "news".
 * That makes the core router serve the two addresses the site already uses:
 *
 *   GET /api/news      - the list
 *   GET /api/news/:id  - one story by its Strapi number
 *
 * Reading is open to everyone; writing still needs a logged-in admin.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::news.news-item');
