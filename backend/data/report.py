"""Report and Chart models. Chart is the shadcn charts / Recharts shape."""

from typing import Any, Literal

from pydantic import BaseModel, Field


class Series(BaseModel):
    key: str
    label: str


class Chart(BaseModel):
    id: str
    kind: Literal["line", "bar", "area", "scatter", "pie"]
    title: str
    x: str
    series: list[Series]
    data: list[dict[str, Any]]


class Report(BaseModel):
    run: str
    pipeline: str
    model: str
    metrics: dict[str, float] = Field(default_factory=dict)
    charts: list[Chart] = Field(default_factory=list)
    summary: str = ""
