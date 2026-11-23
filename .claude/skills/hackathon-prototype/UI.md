# UI prototype

Adapted from mattpocock/skills v1.3.1 skills/engineering/prototype/UI.md (MIT)

Several radically different UI variations on one route, switched by a URL search param and a floating bottom bar. If the question is about logic, use [LOGIC.md](LOGIC.md).

## Where the variants live

- **Existing page (preferred)**: render the variants on the same route, gated by the param. Data fetching and params stay; only rendering swaps. A new section of an existing page counts as this shape.
- **New page (last resort)**: a throwaway route following the project's routing convention, with `prototype` in its name. First check that no existing page can host it.

The param is `?variant=` unless the caller names another. Design uses `/showcase?preset=`.

## Process

### 1. State the question and pick N

Default to 3 variants, cap at 5. Write one line in a top-of-file comment: "Three variants of X, switchable via `?variant=`, on the existing `/route`."

### 2. Generate radically different variants

Give each a clear component name (`VariantA`, `VariantB`, `VariantC`), the page's purpose and data, and the project's component library and design tokens. Variants differ in layout, information hierarchy and primary affordance, not colour. If two drafts look alike, redo one with "no card grid".

### 3. Wire them together

One switcher on the route reads the param (default the first key), renders the matching variant and mounts the switcher bar. Keep existing data fetching above the switcher.

### 4. Build the floating bar

A fixed pill at bottom-centre, visually distinct from the page: left arrow, label (key plus optional name, e.g. `B (Sidebar layout)`), right arrow. Arrows wrap around and update the URL param so the variant survives reload and sharing. `←` and `→` cycle too, except while an input, textarea or `[contenteditable]` has focus. Hide the bar in production builds. Keep it in one shared component.

### 5. Hand it over

Surface the URL and the keys. Feedback like "header from B, sidebar from C" is the real design.

### 6. Capture and clean up

Record which variant won and why. Fold the winner into the real page or route, rewriting it properly. Move every variant and the switcher to the `prototype/<name>` branch.

## Pitfalls

- Variants that differ only in colour or copy.
- A shared layout component across variants; share small parts like a header only.
- Mutations wired to the real backend; point variants at stubs.
- Promoting prototype code to main unchanged.
