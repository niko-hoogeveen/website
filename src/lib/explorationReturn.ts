import type { DestinationId } from "@/components/open-water/destinations";

const KEY = "open-water:return-island:v1";
const VALID: DestinationId[] = ["lighthouse", "innovation", "harbour", "port", "radio"];

export function rememberIsland(id: DestinationId) {
  try { window.sessionStorage.setItem(KEY, id); } catch { /* Storage may be disabled. */ }
}
export function readReturnIsland(): DestinationId | null {
  try {
    const id = window.sessionStorage.getItem(KEY);
    return VALID.find((candidate) => candidate === id) ?? null;
  } catch { return null; }
}
export function clearReturnIsland() {
  try { window.sessionStorage.removeItem(KEY); } catch { /* Ignore. */ }
}
