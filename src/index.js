'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * Runs every time Strapi starts.
   *
   * The site reads news through the API without logging in, so the "public"
   * role needs permission to read the News type. The permission is written
   * here instead of being clicked in the admin, so it is set up on every
   * machine the same way and can never be forgotten after a fresh install.
   *
   * Only reading is allowed. Creating, changing and deleting a news item
   * still needs a logged-in admin.
   */
  async bootstrap({ strapi }) {
    const publicActions = [
      'api::news.news-item.find',
      'api::news.news-item.findOne',
    ];

    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (!publicRole) {
      return;
    }

    for (const action of publicActions) {
      const existing = await strapi
        .query('plugin::users-permissions.permission')
        .findOne({ where: { action, role: publicRole.id } });

      if (existing) {
        if (!existing.enabled) {
          await strapi
            .query('plugin::users-permissions.permission')
            .update({ where: { id: existing.id }, data: { enabled: true } });
        }
        continue;
      }

      await strapi
        .query('plugin::users-permissions.permission')
        .create({ data: { action, role: publicRole.id, enabled: true } });
    }
  },
};
