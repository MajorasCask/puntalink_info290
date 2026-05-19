const assert = require('assert/strict')
const sinon = require('sinon')
const proxyquire = require('proxyquire').noCallThru().noPreserveCache()

describe('auth.controller', () => {
  let poolStub: any
  let googleAuthStub: any
  let jwtStub: any
  let authController: any

  const loadModule = () => proxyquire('../src/controllers/auth.controller', {
    '../db': { query: poolStub.query, default: { query: poolStub.query }, pool: { query: poolStub.query } },
    '../services/googleAuth': googleAuthStub,
    '../utils/jwt': jwtStub,
  })

  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    poolStub = { query: sinon.stub() }
    googleAuthStub = { verifyGoogleIdToken: sinon.stub() }
    jwtStub = { signSession: sinon.stub(), verifySession: sinon.stub() }
    authController = loadModule()
  })

  afterEach(() => {
    sinon.restore()
  })

  it('rechaza credenciales inválidas en el login', async () => {
    const req = { body: { credential: 'abc' } }
    const json = sinon.spy()
    const status = sinon.stub().returns({ json })
    const res = { json, status }

    await authController.postGoogle(req, res)

    sinon.assert.calledOnceWithExactly(res.status, 400)
    sinon.assert.calledWithMatch(res.json, sinon.match({ ok: false }))
  })

  it('hace login Google, guarda usuario y setea cookie', async () => {
    googleAuthStub.verifyGoogleIdToken.resolves({
      email: 'user@example.com',
      name: 'User Test',
      picture: 'http://img',
      sub: 'google-sub-123',
    })
    poolStub.query.resolves({ rows: [{ id: 10, email: 'user@example.com', name: 'User Test', picture: 'http://img', provider: 'google' }] })
    jwtStub.signSession.returns('session-token')

    const cookie = sinon.spy()
    const json = sinon.spy()
    const status = sinon.stub().returns({ json })
    const res = { cookie, json, status }
    const req = { body: { credential: 'credential-valid-123' } }

    await authController.postGoogle(req, res)

    sinon.assert.calledOnceWithExactly(googleAuthStub.verifyGoogleIdToken, 'credential-valid-123')
    sinon.assert.calledOnce(poolStub.query)
    sinon.assert.calledOnce(jwtStub.signSession)
    sinon.assert.calledOnce(cookie)
    sinon.assert.calledWithMatch(cookie, 'session', 'session-token', sinon.match({ httpOnly: true, path: '/' }))
    sinon.assert.calledWithMatch(res.json, { ok: true, user: sinon.match.object })
  })

  it('devuelve el usuario de la sesión si el token es válido', () => {
    jwtStub.verifySession.returns({ uid: 5, email: 'me@example.com', provider: 'google' })

    const json = sinon.spy()
    const res = { json }
    const req = { cookies: { session: 'valid-token' } }

    authController.getMe(req, res)

    sinon.assert.calledOnceWithExactly(jwtStub.verifySession, 'valid-token')
    sinon.assert.calledOnceWithExactly(res.json, { ok: true, user: { uid: 5, email: 'me@example.com', provider: 'google' } })
  })

  it('devuelve usuario null si el token no existe o es inválido', () => {
    const json = sinon.spy()
    const res = { json }

    authController.getMe({ cookies: {} }, res)
    sinon.assert.calledWithExactly(res.json.firstCall, { ok: true, user: null })

    jwtStub.verifySession.throws(new Error('bad token'))
    authController.getMe({ cookies: { session: 'invalid-token' } }, res)
    sinon.assert.calledWithMatch(res.json.secondCall, { ok: true, user: null })
  })

  it('cierra la sesión borrando la cookie', () => {
    const clearCookie = sinon.spy()
    const json = sinon.spy()
    const res = { clearCookie, json }

    authController.postLogout({}, res)

    sinon.assert.calledOnce(clearCookie)
    sinon.assert.calledOnceWithExactly(res.json, { ok: true })
  })
})

export {}