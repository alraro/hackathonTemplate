"""anomaly pipeline: flag unusual records, unsupervised."""

from types import SimpleNamespace

import numpy as np
from sklearn.decomposition import PCA
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from skrub import TableVectorizer

from backend.data.config import RunConfig
from backend.data.report import Chart, Report, Series
from backend.data.tables import read_table

SEED = 0
CONTAMINATION = 0.05  # expected share of outliers; override with params.contamination
TOP = 10

# short name -> factory taking the contamination share
MODELS = {
    "isolation_forest": lambda c, **p: IsolationForest(contamination=c, random_state=SEED, **p),
    "lof": lambda c, **p: LocalOutlierFactor(contamination=c, **p),
}


def load(cfg: RunConfig):
    return read_table(cfg)


def prepare(df, cfg: RunConfig):
    if cfg.target and cfg.target in df.columns:
        df = df.drop(columns=cfg.target)
    Z = make_pipeline(TableVectorizer(), StandardScaler()).fit_transform(df)
    return np.asarray(Z, dtype=float)


def fit(X, cfg: RunConfig):
    params = dict(cfg.params)
    contamination = float(params.pop("contamination", CONTAMINATION))
    est = MODELS[cfg.model](contamination, **params)
    labels = np.asarray(est.fit_predict(X))  # -1 outlier, 1 normal
    raw = est.negative_outlier_factor_ if cfg.model == "lof" else est.score_samples(X)
    return SimpleNamespace(outlier=labels == -1, scores=-np.asarray(raw))  # higher = more unusual


def evaluate(model, X, cfg: RunConfig) -> dict[str, float]:
    n = int(model.outlier.sum())
    return {"records": float(len(X)), "outliers": float(n), "outlier_rate": n / len(X)}


def report(cfg: RunConfig, model, X, metrics: dict[str, float]) -> Report:
    xy = PCA(n_components=2, random_state=SEED).fit_transform(X)
    scatter = Chart(
        id="pca",
        kind="scatter",
        title="PCA 2D projection, outliers flagged",
        x="pc1",
        series=[Series(key="normal", label="Normal"), Series(key="outlier", label="Outlier")],
        data=[
            {"pc1": round(float(p[0]), 4), ("outlier" if o else "normal"): round(float(p[1]), 4)}
            for p, o in zip(xy, model.outlier)
        ],
    )
    top = np.argsort(model.scores)[::-1][:TOP]
    scores = Chart(
        id="top_scores",
        kind="bar",
        title=f"Top {len(top)} anomaly scores (higher = more unusual)",
        x="record",
        series=[Series(key="score", label="Anomaly score")],
        data=[{"record": f"#{int(i)}", "score": round(float(model.scores[i]), 4)} for i in top],
    )
    return Report(
        run=cfg.name,
        pipeline=cfg.pipeline,
        model=cfg.model,
        metrics=metrics,
        charts=[scatter, scores],
        summary=f"{cfg.model} flagged {int(metrics['outliers'])} of {int(metrics['records'])} records "
        f"({metrics['outlier_rate']:.1%})",
    )
