import { http, HttpResponse } from "msw"
import { fixtureFor } from "./api"

// Fixtures mode: serve the committed example reports.
export const handlers = [
  http.get("/api/data/reports/:run", ({ params }) => {
    const report = fixtureFor(String(params.run))
    return report ? HttpResponse.json(report) : HttpResponse.json({ detail: "No report" }, { status: 404 })
  }),
]
