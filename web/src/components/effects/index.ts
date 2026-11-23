// Effect registry: preset effect name -> component. /showcase renders any preset's `effects` from it.
// To add an effect: new file here, one line below, and its name in the preset's `effects` array.
import type { ComponentType } from "react"
import { BorderBeam } from "./BorderBeam"
import { ConfettiBurst } from "./ConfettiBurst"
import { DecryptText } from "./DecryptText"
import { DrawnUnderline } from "./DrawnUnderline"
import { FloatingBlobs } from "./FloatingBlobs"
import { GlitchText } from "./GlitchText"
import { GrainOverlay } from "./GrainOverlay"
import { GridBackground } from "./GridBackground"
import { HardShadowPress } from "./HardShadowPress"
import { Marquee } from "./Marquee"
import { MorphingBlob } from "./MorphingBlob"
import { ScrollProgressRule } from "./ScrollProgressRule"
import { SpotlightCard } from "./SpotlightCard"
import { SplitTextReveal } from "./SplitTextReveal"
import { SquishyPress } from "./SquishyPress"
import { WavyDivider } from "./WavyDivider"

// Each effect has its own props, so the registry values are typed loosely; /showcase's EffectDemo passes the right ones.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEffect = ComponentType<any>

export const effects: Record<string, AnyEffect> = {
  SplitTextReveal,
  DrawnUnderline,
  ScrollProgressRule,
  Marquee,
  HardShadowPress,
  GlitchText,
  SquishyPress,
  ConfettiBurst,
  FloatingBlobs,
  GridBackground,
  SpotlightCard,
  DecryptText,
  BorderBeam,
  GrainOverlay,
  MorphingBlob,
  WavyDivider,
}
