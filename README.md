# 🎮 Arcade Hub

Arcade retro de cuatro minijuegos hecho con HTML, CSS y JavaScript. Funciona como página estática: no requiere instalar Node.js para jugar.

## Juegos

| Juego | Mecánica |
|---|---|
| 🐍 Culebrita | Recoge frutas sin chocar. |
| 🐅 Tigre Selva | Salta obstáculos y gana distancia. |
| 💣 Bomber Man | Escapa de explosiones y avanza de nivel. |
| 🦍 Torre Arcade | Sube escaleras y esquiva los barriles. |

## Empezar a jugar

Abre `index.html` con Live Server en VS Code o publícalo con GitHub Pages.

- `index.html`: menú y los tres primeros juegos.
- `torre.html`: juego de plataformas Torre Arcade.
- `css/style.css`: interfaz retro compartida.
- `js/app.js`: lógica principal y puntuaciones locales.
- `js/games/tigre.js` y `js/games/bomberman.js`: rutinas de inicio de juegos.
- `js/global-ranking.js`: cliente del ranking mundial (opcional).
- `js/global-ranking-config.js`: conexión pública a Supabase.
- `supabase/schema.sql`: tabla, permisos y reglas de seguridad.

## Récords locales y globales

El juego siempre guarda los mejores récords locales por nombre y juego usando `localStorage`.

Con el ranking mundial, el jugador puede cambiar entre **★ LOCAL** y **🌍 GLOBAL**. Para activarlo hay que conectar Supabase siguiendo el archivo [supabase/README.md](supabase/README.md).

Los récords globales no necesitan registro de email: usan cuentas anónimas del navegador. Los invitados sin nombre no envían puntos. La tabla está protegida con reglas por usuario, pero, como el juego corre en el navegador, los récords pueden falsificarse y todavía no constituyen un sistema antitrampas.

## Desarrollo

Trabajamos en ramas y revisamos cambios por Pull Request antes de incorporarlos a `main`.

## 🎧 Banda sonora lo-fi

Arcade Hub genera música original con **Web Audio API**, sin archivos MP3 ni dependencias de audio:
acordes suaves, bajo, percusión relajada, pequeños delays y swing. Cada juego
cuenta con un tempo y una progresión distinta.

- **Menú:** 78 BPM, ambiente chill.
- **Culebrita:** 90 BPM, beat ligero que evoluciona cuando comes frutas.
- **Tigre Selva:** 105 BPM, ritmo con más movimiento al avanzar.
- **Bomber Man:** 96 BPM, atmósfera misteriosa que crece al superar niveles.
- **Torre Arcade:** 86 BPM, groove que acompaña la subida.

La música comienza **después de la primera interacción**, porque los navegadores
no permiten reproducir audio automáticamente al abrir una página. Los botones
**♫ LO-FI ON/OFF** en el menú y en Torre Arcade guardan la preferencia entre
páginas. Se detiene al cambiar de juego, silenciar y ocultar la pestaña; la
de Torre Arcade también se detiene al pausar la partida.

La música y los efectos de juego comparten un AudioContext para ahorrar recursos.
