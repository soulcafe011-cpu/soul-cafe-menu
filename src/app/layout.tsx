import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Soul Café | المنيو الإلكتروني",
  description: "منيو Soul Café الإلكتروني — تصفّح، أضف إلى السلة، واطلب عبر واتساب.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
