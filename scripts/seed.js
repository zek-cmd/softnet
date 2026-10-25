'use strict';

/**
 * Seed the news collection with a few sample stories.
 *
 * This project has exactly one content type: api::news.news-item. The starter
 * template this project began as also had article, category, author, global and
 * about; those were removed because the website only ever reads /api/news. This
 * script was written for the template, so it has been rewritten to seed the one
 * type that is left.
 *
 *   npm run seed:example
 *
 * Two things it deliberately does NOT do:
 *
 *   - It does not overwrite or delete anything already in the database. It adds
 *     the stories in data/data.json and leaves real stories alone.
 *   - It does not run twice. Strapi remembers that it has run, in the same way
 *     the template did, so a second run is a no-op.
 *
 * The stories it creates are obvious samples ("Sample story ..."), not school
 * news, so nobody mistakes them for real announcements. Delete them in the admin
 * once the site has real content.
 *
 * NOTE ON THE UID: Strapi registers this type as api::news.news-item — the
 * folder is api/news and the singular name is news-item. The template's helper
 * built uids as `api::${name}.${name}`, which cannot express that, so the uid is
 * written out in full here.
 *
 * NOTE ON STATUS AND SLUG: this type has draftAndPublish on, so a story created
 * without an explicit status stays a draft and is invisible on the site — hence
 * status: 'published'. And slug is a uid field, which Strapi does not fill in
 * from a create() call, so each story's slug comes from data/data.json. Without
 * it the story would have no readable address.
 */

const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');

const NEWS_UID = 'api::news.news-item';

async function isFirstRun() {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: 'type',
    name: 'setup',
  });
  const initHasRun = await pluginStore.get({ key: 'initHasRun' });
  await pluginStore.set({ key: 'initHasRun', value: true });
  return !initHasRun;
}

/**
 * Add the public read permissions the website needs, skipping any that are
 * already there so a re-run cannot pile up duplicates.
 */
async function ensurePublicReadPermissions() {
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });

  if (!publicRole) {
    console.warn('No public role found; skipping permissions.');
    return;
  }

  const wanted = [`${NEWS_UID}.find`, `${NEWS_UID}.findOne`];

  for (const action of wanted) {
    const existing = await strapi.query('plugin::users-permissions.permission').findOne({
      where: { action, role: publicRole.id },
    });

    if (existing) {
      console.log(`  permission already present: ${action}`);
      continue;
    }

    await strapi.query('plugin::users-permissions.permission').create({
      data: { action, role: publicRole.id },
    });
    console.log(`  permission granted: ${action}`);
  }
}

function getFileData(fileName) {
  const filePath = path.join('data', 'uploads', fileName);
  const stats = fs.statSync(filePath);
  const ext = fileName.split('.').pop();
  const mimeType = mime.lookup(ext || '') || '';

  return {
    filepath: filePath,
    originalFileName: fileName,
    size: stats.size,
    mimetype: mimeType,
  };
}

/**
 * Upload one image from data/uploads, or reuse it if it is already in the media
 * library. Returns the uploaded file entry.
 */
async function uploadImage(fileName) {
  if (!fileName) return undefined;

  const nameWithoutExtension = fileName.replace(/\..*$/, '');
  const existing = await strapi.query('plugin::upload.file').findOne({
    where: { name: nameWithoutExtension },
  });

  if (existing) {
    console.log(`  image already uploaded: ${fileName}`);
    return existing;
  }

  const [file] = await strapi.plugin('upload').service('upload').upload({
    files: getFileData(fileName),
    data: {
      fileInfo: {
        name: nameWithoutExtension,
        alternativeText: nameWithoutExtension,
        caption: nameWithoutExtension,
      },
    },
  });

  console.log(`  image uploaded: ${fileName}`);
  return file;
}

/** One story, as the schema expects it. */
async function createStory(story) {
  const image = await uploadImage(story.image);

  // gallery is a repeatable component: each entry is { image, caption }.
  const gallery = [];
  for (const photo of story.gallery || []) {
    const uploaded = await uploadImage(photo.image);
    if (uploaded) gallery.push({ image: uploaded, caption: photo.caption || '' });
  }

  const entry = {
    title: story.title,
    // slug is a uid field: Strapi does not derive it from the data written
    // through the document service, so it has to be given explicitly or the
    // story gets a NULL slug and no readable address.
    slug: story.slug,
    summary: story.summary,
    content: story.content,
    category: story.category || 'General',
    tags: story.tags || '',
  };

  if (image) entry.image = image;
  if (gallery.length) entry.gallery = gallery;

  // draftAndPublish is on for this type, so a story created without a status
  // stays a draft and never appears on the site. Status, not publishedAt.
  const created = await strapi.documents(NEWS_UID).create({ data: entry, status: 'published' });
  console.log(`  story created: ${story.title}`);
  return created;
}

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'error';

  global.strapi = app;

  try {
    if (!(await isFirstRun())) {
      console.log(
        'Seed data has already been imported. Clear the setup store, or use the\n' +
          'admin panel, if you need to run it again.'
      );
      return;
    }

    const { news } = require('../data/data.json');
    const stories = Array.isArray(news) ? news : [];

    console.log('Granting public read access to news...');
    await ensurePublicReadPermissions();

    if (!stories.length) {
      console.log('data/data.json holds no sample stories; nothing to create.');
      return;
    }

    console.log(`Creating ${stories.length} sample story/stories...`);
    for (const story of stories) {
      await createStory(story);
    }

    console.log('Ready to go');
  } catch (error) {
    console.error('Could not import seed data');
    console.error(error);
    process.exitCode = 1;
  } finally {
    await app.destroy();
  }
}

main()
  .then(() => process.exit(process.exitCode || 0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
