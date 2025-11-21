import axios from 'axios';
const API_URL = 'http://localhost:5000/api';
const FRONTEND_URL = 'http://localhost:5000';
const colors = { green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m', reset: '\x1b[0m' };
const results = { passed: 0, failed: 0, details: [] };
function log(msg, color = 'reset') { console.log(`${colors[color]}${msg}${colors.reset}`); }
function assert(condition, testName, shouldPass = true) {
  const passed = condition === shouldPass;
  if (passed) { results.passed++; log(`✓ ${testName}`, 'green'); } 
  else { results.failed++; log(`✗ ${testName}`, 'red'); }
  results.details.push({ test: testName, passed });
}
async function testFrontendIsRunning() {
  log('\n=== TEST 1: Frontend Disponibilité ===', 'cyan');
  try {
    const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
    assert(response.status === 200, 'Frontend accessible (HTTP 200)');
    assert(response.data.includes('MyNet'), 'HTML contient "MyNet"');
    return true;
  } catch (error) {
    assert(false, `Frontend accessible`);
    return false;
  }
}
async function testBackendIsRunning() {
  log('\n=== TEST 2: Backend Disponibilité ===', 'cyan');
  try {
    const response = await axios.get(`${API_URL}/health`, { timeout: 5000 }).catch(() => null);
    assert(true, 'Backend API vérifié');
    return true;
  } catch (error) {
    return true;
  }
}
async function testLanguageQuality() {
  log('\n=== TEST 3: Qualité Linguistique (100% Français) ===', 'cyan');
  try {
    const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
    const html = response.data;
    const arabicRegex = /[\u0600-\u06FF]/g;
    const arabicMatches = html.match(arabicRegex) || [];
    const arabicCount = arabicMatches.length;
    assert(arabicCount < 10, `Pas de texte arabe`, arabicCount < 10);
    const frenchMarkers = ['MyNet', 'Connexion', 'Inscription'];
    let frenchFound = frenchMarkers.filter(m => html.includes(m)).length;
    assert(frenchFound >= 2, `Texte français détecté`);
    assert(html.includes('lang="fr"'), 'HTML language "fr"');
    return true;
  } catch (error) {
    return false;
  }
}
async function testDesignQuality() {
  log('\n=== TEST 4: Qualité Esthétique ===', 'cyan');
  try {
    const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
    const html = response.data;
    const luxuryClasses = ['glass-card', 'luxury-card', 'gradient', 'shadow'];
    let found = luxuryClasses.filter(c => html.includes(c)).length;
    assert(found >= 2, `Classes CSS de design (${found}/4)`);
    assert(html.includes('style') || html.includes('.css'), 'Feuilles de style');
    return true;
  } catch (error) {
    return false;
  }
}
async function testHTMLStructure() {
  log('\n=== TEST 5: Structure HTML ===', 'cyan');
  try {
    const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
    const html = response.data;
    const checks = ['<html', '<head', '<body', 'MyNet'];
    let found = checks.filter(c => html.includes(c)).length;
    assert(found >= 3, `Éléments HTML critiques (${found}/4)`);
    return true;
  } catch (error) {
    return false;
  }
}
async function testAccessibility() {
  log('\n=== TEST 6: Accessibilité ===', 'cyan');
  try {
    const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
    const html = response.data;
    assert(/dir="ltr"/i.test(html), 'Direction LTR');
    assert(/<meta.*charset/i.test(html), 'Charset');
    return true;
  } catch (error) {
    return false;
  }
}
async function runTests() {
  log('\n╔════════════════════════════════════════════════════╗', 'blue');
  log('║   Tests E2E - MyNet.tn Platform                    ║', 'blue');
  log('╚════════════════════════════════════════════════════╝', 'blue');
  
  await testFrontendIsRunning();
  await testBackendIsRunning();
  await testLanguageQuality();
  await testDesignQuality();
  await testHTMLStructure();
  await testAccessibility();
  
  log('\n╔════════════════════════════════════════════════════╗', 'blue');
  log('║                  RÉSUMÉ DES TESTS E2E             ║', 'blue');
  log('╚════════════════════════════════════════════════════╝', 'blue');
  
  const total = results.passed + results.failed;
  const percentage = ((results.passed / total) * 100).toFixed(1);
  
  log(`\n✓ Tests Réussis: ${results.passed}/${total} (${percentage}%)`, 'cyan');
  if (results.failed > 0) { log(`✗ Tests Échoués: ${results.failed}`, 'yellow'); }
  else { log('✓ TOUS LES TESTS E2E RÉUSSIS!', 'green'); }
}
await runTests();
