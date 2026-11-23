# Datasets

Small offline datasets for the example runs. Each is under 1 MB.

| File | Used by | Source | Licence |
| --- | --- | --- | --- |
| `breast_cancer.csv` | `runs/_example_tabular.yaml` | UCI Breast Cancer Wisconsin (Diagnostic), via `sklearn.datasets.load_breast_cancer`. `target` is `malignant` or `benign`. | CC BY 4.0 |
| `wine.csv` | `runs/_example_cluster.yaml` | UCI Wine, via `sklearn.datasets.load_wine`. Class label dropped. | CC BY 4.0 |

To use your own data, drop a CSV, parquet or xlsx here and point `source:` at `datasets/<file>` in a new `runs/<name>.yaml`.
