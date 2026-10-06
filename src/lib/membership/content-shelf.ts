export type ShelfItem = {
  id: string;
  title: string;
  kind: string;
  body: string | null;
};
export type ContentShelf = "episode" | "story" | "vault";

export function selectShelfItems(items: ShelfItem[], shelf: ContentShelf) {
  return items.filter((item) =>
    shelf === "vault"
      ? item.kind === "episode" || item.kind === "story"
      : item.kind === shelf,
  );
}
