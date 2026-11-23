---
module: data
lane: data
requires: [api]
profile: null
extras:
  - data
  - vision
paths:
  - backend/data
  - backend/api/resources/data_reports
keep_when:
  - the product analyses tabular data, forecasts or classifies images
features:
  - id: tabular
    gives: tabular models on a dataset
    entry: backend/data
    keep_when: the idea predicts from a table
  - id: cluster
    gives: clustering of records
    entry: backend/data
    keep_when: the idea groups similar records
  - id: forecast
    gives: time-series forecasting
    entry: backend/data
    keep_when: the idea predicts future values
  - id: anomaly
    gives: anomaly detection
    entry: backend/data
    keep_when: the idea flags unusual records
  - id: vision
    gives: image embeddings and classification (heavy install)
    entry: backend/data
    keep_when: the idea works on images
  - id: eda
    gives: exploratory data analysis helpers
    entry: backend/data
    keep_when: the team must understand a dataset first
  - id: reports
    gives: run reports served at /api/data/reports/{run}
    entry: backend/api/resources/data_reports
    keep_when: the UI shows analysis results
---

# Data Module

Turns a dataset into a Report (metrics plus Charts) that the UI renders. A run is one YAML file; a pipeline is one plain module. Trained at Build time, committed, served read-only: no live training in the Demo.

Read `registry.py` for the pipeline and model names, `report.py` for the Report and Chart shapes, `runs/_example_*.yaml` for one run per pipeline.

## Commands

| Command | Use it to |
| --- | --- |
| `make data-run run=<name>` | run `runs/<name>.yaml`, write `outputs/<name>/report.json` |
| `make eda CSV=<path>` | open a skrub TableReport for a CSV before choosing a pipeline |
| `make check` | validate every `runs/*.yaml` (`python -m backend.data validate`), no fitting |
| `make add-py pkg=<name> extra=data` | add a dependency to the `[data]` extra (`extra=vision` for the vision pipelines) |

## Pipelines and models

| Pipeline | Models | Reads | Needs |
| --- | --- | --- | --- |
| `tabular` | `hgb`, `random_forest`, `knn`, `logistic` (classification only), `linear` (regression only) | csv, parquet, xlsx; `target:` column | `[data]` |
| `cluster` | `kmeans`, `hdbscan`, `gmm` | table | `[data]` |
| `forecast` | `auto_ets`, `auto_arima`, `naive` | table; `params.date`, `params.value`, `params.horizon` | `[data]` |
| `anomaly` | `isolation_forest`, `lof` | table; `params.contamination` | `[data]` |
| `vision` | `clip-vit-b32` (`task: classify`), `rt-detr` (`task: detect`) | folder of images, one sub-folder per class | `[vision]`, heavy install |

## Run file

```yaml
pipeline: tabular
source: datasets/breast_cancer.csv   # csv, parquet or xlsx under backend/data
target: target
model: hgb
params: {}                           # passed to the model
```

Set exactly one of `source` or `sql`. `sql:` is meant to analyse the app's own Postgres; no pipeline reads it yet, each raises "sql is not supported yet". The first pipeline that needs it implements it in its `load`. Own data goes in `datasets/` (see `datasets/README.md` for licences).

Done when `make check` passes and `outputs/<name>/report.json` exists and is committed. Commit it: `GET /api/data/reports/{run}` serves it. The runner also writes `model.joblib` (and `predictions.csv` for `tabular`), both gitignored, so `api.predict(run, rows)` works for tabular runs. `summary` comes from `summary.build_summary`: a deterministic template, plus `llm.summarize` narration when the run sets `explain: true` and the llm Module is present. `outputs/_example_vision/` is not committed: vision needs the heavy `[vision]` extra and stays off by default.

## Recipes

### Add a model

1. Add the name to the pipeline's tuple in `registry.MODELS`.
2. Add the factory to the `MODELS` dict at the top of `pipelines/<pipeline>.py` (for `vision` it maps the model to its task, `classify` or `detect`).
3. Add the dependency to `[data]` with `make add-py`.
4. Set `model: <name>` in a run file.

Done when `make data-run run=<name>` writes a report with that model.

### Add a pipeline

1. Copy `pipelines/_example.py` to `pipelines/<name>.py`; keep the five signatures `load`, `prepare`, `fit`, `evaluate`, `report`.
2. Add the name to `registry.PIPELINES` and its models to `registry.MODELS`.
3. Add `runs/<name>.yaml`.

Done when the run writes a Report. Any pipeline that returns a Report has the same shape as the others, so the web side needs no change once it renders `/api/data/reports/{run}`.

## Discarded, ready to add

Starting points, not recommendations. Research and Brainstorm pick what fits, including options not listed here. These are not Catalog pieces. Each entry: when to use it, install, registry line (add it with the *Add a model* recipe).

| Option | Use when | Install | Registry line |
| --- | --- | --- | --- |
| xgboost, lightgbm | `hgb` is not accurate enough on a table | `make add-py pkg=xgboost extra=data` | `"xgboost": (XGBClassifier, XGBRegressor, False)` in `tabular.MODELS` and `"xgboost"` in `registry.MODELS["tabular"]` |
| ultralytics YOLO | RT-DETR is too slow or lacks the classes; AGPL, check the event rules first | `make add-py pkg=ultralytics extra=vision` | `"yolo"` in `registry.MODELS["vision"]`, branch on it in `vision.py` |
| timm fine-tuning | the images need a trained classifier; GPU only if the event provides one | `make add-py pkg=timm extra=vision` | `"timm"` in `registry.MODELS["vision"]` |
| classic OpenCV | simple image tasks (colour, edges, template match) | already in `[vision]` | `"opencv"` in `registry.MODELS["vision"]` |
| prophet | `auto_ets` misses holidays or several seasonalities | `make add-py pkg=prophet extra=data` | `"prophet"` in `registry.MODELS["forecast"]` and `forecast.MODELS` |
| sentence-transformers | text embeddings; covered by `llm.embed`, use that first | `make add-py pkg=sentence-transformers extra=data` | none: call `llm.embed` |
| ydata-profiling | a deep profile report beyond `make eda` | `make add-py pkg=ydata-profiling extra=data` | none: call it from `eda.py` |
