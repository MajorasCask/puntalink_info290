const http = require('http');

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function writeJson(req, res, status, payload) {
  const origin = req.headers.origin || 'http://127.0.0.1:3010';
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type, x-user-id, x-project-id',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    Vary: 'Origin'
  });
  res.end(JSON.stringify(payload));
}

function writeNoContent(req, res) {
  const origin = req.headers.origin || 'http://127.0.0.1:3010';
  res.writeHead(204, {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type, x-user-id, x-project-id',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    Vary: 'Origin'
  });
  res.end();
}

function createMockApiServer() {
  const mockUser = {
    uid: 'u-e2e-1',
    email: 'e2e@puntalink.local',
    picture: ''
  };

  const state = {
    loggedIn: false,
    projects: [
      {
        pid: 101,
        nombre: 'Proyecto E2E Base',
        empresa: 'Constructora E2E',
        tipo_muerto: 'Cilindrico',
        vel_viento: 120,
        temp_promedio: 24,
        presion_atmo: 760,
        ubicacion: 'Santiago',
        version_proyecto: 1,
        notas_version: 'Version inicial',
        updated_at: '2026-04-06T12:00:00.000Z'
      }
    ],
    nextProjectId: 102
  };

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://localhost:4008');

    if (req.method === 'OPTIONS') {
      writeNoContent(req, res);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/auth/google') {
      state.loggedIn = true;
      writeJson(req, res, 200, { ok: true, user: mockUser });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/auth/me') {
      if (state.loggedIn) {
        writeJson(req, res, 200, { ok: true, user: mockUser });
      } else {
        writeJson(req, res, 200, { ok: false, user: null });
      }
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/auth/logout') {
      state.loggedIn = false;
      writeJson(req, res, 200, { ok: true });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/proyecto/listar') {
      writeJson(req, res, 200, { ok: true, proyectos: state.projects });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/proyecto/cargar') {
      const projectId = Number(req.headers['x-project-id']);
      const project = state.projects.find((p) => p.pid === projectId);
      if (!project) {
        writeJson(req, res, 404, { ok: false, error: 'Proyecto no encontrado' });
        return;
      }
      writeJson(req, res, 200, { ok: true, proyecto: project });
      return;
    }

    if (req.method === 'DELETE' && url.pathname === '/api/proyecto/eliminar') {
      const projectId = Number(req.headers['x-project-id']);
      state.projects = state.projects.filter((p) => p.pid !== projectId);
      writeJson(req, res, 200, { ok: true });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/proyecto/crear') {
      try {
        const body = await readBody(req);
        const created = {
          pid: state.nextProjectId++,
          nombre: body.nombreProyecto,
          empresa: body.empresaConstructora,
          tipo_muerto: body.tipoMuerto,
          vel_viento: Number(body.velViento),
          temp_promedio: Number(body.tempPromedio),
          presion_atmo: Number(body.presionAtm),
          ubicacion: body.ubicacionProyecto,
          version_proyecto: 1,
          notas_version: 'Creado desde test E2E',
          updated_at: new Date().toISOString()
        };
        state.projects.unshift(created);
        writeJson(req, res, 200, { ok: true, new_project: created });
      } catch (err) {
        writeJson(req, res, 400, { ok: false, error: 'JSON invalido' });
      }
      return;
    }

    writeJson(req, res, 404, { ok: false, error: 'Ruta no mockeada' });
  });

  return {
    listen(port) {
      return new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, () => resolve(port));
      });
    },
    close() {
      return new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    },
    reset() {
      state.loggedIn = false;
      state.projects = [
        {
          pid: 101,
          nombre: 'Proyecto E2E Base',
          empresa: 'Constructora E2E',
          tipo_muerto: 'Cilindrico',
          vel_viento: 120,
          temp_promedio: 24,
          presion_atmo: 760,
          ubicacion: 'Santiago',
          version_proyecto: 1,
          notas_version: 'Version inicial',
          updated_at: '2026-04-06T12:00:00.000Z'
        }
      ];
      state.nextProjectId = 102;
    },
    login() {
      state.loggedIn = true;
    }
  };
}

module.exports = { createMockApiServer };
