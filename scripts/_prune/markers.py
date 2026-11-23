"""Which lines of a file a Module owns: `>>> module:x` blocks, `module:x` line markers, pyproject extras."""
from __future__ import annotations

import re


def marker_regexes(names: list[str]):
    alt = "|".join(re.escape(n) for n in names)
    opn = re.compile(rf"^\s*(?:#|//)\s*>>>\s*module:({alt})\s*$")
    cls = re.compile(rf"^\s*(?:#|//)\s*<<<\s*module:({alt})\s*$")
    one = re.compile(rf"(?:#|//)\s*module:({alt})\s*$")
    return opn, cls, one


def mine_flags(lines: list[str], names: list[str], path: str = "") -> tuple[list[str | None], list[str]]:
    """Per line: the owning module name when it must go, else None. Plus descriptions."""
    opn, cls, one = marker_regexes(names)
    owner: list[str | None] = [None] * len(lines)
    notes: list[str] = []
    cur, start = None, 0
    for i, line in enumerate(lines):
        text = line.rstrip("\n")
        if cur is None:
            if m := opn.match(text):
                cur, start = m.group(1), i
                owner[i] = cur
            elif m := one.search(text):
                owner[i] = m.group(1)
                notes.append(f"{path}:{i + 1}: line marked module:{m.group(1)}")
        else:
            owner[i] = cur
            if (m := cls.match(text)) and m.group(1) == cur:
                notes.append(f"{path}:{start + 1}-{i + 1}: block module:{cur}")
                cur = None
    if cur is not None:
        raise ValueError(f"{path}:{start + 1}: unclosed `>>> module:{cur}` block")
    return owner, notes


def extra_span(lines: list[str], name: str) -> tuple[int, int] | None:
    """Line range [start, end) of `name = [...]` inside [project.optional-dependencies]."""
    section = False
    for i, line in enumerate(lines):
        s = line.strip()
        if s.startswith("["):
            section = s == "[project.optional-dependencies]"
            continue
        if section and re.match(rf"^{re.escape(name)}\s*=\s*\[", line):
            depth, in_str = 0, None
            for j in range(i, len(lines)):
                for ch in lines[j]:
                    if in_str:
                        in_str = None if ch == in_str else in_str
                    elif ch in "\"'":
                        in_str = ch
                    elif ch == "#":
                        break
                    elif ch == "[":
                        depth += 1
                    elif ch == "]":
                        depth -= 1
                if depth == 0:
                    return i, j + 1
    return None


def flags_for_file(
    rel: str, lines: list[str], names: list[str], extras: list[str] | None = None
) -> tuple[list[str | None], list[str]]:
    owner, notes = mine_flags(lines, names, rel)
    if rel == "backend/pyproject.toml":
        for n in extras if extras is not None else names:
            if span := extra_span(lines, n):
                for k in range(*span):
                    owner[k] = n
                notes.append(f"{rel}:{span[0] + 1}-{span[1]}: pyproject extra `{n}`")
    return owner, notes
