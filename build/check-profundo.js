const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const http = require('http');
const handler = require('serve-handler');
const path = require('path');

const OUT_DIR = path.resolve(__dirname, '..', 'dist_ofuscado');

(async () => {
    const server = http.createServer((req, res) => handler(req, res, { public: OUT_DIR }));
    await new Promise(r => server.listen(0, r));
    const port = server.address().port;

    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${port}/ControlCalidad.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    const check = await page.evaluate(() => ({
        materialesTemplate: typeof materialesTemplate !== 'undefined' && Array.isArray(materialesTemplate) ? materialesTemplate.length : 'FALTA',
        CustomControlsManager: !!window.CustomControlsManager && typeof window.CustomControlsManager.addHabitual === 'function',
        DriveStore: !!window.DriveStore && typeof window.DriveStore.conectar === 'function',
        APP_CONFIG: !!window.APP_CONFIG && !!window.APP_CONFIG.GOOGLE_CLIENT_ID,
        renderRecepcionHormigonCalc: typeof window.renderRecepcionHormigonCalc === 'function',
        renderEjecOtrosCalc_huerfano: typeof window.renderEjecOtrosCalc === 'function',
        renderRecepcionRellenosCalc_huerfano: typeof window.renderRecepcionRellenosCalc === 'function',
        soportaLocal: typeof window.soportaLocal !== 'undefined' ? window.soportaLocal : 'no definido (variable interna de app.js, normal si no es global)',
    }));

    console.log('Comprobación de piezas clave tras cargar el paquete ofuscado:');
    console.log(JSON.stringify(check, null, 2));

    // Intentar abrir el gestor de puntos personalizados pulsando su botón
    const btn = page.locator('text=Puntos Personalizados');
    const existe = await btn.count();
    console.log('\n¿Existe el botón "Puntos Personalizados"?', existe > 0);
    if (existe > 0) {
        await btn.first().click();
        await page.waitForTimeout(500);
        const modalVisible = await page.locator('text=Gestor de Bases de Datos').count();
        console.log('¿Se abre el Gestor de Bases de Datos al pulsarlo?', modalVisible > 0);
    }

    await browser.close();
    server.close();
})();
