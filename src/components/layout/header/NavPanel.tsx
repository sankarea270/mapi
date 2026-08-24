"use client";

import type { NavItem } from "@/config/navigation";
import type { TourCategory } from "@/types/tour";
import { ToursPanel } from "./ToursPanel";
import { CategoryPanel } from "./CategoryPanel";
import { LinksPanel } from "./LinksPanel";

export function NavPanel({
  item,
  categories,
}: {
  item: NavItem;
  categories: TourCategory[];
}) {
  switch (item.kind) {
    case "tours":
      return <ToursPanel categories={categories} />;
    case "category": {
      const category = categories.find((c) => c.slug === item.categorySlug);
      return category ? <CategoryPanel category={category} /> : null;
    }
    case "links":
      return <LinksPanel sections={item.sections} featured={item.featured} />;
  }
}
