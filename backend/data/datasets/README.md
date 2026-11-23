# Datasets

Small offline datasets for the example runs. Each is under 1 MB.

| File | Used by | Source | Licence |
| --- | --- | --- | --- |
| `breast_cancer.csv` | `runs/_example_tabular.yaml` | UCI Breast Cancer Wisconsin (Diagnostic), via `sklearn.datasets.load_breast_cancer`. `target` is `malignant` or `benign`. | CC BY 4.0 |
| `wine.csv` | `runs/_example_cluster.yaml` | UCI Wine, via `sklearn.datasets.load_wine`. Class label dropped. | CC BY 4.0 |
| `monthly_sales.csv` | `runs/_example_forecast.yaml` | Synthetic, seeded: 96 monthly points with trend and yearly seasonality. Columns `date`, `sales`. | CC0 |
| `transactions.csv` | `runs/_example_anomaly.yaml` | Synthetic, seeded: 300 shop transactions with 15 injected outliers. | CC0 |
| `vision_sample/` | `runs/_example_vision.yaml` | Synthetic, generated with a seeded Pillow script: 20 images, 10 `circle` and 10 `square`. | CC0 |

To use your own data, drop a CSV, parquet or xlsx here and point `source:` at `datasets/<file>` in a new `runs/<name>.yaml`.
