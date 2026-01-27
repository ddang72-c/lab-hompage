export type Frontmatter = Record<string, any>;

export function toImageUrls(fm: Frontmatter | undefined | null): string[] {
  const out: string[] = [];

  const push = (x: any) => {
    if (typeof x === "string" && x.trim()) out.push(x.trim());
  };

  const readList = (arr: any[]) => {
    for (const it of arr) {
      if (typeof it === "string") {
        push(it);
      } else if (it && typeof it === "object") {
        push(it.photo ?? it.image ?? it.src ?? it.url);
      }
    }
  };

  if (Array.isArray(fm?.images)) readList(fm.images);
  if (Array.isArray(fm?.photos)) readList(fm.photos);
  if (Array.isArray(fm?.gallery)) readList(fm.gallery);
  if (Array.isArray(fm?.media)) readList(fm.media);

  push((fm as any)?.cover);
  push((fm as any)?.thumbnail);
  push((fm as any)?.thumb);
  push((fm as any)?.image);

  return Array.from(new Set(out));
}

export function stripFrontmatter(raw: string): string {
  return raw.replace(/^---[\s\S]*?---\s*/m, "").trim();
}
