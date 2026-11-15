# Logic prototype

Adapted from mattpocock/skills v1.3.1 skills/engineering/prototype/LOGIC.md (MIT)

A single self-contained HTML file that anyone can drive by clicking buttons. Use it when the question is about business logic, state transitions or data shape. If the question is "what should this look like", use [UI.md](UI.md).

## Process

### 1. State the question

Write the state model and the question in one visible paragraph at the top of the demo, not only in a comment.

### 2. Isolate the logic

Put the logic in one `<script>` block as a small pure module (no DOM, no handlers) that can be lifted into the real code. Pick the shape that fits the question: a reducer `(state, action) => state`, an explicit state machine, a set of pure functions, or a class that owns ongoing state. The page calls the module; nothing flows back.

### 3. Build the HTML file

Plain HTML/CSS/JS, everything inline, no framework or server. Write labels in domain language for a non-developer. Lay out top to bottom:

1. Title and one-line explanation (the question).
2. Current state as a readable panel, re-rendered after every click, with what just changed called out.
3. Free-play buttons, one per action, always available.
4. Guided walkthroughs, one tab per scenario: a plain description, then the ordered buttons to press. Starting one resets to a known state. Cover the happy path, a tricky edge case and an attempt at something illegal.

Keep it restrained: clean typography, one accent colour, no animation.

### 4. Hand it over

Open the file for the user. Remarks like "that shouldn't be possible" are bugs in the idea; add actions or scenarios on request.

### 5. Capture

Lift the validated module into the real code. The HTML shell goes to the `prototype/<name>` branch, never to main.
