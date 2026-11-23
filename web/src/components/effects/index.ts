// Effect registry: preset effect name -> component. Covers Editorial, Brutalist and Soft.
// Dark Tech/Organic effects live in index.2.ts; consumers merge both.
import { SplitTextReveal } from "./SplitTextReveal"
import { DrawnUnderline } from "./DrawnUnderline"
import { ScrollProgressRule } from "./ScrollProgressRule"
import { Marquee } from "./Marquee"
import { HardShadowPress } from "./HardShadowPress"
import { GlitchText } from "./GlitchText"
import { SquishyPress } from "./SquishyPress"
import { ConfettiBurst } from "./ConfettiBurst"
import { FloatingBlobs } from "./FloatingBlobs"

export const effects = {
  SplitTextReveal,
  DrawnUnderline,
  ScrollProgressRule,
  Marquee,
  HardShadowPress,
  GlitchText,
  SquishyPress,
  ConfettiBurst,
  FloatingBlobs,
}
