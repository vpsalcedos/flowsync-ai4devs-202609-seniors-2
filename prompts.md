# Prompts

Aquí van **todos los prompts que lanzaste** para hacer el ejercicio, en el orden en que los
lanzaste, con el modelo y la herramienta de cada uno.

Esto no es papeleo. Lo que se revisa es **cómo pediste las cosas**, no solo lo que salió: un
resultado flojo con un prompt bueno y un resultado flojo con un prompt vago necesitan feedback
distinto, y sin este archivo no se distinguen.

## Cómo rellenarlo

- Un apartado `## Prompt N` por cada prompt.
- **Pega el prompt tal cual lo lanzaste**, dentro del bloque de código, aunque ocupe diez líneas
  y aunque tenga faltas. No lo reescribas para que quede bien: el que arreglaste mentalmente
  después no es el que lanzaste.
- Incluye también los que **no funcionaron**. Suelen ser los más útiles de leer.
- `Modelo` y `Herramienta` en todos. Si cambiaste de una a otra a mitad, se nota aquí.

Borra el ejemplo de abajo cuando escribas el primero.

---

## Prompt 1

**Modelo:** Opus 5.5 (claude-opus-5-5)
**Herramienta:** Claude Code (CLI)

```
Accede al historial de commits del proyecto y resume los ultimos commits.
```

**Qué salió:** funcionó a la primera: resumió los últimos 14 commits agrupados por tema y señaló el `422` de `GET /tasks` que sigue sin corregir.

## Prompt 2

**Modelo:** Opus 5.5 (claude-opus-5-5)
**Herramienta:** Claude Code (CLI)

```
Vamos a crear la tabla de auditoria, contrastando las regalse de proceso que se encuentran en @CLAUDE.md versus los ultimos 15 commits. Las instrucciones se encuentran en @README.md. La tabla debe contener las columnas: Qué pide la regla, Qué se revisó para comprobarla, Veredicto, Evidencia y Qué harías con ella. Esto debe quedar consolidado en docs/auditoria/vpss.md. Importante, NO vayas a modificar ningun achivo o correguir una tarea.
```

**Qué salió:** creó la tabla con 7 reglas (1 se cumple, 6 no se pueden comprobar) sin tocar otros archivos. Al principio leyó la regla 2 como «no se cumple» y luego la bajó a «no se puede comprobar». Dejó la Parte B en blanco.

## Prompt 3

**Modelo:** Opus 5.5 (claude-opus-5-5)
**Herramienta:** Claude Code (CLI)

```
Ajusta un poco los textos de la tabla, resulta que cambiaron un poco en el enunciado final. Te agrego el texto y descripcion de cada columna para que lo ajustes sobre el documento que ya se creo de auditoria. 

Qué pide la regla. Resúmela en una frase y con tus propias palabras. Si necesitas varias frases, puede que estés mezclando más de una regla.

Qué se revisó para comprobarla. Indica el comando ejecutado o el archivo consultado. Sin esta información no hay forma de saber en qué se apoya el veredicto.

Veredicto. Solo puede ser se cumple, no se cumple o no se puede comprobar con la información disponible. Este último caso también es un resultado válido. Significa que la regla no deja suficiente evidencia para verificarla.

Evidencia. Escríbela en una línea. Si la regla no se cumple, indica dónde se incumple. Si no se puede comprobar, explica qué información falta.

Qué harías con ella. Elige una opción: dejarla, borrarla o convertirla en una comprobación automática.
```

**Qué salió:** funcionó a la primera: cambió el texto del veredicto y de la acción, dejó la evidencia en una línea y no tocó los veredictos de fondo.

## Prompt 4

**Modelo:** Opus 5.5 (claude-opus-5-5)
**Herramienta:** Claude Code (CLI)

```
Vamos a trabajar sobre la respuesta de la parte B. Primer punto. En realidad mi expectativa fue bastante lejana a lo encontrado. Por ejemplo, yo pensaba que la regla de las ramas y de los updates en la documentacion no se estaban cumpliendo. Por el contrario crei que si se estaba cumpliendo lo del commit. Las otras dos las pense como "ni idea". En ese orden de idea, mi respuestas fue mas de impresion dando un vistado rapido de los commits. Por supuerto no fui a fondo.
```

**Qué salió:** redactó la línea 1 a partir de mi apuesta, con la regla 4 como la que más se separó. Después yo cambié a mano «ramas» por «reglas».

## Prompt 5

**Modelo:** Opus 5.5 (claude-opus-5-5)
**Herramienta:** Claude Code (CLI)

```
Sigamos con el punto 2. Una regla que no se puede comprobar con la informacion es la regla del adversarial reviewer. En este caso es importante saber que esta regla toca cambiarla o reformularla para que sea claro que el output quede en la PR y no se pierda en el chat. Igualmente yo pensaria en convertirla en una comprobacion automatica en el pipeline. Puesto que es algo que aplica a todos los procesos y no es algo solo local que se pueda poner en un hook.
```

**Qué salió:** funcionó a la primera: escribió la línea 2 con mis dos ideas (que el informe quede en el PR y convertirla en un job de CI en vez de un hook).

## Prompt 6

**Modelo:** Opus 5.5 (claude-opus-5-5)
**Herramienta:** Claude Code (CLI)

```
Sigamos con el punto 3, la regla que borraría. En este caso creo que seria la ultima regla. Esta involucra la respuesta de la URL del PR. Incluso esto para mi va mas en un prompt aparte de un skill o como un hook de crear una PR. No como una regla. Pero definitivamente esto no aporta mucho al proceso y muy seguramente deja de ser algo relevante para los desarrolladores que incluso aporta mas carga.
```

**Qué salió:** funcionó a la primera: escribió la línea 3 con la regla 7 y la colocó en el grupo de las que nadie comprueba y a nadie le importan.

## Prompt 7

**Modelo:** Opus 5.5 (claude-opus-5-5)
**Herramienta:** Claude Code (CLI)

```
/registrar-prompts
```

**Qué salió:** registró los prompts 1 a 6 desde el transcript, pero se dejó fuera su propia invocación, porque la skill decía que había que descartarla.