import { Suspense } from "react";
import InfantRecipesClient from "./infant-recipes-client";

export default function InfantRecipesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <p className="text-sm text-gray-600">Loading infant recipes...</p>
        </div>
      }
    >
      <InfantRecipesClient />
    </Suspense>
  );
}
