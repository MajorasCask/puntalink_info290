const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const mappingPath = path.join(root, 'coverage-mapping.json');
const outDir = path.join(root, 'reports');
const outPath = path.join(outDir, 'test-requirement-coverage.json');
const mochaBin = require.resolve('mocha/bin/mocha.js');

if (!fs.existsSync(mappingPath)) {
  console.error('coverage-mapping.json not found in backend/');
  process.exit(2);
}

const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
const results = {};

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const normalizeTests = (entry) => {
  if (Array.isArray(entry)) return entry;
  if (entry && Array.isArray(entry.tests)) return entry.tests;
  return [];
};

const runTestsForFiles = (files) => {
  const testFiles = Array.isArray(files) ? files : [];
  if (testFiles.length === 0) {
    return {
      exitCode: 0,
      stdout: '',
      stderr: '',
      error: '',
      parsed: null,
      skipped: true,
    };
  }
  const args = [mochaBin, '--require', 'tsx/cjs', ...testFiles];
  console.log('Running:', process.execPath, args.join(' '));
  let res = spawnSync(process.execPath, args, {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  const out = (res && res.stdout) ? res.stdout : '';
  const err = (res && res.stderr) ? res.stderr : '';
  let parsed = null;
  try {
    parsed = JSON.parse(out);
  } catch (e) {
    // ignore parse errors
  }
  return {
    exitCode: res ? res.status : null,
    stdout: out,
    stderr: err,
    error: res && res.error ? String(res.error.message || res.error) : '',
    skipped: false,
    parsed,
  };
};

(async () => {
  for (const req of Object.keys(mapping)) {
    const files = normalizeTests(mapping[req]);
    const res = runTestsForFiles(files);
    const covered = files.length > 0 && res.exitCode === 0;
    const detail = {
      files,
      covered,
      exitCode: res.exitCode,
      stdout: res.stdout,
      stderr: res.stderr,
      error: res.error,
      skipped: res.skipped,
    };
    if (res.parsed && res.parsed.stats) {
      detail.stats = res.parsed.stats;
    }
    results[req] = detail;
    console.log(`${req} → ${covered ? 'COVERED' : 'NOT COVERED'} (exit ${res.exitCode})`);
  }

  fs.writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2));
  console.log('\nWrote report to', outPath);
  const coveredCount = Object.values(results).filter(r => r.covered).length;
  const total = Object.keys(results).length;
  console.log(`\nSummary: ${coveredCount}/${total} requirements covered`);
  if (coveredCount !== total) process.exit(1);
})();
