"""tabular pipeline: classification or regression, detected from the target column."""

from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import (
    HistGradientBoostingClassifier,
    HistGradientBoostingRegressor,
    RandomForestClassifier,
    RandomForestRegressor,
)
from sklearn.inspection import permutation_importance
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    mean_absolute_error,
    r2_score,
)
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from skrub import TableVectorizer

from backend.data.config import DATA_DIR, RunConfig, source_path
from backend.data.report import Chart, Report, Series

# short name -> (classifier factory, regressor factory, needs scaling)
MODELS = {
    "hgb": (HistGradientBoostingClassifier, HistGradientBoostingRegressor, False),
    "random_forest": (RandomForestClassifier, RandomForestRegressor, False),
    "logistic": (LogisticRegression, LinearRegression, True),
    "linear": (LogisticRegression, LinearRegression, True),
    "knn": (KNeighborsClassifier, KNeighborsRegressor, True),
}
SEED = 0


def read_table(cfg: RunConfig) -> pd.DataFrame:
    """Read cfg.source (csv, parquet or xlsx) into a DataFrame."""
    path: Path | None = source_path(cfg)
    if path is None:
        raise ValueError("this pipeline reads 'source' files only; 'sql' is not supported yet")
    if not path.is_file():
        raise ValueError(f"source '{cfg.source}' not found under {DATA_DIR}")
    readers = {".csv": pd.read_csv, ".parquet": pd.read_parquet, ".xlsx": pd.read_excel}
    if path.suffix not in readers:
        raise ValueError(f"source type '{path.suffix}' unsupported; use csv, parquet or xlsx")
    return readers[path.suffix](path)


def load(cfg: RunConfig):
    return read_table(cfg)


def is_classification(y: pd.Series) -> bool:
    if not pd.api.types.is_numeric_dtype(y) or pd.api.types.is_bool_dtype(y):
        return True
    return y.nunique() <= 10 and bool((y.dropna() % 1 == 0).all())


def prepare(df, cfg: RunConfig):
    if not cfg.target or cfg.target not in df.columns:
        raise ValueError(f"set 'target' to a column of the source: {', '.join(map(str, df.columns))}")
    df = df.dropna(subset=[cfg.target])
    X, y = df.drop(columns=cfg.target), df[cfg.target]
    clf = is_classification(y)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=SEED, stratify=y if clf else None
    )
    return {"clf": clf, "X_train": X_train, "X_test": X_test, "y_train": y_train, "y_test": y_test}


def fit(X, cfg: RunConfig):
    make_clf, make_reg, scale = MODELS[cfg.model]
    params = dict(cfg.params)
    if cfg.model in ("hgb", "random_forest"):
        params.setdefault("random_state", SEED)
    steps = [TableVectorizer()] + ([StandardScaler()] if scale else [])
    est = (make_clf if X["clf"] else make_reg)(**params)
    return make_pipeline(*steps, est).fit(X["X_train"], X["y_train"])


def evaluate(model, X, cfg: RunConfig) -> dict[str, float]:
    pred = model.predict(X["X_test"])
    y = X["y_test"]
    if X["clf"]:
        return {
            "accuracy": float(accuracy_score(y, pred)),
            "f1_macro": float(f1_score(y, pred, average="macro")),
        }
    return {"r2": float(r2_score(y, pred)), "mae": float(mean_absolute_error(y, pred))}


def report(cfg: RunConfig, model, X, metrics: dict[str, float]) -> Report:
    y, pred = X["y_test"], model.predict(X["X_test"])
    imp = permutation_importance(model, X["X_test"], y, n_repeats=5, random_state=SEED, n_jobs=1)
    top = np.argsort(imp.importances_mean)[::-1][:10]
    cols = X["X_test"].columns
    charts = [
        Chart(
            id="importance",
            kind="bar",
            title="Permutation importance (top 10)",
            x="feature",
            series=[Series(key="importance", label="Importance")],
            data=[
                {"feature": str(cols[i]), "importance": round(float(imp.importances_mean[i]), 5)}
                for i in top
            ],
        )
    ]
    if X["clf"]:
        labels = sorted(y.unique(), key=str)
        cm = confusion_matrix(y, pred, labels=labels)
        charts.append(
            Chart(
                id="confusion",
                kind="bar",
                title="Confusion matrix (rows: actual, series: predicted)",
                x="actual",
                series=[Series(key=f"pred_{c}", label=f"Predicted {c}") for c in labels],
                data=[
                    {"actual": str(a), **{f"pred_{p}": int(cm[i, j]) for j, p in enumerate(labels)}}
                    for i, a in enumerate(labels)
                ],
            )
        )
        task = "classification"
    else:
        charts.append(
            Chart(
                id="actual_vs_predicted",
                kind="scatter",
                title="Actual vs predicted",
                x="actual",
                series=[Series(key="predicted", label="Predicted")],
                data=[
                    {"actual": round(float(a), 4), "predicted": round(float(p), 4)}
                    for a, p in zip(y, pred)
                ],
            )
        )
        task = "regression"
    shown = ", ".join(f"{k}={v:.3f}" for k, v in metrics.items())
    return Report(
        run=cfg.name,
        pipeline=cfg.pipeline,
        model=cfg.model,
        metrics=metrics,
        charts=charts,
        summary=f"{task} on '{cfg.target}' with {cfg.model}: {shown}",
    )
