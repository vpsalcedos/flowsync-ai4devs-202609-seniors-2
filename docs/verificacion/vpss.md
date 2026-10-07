# Verificación: «Lo que cada tarea muestra de su responsable»

Requisito de `openspec/specs/tasks/spec.md` (líneas 97-114).

- **Scenarios del requisito:** 3
- **Cubiertos:** 0 (al analizar la suite existente)

La matriz de abajo es la del análisis, antes de escribir ningún test. Los tests que se añadieron después están en la sección siguiente.

## Matriz de trazabilidad

| # | Scenario (en una línea) | Prueba que lo cubre (nombre en la suite) | Estado | Si «no lo sé»: qué faltó · notas |
|---|---|---|---|---|
| 1 | Si el responsable se llama "Ada Lovelace", el `assignee` de la tarea trae ese nombre y sus iniciales | — (ninguna) | No cubierto | No hay ningún test en `tests/functional/tasks/`. Lo que más se parece, `Auth \| iniciales › un nombre de dos palabras da la inicial de cada una`, afirma `initials === 'AL'` sobre `data.user` del **login**, no sobre el `assignee` de una tarea: prueba el getter, no que la tarea lo exponga. «Esos datos bastan para saber quién la lleva» no se puede afirmar con un test (dos cuentas homónimas darían el mismo nombre e iniciales). |
| 2 | Ninguna tarea, suelta o en la lista, trae en su `assignee` el email ni otros datos de acceso | — (ninguna) | No cubierto | Ningún test pide una tarea. Lo que se parece, `Auth \| registro › la contraseña nunca sale en la respuesta`, mira el `user` del signup, no el de una tarea. Leyendo el código, un test pondría rojo: `GET /tasks`, `POST /tasks` y `PATCH /tasks/:id/status` usan `TaskTransformer` → `UserTransformer`, que hace `pick` de `email`; solo `GET /tasks/:id` y `PUT …/due-date` usan `TaskAssigneeTransformer` (`id`, `fullName`, `initials`). La spec no dice qué cuenta como «otro dato de acceso» (¿`createdAt`/`updatedAt` de la cuenta? ¿el `id`?). |
| 3 | Si el responsable se registró sin nombre, su nombre llega `null` y sus iniciales siguen llegando | — (ninguna) | No cubierto | Se parecen `Auth \| registro › una cuenta puede quedarse sin nombre` (afirma `fullName` nulo en el signup) y `Auth \| iniciales › sin nombre, las iniciales salen del email` (afirma `'AE'` en el login), pero ninguno mira el `assignee` de una tarea. Además, las iniciales sin nombre **se derivan del email** (`User.initials`): la spec pide que la interfaz lo represente «sin recurrir a su email», y no decide si unas iniciales sacadas del email cumplen eso o ya son una fuga parcial. |

## Tests añadidos (parte A.2)

Fichero: `backend/tests/functional/tasks/assignee.spec.ts`, grupo `Tasks | responsable`. Hay un test por scenario. En los tres, quien pide la tarea es una cuenta distinta del responsable.

| # | Test | Qué afirma | Resultado |
|---|---|---|---|
| 1 | `Tasks \| responsable › el responsable llega con su nombre y sus iniciales` | `assignee.fullName === 'Ada Lovelace'` y `assignee.initials === 'AL'`, en `GET /tasks` y en `GET /tasks/:id` | ✔ verde |
| 2 | `Tasks \| responsable › el responsable de una tarea no expone el email ni datos de acceso` | En las 5 respuestas que devuelven una tarea (`POST /tasks`, `GET /tasks`, `GET /tasks/:id`, `PATCH …/status`, `PUT …/due-date`), el `assignee` no tiene la clave `email`, ningún valor con el email, ni `password` o `token` | ✖ **rojo**: fuga en `POST /tasks`, `GET /tasks` y `PATCH …/status`. No se ha tocado el código |
| 3 | `Tasks \| responsable › un responsable sin nombre llega con el nombre nulo y con iniciales` | La clave `fullName` está presente y vale `null`, e `initials` es un texto no vacío, en `GET /tasks` y en `GET /tasks/:id` | ✔ verde |

Ejecución (`node ace test`): **22 passed, 1 failed (23)**.

El test 3 está en verde, pero solo comprueba que `initials` sea un texto no vacío. No comprueba el valor ni el formato, y solo prueba `fullName: null`.

## Decisión de spec pendiente: iniciales sin nombre utilizable

Hoy las iniciales las calcula `User.initials` siguiendo la spec de `auth` («Iniciales de la cuenta»): salen del nombre si lo hay y, si no, del email. Al aplicar esa regla a casos que ningún scenario contempla, se obtiene esto:

| `fullName` | email | `initials` hoy |
|---|---|---|
| `null` | `sin-nombre@example.com` | `SE` |
| `""` | `ab@y.com` | `AY` (se usa el email) |
| `"   "` | `x@y.com` | `""` (vacío) |
| `" Ada"` | `x@y.com` | `""` (vacío) |

El registro acepta esos nombres, porque `fullName` no se recorta ni tiene longitud mínima. En los dos últimos casos se incumplen a la vez la spec de `auth` («dos letras mayúsculas») y el scenario de tareas («sus iniciales siguen llegando»), y el test 3 no lo detecta porque solo prueba `null`.

Falta que la spec decida, no el test:
- **Valor de reserva.** Qué se envía cuando no se pueden calcular iniciales. Por ejemplo, `"-"`, y en ese caso nunca un texto vacío.
- **Nombre en blanco.** Si un `fullName` solo de espacios cuenta como «sin nombre», es decir, si se recorta y se convierte en `null` al registrarse.
- **Uso del email.** Si sacar las iniciales del email cuenta como «recurrir a su email». Si es así, el valor de reserva valdría también para `fullName: null`.

Mientras no se decida, el test 3 no puede afirmar un valor concreto sin inventarse la regla.

## Las tres líneas (parte B)

1. **Cubiertos antes de mirar / cubiertos de verdad:** 2 / 0
2. **Hueco de test o hueco de spec:** «Responsable sin nombre». Sin nombre, las iniciales se calculan a partir del email (`sin-nombre@example.com` → `SE`: la inicial del usuario y la del dominio), y la spec pide representar a esa cuenta «sin recurrir a su email» pero no dice si eso ya es recurrir a él: un test no puede decidirlo por la spec.
3. **Lo que el scenario no decidía y tuve que decidir yo:** qué es «un dato de acceso». Tomé email, contraseña y token, y dejé pasar el `id` de la cuenta. El requisito dice «ningún otro dato»: leído al pie de la letra, también fallaría `GET /tasks/:id`, que hoy pasa.
