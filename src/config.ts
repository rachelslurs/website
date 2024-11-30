import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://rachel.fyi", // replace this with your deployed domain
  author: "Rachel Cantor",
  desc: "A senior engineer with a background spanning the full stack of web development; passionate about delivering exceptional UI/UX.",
  title: "Rachel Cantor",
  ogImage: "og_image.png",
  lightAndDarkMode: true,
  postPerPage: 3,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
};

export const LOCALE = {
  lang: "en", // html lang code. Set this empty and default will be "en"
  langTag: ["en-EN"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/rachelslurs",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/rachelcantor",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
  {
    name: "CodePen",
    href: "https://codepen.io/rachelslurs",
    linkTitle: `${SITE.title} on CodePen`,
    active: true,
  },
];
