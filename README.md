# Neon Chronik

## Start

```bash
python -m http.server 8000
```

Danach `http://localhost:8000` im Browser öffnen.

## Features

- Parallax-Engine mit drei Layern
- Reveal-Animationen mit Blur → Sharp
- Minimap-Navigation mit Scrollspy
- Scroll-Progress-Bar
- Reduce-Motion-Modus

## Barrierefreiheit & Motion

Die Timeline respektiert `prefers-reduced-motion`. Über den Toggle im Header kann die Motion zusätzlich manuell
überschrieben werden; die Einstellung wird in `localStorage` gespeichert.
