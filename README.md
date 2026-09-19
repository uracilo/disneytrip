# Guía Disney

PWA personal para usar caminando en Disneyland: **qué toca ahora**, **qué sigue** y **qué Lightning Lane vigilar** — en segundos, con una sola mano, offline.

**Live:** https://uracilo.github.io/disneytrip/

Itinerario: **sábado 26 de septiembre de 2026** · Disneyland Resort (2 adultos + niña ~2.5 años).

## Cómo usar

```bash
npm install
npm run dev
```

Abre la URL local en el teléfono (misma red) o en el navegador. Para instalar como app: *Compartir → Añadir a pantalla de inicio* (iPhone) o *Instalar app* (Android).

```bash
npm run build
npm run preview
```

## Contenido

El itinerario vive en `src/data/itinerary.ts`. Cambia `date` al día real del viaje (zona Anaheim).

## Funciona offline

Itinerario, buscador, estados, marcar como hecho y navegación no necesitan internet.
