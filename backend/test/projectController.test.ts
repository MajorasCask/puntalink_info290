const assert = require('assert/strict')
const sinon = require('sinon')
const proxyquire = require('proxyquire').noCallThru().noPreserveCache()

describe('projectController.crearProyecto', () => {
  let serviceStubs: any
  let projectController: any

  const loadModule = () => proxyquire('../src/controllers/projectController', {
    '../services/projectService': serviceStubs,
  })

  beforeEach(() => {
    serviceStubs = {
      crearProyectoService: sinon.stub(),
      actualizarProyectoService: sinon.stub(),
      listarProyectosService: sinon.stub(),
      cargarProyectoService: sinon.stub(),
      guardarTxtService: sinon.stub(),
      nuevaVersionService: sinon.stub(),
      eliminarProyectoService: sinon.stub(),
    }
    projectController = loadModule()
  })

  afterEach(() => {
    sinon.restore()
  })

  it('responde con el proyecto creado cuando el servicio tiene éxito', async () => {
    const fakeProject = { id: 42, name: 'Mi proyecto' }
    serviceStubs.crearProyectoService.resolves(fakeProject)

    const req = { body: { name: 'Mi proyecto' } }
    const json = sinon.spy()
    const status = sinon.stub().returns({ json })
    const res = { json, status }

    await projectController.crearProyecto(req, res)

    sinon.assert.calledOnceWithExactly(serviceStubs.crearProyectoService, req.body)
    sinon.assert.calledOnceWithExactly(res.json, { ok: true, new_project: fakeProject })
  })

  it('responde 500 cuando el servicio lanza un error', async () => {
    serviceStubs.crearProyectoService.rejects(new Error('DB error'))

    const req = { body: { name: 'Fail' } }
    const json = sinon.spy()
    const status = sinon.stub().returns({ json })
    const res = { json, status }

    await projectController.crearProyecto(req, res)

    sinon.assert.calledOnceWithExactly(res.status, 500)
    sinon.assert.calledWithMatch(res.json, sinon.match({ ok: false }))
  })
})

export {}