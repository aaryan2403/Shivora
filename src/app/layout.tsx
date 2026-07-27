import type { Metadata } from "next";
import { Cormorant, Montserrat, Cinzel } from "next/font/google";
import "./globals.css";
import { ShopProvider } from "../context/ShopContext";
import { ThemeProvider } from "../context/ThemeContext";
import AnnouncementBar from "../components/AnnouncementBar";
import Navbar from "../components/Navbar";
import NavbarSpacer from "../components/NavbarSpacer";
import SearchOverlay from "../components/SearchOverlay";
import AuthModal from "../components/AuthModal";
import CartSidebar from "../components/CartSidebar";
import WishlistSidebar from "../components/WishlistSidebar";
import GlobalProductModal from "../components/GlobalProductModal";
import Footer from "../components/Footer";
import LoginPrompt from "../components/LoginPrompt";
import LegalConsentModal from "../components/LegalConsentModal";

const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://myshivora.com"),
  title: "Shivora",
  description: "Discover our exquisite collection of fine jewelry. Elegant pieces crafted with obsidian, ash, and pearl aesthetics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${montserrat.variable} ${cormorant.variable} ${cinzel.variable} antialiased bg-creme text-obsidian min-h-screen font-sans selection:bg-primary/20`}
      >
        <ThemeProvider>
          <ShopProvider>
            <AnnouncementBar />
            <Navbar />
            <NavbarSpacer />
            <SearchOverlay />
            <AuthModal />
            <CartSidebar />
            <GlobalProductModal />
            <WishlistSidebar />
            <LegalConsentModal />
            {children}
            <Footer />
          </ShopProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
