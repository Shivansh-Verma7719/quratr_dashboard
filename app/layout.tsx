import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/app/providers";
import CustomNavbar from "@/components/navbar/index";
import Footer from "@/components/footer/index";

export const metadata: Metadata = {
  title: "Quratr Dashboard",
  description: "Quratr Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Providers>
          <CustomNavbar />
          <main className="md:pt-[68px] mt-0 mb-16 md:mb-0 w-full h-full">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
