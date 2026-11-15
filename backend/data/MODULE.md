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
