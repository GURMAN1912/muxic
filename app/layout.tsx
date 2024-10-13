import type { Metadata } from "next";
import "./globals.css";
import Provider from "./components/Provider";
import { Toaster } from "react-hot-toast";


export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` antialiased`}
      >
        <Toaster />
        <Provider>
        {children}
        </Provider>
      </body>
    </html>
  );
}
