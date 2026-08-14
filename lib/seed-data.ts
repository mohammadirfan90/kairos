import { ChecklistCategory, ChecklistItem } from "./types";
import checklistData from "./checklist-data.json";

export const CANONICAL_CATEGORIES = checklistData.categories as ChecklistCategory[];
export const CANONICAL_ITEMS = checklistData.items as ChecklistItem[];
