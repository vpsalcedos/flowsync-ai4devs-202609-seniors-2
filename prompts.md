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

---

## Prompt 1

**Modelo:** Opus 5.5 (claude-opus-5-5, contexto 1M)
**Herramienta:** Claude Code (CLI)

```
Genera una tabla de trazabilidad con base en los criterios de aceptacion descritos en los escenarios y valida si los test cubren o no o no se sabe cada caso. Vamos SOLAMENTE a trabajar sobre el requisito Requirement: Lo que cada tarea muestra de su responsable que se encuentra en @openspec/specs/tasks/spec.md. Sigue las recomendaciones indicadas en el @README.md, en especial, vas a escribir la tabla en docs/verificacion/vpss.md. Recuerda, no solo el test con el nombre es suficiente para conocer si un scenario esta cubierto. Por otro lado, es importante que indiques si no lo se, que falto para decidirlo.
```

**Qué salió:** Funcionó a la primera: 3 scenarios, 0 cubiertos (no había ningún test de tasks), y detectó leyendo el código que la lista expone el email. No marcó ningún «no lo sé»: las dudas que encontró eran de la spec, no de cobertura.

## Prompt 2

**Modelo:** Opus 5.5 (claude-opus-5-5, contexto 1M)
**Herramienta:** Claude Code (CLI)

```
Con base en el resultado de la matriz de trazabilidad vamos a crear los test de solo el backend que esten alineados con los tres scenarios indicados para el requisito analizado. En este caso, NO realices ningun ajuste en el codigo, por ejemplo ya sabemos que el segundo escenario va a fallar al revisar el codigo. Sin embargo, asegura que todos los test se hayan creado para validar los escenarios que que estos efectivamente lo cubran. Guiate de los test que ya estan desarrollados para auth y el harness o buenas practicas para TS.
```

**Qué salió:** Funcionó: 3 tests en `tests/functional/tasks/assignee.spec.ts`, 2 en verde y 1 en rojo (el del email, como se esperaba). Hizo falta una vuelta para arreglar el typecheck, por los tipos que genera Tuyau.

## Prompt 3

**Modelo:** Opus 5.5 (claude-opus-5-5, contexto 1M)
**Herramienta:** Claude Code (CLI)

```
Bien. Vamos a completar la parte B. 1. Bien aqui hice dos cosas. A ojo imposible pero supuse que estana al menos 2 tests creados. Sin mebargo, luego de revisar rapidamente el codigo vi que nada de task en test se encontraba. Luego de lo obtenido efectivamente se comprobo que ninguno estaba. Si algo, ajusta esta respuesta con base en lo que se pide del enunciado que esta en el @README.md para que quede tal y como se espera. Para los otros puntos crea una respuesta inicial con base en lo que encontraste desde la matriz de trazabilidad y realizando las tareas. Recuerda ser corto.
```

**Qué salió:** Funcionó, pero metió un dato erróneo: puso `SI` como iniciales de `sin-nombre@…` cuando son `SE`. Se descubrió en el prompt siguiente.

## Prompt 4

**Modelo:** Opus 5.5 (claude-opus-5-5, contexto 1M)
**Herramienta:** Claude Code (CLI)

```
Revisando todo, efectivamente el ultimo scenario no es claro en como manejar las iniciales. Pero me queda la duda de que se uso? Como se valido? En principio faltaria una decision que es parte del spec y que vale la pena incluir en el analisis. Por ejemplo decidir que se pone un '-' si es vacio.
```

**Qué salió:** Útil: al cuestionarlo salió que el test 3 solo comprueba un texto no vacío, que con `fullName` de solo espacios las iniciales llegan vacías, y el error `SI`→`SE`. Se añadió al análisis como decisión de spec pendiente.

## Prompt 5

**Modelo:** Opus 5.5 (claude-opus-5-5, contexto 1M)
**Herramienta:** Claude Code (CLI)

```
Bien, vamos a finalizar con el ultimo paso. Que es crear el prompts.md. Sigue lo indicado en @README.md y el formato guia de @prompts.md. Recopila todos los prompts de esta session y describelos en ese archivo. Luego, dime si es posible y puedes crear un subagent o skill en mi personal que me permita recopilar los prompts y para este tipo de ejercicios siempre ir guardando los prompts en ese archivo una vez finalizado un prompt y ejecutado en claude.
```

**Qué salió:** Generó este archivo.
