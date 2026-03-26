"use client";
import EntityRegistry from "./EntityRegistry";

/**
 * Entry point for /admin/entities
 * Decoupled from logic to allow for cleaner hot-reloading
 * and routing compliance.
 */
export default function EntitiesPage() {
  return <EntityRegistry />;
}