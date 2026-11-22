import type { Metadata } from "next";

export function pageMetadata({
  path,
  title,
  description,
  index = true,
  absoluteTitle = false,
}: {
  path: string;
  title?: string;
  description?: string;
  index?: boolean;
  absoluteTitle?: boolean;
}): Metadata {
  return {
    ...(title
      ? { title: absoluteTitle ? { absolute: title } : title }
      : {}),
    ...(description ? { description } : {}),
    alternates: { canonical: path },
    openGraph: { url: path },
    ...(index ? {} : { robots: { index: false, follow: false } }),
  };
}
