"use client";
import Appbar from "./components/Appbar";
import Features from "./components/Features";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";

export default function Home() {
  return (
    <div>
      <Appbar/>
      <HeroSection/>
      <Features/>
      <Footer/>
    </div>
  );
}
