"""forecast pipeline: one time series, history plus forecast with a 95% band."""

from types import SimpleNamespace

import numpy as np
import pandas as pd
from statsforecast import StatsForecast
from statsforecast.models import AutoARIMA, AutoETS, Naive

from backend.data.config import RunConfig
from backend.data.report import Chart, Report, Series
from backend.data.tables import read_table

LEVEL = 95
HORIZON = 12
# freq letter -> seasonal period
SEASON = {"M": 12, "Q": 4, "D": 7, "H": 24, "W": 52}
OWN_PARAMS = ("date", "value", "freq", "season_length", "horizon")

# short name -> statsforecast model factory taking season_length
MODELS = {
    "auto_ets": lambda m, **p: AutoETS(season_length=m, **p),
    "auto_arima": lambda m, **p: AutoARIMA(season_length=m, **p),
    "naive": lambda m, **p: Naive(**p),
}


def load(cfg: RunConfig):
    return read_table(cfg)


def prepare(df, cfg: RunConfig):
    """Return the series (columns ds, y), its frequency and its seasonal period."""
    date = cfg.params.get("date", df.columns[0])
    value = cfg.params.get("value") or cfg.target or df.columns[1]
    for col in (date, value):
        if col not in df.columns:
            raise ValueError(f"column '{col}' not in dataset; columns: {', '.join(df.columns)}")
    ts = pd.DataFrame({"ds": pd.to_datetime(df[date]), "y": pd.to_numeric(df[value])})
    ts = ts.dropna().sort_values("ds").reset_index(drop=True)
    freq = cfg.params.get("freq") or pd.infer_freq(ts["ds"])
    if freq is None:
        raise ValueError("cannot infer the frequency; set params.freq (e.g. MS, D, h)")
    letter = freq.lstrip("0123456789")[:1].upper()
    season = int(cfg.params.get("season_length") or SEASON.get(letter, 1))
    return SimpleNamespace(ts=ts, freq=freq, season=season)


def _forecast(ts, freq, season, cfg: RunConfig, h: int) -> pd.DataFrame:
    params = {k: v for k, v in cfg.params.items() if k not in OWN_PARAMS}
    model = MODELS[cfg.model](season, **params)
    sf = StatsForecast(models=[model], freq=freq)
    out = sf.forecast(df=ts.assign(unique_id="s")[["unique_id", "ds", "y"]], h=h, level=[LEVEL])
    name = model.alias
    return pd.DataFrame(
        {
            "ds": out["ds"].to_numpy(),
            "forecast": out[name].to_numpy(),
            "lower": out[f"{name}-lo-{LEVEL}"].to_numpy(),
            "upper": out[f"{name}-hi-{LEVEL}"].to_numpy(),
        }
    )


def fit(X, cfg: RunConfig):
    h = int(cfg.params.get("horizon", HORIZON))
    if len(X.ts) <= 2 * h:
        raise ValueError(f"series has {len(X.ts)} points; need more than 2 x horizon ({h})")
    holdout = _forecast(X.ts.iloc[:-h], X.freq, X.season, cfg, h)  # for metrics only
    future = _forecast(X.ts, X.freq, X.season, cfg, h)
    return SimpleNamespace(h=h, holdout=holdout, future=future)


def evaluate(model, X, cfg: RunConfig) -> dict[str, float]:
    actual = X.ts["y"].to_numpy()[-model.h :]
    err = actual - model.holdout["forecast"].to_numpy()
    metrics = {"mae": float(np.abs(err).mean()), "rmse": float(np.sqrt((err**2).mean()))}
    nonzero = actual != 0
    if nonzero.any():
        metrics["mape"] = float(np.abs(err[nonzero] / actual[nonzero]).mean() * 100)
    return metrics


def report(cfg: RunConfig, model, X, metrics: dict[str, float]) -> Report:
    def day(d) -> str:
        return pd.Timestamp(d).strftime("%Y-%m-%d")

    rows = [{"date": day(d), "history": round(float(y), 4)} for d, y in zip(X.ts["ds"], X.ts["y"])]
    last = rows[-1]["history"]  # join the forecast to the last observation so the lines touch
    rows[-1].update(forecast=last, lower=last, upper=last)
    for r in model.future.itertuples():
        rows.append(
            {
                "date": day(r.ds),
                "forecast": round(float(r.forecast), 4),
                "lower": round(float(r.lower), 4),
                "upper": round(float(r.upper), 4),
            }
        )
    chart = Chart(
        id="forecast",
        kind="line",
        title=f"History and {model.h}-step forecast ({LEVEL}% band)",
        x="date",
        series=[
            Series(key="history", label="History"),
            Series(key="forecast", label="Forecast"),
            Series(key="lower", label=f"Lower {LEVEL}%"),
            Series(key="upper", label=f"Upper {LEVEL}%"),
        ],
        data=rows,
    )
    mape = f", MAPE={metrics['mape']:.1f}%" if "mape" in metrics else ""
    return Report(
        run=cfg.name,
        pipeline=cfg.pipeline,
        model=cfg.model,
        metrics=metrics,
        charts=[chart],
        summary=f"{cfg.model} forecasts {model.h} steps, holdout MAE={metrics['mae']:.2f}{mape}",
    )
