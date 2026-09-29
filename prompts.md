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

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Se quiere recrear el spec de todo el modulo de cuentas y acceso del proyecto tanto a nivel de BE como FE. Para ello, lo inicial sera explorar el codigo existente e identificar lo que existe en cuando a BE: ruta, controladores, modelo de usuario, validadores y middlewares. Por su parte en el FE es necesario identificar: pantallas de acceso, estado de la asesion y proteccion de rutas. De esto es necesario entender y tener claro el proposito de cada capability identificada y los requerimientos que el sistema SHALL hacer algo. Luego identificar los escenarios de estilo When-THEN. Primero vamos a comenzar con la exploracion y un breve documento para entender lo que esta del sistema solo en el modulo especificado.
```

**Qué salió:** funcionó a la primera: inventario de BE/FE, 7 capabilities, requisitos candidatos y primeras dudas en un documento de exploración fuera del repo.

## Prompt 2

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
escribe la spec en docs/spec-viva/vpss.md con los escenarios WHEN/THEN y la estructura descrita en el README. Es importante no profundizar a nivel de clases o ficheros. Seguir una estructura de spec que nos permita entender bien las capabilities, requirments asociados y sus escenarios.
```

**Qué salió:** funcionó a la primera: 7 capabilities, 26 requisitos y 52 escenarios, sin nombres de clases ni ficheros.

## Prompt 3

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Para la parte B del documento de spec completa los requisitos escritos y comprobados con lo siguiente. Se revisaron y confirmaron: Alta de cuenta con datos válidos, Nombre opcional pero presente, Email único y bien formado, Contraseña con longitud acotada y confirmada, Emisión de token con credenciales correctas.
```

**Qué salió:** funcionó a la primera: 26 escritos, 5 comprobados.

## Prompt 4

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
En la parte 2 Incoherencias que aparecieron al escribirla. Escribe que se encontraron por lo menos 3 insonsistencias que fueron comprobadas. La principal es que auqnue se tiene un mismo archivo de validacion user dentro la validacion de la contraseña es distinta para un login o signup. En pocas palabras: El login no limita la longitud de la contraseña y el registro sí. Otro caso curioso encontrado por la IA y confirmado es como se manejan las iniciales ya que existe un split curioso si no tenemos fullName por el arroba, sin embargo esto no tiene consistencia. Otro identificado es que logout no tiene una forma comun de devolver la respusta comparada con las demas: El logout sin envoltorio data.
```

**Qué salió:** funcionó a la primera.

## Prompt 5

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Agrega a la parte dos que, igualmente en una exploracion inicial se encontraron mas inconsistencias: Signup responde 200, no 201, 

passwordConfirmation lleva también reglas 8–32: una confirmación corta produce error de longitud en vez de "no coinciden".
Cualquier 400 se traduce a "credenciales incorrectas" en el front, venga de donde venga.
Tokens sin caducidad: el mensaje "Tu sesión ha caducado" se muestra, pero el backend no hace caducar nada (solo no-verificable sin esperar/ejecutar).
Backend caído al recargar: se conserva el token pero se manda al login como anónimo; si la persona vuelve a entrar se genera otro token y el viejo queda huérfano.
sessionError solo se pinta en /login, no en /register.
Sin límite de intentos de login.
CORS en producción no admite ningún origen (CORS_ORIGIN comentado y sin usar).
Guard web (sesión) configurado y sin uso; la cookie de sesión se emite igualmente.

. Sin embargo, no pude revisar todos los casos
```

**Qué salió:** funcionó: se añadieron como bloque aparte marcado «sin comprobar», reformulando los nombres internos en términos observables.

## Prompt 6

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Finalmente, para el tercer punto: Lo que no supe decidir si era bug o contrato. Lo de las iniciales definitivamente no me queda claro. Pero pensaria que es mas un hueco y una definicion mal hecha que no estaba en el contrato. Sobre otros puntos, me queda la duda si el contrato hablamos de producto o ya decisiones tecnicas que faltaron en el spce. Por ejemplo, pensaria que otra que no es clara es el tipo de respuesta que queremos en registro y el token sin caducidad, suena mas como un riesgo de seguridad.
```

**Qué salió:** funcionó a la primera: tres puntos con sus dos lecturas y la duda de fondo producto vs. técnica.

## Prompt 7

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Por ultimo, necesito que llenes el @../../../../../prompts.md con todos los prompts de esta conversacion y el formato que se solicita de ese documento
```

**Qué salió:** este archivo.
