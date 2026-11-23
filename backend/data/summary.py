"""Report summary: a deterministic template, plus optional LLM narration."""

from backend.data.report import Report


def template_summary(report: Report) -> str:
    """Always-available summary, e.g. "accuracy 87 %; top drivers X, Y"."""
    parts = []
    for key, value in list(report.metrics.items())[:3]:
        shown = f"{value * 100:.0f} %" if 0 <= value <= 1 else f"{value:.3g}"
        parts.append(f"{key} {shown}")
    text = ", ".join(parts) or f"{report.pipeline} run {report.run}"
    drivers = next((c for c in report.charts if c.id in ("importance", "drivers")), None)
    if drivers and drivers.data and drivers.series:
        k, x = drivers.series[0].key, drivers.x
        top = sorted(drivers.data, key=lambda r: r.get(k, 0), reverse=True)[:2]
        text += "; top drivers " + ", ".join(str(r.get(x)) for r in top)
    return text


def build_summary(report: Report, explain: bool = False) -> str:
    """Template summary; with `explain` and the llm Module present, add narration."""
    text = template_summary(report)
    if not explain:
        return text
    try:
        from backend.llm.helpers import summarize  # llm pruned -> ImportError

        narration = summarize(
            f"Explain these model results to a non-technical audience, in the event language: {text}",
            max_words=80,
        )
        return f"{text}\n\n{narration}"
    except (ImportError, NotImplementedError):
        return text  # data never hard-depends on llm
