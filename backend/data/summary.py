"""Report summary: a deterministic template, plus optional LLM narration."""

import re

from backend.data.report import Report

# Metrics that are fractions in [0, 1] and read better as a percentage. Counts (detections, records, k) never are.
_RATE = re.compile(r"accuracy|f1|precision|recall|rate|auc|silhouette|r2|share|ratio", re.IGNORECASE)


def _show(key: str, value: float) -> str:
    if _RATE.search(key) and 0 <= value <= 1:
        return f"{value * 100:.0f} %"
    if float(value).is_integer():
        return f"{int(value)}"
    return f"{value:.3g}"


def template_summary(report: Report) -> str:
    """Always-available summary, e.g. "accuracy 87 %; top drivers X, Y"."""
    parts = []
    for key, value in list(report.metrics.items())[:3]:
        parts.append(f"{key} {_show(key, value)}")
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
        from backend.llm.helpers import summarize  # module:llm (pruned -> ImportError)

        narration = summarize(
            f"Explain these model results to a non-technical audience, in the event language: {text}",
            max_words=80,
        )
        return f"{text}\n\n{narration}"
    except Exception:  # noqa: BLE001 - ImportError when llm is pruned, provider errors offline
        return text  # data never hard-depends on llm
