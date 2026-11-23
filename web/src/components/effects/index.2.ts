// Registry of the Dark Tech and Organic signature effects: preset effect name -> component.
// /showcase merges this with the registry in ./index.ts. To add an effect: new file here, one line below,
// and its name in the preset's `effects` array.
import type { ComponentType } from "react"
import { BorderBeam } from "./BorderBeam"
import { DecryptText } from "./DecryptText"
import { GrainOverlay } from "./GrainOverlay"
import { GridBackground } from "./GridBackground"
import { MorphingBlob } from "./MorphingBlob"
import { SpotlightCard } from "./SpotlightCard"
import { WavyDivider } from "./WavyDivider"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const effects2: Record<string, ComponentType<any>> = {
  GridBackground,
  SpotlightCard,
  DecryptText,
  BorderBeam,
  GrainOverlay,
  MorphingBlob,
  WavyDivider,
}
