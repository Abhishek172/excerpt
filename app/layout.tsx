import "./globals.css";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Excerpt",
  description: "Search conversations like evidence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
