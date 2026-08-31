"use client";

import type { NavItem } from "@/config/navigation";
import { ToursPanel } from "./ToursPanel";
import { CategoryPanel } from "./CategoryPanel";
import { LinksPanel } from "./LinksPanel";
import type { CategoryBrief } from "@/lib/catalog";

export function NavPanel({
  item,
  catalog,
}: {
  item: NavItem;
  catalog: CategoryBrief[];
}) {
  switch (item.kind) {
    case "tours":
      return <ToursPanel catalog={catalog} />;
    case "category": {
      const category = catalog.find((c) => c.slug === item.categorySlug);
      return category ? <CategoryPanel category={category} /> : null;
    }
    case "links":
      return <LinksPanel sections={item.sections} featured={item.featured} />;
  }
}
