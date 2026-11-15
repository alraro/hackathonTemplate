// Host fallback: tsconfig maps @features to ./features.json, which only exists inside docker.
declare module "@features" {
  const features: Record<string, boolean>
  export default features
}
