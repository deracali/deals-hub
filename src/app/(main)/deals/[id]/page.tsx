import React from "react";
import DealDetails from "../components/details";
interface DetailsParams {
  params: {
    id: string;
  };
}

function DealsDetailsPage({ params }: DetailsParams) {
  return (
    <div>
      <DealDetails />
    </div>
  );
}

export default DealsDetailsPage;
