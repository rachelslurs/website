import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,

  // Get this from tina.io
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  // Get this from tina.io
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      publicFolder: "public",
      mediaRoot: "uploads",
    },
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
  schema: {
    collections: [
      {
        name: "post",
        label: "Posts",
        path: "src/content/blog",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: 'string',
            name: 'description',
            label: 'Description',
            required: false
          },
          {
            type: 'boolean',
            name: 'featured',
            label: 'Featured',
            required: false
          },
          {
            type: 'boolean',
            name: 'draft',
            label: 'Draft',
            required: false
          },
          {
            type: "string",
            name: "author",
            label: "Author",
            isTitle: false,
            required: true,
          },
          {
            type: "datetime",
            name: "pubDatetime",
            label: "Date",
            required: true,
          },
          {
            label: 'Tags',
            name: 'tags',
            type: 'string',
            list: true
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
      {
        name: "work",
        label: "Work",
        path: "src/content/work",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: 'string',
            name: 'description',
            label: 'Description',
            required: false
          },
          {
            type: 'string',
            name: 'summary',
            label: 'Summary',
            required: true
          },
          {
            type: 'boolean',
            name: 'featured',
            label: 'Featured',
            required: false
          },
          {
            type: 'boolean',
            name: 'draft',
            label: 'Draft',
            required: false
          },
          {
            type: "string",
            name: "author",
            label: "Author",
            isTitle: false,
            required: true,
          },
          {
            type: "datetime",
            name: "pubDatetime",
            label: "Date",
            required: true,
          },
          {
            type: "string",
            name: "year",
            label: "Year",
            required: false,
          },
          {
            label: 'Tags',
            name: 'tags',
            type: 'string',
            list: true
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
          {
            label: 'Features',
            name: 'features',
            type: 'object',
            list: true,
            required: false,
            fields: [
              {
                type: 'image',
                name: 'src',
                label: 'Image',
                required: true
              },
              {
                type: 'string',
                name: 'alt',
                label: 'Alt',
                required: true
              },
              {
                type: 'string',
                name: 'caption',
                label: 'Caption',
              },
            ]
          },
        ],
      },
    ],
  },
});
