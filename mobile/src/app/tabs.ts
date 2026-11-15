// The single registry of bottom tabs. Later issues fill screens, never this file.
// Each entry names its Feature id (key in root features.json); a Feature switched off
// there loses its tab and its route redirects home. `null` = always on.
import { Home, List, Map, Settings, Sparkles, type LucideIcon } from "lucide-react-native";
import features from "../../../features.json";

export type TabDef = {
  /** Route name under app/(tabs)/ */
  name: string;
  title: string;
  feature: keyof typeof features | null;
  icon: LucideIcon;
};

const ALL_TABS: TabDef[] = [
  { name: "index", title: "Home", feature: null, icon: Home }, // module:mobile
  { name: "crud", title: "Items", feature: "crud", icon: List }, // module:mobile
  { name: "settings", title: "Settings", feature: "settings", icon: Settings }, // module:mobile
  { name: "showcase", title: "Showcase", feature: "showcase", icon: Sparkles }, // module:mobile
  { name: "map", title: "Map", feature: "map", icon: Map }, // module:mobile
];

const flags: Record<string, boolean> = features;

export const isEnabled = (tab: TabDef) => tab.feature === null || flags[tab.feature] !== false;

export const TABS = ALL_TABS.map((tab) => ({ ...tab, enabled: isEnabled(tab) }));
