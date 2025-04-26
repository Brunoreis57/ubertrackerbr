import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BR UBER - Controle de Ganhos para Motoristas",
  description: "Aplicação para controle de ganhos e gastos para motoristas de aplicativos",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gray-100`}>
        <Navbar>
          {children}
        </Navbar>
      </body>
    </html>
  );
}
