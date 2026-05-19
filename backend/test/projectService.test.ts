const assert = require('assert/strict')
const sinon = require('sinon')
const proxyquire = require('proxyquire').noCallThru().noPreserveCache()

describe('projectService', () => {
  let modelStubs: any
  let projectService: any

  const loadModule = () => proxyquire('../src/services/projectService', {
    '../models/Project': modelStubs,
  })

  beforeEach(() => {
    modelStubs = {
      addProject: sinon.stub(),
      updateProject: sinon.stub(),
      getProjectsByUser: sinon.stub(),
      getProjectById: sinon.stub(),
      saveTXT: sinon.stub(),
      duplicateProject: sinon.stub(),
      deleteProject: sinon.stub(),
    }
    projectService = loadModule()
  })

  afterEach(() => {
    sinon.restore()
  })

  it('crea un proyecto con valores numéricos convertidos', async () => {
    modelStubs.addProject.resolves({ pid: 1, nombre: 'Proyecto A' })

    const result = await projectService.crearProyectoService({
      id_usuario: 7,
      nombreProyecto: 'Proyecto A',
      empresaConstructora: 'Constructora X',
      tipoMuerto: 'muro',
      velViento: '120.5',
      tempPromedio: '25.2',
      presionAtm: '740.1',
      ubicacionProyecto: 'Lima',
    })

    sinon.assert.calledOnceWithExactly(modelStubs.addProject, 7, 'Proyecto A', 'Constructora X', 'muro', 120.5, 25.2, 740.1, 'Lima')
    assert.deepStrictEqual(result, { pid: 1, nombre: 'Proyecto A' })
  })

  it('actualiza un proyecto usando el request completo', async () => {
    modelStubs.updateProject.resolves({ pid: 2, nombre: 'Proyecto B' })

    const result = await projectService.actualizarProyectoService({
      body: {
        pid: 2,
        pk_usuario: 9,
        nombre: 'Proyecto B',
        empresa: 'Constructora Y',
        tipo_muerto: 'panel',
        vel_viento: 130,
        temp_promedio: 26,
        presion_atmo: 730,
        ubicacion: 'Bogotá',
      },
    })

    sinon.assert.calledOnceWithExactly(modelStubs.updateProject, 2, 9, 'Proyecto B', 'Constructora Y', 'panel', 130, 26, 730, 'Bogotá')
    assert.deepStrictEqual(result, { pid: 2, nombre: 'Proyecto B' })
  })

  it('lista proyectos por usuario y usa fallback', async () => {
    modelStubs.getProjectsByUser.resolves([{ pid: 1 }])

    const result = await projectService.listarProyectosService({ headers: { 'x-user-id': 15 } })

    sinon.assert.calledOnceWithExactly(modelStubs.getProjectsByUser, 15)
    assert.deepStrictEqual(result, [{ pid: 1 }])
  })

  it('carga, guarda, duplica y elimina proyectos', async () => {
    modelStubs.getProjectById.resolves({ pid: 3, nombre: 'Proyecto C' })
    modelStubs.saveTXT.resolves({ pid: 3, texto_entrada: { a: 1 } })
    modelStubs.duplicateProject.resolves(99)
    modelStubs.deleteProject.resolves(true)

    assert.deepStrictEqual(await projectService.cargarProyectoService({ headers: { 'x-project-id': 3, 'x-user-id': 1 } }), { pid: 3, nombre: 'Proyecto C' })
    assert.deepStrictEqual(await projectService.guardarTxtService(3, { filename: 'a.txt', content: 'hola' }), { pid: 3, texto_entrada: { a: 1 } })
    assert.deepStrictEqual(await projectService.nuevaVersionService({ body: { pid: 3, pk_usuario: 1, nombre: 'Proyecto C', notas_version: 'v2' } }), 99)
    assert.deepStrictEqual(await projectService.eliminarProyectoService({ headers: { 'x-project-id': 3, 'x-user-id': 1 } }), true)

    sinon.assert.calledOnceWithExactly(modelStubs.getProjectById, 3, 1)
    sinon.assert.calledOnceWithExactly(modelStubs.saveTXT, 3, { filename: 'a.txt', content: 'hola' })
    sinon.assert.calledOnceWithExactly(modelStubs.duplicateProject, 3, 1, 'Proyecto C', 'v2')
    sinon.assert.calledOnceWithExactly(modelStubs.deleteProject, 3, 1)
  })
})

export {}