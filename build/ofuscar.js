#!/usr/bin/env node
// ============================================================================
// Ofuscador específico para "Control de Calidad en la Edificación"
// ----------------------------------------------------------------------------
// A diferencia de un ofuscador genérico, este script conoce la estructura
// real de ESTA aplicación:
//
//  - config.js NUNCA se ofusca ni se fusiona: se copia tal cual, para que
//    el cliente final pueda seguir editando su GOOGLE_CLIENT_ID sin tener
//    que volver a pasar el ofuscador.
//  - Detecta no solo los <script src="..."> del HTML, sino también los
//    archivos que data.js inyecta dinámicamente (document.createElement
//    ('script')) y los incluye igualmente en el paquete ofuscado.
//  - Copia automáticamente TODO lo demás del proyecto (manifest.json,
//    iconos, styles.css, etc.) a la carpeta de salida, para que nada se
//    quede fuera por error.
//  - No incluye "anti-inspección" (bloqueo de F12/clic derecho) ni
//    "anti-debugger": son las opciones más propensas a romper la app en
//    móvil, y aquí lo que importa es que el código fuente no se lea a
//    simple vista, no impedir F12.
//  - Al terminar, abre el resultado en un navegador real (Playwright) y
//    comprueba que no haya errores de JavaScript ni peticiones fallidas,
//    antes de decir que el paquete está listo.
//
// Uso:
//   node build/ofuscar.js
//
// Resultado: carpeta  dist_ofuscado/  lista para subir al servidor tal cual
// (sustituye a toda la carpeta del proyecto, incluido manifest.json e
// iconos).
// ============================================================================

const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const PROJECT_DIR = path.resolve(__dirname, '..');
const OUT_DIR = path.join(PROJECT_DIR, 'dist_ofuscado');
const HTML_FILE = 'ControlCalidad.html';
const VERSION = Date.now(); // cache-busting automático, único cada vez

// Carpetas/archivos que nunca se copian al paquete de salida
const EXCLUDE = new Set(['.git', 'build', 'dist_ofuscado', 'node_modules', '.DS_Store']);

function log(msg) { console.log(msg); }

// ----------------------------------------------------------------------------
// 1. Copiar TODO el proyecto tal cual (así nunca falta manifest.json, iconos,
//    styles.css, ni nada que aparezca en el futuro). Luego se sobrescriben
//    solo los archivos que hace falta transformar.
// ----------------------------------------------------------------------------
function copyProjectAsIs() {
    fs.rmSync(OUT_DIR, { recursive: true, force: true });
    fs.mkdirSync(OUT_DIR, { recursive: true });

    function copyDir(src, dst) {
        for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
            if (EXCLUDE.has(entry.name)) continue;
            const s = path.join(src, entry.name);
            const d = path.join(dst, entry.name);
            if (entry.isDirectory()) {
                fs.mkdirSync(d, { recursive: true });
                copyDir(s, d);
            } else {
                fs.copyFileSync(s, d);
            }
        }
    }
    copyDir(PROJECT_DIR, OUT_DIR);
    log('✓ Copiado el proyecto completo (manifest, iconos, CSS, etc.) a dist_ofuscado/');
}

// ----------------------------------------------------------------------------
// 2. Analizar ControlCalidad.html: scripts locales, CDN, inline, y posición
//    de config.js (todo lo anterior y posterior a config.js se separa en dos
//    paquetes, para que config.js pueda seguir cargándose en medio, sin
//    ofuscar).
// ----------------------------------------------------------------------------
function analizarHtml(htmlText) {
    const scriptTagRe = /<script\b[^>]*>\s*<\/script>/gi;
    const srcRe = /src=["']([^"']+)["']/i;

    const tags = htmlText.match(scriptTagRe) || [];
    const locales = [];
    let configTag = null;

    tags.forEach(tag => {
        const m = tag.match(srcRe);
        if (!m) return; // inline: se deja intacto, no se toca
        const src = m[1];
        if (/^https?:\/\//i.test(src) || src.startsWith('//')) return; // CDN: se deja intacto
        const cleanName = src.split('?')[0];
        if (cleanName === 'config.js') { configTag = tag; return; }
        locales.push({ tag, src, cleanName });
    });

    if (!configTag) {
        throw new Error('No se ha encontrado <script src="config.js..."> en el HTML. Revisa el archivo antes de continuar.');
    }

    // Separar en "antes de config.js" y "después de config.js" según su
    // posición real en el documento
    const configPos = htmlText.indexOf(configTag);
    const pre = locales.filter(l => htmlText.indexOf(l.tag) < configPos);
    const post = locales.filter(l => htmlText.indexOf(l.tag) > configPos);

    return { pre, post, configTag };
}

// ----------------------------------------------------------------------------
// 3. Encontrar archivos "huérfanos": .js que existen en el proyecto pero que
//    NO están en ningún <script src="..."> del HTML, y que SÍ son
//    referenciados por su nombre dentro del código de otro script (el caso
//    de data.js, que carga 5 fichas dinámicamente). Si no se incluyen aquí,
//    el ofuscador los dejaría fuera del paquete y la aplicación los pediría
//    por red y daría 404.
// ----------------------------------------------------------------------------
function encontrarHuerfanos(pre, post) {
    const listados = new Set([...pre, ...post].map(l => l.cleanName));
    const todosLosJs = fs.readdirSync(PROJECT_DIR).filter(f => f.endsWith('.js'));
    const huerfanos = [];

    const contenidoCompleto = [...pre, ...post]
        .map(l => fs.readFileSync(path.join(PROJECT_DIR, l.cleanName), 'utf8'))
        .join('\n');

    for (const f of todosLosJs) {
        if (listados.has(f)) continue;
        // ¿Se menciona su nombre como nombre de archivo dentro de algún script?
        const re = new RegExp(`['"\`]${f.replace('.', '\\.')}(\\?[^'"\`]*)?['"\`]`);
        if (re.test(contenidoCompleto)) huerfanos.push(f);
    }
    return huerfanos;
}

// ----------------------------------------------------------------------------
// 4. Fusionar y ofuscar un grupo de archivos
// ----------------------------------------------------------------------------
const OBFUSCATOR_OPTIONS = {
    compact: true,
    controlFlowFlattening: false,   // mantiene el tamaño y el rendimiento razonables
    deadCodeInjection: false,
    identifierNamesGenerator: 'hexadecimal',
    renameGlobals: false,           // imprescindible: no tocar window.X entre archivos
    stringArray: true,
    stringArrayEncoding: ['base64'],
    stringArrayThreshold: 0.75,
    transformObjectKeys: false,     // imprescindible: no tocar nombres de propiedades
    debugProtection: false,         // desactivado: frágil en navegadores de móvil
    disableConsoleOutput: false
};

function fusionarYOfuscar(nombreSalida, archivos) {
    let bundle = '';
    archivos.forEach(f => {
        const texto = fs.readFileSync(path.join(PROJECT_DIR, f), 'utf8');
        bundle += `\n;// --- ${f} ---\n` + texto + '\n;';
    });
    const ofuscado = JavaScriptObfuscator.obfuscate(bundle, OBFUSCATOR_OPTIONS).getObfuscatedCode();
    fs.writeFileSync(path.join(OUT_DIR, nombreSalida), ofuscado);
    log(`✓ ${nombreSalida}  (${archivos.length} archivos, ${(ofuscado.length / 1024).toFixed(0)} KB)`);
}

// ----------------------------------------------------------------------------
// 5. Reescribir ControlCalidad.html: quitar los <script src> ya fusionados,
//    dejar config.js y los CDN intactos, no tocar el script inline.
// ----------------------------------------------------------------------------
function reescribirHtml(htmlText, pre, post) {
    let out = htmlText;

    const primeraTagPre = pre[0].tag;
    const primeraTagPost = post.length ? post[0].tag : null;

    pre.forEach(l => { out = out.replace(l.tag, l === pre[0] ? `<script src="bundle-a.min.js?v=${VERSION}"></script>` : ''); });
    if (post.length) {
        post.forEach(l => { out = out.replace(l.tag, l === post[0] ? `<script src="bundle-b.min.js?v=${VERSION}"></script>` : ''); });
    }
    return out;
}

// ----------------------------------------------------------------------------
// MAIN
// ----------------------------------------------------------------------------
(async () => {
    log('🚀 Generando paquete ofuscado específico para Control de Calidad...\n');

    copyProjectAsIs();

    const htmlText = fs.readFileSync(path.join(PROJECT_DIR, HTML_FILE), 'utf8');
    const { pre, post } = analizarHtml(htmlText);
    const huerfanos = encontrarHuerfanos(pre, post);

    if (huerfanos.length) {
        log(`\n⚠ Archivos cargados dinámicamente (no están en ningún <script src>), se incluyen igualmente: ${huerfanos.join(', ')}`);
    }

    log('\n⚙ Ofuscando bloque 1 (antes de config.js)...');
    fusionarYOfuscar('bundle-a.min.js', [...huerfanos, ...pre.map(l => l.cleanName)]);

    if (post.length) {
        log('\n⚙ Ofuscando bloque 2 (después de config.js: Drive, app, móvil)...');
        fusionarYOfuscar('bundle-b.min.js', post.map(l => l.cleanName));
    }

    // Borrar del paquete de salida los .js individuales que ya están dentro
    // de los bundles, para que no quede el código fuente legible al lado.
    const yaIncluidos = new Set([...huerfanos, ...pre.map(l => l.cleanName), ...post.map(l => l.cleanName)]);
    yaIncluidos.forEach(f => {
        const p = path.join(OUT_DIR, f);
        if (fs.existsSync(p)) fs.unlinkSync(p);
    });
    log(`\n✓ Eliminados del paquete ${yaIncluidos.size} archivos .js sueltos (ya están dentro de los bundle-*.min.js)`);

    const htmlFinal = reescribirHtml(htmlText, pre, post);
    fs.writeFileSync(path.join(OUT_DIR, HTML_FILE), htmlFinal);
    log(`✓ ${HTML_FILE} reescrito (config.js intacto y editable, script inline intacto)`);

    log('\n📦 Paquete generado en: ' + OUT_DIR);
    log('   config.js se mantiene SIN ofuscar y editable, tal como lo necesita el cliente.');

    // --------------------------------------------------------------------
    // Autoverificación: abrir el resultado en un navegador real
    // --------------------------------------------------------------------
    log('\n🔎 Verificando el paquete en un navegador real...');
    await verificar();
})().catch(err => {
    console.error('\n❌ ERROR:', err.message);
    process.exit(1);
});

async function verificar() {
    const { chromium } = require('/opt/npm-tools/node_modules/playwright');
    const http = require('http');
    const handler = require('serve-handler');

    const server = http.createServer((req, res) => handler(req, res, { public: OUT_DIR }));
    await new Promise(r => server.listen(0, r));
    const port = server.address().port;

    const browser = await chromium.launch();
    const page = await browser.newPage();
    const problemas = [];
    page.on('pageerror', e => problemas.push('Error de JS: ' + e.message));
    page.on('response', r => {
        if (r.status() === 404 && !r.url().includes('transparenttextures') && !r.url().includes('cdnjs') && !r.url().includes('unpkg')) {
            problemas.push('404: ' + r.url());
        }
    });

    await page.goto(`http://127.0.0.1:${port}/${HTML_FILE}`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1000);
    const textoVisible = await page.locator('body').innerText().catch(() => '');

    await browser.close();
    server.close();

    if (problemas.length === 0 && textoVisible.length > 100) {
        log('\n✅ VERIFICADO: sin errores de JavaScript, sin archivos que falten, la pantalla inicial se pinta bien.');
        log('   El paquete está listo para subir al servidor.');
    } else {
        log('\n⚠ Se han encontrado problemas, NO subas este paquete todavía:');
        problemas.forEach(p => log('   - ' + p));
        if (textoVisible.length <= 100) log('   - La pantalla apenas muestra contenido (posible fallo al arrancar)');
        process.exitCode = 1;
    }
}
