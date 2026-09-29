# Spec viva: cuentas y acceso

Comportamiento **actual** del vertical de cuentas y acceso de FlowSync, en sus dos capas: la API (lo que se pide y lo que se responde) y la interfaz (lo que una persona ve y puede hacer). Se organiza en siete capabilities, cada una con su propósito, sus requisitos y sus escenarios.

Convenciones que aplican a toda la spec:

- Todas las rutas de la API cuelgan del prefijo `/api/v1`.
- «Respuesta envuelta» significa que el cuerpo es un objeto JSON con el contenido bajo la clave `data`.
- «Error de validación» significa una respuesta `422` cuyo cuerpo tiene una lista `errors`, donde cada elemento indica al menos el campo afectado, la regla incumplida y un mensaje.
- «Usuario público» es la representación de un usuario que devuelve la API: `id`, `fullName`, `email`, `createdAt`, `updatedAt` e `initials`.

---

# Capability: Registro de cuenta

## Purpose

Permitir que una persona sin cuenta se registre en FlowSync con su email y una contraseña, y que salga del registro ya con la sesión iniciada.

## Requirements

### Requirement: Alta de cuenta con datos válidos

La API SHALL crear una cuenta cuando recibe un email válido y no registrado, una contraseña de entre 8 y 32 caracteres y una confirmación idéntica, y SHALL responder con el usuario público y un token de acceso listo para usar.

#### Scenario: Registro correcto con nombre

- **WHEN** se envía `POST /auth/signup` con `fullName: "Ada Lovelace"`, un email no registrado, `password` de 8 a 32 caracteres y `passwordConfirmation` igual a `password`
- **THEN** la respuesta es `200` y envuelta, con `user` (el usuario público, con `fullName: "Ada Lovelace"`) y `token` (una cadena)

#### Scenario: El token del registro ya da acceso

- **WHEN** tras un registro correcto se pide `GET /account/profile` con el token recibido como `Authorization: Bearer <token>`
- **THEN** la respuesta es `200` con el usuario recién creado

### Requirement: Nombre opcional pero presente

La API SHALL aceptar `fullName` con valor `null`, y SHALL rechazar la petición si la clave `fullName` no se envía.

#### Scenario: Registro sin nombre

- **WHEN** se envía `POST /auth/signup` con `fullName: null` y el resto de datos válidos
- **THEN** la respuesta es `200` y el usuario público tiene `fullName: null`

#### Scenario: Falta la clave del nombre

- **WHEN** se envía `POST /auth/signup` sin la clave `fullName` y el resto de datos válidos
- **THEN** la respuesta es un error de validación sobre `fullName` con la regla `required`, y no se crea la cuenta

### Requirement: Email único y bien formado

La API SHALL rechazar el registro con un error de validación sobre `email` si el email no tiene formato válido, supera los 254 caracteres o ya pertenece a una cuenta.

#### Scenario: Email ya registrado

- **WHEN** se envía `POST /auth/signup` con un email que ya existe
- **THEN** la respuesta es un error de validación sobre `email` con la regla `database.unique`, y no se crea una segunda cuenta

#### Scenario: Email con formato inválido

- **WHEN** se envía `POST /auth/signup` con `email: "no-es-un-email"`
- **THEN** la respuesta es un error de validación sobre `email` con la regla `email`

### Requirement: Contraseña con longitud acotada y confirmada

La API SHALL exigir una contraseña de entre 8 y 32 caracteres y una `passwordConfirmation` idéntica a ella.

#### Scenario: Contraseña demasiado corta

- **WHEN** se envía `POST /auth/signup` con una `password` de 7 caracteres
- **THEN** la respuesta es un error de validación sobre `password` con la regla `minLength`

#### Scenario: Contraseña demasiado larga

- **WHEN** se envía `POST /auth/signup` con una `password` de 33 caracteres
- **THEN** la respuesta es un error de validación sobre `password` con la regla `maxLength`

#### Scenario: La confirmación no coincide

- **WHEN** se envía `POST /auth/signup` con una `password` válida y una `passwordConfirmation` distinta, también de entre 8 y 32 caracteres
- **THEN** la respuesta es un error de validación sobre `passwordConfirmation` con la regla `sameAs`

### Requirement: La contraseña nunca se expone

La API SHALL omitir la contraseña, en claro o cifrada, de cualquier representación de un usuario.

#### Scenario: Respuesta de registro sin contraseña

- **WHEN** un registro se completa correctamente
- **THEN** el objeto `user` de la respuesta no contiene ninguna clave `password`

### Requirement: Pantalla de registro

La interfaz SHALL ofrecer en `/register` un formulario con nombre completo (marcado como opcional), email, contraseña (con la pista «Entre 8 y 32 caracteres.») y repetición de la contraseña, más un enlace a la pantalla de inicio de sesión.

#### Scenario: Registro correcto desde la pantalla

- **WHEN** una persona sin sesión rellena el formulario con datos válidos y pulsa «Crear cuenta»
- **THEN** el botón muestra «Creando cuenta…» y queda deshabilitado mientras espera, y al terminar la persona llega a su perfil con la sesión iniciada

#### Scenario: Nombre en blanco

- **WHEN** la persona deja el nombre vacío o solo con espacios y se registra
- **THEN** la cuenta se crea sin nombre

#### Scenario: Contraseñas distintas detectadas antes de enviar

- **WHEN** la persona escribe dos contraseñas diferentes y pulsa «Crear cuenta»
- **THEN** bajo «Repite la contraseña» aparece «Las contraseñas no coinciden.», y no se envía nada al servidor

#### Scenario: Email ya registrado desde la pantalla

- **WHEN** la persona intenta registrarse con un email que ya tiene cuenta
- **THEN** bajo el campo de email aparece «Ese email ya está registrado. Inicia sesión en su lugar.» y la persona sigue en `/register`

#### Scenario: Ir a iniciar sesión

- **WHEN** la persona pulsa «Inicia sesión» bajo el formulario
- **THEN** llega a `/login`

---

# Capability: Inicio de sesión

## Purpose

Permitir que una persona con cuenta demuestre quién es con su email y su contraseña, y obtenga un token con el que la API la reconozca.

## Requirements

### Requirement: Emisión de token con credenciales correctas

La API SHALL responder con el usuario público y un token nuevo cuando el email y la contraseña corresponden a una cuenta existente. Cada inicio de sesión SHALL generar un token distinto.

#### Scenario: Login correcto

- **WHEN** se envía `POST /auth/login` con el email y la contraseña de una cuenta existente
- **THEN** la respuesta es `200` y envuelta, con `user` (el usuario público) y `token`

#### Scenario: Dos logins, dos tokens

- **WHEN** la misma cuenta inicia sesión dos veces seguidas
- **THEN** cada respuesta trae un token diferente, y los dos dan acceso a la vez

### Requirement: Rechazo de credenciales incorrectas sin revelar la causa

La API SHALL responder `400` con el mismo tipo de error tanto si el email no existe como si la contraseña es incorrecta.

#### Scenario: Contraseña incorrecta

- **WHEN** se envía `POST /auth/login` con un email existente y una contraseña que no es la suya
- **THEN** la respuesta es `400` con una lista `errors` que contiene un mensaje, y no incluye token

#### Scenario: Email inexistente

- **WHEN** se envía `POST /auth/login` con un email que no pertenece a ninguna cuenta
- **THEN** la respuesta es la misma que con una contraseña incorrecta: `400`, sin token

### Requirement: Validación de forma antes de comprobar credenciales

La API SHALL rechazar con un error de validación un login cuyo email no tenga formato válido o cuya contraseña falte. No SHALL aplicar límites de longitud a la contraseña en el login.

#### Scenario: Email mal formado en el login

- **WHEN** se envía `POST /auth/login` con `email: "ada"` y cualquier contraseña
- **THEN** la respuesta es un error de validación sobre `email`

#### Scenario: Falta la contraseña

- **WHEN** se envía `POST /auth/login` con un email válido y sin `password`
- **THEN** la respuesta es un error de validación sobre `password` con la regla `required`

### Requirement: Pantalla de inicio de sesión

La interfaz SHALL ofrecer en `/login` un formulario de email y contraseña, un botón «Entrar» y un enlace a la pantalla de registro.

#### Scenario: Login correcto desde la pantalla

- **WHEN** una persona sin sesión introduce sus credenciales correctas y pulsa «Entrar»
- **THEN** el botón muestra «Entrando…» y queda deshabilitado mientras espera, y al terminar la persona llega a su perfil

#### Scenario: Credenciales incorrectas desde la pantalla

- **WHEN** la persona introduce un email o una contraseña que no son correctos y pulsa «Entrar»
- **THEN** arriba del formulario aparece el aviso «El email o la contraseña no son correctos.» y la persona sigue en `/login`

#### Scenario: Email mal formado desde la pantalla

- **WHEN** la persona escribe un email sin formato válido y pulsa «Entrar»
- **THEN** bajo el campo de email aparece «Introduce una dirección de email válida.»

#### Scenario: Ir a crear cuenta

- **WHEN** la persona pulsa «Crea una» bajo el formulario
- **THEN** llega a `/register`

---

# Capability: Acceso autenticado a la API

## Purpose

Que la API distinga las peticiones de una persona identificada de las anónimas, y que solo sirva los recursos de cuenta a quien presenta un token válido.

## Requirements

### Requirement: Rutas de cuenta protegidas por token

La API SHALL responder `401` en las rutas bajo `/account` cuando la petición no trae token, trae uno que no existe o trae uno que ya fue revocado.

#### Scenario: Sin token

- **WHEN** se pide `GET /account/profile` sin cabecera `Authorization`
- **THEN** la respuesta es `401` con una lista `errors` que contiene un mensaje

#### Scenario: Token inventado

- **WHEN** se pide `GET /account/profile` con `Authorization: Bearer token-inventado`
- **THEN** la respuesta es `401`

#### Scenario: Token revocado

- **WHEN** se pide `GET /account/profile` con un token que ya se usó para cerrar sesión
- **THEN** la respuesta es `401`

### Requirement: Rutas de acceso abiertas

La API SHALL permitir registrarse e iniciar sesión sin token.

#### Scenario: Login sin token

- **WHEN** se envía `POST /auth/login` sin cabecera `Authorization`
- **THEN** la petición se procesa con normalidad, sin `401`

### Requirement: Respuestas siempre en JSON

La API SHALL responder en JSON, incluidos los errores, aunque la petición no lo pida expresamente.

#### Scenario: Error pedido sin Accept

- **WHEN** se pide `GET /account/profile` sin token y sin cabecera `Accept`
- **THEN** la respuesta de `401` es un cuerpo JSON, no HTML ni texto plano

---

# Capability: Perfil

## Purpose

Que la persona autenticada pueda consultar quién es para el sistema: su nombre, su email, desde cuándo tiene cuenta y cómo se la representa.

## Requirements

### Requirement: Consulta del propio perfil

La API SHALL devolver, a quien presenta un token válido, el usuario público de la cuenta dueña de ese token y de ninguna otra.

#### Scenario: Perfil propio

- **WHEN** se pide `GET /account/profile` con un token válido
- **THEN** la respuesta es `200` y envuelta, con el usuario público de la cuenta que obtuvo ese token y sin contraseña

### Requirement: Iniciales derivadas

La API SHALL incluir en el usuario público unas `initials` en mayúsculas, derivadas del nombre si existe y del email si no.

#### Scenario: Nombre de dos palabras

- **WHEN** la cuenta tiene `fullName: "Ada Lovelace"`
- **THEN** `initials` es `"AL"`

#### Scenario: Nombre de una sola palabra

- **WHEN** la cuenta tiene `fullName: "Ada"`
- **THEN** `initials` es `"AD"` (las dos primeras letras)

#### Scenario: Sin nombre

- **WHEN** la cuenta tiene `fullName: null` y email `ada@flowsync.io`
- **THEN** `initials` es `"AF"` (la primera letra antes y la primera después de la `@`)

### Requirement: Pantalla de perfil

La interfaz SHALL mostrar en `/profile` las iniciales de la persona en un avatar, su nombre, su email, la fecha de alta en formato largo en castellano y un botón para cerrar sesión.

#### Scenario: Perfil con nombre

- **WHEN** una persona con sesión y nombre «Ada Lovelace» abre `/profile`
- **THEN** ve el avatar «AL», el nombre «Ada Lovelace», su email y «Miembro desde» con una fecha del estilo «28 de septiembre de 2026»

#### Scenario: Perfil sin nombre

- **WHEN** una persona con sesión que se registró sin nombre abre `/profile`
- **THEN** en lugar del nombre ve «Sin nombre»

---

# Capability: Cierre de sesión

## Purpose

Permitir que una persona invalide la credencial con la que está dentro y deje de estar autenticada en ese navegador.

## Requirements

### Requirement: Revocación del token usado

La API SHALL revocar el token con el que se hace la petición de cierre, y SHALL dejar intactos los demás tokens de la misma cuenta.

#### Scenario: Logout correcto

- **WHEN** se envía `POST /account/logout` con un token válido
- **THEN** la respuesta es `200` con un cuerpo `{ "message": "Logged out successfully" }` (sin envoltorio `data`), y ese token deja de dar acceso

#### Scenario: Otras sesiones siguen vivas

- **WHEN** una cuenta tiene dos tokens y cierra sesión con uno
- **THEN** el otro sigue devolviendo `200` en `GET /account/profile`

#### Scenario: Logout sin token

- **WHEN** se envía `POST /account/logout` sin token
- **THEN** la respuesta es `401`

### Requirement: Cierre de sesión en la interfaz siempre efectivo

La interfaz SHALL dar por cerrada la sesión local al pulsar «Cerrar sesión», tanto si el servidor confirma la revocación como si falla, y SHALL llevar a la persona a `/login`.

#### Scenario: Cerrar sesión

- **WHEN** una persona con sesión pulsa «Cerrar sesión» en su perfil
- **THEN** el botón muestra «Cerrando sesión…», la persona llega a `/login` sin ningún aviso de error, y al recargar sigue fuera

#### Scenario: Cerrar sesión con el servidor caído

- **WHEN** la persona pulsa «Cerrar sesión» y el servidor no responde
- **THEN** llega igualmente a `/login` sin sesión

---

# Capability: Persistencia de la sesión en el navegador

## Purpose

Que una persona que ya inició sesión no tenga que volver a hacerlo al recargar o reabrir la aplicación en el mismo navegador, y que, si la sesión se pierde, se le explique por qué.

## Requirements

### Requirement: La sesión sobrevive a una recarga

La interfaz SHALL recordar la sesión en el navegador y, al cargar la aplicación, SHALL comprobarla contra el servidor antes de darla por buena, mostrando un indicador de carga mientras tanto.

#### Scenario: Recarga con sesión válida

- **WHEN** una persona con sesión recarga `/profile`
- **THEN** ve un indicador de carga y después su perfil, sin pasar por `/login`

### Requirement: Sesión rechazada por el servidor

La interfaz SHALL olvidar la sesión recordada si el servidor la rechaza, y SHALL explicárselo a la persona en la pantalla de inicio de sesión.

#### Scenario: Token revocado o desconocido al recargar

- **WHEN** la aplicación carga con una sesión recordada que el servidor rechaza con `401`
- **THEN** la persona llega a `/login` con el aviso «Tu sesión ha caducado. Vuelve a iniciar sesión.», y en recargas posteriores ya no se intenta recuperar esa sesión

### Requirement: Servidor inaccesible al recargar

La interfaz SHALL tratar a la persona como no identificada mientras no pueda comprobar la sesión, sin olvidar la sesión recordada, y SHALL avisar del problema de conexión.

#### Scenario: Backend caído al recargar

- **WHEN** la aplicación carga con una sesión recordada y el servidor no responde
- **THEN** la persona llega a `/login` con el aviso «No se pudo conectar con el servidor. Comprueba que el backend está arrancado.»

#### Scenario: El backend vuelve

- **WHEN** después de lo anterior el servidor vuelve a estar disponible y la persona recarga la página
- **THEN** recupera su sesión sin volver a introducir credenciales

### Requirement: Un intento nuevo sustituye al aviso anterior

La interfaz SHALL dejar de mostrar el aviso de sesión perdida en cuanto la persona inicie sesión o se registre con éxito, y SHALL mostrar el error del intento en curso en lugar del aviso anterior.

#### Scenario: Error del intento frente al aviso previo

- **WHEN** la persona está en `/login` con el aviso de sesión caducada e intenta entrar con una contraseña incorrecta
- **THEN** el aviso visible pasa a ser «El email o la contraseña no son correctos.»

---

# Capability: Protección de pantallas

## Purpose

Que cada pantalla solo se muestre en el estado de sesión en el que tiene sentido: el perfil, solo con sesión; el login y el registro, solo sin ella.

## Requirements

### Requirement: El perfil exige sesión

La interfaz SHALL redirigir a `/login` a quien abra `/profile` sin sesión.

#### Scenario: Anónimo en el perfil

- **WHEN** una persona sin sesión abre `/profile`
- **THEN** acaba en `/login`

### Requirement: Login y registro solo sin sesión

La interfaz SHALL redirigir a `/profile` a quien abra `/login` o `/register` con una sesión activa.

#### Scenario: Con sesión en el login

- **WHEN** una persona con sesión abre `/login`
- **THEN** acaba en `/profile`

#### Scenario: Con sesión en el registro

- **WHEN** una persona con sesión abre `/register`
- **THEN** acaba en `/profile`

### Requirement: Sin decidir mientras se comprueba la sesión

La interfaz SHALL mostrar un indicador de carga, y no redirigir, mientras está comprobando una sesión recordada.

#### Scenario: Recarga en una pantalla protegida

- **WHEN** una persona con sesión recordada recarga `/profile` y el servidor tarda en responder
- **THEN** ve el indicador de carga y no se la manda a `/login` mientras tanto

### Requirement: Cualquier otra dirección lleva al perfil

La interfaz SHALL redirigir al perfil cualquier dirección que no sea `/login`, `/register` o `/profile`, y a partir de ahí se aplican las reglas anteriores.

#### Scenario: Dirección desconocida sin sesión

- **WHEN** una persona sin sesión abre `/cualquier-cosa`
- **THEN** acaba en `/login`

#### Scenario: Raíz con sesión

- **WHEN** una persona con sesión abre `/`
- **THEN** acaba en `/profile`

---

# Parte B

## 1. Requisitos escritos y comprobados

- Escritos por el agente: 26
- Comprobados abriendo el código: 5
  - Alta de cuenta con datos válidos
  - Nombre opcional pero presente
  - Email único y bien formado
  - Contraseña con longitud acotada y confirmada
  - Emisión de token con credenciales correctas

## 2. Incoherencias que aparecieron al escribirla

Se encontraron al menos 3, y las tres están comprobadas en el código:

- **Contraseña con reglas distintas según la ruta**: el registro exige de 8 a 32 caracteres y el login no limita la longitud, aunque las dos validaciones de usuario están en el mismo sitio y comparten las reglas del email. Se ve en `POST /auth/signup` frente a `POST /auth/login`.
- **Iniciales sin un criterio uniforme**: con nombre se toman de las palabras del nombre, pero sin nombre el email se parte por la `@` y la segunda inicial sale del dominio (`ada@flowsync.io` → `AF`). Se ve en el campo `initials` de cualquier usuario público y en el avatar de `/profile`.
- **Logout sin envoltorio `data`**: es la única respuesta correcta que devuelve `{ "message": ... }` directamente; el resto va bajo `data`. Se ve en `POST /account/logout` frente a signup, login y profile.

La exploración inicial detectó además estas otras. **No pude revisarlas todas**, así que quedan anotadas sin comprobar:

- **El registro responde `200`, no `201`**, aunque crea un recurso. Se ve en `POST /auth/signup`.
- **La confirmación de contraseña también lleva la regla de 8 a 32 caracteres**: una confirmación corta da un error de longitud en vez de «no coinciden». Se ve en `POST /auth/signup` con una `passwordConfirmation` de menos de 8 caracteres.
- **Cualquier `400` se muestra como «credenciales incorrectas»**, venga de donde venga. Se ve en la interfaz ante cualquier respuesta `400` del servidor.
- **Aviso de «sesión caducada» sin caducidad real**: la interfaz muestra «Tu sesión ha caducado», pero el servidor no hace caducar los tokens. No se puede verificar sin ejecutar el sistema y esperar. Se ve en `/login` tras un `401` al recargar.
- **Servidor caído al recargar**: la sesión recordada se conserva, pero se manda a la persona al login como anónima; si vuelve a entrar se genera otro token y el anterior queda huérfano. Se ve en `/login` con el backend parado.
- **El aviso de sesión perdida solo aparece en `/login`**, no en `/register`. Se ve al perder la sesión y navegar a `/register`.
- **No hay límite de intentos de login**. Se ve repitiendo `POST /auth/login` con credenciales incorrectas.
- **En producción la API no admite peticiones de ningún origen externo**: la variable de orígenes permitidos está comentada y no se usa. Se ve al servir la interfaz desde otro dominio en producción.
- **Hay un mecanismo de sesión por cookie configurado y sin uso**, pero la cookie de sesión se emite igualmente. Se ve en las cabeceras `Set-Cookie` de las respuestas de la API.

## 3. Lo que no supe decidir si era bug o contrato

- **Iniciales sin nombre (`ada@flowsync.io` → `AF`)**: una lectura dice que es una regla deliberada («primera letra antes y después de la `@`»); la otra, que es un hueco, un caso sin nombre que nadie definió y que salió así por partir el email igual que el nombre. Me inclino por la segunda, pero el código no permite asegurarlo.
- **El registro responde `200` en vez de `201`**: puede ser contrato (el cliente solo espera «éxito» y le da igual el código) o un descuido técnico frente a la convención de devolver `201` cuando se crea un recurso.
- **Tokens sin caducidad**: puede ser una decisión de producto («la sesión dura hasta que cierras sesión») o una decisión técnica que faltó y deja un riesgo de seguridad; la propia interfaz habla de «sesión caducada», lo que sugiere que alguien esperaba que caducaran.

Duda de fondo que atraviesa las tres: no tengo claro si el «contrato» de esta spec debe cubrir solo lo que decide producto (qué ve y puede hacer la persona) o también las decisiones técnicas que se ven desde fuera (códigos de estado, forma de las respuestas, caducidad de credenciales). Según la respuesta, estos puntos son contrato no escrito o simplemente huecos de la spec.
