"use client";

import React from "react";
import { Agentation } from "agentation";

/**
 * AgentationClient
 *
 * Renders the Agentation visual-feedback toolbar only when running in
 * development. Tree-shaken from production builds because the conditional
 * is evaluated at the call-site in the Server Component that imports this.
 *
 * NOTE: This component is intentionally a Client Component (it imports a
 * "use client" package and uses React state internally). It is mounted
 * from the root layout, which is a Server Component, and Next.js handles
 * the boundary automatically.
 */
export default function AgentationClient() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }
  return <Agentation />;
}
