# Archivo

Pantallas retiradas del flujo, **no borradas**. Se conservan por si hiciera falta recuperar algo.

## Sesión 2026-09-14 — "Sitios por ciudad" sustituido por el planning por ciudad

María cerró el planning definitivo de cada ciudad y pidió que fuera la única información
por ciudad de la app. Estas 4 pantallas eran el sistema anterior: 10 categorías vacías
(cafeterías, restaurantes, tiendas, excursiones, POVs, templos, pandas, pastelerías,
curiosidades, lugares) que había que ir rellenando a mano desde el móvil.

- `PlacesView.tsx` — listado de ciudades → categorías. Sustituido por `src/views/CityPlansView.tsx`.
- `CityWhatToDo.tsx` — menú de categorías de una ciudad. Sustituido por `src/pages/CityPlanDetail.tsx`.
- `CategoryPlaces.tsx` — CRUD de lugares de una categoría (Supabase, tabla `places`).
- `AddPlaceModal.tsx` — modal de alta que usaba `CategoryPlaces`.

⚠️ **La tabla `places` de Supabase NO se ha tocado.** Sigue ahí con sus filas, y
`useVideoTips` la sigue usando para los tips de vídeo (`category='video_tip'`), que no
se han tocado. Si algún día se quiere recuperar esta sección, basta con devolver los
ficheros a su sitio y restaurar las rutas `/que-hacer/...` en `App.tsx`.

## Sesión 2026-09-15 (tarde) — el planning se muda a Plan

María reorganizó la navegación: el planning por ciudad pasa de "Qué hacer" a **Plan**,
el día a día deja de ser sub-pestaña y se abre con un botón de la cabecera de Plan, y
la antigua vista de itinerario por ciudades desaparece.

- `ItineraryView.tsx` — listado de las 10 paradas con fechas y noches, que era
  `/plan/ciudades`. Lo sustituye `CityPlansView` (misma información y además el plan
  de cada ciudad). La ruta vieja redirige a `/plan/planning`.

Cómo queda la navegación:

| Pestaña | Sub-pestañas |
|---|---|
| Plan | `planning` (CityPlansView) · `hoteles` — y botón "Día a día" → `/calendario` |
| Qué hacer | `actividades` · `videos` |

`CalendarView` NO está archivada: sigue viva, ahora dentro de `src/pages/Calendario.tsx`.
