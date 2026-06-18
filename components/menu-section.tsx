import { MenuCard } from "@/components/menu-card";
import { categoryLabels } from "@/lib/menu-data";
import type { MenuCategory, MenuItem } from "@/lib/types";

type MenuSectionProps = {
  category: MenuCategory;
  items: MenuItem[];
};

export function MenuSection({ category, items }: MenuSectionProps) {
  if (!items.length) return null;

  return (
    <section id={category} className="scroll-mt-24 space-y-4">
      <h2 className="font-display border-primary text-3xl tracking-wide border-l-4 pl-3 uppercase">
        {categoryLabels[category]}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <MenuCard key={item._id} item={item} />
        ))}
      </div>
    </section>
  );
}
