import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ToasterProvider from "./components/ToasterProvider";
// import Chatbot from "./Chatbot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CST room booking system",
  description: "CST room booking system",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body 
        className="min-h-full flex flex-col"
        suppressHydrationWarning={true}
      >
        {children}

        {/* Renders all react-hot-toast notifications (success/error toasts) */}
        <ToasterProvider />

        {/* Global AI Chatbot */}
        {/* <Chatbot /> */}
      </body>
    </html>
  );
}
