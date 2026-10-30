export type Category = { id: string; name: string; sort_order: number };
export type Product = {
  id: string; category_id: string; name: string; description: string;
  price: number; image_url: string; available: boolean; featured?: boolean;
};

export const demoCategories: Category[] = [
  { id: "hot", name: "القهوة الساخنة", sort_order: 1 },
  { id: "cold", name: "القهوة الباردة", sort_order: 2 },
  { id: "tea", name: "الشاي والمشروبات", sort_order: 3 },
  { id: "dessert", name: "الحلويات", sort_order: 4 }
];

export const demoProducts: Product[] = [
  { id: "p1", category_id: "hot", name: "إسبريسو", description: "قهوة مركّزة بطعم غني", price: 25000, image_url: "https://images.unsplash.com/photo-1510707577719-ae7c14805e76?auto=format&fit=crop&w=900&q=85", available: true, featured: true },
  { id: "p2", category_id: "hot", name: "كابتشينو", description: "إسبريسو مع الحليب ورغوة ناعمة", price: 35000, image_url: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=900&q=85", available: true },
  { id: "p3", category_id: "hot", name: "لاتيه", description: "قهوة بالحليب بقوام كريمي", price: 38000, image_url: "https://images.unsplash.com/photo- latte?auto=format&fit=crop&w=900&q=85".replace("photo- latte", "photo-1461023058943-07fcbe16d735"), available: true },
  { id: "p4", category_id: "cold", name: "آيس لاتيه", description: "لاتيه بارد مع الثلج", price: 40000, image_url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=85", available: true, featured: true },
  { id: "p5", category_id: "cold", name: "فرابيه", description: "مشروب قهوة بارد ومخفوق", price: 45000, image_url: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=85", available: true },
  { id: "p6", category_id: "tea", name: "شاي", description: "شاي ساخن حسب الاختيار", price: 15000, image_url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=85", available: true },
  { id: "p7", category_id: "dessert", name: "تشيز كيك", description: "قطعة تشيز كيك طازجة", price: 45000, image_url: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=900&q=85", available: true }
];

export function formatPrice(price: number) {
  const currency = process.env.NEXT_PUBLIC_CURRENCY || "ل.س";
  return `${new Intl.NumberFormat("ar").format(price)} ${currency}`;
}
