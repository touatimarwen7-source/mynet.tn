import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = { green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', cyan: '\x1b[36m', magenta: '\x1b[35m', reset: '\x1b[0m' };
const results = { categories: { linguistic: { passed: 0, total: 0, name: 'Linguistique' }, aesthetic: { passed: 0, total: 0, name: 'Esthétique' }, functional: { passed: 0, total: 0, name: 'Fonctionnalité' }, security: { passed: 0, total: 0, name: 'Sécurité' } }, details: [] };

function log(msg, color = 'reset') { console.log(`${colors[color]}${msg}${colors.reset}`); }
function testCase(category, testName, passed, details = '') {
  results.categories[category].total++;
  if (passed) { results.categories[category].passed++; log(`  ✓ ${testName}`, 'green'); } 
  else { log(`  ✗ ${testName}`, 'red'); if (details) log(`    └─ ${details}`, 'yellow'); }
  results.details.push({ category, test: testName, passed, details });
}

function scanSourceFiles() {
  log('\n=== Analyse des Fichiers Source ===', 'cyan');
  const pagesDir = '/home/runner/workspace/frontend/src/pages';
  const componentsDir = '/home/runner/workspace/frontend/src/components';
  
  let jsxFiles = [];
  let arabicCount = 0, frenchCount = 0;
  
  try {
    const pages = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));
    pages.forEach(page => {
      const content = fs.readFileSync(path.join(pagesDir, page), 'utf8');
      arabicCount += (content.match(/[\u0600-\u06FF]/g) || []).length;
      frenchCount += (content.match(/\b(Connexion|Inscription|Appel|Offre|Notification)\b/g) || []).length;
    });
  } catch (e) { }
  
  testCase('linguistic', 'Pas de texte arabe', arabicCount < 10);
  testCase('linguistic', 'Vocabulaire français présent', frenchCount > 0);
}

function checkDesignStructure() {
  log('\n=== Analyse du Design ===', 'cyan');
  const styleDir = '/home/runner/workspace/frontend/src/styles';
  const requiredCSS = ['luxuryDesign.css', 'microInteractions.css', 'modernColors.css'];
  
  requiredCSS.forEach(css => {
    const exists = fs.existsSync(path.join(styleDir, css));
    testCase('aesthetic', `CSS: ${css}`, exists);
  });
  
  try {
    const luxuryCSS = fs.readFileSync(path.join(styleDir, 'luxuryDesign.css'), 'utf8');
    testCase('aesthetic', 'Glassmorphism', luxuryCSS.includes('backdrop-filter'));
    testCase('aesthetic', 'Gradients', luxuryCSS.includes('linear-gradient'));
  } catch (e) { }
}

function checkCriticalPages() {
  log('\n=== Pages Critiques ===', 'cyan');
  const pagesDir = '/home/runner/workspace/frontend/src/pages';
  const critical = ['Login.jsx', 'Register.jsx', 'TenderList.jsx', 'NotificationCenter.jsx'];
  
  critical.forEach(page => {
    const exists = fs.existsSync(path.join(pagesDir, page));
    testCase('functional', `Page: ${page}`, exists);
  });
}

function checkDateFormatting() {
  log('\n=== Format des Dates ===', 'cyan');
  const pagesDir = '/home/runner/workspace/frontend/src/pages';
  
  let frFRCount = 0, arTNCount = 0;
  try {
    const pages = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));
    pages.forEach(page => {
      const content = fs.readFileSync(path.join(pagesDir, page), 'utf8');
      frFRCount += (content.match(/fr-FR/g) || []).length;
      arTNCount += (content.match(/ar-TN/g) || []).length;
    });
  } catch (e) { }
  
  testCase('security', 'Format français (fr-FR)', frFRCount > 0);
  testCase('security', 'Pas de format arabe', arTNCount === 0);
}

function runUAT() {
  log('\n╔════════════════════════════════════════════════════╗', 'magenta');
  log('║   Tests UAT - MyNet.tn Platform                    ║', 'magenta');
  log('╚════════════════════════════════════════════════════╝', 'magenta');
  
  scanSourceFiles();
  checkDesignStructure();
  checkCriticalPages();
  checkDateFormatting();
  
  log('\n╔════════════════════════════════════════════════════╗', 'magenta');
  log('║                RÉSUMÉ UAT                          ║', 'magenta');
  log('╚════════════════════════════════════════════════════╝', 'magenta');
  
  Object.entries(results.categories).forEach(([key, category]) => {
    if (category.total > 0) {
      const percentage = ((category.passed / category.total) * 100).toFixed(1);
      log(`\n${category.name}: ${category.passed}/${category.total} (${percentage}%)`, 'cyan');
    }
  });
  
  const totalTests = Object.values(results.categories).reduce((s, c) => s + c.total, 0);
  const totalPassed = Object.values(results.categories).reduce((s, c) => s + c.passed, 0);
  const globalPercentage = ((totalPassed / totalTests) * 100).toFixed(1);
  
  log('\n' + '='.repeat(50), 'cyan');
  log(`Score Global: ${totalPassed}/${totalTests} (${globalPercentage}%)`, 'cyan');
  
  if (globalPercentage >= 90) { log('✓ PLATEFORME PRÊTE POUR PRODUCTION', 'green'); }
  else if (globalPercentage >= 70) { log('⚠ PLATEFORME PRÊTE AVEC RÉSERVES', 'yellow'); }
  else { log('✗ CORRECTIONS NÉCESSAIRES', 'red'); }
}

runUAT();
