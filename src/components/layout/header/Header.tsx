import { getCategoriesWithTours } from "@/lib/tours";
import { HeaderClient } from "./HeaderClient";

export default async function Header() {
  const categories = await getCategoriesWithTours();
  return <HeaderClient categories={categories} />;
}
