"use client";

import { useMemo, useState } from "react";
import { ShoppingBag, Search, Plus, Minus, X, MessageCircle, Coffee, Menu as MenuIcon, ArrowUpLeft } from "lucide-react";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { demoCategories, demoProducts, formatPrice, type Category, type Product } from "@/lib/menu";

type CartItem = { product: Product; quantity: number };

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [categories, setCategories] = useState<Category[]>(demoCategories);
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [orderType, setOrderType] = useState("استلام من القهوة");

  useEffect(() => {
    let active = true;
    async function fetchMenu() {
      if (!supabase) return;
      const [cats, prods] = await Promise.all([
        supabase.from("categories").select("id,name,sort_order").eq("is_active", true).order("sort_order"),
        supabase.from("products").select("id,category_id,name,description,price,image_url,available,featured").eq("available", true).order("sort_order")
      ]);
      if (!active) return;
      if (!cats.error && cats.data?.length) setCategories(cats.data as Category[]);
      if (!prods.error && prods.data?.length) setProducts(prods.data as Product[]);
    }
    void fetchMenu();
    return () => { active = false; };
  }, []);

  const visibleProducts = useMemo(() => products.filter(p =>
    p.available &&
    (activeCategory === "all" || p.category_id === activeCategory) &&
    `${p.name} ${p.description}`.toLowerCase().includes(search.toLowerCase())
  ), [activeCategory, search, products]);

  const cartItems = Object.values(cart);
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  function add(product: Product) {
    setCart(old => ({ ...old, [product.id]: { product, quantity: (old[product.id]?.quantity || 0) + 1 } }));
  }
  function changeQuantity(id: string, delta: number) {
    setCart(old => {
      const item = old[id];
      if (!item) return old;
      const next = item.quantity + delta;
      if (next <= 0) { const copy = { ...old }; delete copy[id]; return copy; }
      return { ...old, [id]: { ...item, quantity: next } };
    });
  }
  function sendOrder() {
    if (!cartItems.length) return;
    const phone = (process.env.NEXT_PUBLIC_CAFE_WHATSAPP || "").replace(/\D/g, "");
    if (!phone || phone.includes("XXXXXXXX")) {
      alert("رقم واتساب القهوة غير مضبوط بعد. أضف الرقم في ملف .env.local ثم أعد تشغيل الموقع.");
      return;
    }
    const lines = cartItems.map(({ product, quantity }) => `• ${product.name} × ${quantity} — ${formatPrice(product.price * quantity)}`);
    const message = [
      "☕ *طلب جديد — Soul Café*",
      "",
      ...lines,
      "",
      `*المجموع: ${formatPrice(total)}*`,
      `طريقة الطلب: ${orderType}`,
      customerName.trim() ? `اسم الزبون: ${customerName.trim()}` : "",
      orderNote.trim() ? `ملاحظات: ${orderNote.trim()}` : "",
      "",
      "يرجى تأكيد الطلب والوقت المتوقع."
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <main>
      <header className="topbar">
        <a href="#" className="brand" aria-label="Soul Cafe home"><span className="brand-mark"><Coffee size={25}/></span><span><b>SOUL</b><small>CAFÉ</small></span></a>
        <a className="header-order" href="#menu">استكشف المنيو <ArrowUpLeft size={16}/></a>
      </header>

      <section className="hero">
        <div className="hero-shade"/>
        <div className="hero-content">
          <span className="eyebrow"><span/> GOOD COFFEE. GOOD MOOD.</span>
          <h1>لحظتك الحلوة<br/><em>بتبلّش من هون.</em></h1>
          <p>قهوة بتحبّها، أجواء بتشبهك، وتفاصيل صغيرة بتصنع الفرق.</p>
          <a className="primary-btn" href="#menu">شوف المنيو <ArrowUpLeft size={18}/></a>
        </div>
        <div className="hero-label"><span>EST.</span><b>SOUL</b><span>CAFÉ EXPERIENCE</span></div>
      </section>

      <section className="menu-section" id="menu">
        <div className="section-heading">
          <div><span className="section-kicker">OUR MENU</span><h2>اختار مزاجك</h2><p>حضّر طلبك على راحتك، ونحن بانتظارك.</p></div>
          <button className="cart-button" onClick={() => setCartOpen(true)}><ShoppingBag size={19}/><span>السلة</span>{count > 0 && <b>{count}</b>}</button>
        </div>
        <div className="search-box"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="دوّر على مشروبك المفضل..." aria-label="ابحث في المنيو"/>{search && <button onClick={() => setSearch("")} aria-label="مسح البحث"><X size={16}/></button>}</div>
        <div className="category-tabs">
          <button className={activeCategory === "all" ? "active" : ""} onClick={() => setActiveCategory("all")}><MenuIcon size={15}/> كل المنيو</button>
          {categories.map(category => <button key={category.id} className={activeCategory === category.id ? "active" : ""} onClick={() => setActiveCategory(category.id)}>{category.name}</button>)}
        </div>
        <div className="product-grid">
          {visibleProducts.map(product => <article className="product-card" key={product.id}>
            <div className="product-image"><img src={product.image_url} alt={product.name}/>{product.featured && <span className="popular">مفضّل</span>}<button className="quick-add" onClick={() => add(product)} aria-label={`أضف ${product.name}`}><Plus size={19}/></button></div>
            <div className="product-info"><div className="product-title-row"><h3>{product.name}</h3><strong>{formatPrice(product.price)}</strong></div><p>{product.description}</p><button className="add-link" onClick={() => add(product)}>أضف للسلة <Plus size={14}/></button></div>
          </article>)}
        </div>
        {visibleProducts.length === 0 && <div className="empty-state">ما لقينا أصناف مطابقة. جرّب بحث أو قسم تاني.</div>}
      </section>

      <footer className="footer"><a href="#" className="footer-brand">SOUL <span>CAFÉ</span></a><p>قهوة بتجمعنا، ولحظات بتضل.</p><small>© {new Date().getFullYear()} Soul Café. جميع الحقوق محفوظة.</small></footer>

      {cartOpen && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setCartOpen(false); }}>
        <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="سلة المشتريات">
          <div className="drawer-head"><div><span className="section-kicker">YOUR ORDER</span><h2>سلة المشتريات <span>({count})</span></h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="إغلاق"><X/></button></div>
          {cartItems.length === 0 ? <div className="cart-empty"><ShoppingBag size={38}/><h3>سلتك لسا فاضية</h3><p>اختار شي طيب من المنيو وارجع لهون.</p><button className="primary-btn" onClick={() => setCartOpen(false)}>تصفّح المنيو</button></div> : <>
            <div className="cart-items">{cartItems.map(({ product, quantity }) => <div className="cart-item" key={product.id}><img src={product.image_url} alt=""/><div className="cart-item-main"><b>{product.name}</b><span>{formatPrice(product.price)}</span><div className="quantity"><button onClick={() => changeQuantity(product.id, -1)} aria-label="تقليل"><Minus size={14}/></button><span>{quantity}</span><button onClick={() => changeQuantity(product.id, 1)} aria-label="زيادة"><Plus size={14}/></button></div></div><strong>{formatPrice(product.price * quantity)}</strong></div>)}</div>
            <div className="order-form">
              <label>اسمك (اختياري)<input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="شو منناديك؟"/></label>
              <label>طريقة الطلب<select value={orderType} onChange={e => setOrderType(e.target.value)}><option>استلام من القهوة</option><option>تناول داخل القهوة</option><option>توصيل (إذا متاح)</option></select></label>
              <label>ملاحظات للطلب (اختياري)<textarea value={orderNote} onChange={e => setOrderNote(e.target.value)} placeholder="مثلاً: بدون سكر..." rows={2}/></label>
            </div>
            <div className="drawer-total"><span>المجموع</span><strong>{formatPrice(total)}</strong></div>
            <button className="checkout-btn" onClick={sendOrder}><MessageCircle size={19}/> تأكيد الطلب عبر واتساب</button>
            <p className="checkout-note">رح يفتح واتساب برسالة جاهزة. راجع الطلب واضغط إرسال لتأكيده مع القهوة.</p>
          </>}
        </aside>
      </div>}
    </main>
  );
}
