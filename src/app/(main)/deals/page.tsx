"use client";

import { Suspense } from "react";
import React from "react";
import DealsDashboard from "./components";

function Deals() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <DealsDashboard />
      </Suspense>
    </div>
  );
}

export default Deals;
