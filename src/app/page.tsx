"use client";

import { Suspense } from "react";
import MarketingHomePage from "./(main)/home";

export default function Home() {
  return (
    <main>
      <Suspense fallback={<div>Loading...</div>}>
        <MarketingHomePage />
      </Suspense>
    </main>
  );
}
