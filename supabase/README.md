## Estado del proyecto Arcade Hub (19/10/2026)

✅ Proyecto Supabase creado y activo en São Paulo (`sa-east-1`).
✅ Migración SQL aplicada y políticas RLS verificadas.
✅ URL y clave **publicable** añadidas al archivo `js/global-ranking-config.js`.
⏳ Comprobar y habilitar **Authentication → Providers → Anonymous Sign-Ins** en el panel de Supabase.
⏳ Fusionar el Pull Request con los cambios de frontend y probar dos navegadores.

---

# Ranking global de Arcade Hub 🌍

El sitio funciona **sin configurar nada**: conserva los récords locales. Cuando actives Supabase, aparecerán los resultados globales de los cuatro juegos al pulsar **🌍 GLOBAL**.

## Configuración inicial

1. Crea un proyecto en [Supabase](https://supabase.com/dashboard) (puedes usar su plan gratuito mientras entre en los límites de uso).
2. Abre **SQL Editor** y ejecuta todo el archivo [schema.sql](schema.sql).
3. En **Authentication → Providers**, habilita **Anonymous Sign-Ins**. No es necesario que los visitantes introduzcan correo electrónico.
4. En **Project Settings → API Keys** (la ubicación exacta depende del panel), copia la **Project URL** y una clave **publishable/anon** pública.
5. Edita `js/global-ranking-config.js`:

```js
window.ARCADE_GLOBAL_CONFIG = {
  url: 'https://TU-PROYECTO.supabase.co',
  publishableKey: 'TU_CLAVE_PUBLICABLE'
};
```

6. Guarda los cambios, publica tu página y abre el selector **🌍 GLOBAL** en cualquier juego.

**Seguridad:** una clave publicable es apta para el navegador; **jamás** pongas en GitHub ni en código cliente la clave `service_role`, una clave secreta `sb_secret_...`, una contraseña de base de datos o un token de administración.

## Funcionamiento

- Ranking **LOCAL**: sigue usando `localStorage`. Funciona sin internet.
- Ranking **GLOBAL**: carga los mejores 10 récords de cada juego de Supabase.
- Cuando termina una partida, guarda el récord local y, si hay configuración y nombre de jugador, también intenta subirlo al ranking global.
- Los jugadores invitados (sin nombre) no publican puntuaciones, aunque pueden consultar el ranking.
- Supabase genera una cuenta anónima por instalación del navegador. Al borrar sus datos o cambiar de equipo el usuario se considera nuevo; un nombre visible no es una cuenta permanente.
- Cada cuenta mantiene su puntuación más alta por juego. Al actualizar no se pierde el mejor récord.
- Si Supabase falla o el visitante está desconectado, los cuatro juegos y los récords locales siguen funcionando.
- Las puntuaciones globales se almacenan de manera pública. Recomienda apodos, no nombres completos.

## Nota antitrampas

Las reglas de acceso (RLS) impiden modificar puntuaciones ajenas y el disparador conserva el récord máximo, **pero el puntaje todavía lo envía el navegador**. Un jugador técnico podría enviarse cifras falsas. Para un ranking competitivo fiable, habría que verificar partidas en un servidor, restringir abusos y activar protección anti-bots/CAPTCHA para registros anónimos.

## Comprobación rápida

- Abre un juego con el nombre de jugador asignado. Puntuación local guardada al finalizar una partida.
- Cambia a **GLOBAL**: deben aparecer los 10 mejores después de que Supabase esté configurado.
- Abre el sitio en otro navegador y comprueba que aparece el mismo ranking.
- Comprueba que un visitante no puede sobrescribir ni borrar los registros de otro jugador.
