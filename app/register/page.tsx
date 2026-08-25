import { Suspense } from "react";

import { PublicRegistrationClient } from "./_components/public-registration-client";

export default function PublicVisitorRegistrationPage() {
  return (
    <Suspense>
      <PublicRegistrationClient />
    </Suspense>
  );
}
