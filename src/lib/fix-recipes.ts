import { taxonomyById } from "./failure-taxonomy";
import type { FailureType } from "./schemas";

export function getFixRecipe(type: FailureType) {
  return taxonomyById[type] ?? taxonomyById.UNKNOWN;
}
