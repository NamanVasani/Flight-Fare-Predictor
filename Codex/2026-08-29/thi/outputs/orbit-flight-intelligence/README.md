# ORBIT — Flight Intelligence

A premium React/Vite flight-fare frontend with a cinematic opening, coordinate-driven SVG route animation, responsive form experience, and a model-safe prediction boundary.

## Run locally

```bash
npm install
npm run dev
```

Create a deployment build with:

```bash
npm run build
```

## Connect the ML models

The UI intentionally does **not** invent a price or price category. Update `src/predictionService.ts` when the backend is ready. Its `predictFlight()` function receives:

```ts
{ from, to, date, departureTime, arrivalTime, airline, stops, cabin }
```

It must return:

```ts
{ fare: number, category: "Low" | "Medium" | "High" | "Premium", insight?: string }
```

The route visualization is driven by the city coordinates in `src/App.tsx`; add any extra supported cities there. The UI respects `prefers-reduced-motion` and uses SVG/CSS instead of a heavyweight globe or 3D engine.
