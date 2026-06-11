import type socialIcons from "@assets/socialIcons";

// A non-disabled LinkButton must have an href (it renders an <a>); the
// disabled state renders a <span>, so href is only optional there.
// (Lives here rather than in LinkButton.astro because the Astro compiler
// can't parse intersection types in frontmatter.)
export type LinkButtonProps = {
  className?: string;
  ariaLabel?: string;
  title?: string;
} & ({ disabled: true; href?: string } | { disabled?: false; href: string });

export type Site = {
  website: string;
  author: string;
  profile: string;
  desc: string;
  title: string;
  ogImage?: string;
  lightAndDarkMode: boolean;
  postPerPage: number;
  scheduledPostMargin: number;
  showArchives?: boolean;
};

export type SocialObjects = {
  name: keyof typeof socialIcons;
  href: string;
  active: boolean;
  linkTitle: string;
}[];
