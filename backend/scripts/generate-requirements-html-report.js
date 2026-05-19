const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const mappingPath = path.join(root, 'coverage-mapping.json');
const reportPath = path.join(root, 'reports', 'test-requirement-coverage.json');
const htmlPath = path.join(root, 'reports', 'test-requirement-coverage.html');

if (!fs.existsSync(mappingPath)) {
  console.error('No se encontró coverage-mapping.json');
  process.exit(2);
}

if (!fs.existsSync(reportPath)) {
  console.error('No se encontró test-requirement-coverage.json. Ejecuta primero npm run coverage:requirements');
  process.exit(2);
}

const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const results = report.results || {};

const rows = Object.keys(mapping).map((reqId) => {
  const entry = mapping[reqId] || {};
  const result = results[reqId] || {};
  const covered = Boolean(result.covered);
  const tests = Array.isArray(entry.tests) ? entry.tests : [];
  return {
    reqId,
    desc: entry.desc || '',
    tests,
    covered,
    exitCode: result.exitCode,
  };
});

const coveredCount = rows.filter((row) => row.covered).length;
const totalCount = rows.length;
const percent = totalCount ? Math.round((coveredCount / totalCount) * 100) : 0;

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Cobertura de pruebas</title>
  <style>
    :root { color-scheme: light; }
    body { font-family: Arial, sans-serif; margin: 0; background: #f6f8fb; color: #122033; }
    .wrap { max-width: 1100px; margin: 0 auto; padding: 32px 20px 48px; }
    h1 { margin: 0 0 6px; font-size: 30px; }
    .sub { margin: 0 0 22px; color: #5a6577; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 22px; }
    .card { background: white; border: 1px solid #e4e9f2; border-radius: 14px; padding: 16px; box-shadow: 0 6px 20px rgba(17, 34, 68, 0.05); }
    .card .label { font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: #667085; margin-bottom: 6px; }
    .card .value { font-size: 28px; font-weight: 700; }
    .progress { height: 10px; background: #e9eef7; border-radius: 999px; overflow: hidden; margin-top: 12px; }
    .bar { height: 100%; background: linear-gradient(90deg, #2f80ed, #56ccf2); width: ${percent}%; }
    .table { width: 100%; border-collapse: collapse; background: white; border: 1px solid #e4e9f2; border-radius: 14px; overflow: hidden; box-shadow: 0 6px 20px rgba(17, 34, 68, 0.05); }
    th, td { padding: 14px 12px; text-align: left; border-bottom: 1px solid #edf1f7; vertical-align: top; }
    th { background: #f8fafc; font-size: 13px; color: #475467; }
    tr:last-child td { border-bottom: none; }
    .badge { display: inline-block; padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
    .ok { background: #e8f8ee; color: #137333; }
    .no { background: #fdecec; color: #b42318; }
    ul { margin: 0; padding-left: 18px; }
    .muted { color: #667085; font-size: 12px; }
    .footer { margin-top: 16px; color: #667085; font-size: 13px; }
    code { background: #eef2f8; padding: 2px 5px; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Cobertura de pruebas</h1>
    <p class="sub">Vista limpia del mapping requisito → test</p>

    <div class="cards">
      <div class="card"><div class="label">Requisitos cubiertos</div><div class="value">${coveredCount}/${totalCount}</div><div class="muted">${percent}%</div><div class="progress"><div class="bar"></div></div></div>
      <div class="card"><div class="label">Última generación</div><div class="value" style="font-size:18px">${escapeHtml(report.generatedAt || '-')}</div></div>
      <div class="card"><div class="label">Estado general</div><div class="value" style="font-size:18px">${coveredCount === totalCount ? 'Completo' : 'Parcial'}</div></div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Requisito</th>
          <th>Descripción</th>
          <th>Tests asociados</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map((row) => `
          <tr>
            <td><strong>${escapeHtml(row.reqId)}</strong></td>
            <td>${escapeHtml(row.desc || '-')}</td>
            <td>
              ${row.tests.length ? `<ul>${row.tests.map((test) => `<li>${escapeHtml(test)}</li>`).join('')}</ul>` : '<span class="muted">Sin tests asignados</span>'}
              <div class="muted">Exit code: ${escapeHtml(row.exitCode)}</div>
            </td>
            <td><span class="badge ${row.covered ? 'ok' : 'no'}">${row.covered ? 'Cubierto' : 'No cubierto'}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="footer">Abre este archivo en el navegador: <code>backend/reports/test-requirement-coverage.html</code></div>
  </div>
</body>
</html>`;

fs.writeFileSync(htmlPath, html, 'utf8');
console.log(`Reporte HTML generado en ${htmlPath}`);
