import User from '#models/user'
import Task from '#models/task'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Lo que llega por la red, no lo que prometen los tipos generados: el registro
 * Tuyau tipa `data` como «una tarea o varias» y ya da por hecho un `assignee`
 * con email. Aquí se lee el cuerpo sin esa promesa, que es justo lo que se
 * comprueba.
 */
type TareaRecibida = { id: number; assignee: Record<string, any> }

function tarea(body: unknown) {
  return (body as { data: TareaRecibida }).data
}

function tareaDeLaLista(body: unknown, id: number) {
  return (body as { data: TareaRecibida[] }).data.find((t) => t.id === id)
}

/**
 * Lo que cada tarea muestra de su responsable. Cubre los tres scenarios del
 * requisito «Lo que cada tarea muestra de su responsable» de
 * `openspec/specs/tasks/spec.md`: el responsable identificable, que la tarea
 * no filtre datos de cuenta, y el responsable sin nombre.
 *
 * Quien mira es siempre una cuenta distinta del responsable: si fueran la
 * misma, un `assignee` correcto no se distinguiría de devolver la cuenta de la
 * sesión.
 */
test.group('Tasks | responsable', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  /**
   * `GET /tasks/:id` exige un día de referencia para resolver el vencimiento.
   * Su valor no influye en nada de lo que aquí se comprueba.
   */
  const today = '2026-10-06'

  async function observador() {
    return User.create({
      fullName: 'Alan Turing',
      email: 'alan@example.com',
      password: 'secreto123',
    })
  }

  test('el responsable llega con su nombre y sus iniciales', async ({ client, assert }) => {
    const ada = await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secreto123',
    })
    const alan = await observador()
    const task = await Task.create({ title: 'Revisar el informe', assigneeId: ada.id })

    const lista = await client.get('/api/v1/tasks').loginAs(alan)
    const suelta = await client.get(`/api/v1/tasks/${task.id}`).qs({ today }).loginAs(alan)

    lista.assertStatus(200)
    suelta.assertStatus(200)

    const enLista = tareaDeLaLista(lista.body(), task.id)
    assert.exists(enLista, 'la tarea no aparece en la lista')

    const vistas: Array<[string, TareaRecibida['assignee']]> = [
      ['lista', enLista!.assignee],
      ['suelta', tarea(suelta.body()).assignee],
    ]

    for (const [via, assignee] of vistas) {
      assert.equal(assignee.fullName, 'Ada Lovelace', `nombre en la tarea ${via}`)
      assert.equal(assignee.initials, 'AL', `iniciales en la tarea ${via}`)
    }
  })

  test('el responsable de una tarea no expone el email ni datos de acceso', async ({
    client,
    assert,
  }) => {
    const ada = await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secreto123',
    })
    const alan = await observador()

    // El scenario dice «cualquier tarea, suelta o dentro de la lista»: se miran
    // todas las respuestas de la API que devuelven una tarea, no solo una.
    const creada = await client
      .post('/api/v1/tasks')
      .json({ title: 'Revisar el informe' })
      .loginAs(ada)
    creada.assertStatus(201)
    const id = tarea(creada.body()).id

    const lista = await client.get('/api/v1/tasks').loginAs(alan)
    const suelta = await client.get(`/api/v1/tasks/${id}`).qs({ today }).loginAs(alan)
    const estado = await client
      .patch(`/api/v1/tasks/${id}/status`)
      .json({ status: 'in_progress' })
      .loginAs(alan)
    const fecha = await client
      .put(`/api/v1/tasks/${id}/due-date`)
      .json({ today, dueDate: '2026-12-01' })
      .loginAs(alan)

    lista.assertStatus(200)
    suelta.assertStatus(200)
    estado.assertStatus(200)
    fecha.assertStatus(200)

    const enLista = tareaDeLaLista(lista.body(), id)
    assert.exists(enLista, 'la tarea no aparece en la lista')

    const respuestas: Array<[string, Record<string, unknown>]> = [
      ['POST /tasks', tarea(creada.body()).assignee],
      ['GET /tasks', enLista!.assignee],
      ['GET /tasks/:id', tarea(suelta.body()).assignee],
      ['PATCH /tasks/:id/status', tarea(estado.body()).assignee],
      ['PUT /tasks/:id/due-date', tarea(fecha.body()).assignee],
    ]

    // Se recogen todas las fugas antes de afirmar, para que el fallo diga en
    // qué respuestas está el problema y no solo en la primera.
    const fugas = respuestas.flatMap(([via, assignee]) => {
      const serialized = JSON.stringify(assignee).toLowerCase()
      const encontradas = [
        ['email', 'email' in assignee],
        ['el email como valor', serialized.includes('ada@example.com')],
        ['password', 'password' in assignee || serialized.includes('secreto123')],
        ['token', Object.keys(assignee).some((key) => key.toLowerCase().includes('token'))],
      ] as const
      return encontradas.filter(([, hay]) => hay).map(([que]) => `${via}: ${que}`)
    })

    assert.deepEqual(fugas, [], `el assignee filtra datos de cuenta en: ${fugas.join(', ')}`)
  })

  test('un responsable sin nombre llega con el nombre nulo y con iniciales', async ({
    client,
    assert,
  }) => {
    const sinNombre = await User.create({
      fullName: null,
      email: 'sin-nombre@example.com',
      password: 'secreto123',
    })
    const alan = await observador()
    const task = await Task.create({ title: 'Revisar el informe', assigneeId: sinNombre.id })

    const lista = await client.get('/api/v1/tasks').loginAs(alan)
    const suelta = await client.get(`/api/v1/tasks/${task.id}`).qs({ today }).loginAs(alan)

    lista.assertStatus(200)
    suelta.assertStatus(200)

    const enLista = tareaDeLaLista(lista.body(), task.id)
    assert.exists(enLista, 'la tarea no aparece en la lista')

    const vistas: Array<[string, TareaRecibida['assignee']]> = [
      ['lista', enLista!.assignee],
      ['suelta', tarea(suelta.body()).assignee],
    ]

    for (const [via, assignee] of vistas) {
      // «Llega nulo»: la clave tiene que estar presente y valer `null`. Una
      // clave ausente daría `undefined` y no es lo mismo que decir «sin nombre».
      assert.property(assignee, 'fullName', `nombre en la tarea ${via}`)
      assert.isNull(assignee.fullName, `nombre en la tarea ${via}`)
      assert.isString(assignee.initials, `iniciales en la tarea ${via}`)
      assert.isNotEmpty(assignee.initials, `iniciales en la tarea ${via}`)
    }
  })
})
