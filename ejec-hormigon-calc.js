// Lotes y UIs teóricos de la ejecución de estructuras de hormigón, a partir de los datos guardados
window.teoricoEjecHormigon = function (data) {
    const n = (v) => parseFloat(v) || 0;
    const c_el = n(data.cim_elements), c_ar = n(data.cim_area), c_vo = n(data.cim_volume);
    const v_fl = n(data.vert_floors), v_el = n(data.vert_elements), v_vo = n(data.vert_volume);
    const h_fl = n(data.horiz_floors), h_ar = n(data.horiz_area), h_vo = n(data.horiz_volume);
    const lotesCim = Math.max(Math.ceil(c_ar / 250), Math.ceil(c_el / 10));
    const uisCim = c_vo < 350 ? c_el : Math.max(Math.ceil(c_el / 10), Math.ceil(c_vo / 250));
    const volVertPerFloor = v_fl > 0 ? v_vo / v_fl : 0;
    const elemVertPerFloor = v_fl > 0 ? v_el / v_fl : 0;
    const lotesVert = Math.max(1, Math.ceil(volVertPerFloor / 100)) * v_fl;
    const uisVert = Math.max(Math.ceil(elemVertPerFloor / 10), Math.ceil(volVertPerFloor / 100)) * v_fl;
    const areaHorizPerFloor = h_fl > 0 ? h_ar / h_fl : 0;
    const volHorizPerFloor = h_fl > 0 ? h_vo / h_fl : 0;
    const lotesHoriz = Math.max(Math.ceil(areaHorizPerFloor / 250), Math.ceil(volHorizPerFloor / 250)) * h_fl;
    const uisHoriz = Math.max(1, Math.ceil(areaHorizPerFloor / 250)) * h_fl;
    return {
        cim: { lotes: lotesCim, uis: uisCim }, vert: { lotes: lotesVert, uis: uisVert }, horiz: { lotes: lotesHoriz, uis: uisHoriz },
        totalLotes: lotesCim + lotesVert + lotesHoriz, totalUis: uisCim + uisVert + uisHoriz
    };
};

window.renderEjecHormigonCalc = function(container, materialId) {
    const projectData = currentProject;
    if (!projectData.formData) projectData.formData = {};
    if (!projectData.formData[materialId] || Object.keys(projectData.formData[materialId]).length === 0) {
        projectData.formData[materialId] = {
            cim_elements: "",
            cim_area: "",
            cim_volume: "",
            vert_floors: "",
            vert_elements: "",
            vert_volume: "",
            horiz_floors: "",
            horiz_area: "",
            horiz_volume: "",
            checks: {},
            uisCreated: { cim: 0, vert: 0, horiz: 0 }
        };
    }
    
    const data = projectData.formData[materialId];
    if (!data.uisCreated) data.uisCreated = { cim: 0, vert: 0, horiz: 0 };
    if (!data.checks) data.checks = {};

    // Checklists base
    const checklists = {
        cim: [
            "Limpieza de la excavación y vertido uniforme del hormigón de limpieza (mínimo 10 cm).",
            "Comprobación dimensiones zapatas y riostras",
            "Verificación de tipo de acero, diámetro, longitud de patillas y separación del armado.",
            "Control del recubrimiento libre inferior de armadura mediante separadores homologados.",
            "Replanteo y fijación del armado de espera.",
            "Compactación mecánica uniforme mediante vibrador.",
            "Hormigón previsto según proyecto (resistencia y ambiente)",
            "Curado del hormigón por el período establecido."
        ],
        vert: [
            "Replanteo de ejes y caras",
            "Limpieza de la base de arranque del pilar mediante soplado a presión.",
            "Verificación de tipo de acero, diámetros y disposición de armaduras.",
            "Control de la verticalidad (plomo lateral del encofrado, tolerancia 5 mm).",
            "Estanqueidad de la junta inferior del encofrado.",
            "Disposición de separadores de rueda en el alzado del pilar (mínimo 3 niveles).",
            "Verificación de la longitud de solape de esperas y espaciado de estribos.",
            "Hormigón previsto según proyecto (resistencia y ambiente)",
            "Hormigonado continuo por tongadas verticales (caída libre máx. 1.5m).",
            "Respeto de los tiempos de desencofrado.",
            "Curado del hormigón por el período establecido."
        ],
        horiz: [
            "Nivelación del plano inferior del encofrado, previendo contraflechas.",
            "Control de estabilidad y arriostramiento del apuntalamiento.",
            "Verificación de tipo de acero, diámetros y disposición de armaduras y colocación mallazo.",
            "Disposición de los refuerzos frente a punzonamiento en capiteles y nervios de reticular.",
            "Disposición de separadores.",
            "Comprobación de la reserva y paso de instalaciones antes del vertido.",
            "Canto total del forjado según proyecto",
            "Hormigón previsto según proyecto (resistencia y ambiente)",
            "Vibrado por sectores y control del espesor de la losa mediante maestras.",
            "Curado continuo con agua pulverizada o aditivos filmógenos."
        ]
    };

    container.innerHTML = `
        <div class="card" style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1.5rem;">
                <h2>Control de ejecución de Estructuras de hormigón</h2>
            </div>

            <div class="eh-param-block" data-param-type="cim">
                <h3 style="font-size: 1.05rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.75rem;">Parámetros Cimentación</h3>
                <div class="dynamic-grid">
                    <div class="form-group"><label class="form-label">Elementos indep. (zapatas)</label><input type="number" id="eh-cim-elements" class="form-control" value="${escHtml(data.cim_elements)}"></div>
                    <div class="form-group"><label class="form-label">Sup. ocupación (m²)</label><input type="number" id="eh-cim-area" class="form-control" value="${escHtml(data.cim_area)}"></div>
                    <div class="form-group"><label class="form-label">Volumen hormigón (m³)</label><input type="number" id="eh-cim-volume" class="form-control" value="${escHtml(data.cim_volume)}"></div>
                </div>
                <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">*Lotes cimentación: máx 250 m² planta o 10 elementos. UIs: Cada elemento si vol < 350m³, si no, máx 10 elem / 250m³.</p>
            </div>

            <div class="eh-param-block" data-param-type="vert">
                <h3 style="font-size: 1.05rem; font-weight: 600; color: var(--text-main); margin-top: 1.25rem; margin-bottom: 0.75rem;">Parámetros Estructura vertical</h3>
                <div class="dynamic-grid">
                    <div class="form-group"><label class="form-label">Nº Plantas con pilares</label><input type="number" id="eh-vert-floors" class="form-control" value="${escHtml(data.vert_floors)}"></div>
                    <div class="form-group"><label class="form-label">Pilares totales</label><input type="number" id="eh-vert-elements" class="form-control" value="${escHtml(data.vert_elements)}"></div>
                    <div class="form-group"><label class="form-label">Volumen pilares (m³)</label><input type="number" id="eh-vert-volume" class="form-control" value="${escHtml(data.vert_volume)}"></div>
                </div>
                <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">*Lotes verticales: se limitan a 1 planta. UIs: máx 10 soportes o 100m³.</p>
            </div>

            <div class="eh-param-block" data-param-type="horiz">
                <h3 style="font-size: 1.05rem; font-weight: 600; color: var(--text-main); margin-top: 1.25rem; margin-bottom: 0.75rem;">Parámetros Estructura horizontal</h3>
                <div class="dynamic-grid">
                    <div class="form-group"><label class="form-label">Nº Plantas forjado</label><input type="number" id="eh-horiz-floors" class="form-control" value="${escHtml(data.horiz_floors)}"></div>
                    <div class="form-group"><label class="form-label">Superficie total (m²)</label><input type="number" id="eh-horiz-area" class="form-control" value="${escHtml(data.horiz_area)}"></div>
                    <div class="form-group"><label class="form-label">Volumen forjados (m³)</label><input type="number" id="eh-horiz-volume" class="form-control" value="${escHtml(data.horiz_volume)}"></div>
                </div>
                <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">*Lotes forjados: máx 250m² o 250m³ o 2 plantas. UIs: máx 250m².</p>
            </div>
            
            <div style="text-align: right; margin-top: 1.5rem; border-top: 1px solid var(--border); padding-top: 1.5rem;">
                <button id="eh-btn-calcular" class="btn btn-primary" style="font-size: 1.1rem; padding: 0.75rem 2rem;">Calcular Lotes y UIs Teóricos</button>
            </div>
        </div>

        <div class="card" style="margin-bottom: 2rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 1.5rem;">
            <h2 style="color: var(--primary);">Resultados Teóricos de Lotes y UIs</h2>
            <div id="eh-results-summary" style="margin-bottom: 1.5rem;">
                <!-- Resumen Lotes y UIs teóricas -->
            </div>
            <h2 style="color: var(--text-main); margin-top: 2rem; border-top: 2px solid var(--border); padding-top: 1rem;">Registro de Inspecciones en Obra</h2>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.5rem;">Crea manualmente cada Unidad de Inspección (UI) a medida que la obra avanza para llevar el control.</p>
            <div id="eh-ui-container">
                <!-- Aquí se generarán dinámicamente los bloques de UI con sus checklists creadas manualmente -->
            </div>
        </div>
    `;

    // Eventos
    const inputs = ['cim-elements', 'cim-area', 'cim-volume', 'vert-floors', 'vert-elements', 'vert-volume', 'horiz-floors', 'horiz-area', 'horiz-volume'];
    inputs.forEach(id => {
        const inputEl = container.querySelector('#eh-'+id);
        if (inputEl) {
            const handleUpdate = (e) => {
                const key = id.replace('-', '_');
                let val = e.target.value === "" ? "" : parseFloat(e.target.value);
                if(val !== "" && val < 0) val = 0;
                data[key] = val;
                calculateAndRender();
            };
            inputEl.addEventListener('change', handleUpdate);
            inputEl.addEventListener('input', handleUpdate);
        }
    });

    const btnCalcular = container.querySelector('#eh-btn-calcular');
    if (btnCalcular) {
        btnCalcular.addEventListener('click', () => {
            calculateAndRender();
        });
    }

    // Impresión desde los datos
    const TITULOS_EH = { cim: 'Cimentación', vert: 'Estructura vertical', horiz: 'Estructura horizontal' };
    if (window.registrarImpresionFicha) registrarImpresionFicha(materialId, (d, soloDatos, H) => {
        const t = window.teoricoEjecHormigon(d);
        const checks = d.checks || {};
        let html = '';
        const partida = {
            cim: [[d.cim_elements, 'elementos'], [d.cim_area, 'm²'], [d.cim_volume, 'm³']],
            vert: [[d.vert_floors, 'plantas'], [d.vert_elements, 'pilares'], [d.vert_volume, 'm³']],
            horiz: [[d.horiz_floors, 'plantas'], [d.horiz_area, 'm²'], [d.horiz_volume, 'm³']]
        };
        const filasTeo = ['cim', 'vert', 'horiz'].filter(k => !soloDatos || t[k].lotes > 0 || t[k].uis > 0).map(k => [
            H.esc(TITULOS_EH[k]),
            H.esc(partida[k].filter(([v]) => v !== '' && v !== undefined && v !== null).map(([v, u]) => `${String(v).replace('.', ',')} ${u}`).join(' · ')),
            String(t[k].lotes), String(t[k].uis)
        ]);
        if (filasTeo.length) {
            filasTeo.push({ clase: 'pd-fila-total', celdas: ['<b>Total estructura</b>', '', `<b>${t.totalLotes}</b>`, `<b>${t.totalUis}</b>`] });
            html += H.subtitulo('Lotes y unidades de inspección teóricos');
            html += H.tabla([{ t: 'Tipo estructural', w: '28%' }, { t: 'Datos de partida', w: '44%' }, { t: 'Lotes', w: '14%', clase: 'pd-centro' }, { t: 'UIs', w: '14%', clase: 'pd-centro' }], filasTeo);
        }
        let nUis = 0, nPuntos = 0, nRev = 0;
        ['cim', 'vert', 'horiz'].forEach(type => {
            const n = (d.uisCreated || {})[type] || 0;
            let bloques = '';
            for (let i = 1; i <= n; i++) {
                const puntos = checklists[type].map((name, idx) => {
                    const c = checks[`${type}_ui${i}_c${idx}`] || {};
                    return { name, val: c.status || '', date: c.date || '' };
                });
                Object.keys(checks).filter(k => k.startsWith(`${type}_ui${i}_cust_`)).forEach(k => {
                    const c = checks[k] || {};
                    if (c.label || c.status || c.date) puntos.push({ name: c.label || '', val: c.status || '', date: c.date || '' });
                });
                const nombre = `UI ${i}` + (checks[`${type}_ui${i}_name`] ? ' · ' + checks[`${type}_ui${i}_name`] : '');
                const b = H.bloquePuntos({ nombre, fecha: checks[`${type}_ui${i}_date`], meta: [['Lote', checks[`${type}_ui${i}_lote`]]], puntos }, soloDatos);
                if (!b) continue;
                nUis++; nPuntos += puntos.length; nRev += puntos.filter(p => p.val).length;
                bloques += b;
            }
            if (bloques) html += H.subtitulo('Inspecciones · ' + TITULOS_EH[type]) + bloques;
        });
        return { html, resumen: [t.totalLotes ? `${t.totalLotes} lotes teóricos` : '', H.plural(nUis, 'unidad de inspección', 'unidades de inspección'), nPuntos ? `${nRev} de ${nPuntos} puntos revisados` : ''] };
    });

    function calculateAndRender() {
        // Valores base para el calculo (parsear los vacíos a 0 para que no fallen las divisiones)
        const c_el = parseFloat(data.cim_elements) || 0;
        const c_ar = parseFloat(data.cim_area) || 0;
        const c_vo = parseFloat(data.cim_volume) || 0;
        const v_fl = parseFloat(data.vert_floors) || 0;
        const v_el = parseFloat(data.vert_elements) || 0;
        const v_vo = parseFloat(data.vert_volume) || 0;
        const h_fl = parseFloat(data.horiz_floors) || 0;
        const h_ar = parseFloat(data.horiz_area) || 0;
        const h_vo = parseFloat(data.horiz_volume) || 0;

        // Cimentacion
        const lotesCim = Math.max(Math.ceil(c_ar / 250), Math.ceil(c_el / 10));
        let uisCimTeorico = 0;
        if (c_vo < 350) {
            uisCimTeorico = c_el;
        } else {
            uisCimTeorico = Math.max(Math.ceil(c_el / 10), Math.ceil(c_vo / 250));
        }

        // Vertical
        const volVertPerFloor = v_fl > 0 ? v_vo / v_fl : 0;
        const elemVertPerFloor = v_fl > 0 ? v_el / v_fl : 0;
        const totalLotesVert = Math.max(1, Math.ceil(volVertPerFloor / 100)) * v_fl;
        const uisVertPerFloor = Math.max(Math.ceil(elemVertPerFloor / 10), Math.ceil(volVertPerFloor / 100));
        const totalUisVertTeorico = uisVertPerFloor * v_fl;

        // Horizontal
        const areaHorizPerFloor = h_fl > 0 ? h_ar / h_fl : 0;
        const volHorizPerFloor = h_fl > 0 ? h_vo / h_fl : 0;
        const totalLotesHoriz = Math.max(Math.ceil(areaHorizPerFloor / 250), Math.ceil(volHorizPerFloor / 250)) * h_fl;
        const uisHorizPerFloor = Math.max(1, Math.ceil(areaHorizPerFloor / 250));
        const totalUisHorizTeorico = uisHorizPerFloor * h_fl;

        const totalLotes = lotesCim + totalLotesVert + totalLotesHoriz;
        const totalUis = uisCimTeorico + totalUisVertTeorico + totalUisHorizTeorico;

        const summaryEl = container.querySelector('#eh-results-summary');
        if (summaryEl) {
            summaryEl.innerHTML = `
                <div style="overflow-x:auto;">
                    <table class="eh-summary-table">
                        <thead>
                            <tr>
                                <th style="text-align: left;">Tipo Estructural</th>
                                <th style="width: 25%;">Lotes</th>
                                <th style="width: 25%;">UIs</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr data-summary-type="cim">
                                <td style="text-align: left; font-weight: 500;">Cimentación</td>
                                <td class="eh-num-val">${lotesCim}</td>
                                <td class="eh-num-val">${uisCimTeorico}</td>
                            </tr>
                            <tr data-summary-type="vert">
                                <td style="text-align: left; font-weight: 500;">Estructura Vertical</td>
                                <td class="eh-num-val">${totalLotesVert}</td>
                                <td class="eh-num-val">${totalUisVertTeorico}</td>
                            </tr>
                            <tr data-summary-type="horiz">
                                <td style="text-align: left; font-weight: 500;">Estructura Horizontal</td>
                                <td class="eh-num-val">${totalLotesHoriz}</td>
                                <td class="eh-num-val">${totalUisHorizTeorico}</td>
                            </tr>
                            <tr style="background: #f8fafc; font-weight: bold;">
                                <td style="text-align: left; text-transform: uppercase;">TOTAL ESTRUCTURA</td>
                                <td class="eh-num-val eh-num-total">${totalLotes}</td>
                                <td class="eh-num-val eh-num-total">${totalUis}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
        }

        const uiContainer = container.querySelector('#eh-ui-container');
        if (!uiContainer) return;
        uiContainer.innerHTML = '';

        function renderUIBlocks(title, type, checksArray) {
            const sec = document.createElement('div');
            sec.className = 'eh-uisection';
            sec.dataset.type = type;
            sec.style.marginBottom = '3rem';
            
            // Header del tipo
            const headerHtml = `<div style="display:flex; justify-content:space-between; align-items:center; background: var(--primary); color: white; padding: 0.6rem 1rem; margin-bottom: 1rem; border-radius: 4px;">
                <h3 style="margin:0; color:white; font-size:1.15rem;">${title}</h3>
            </div>`;
            sec.innerHTML = headerHtml;
            
            let totalUsedInType = 0;
            const currentCount = data.uisCreated[type] || 0;

            for(let i=1; i<=currentCount; i++) {
                const uiCard = document.createElement('div');
                uiCard.className = 'eh-uicard';
                uiCard.style.border = '1px solid var(--border)';
                uiCard.style.padding = '1rem';
                uiCard.style.marginBottom = '1.25rem';
                uiCard.style.background = 'white';
                uiCard.style.borderRadius = '4px';
                
                const uiDateId = `${type}_ui${i}_date`;
                const uiLoteId = `${type}_ui${i}_lote`;
                const uiNameId = `${type}_ui${i}_name`;

                if (!data.checks[uiDateId]) data.checks[uiDateId] = "";
                if (data.checks[uiLoteId] === undefined) data.checks[uiLoteId] = "";
                if (data.checks[uiNameId] === undefined) data.checks[uiNameId] = "";

                // Sincronizar puntos habituales para esta UI
                if (window.CustomControlsManager) {
                    const habPoints = window.CustomControlsManager.getPoints(materialId, type);
                    habPoints.forEach((hText) => {
                        let found = false;
                        Object.keys(data.checks).forEach(k => {
                            if (k.startsWith(`${type}_ui${i}_cust_`) && data.checks[k] && data.checks[k].label === hText) {
                                found = true;
                            }
                        });
                        if (!found) {
                            const newK = `${type}_ui${i}_cust_hab_${Math.abs(hText.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0))}`;
                            if (!data.checks[newK]) {
                                data.checks[newK] = { label: hText, status: "", date: "", isCustom: true };
                            }
                        }
                    });
                }

                const custKeys = Object.keys(data.checks).filter(k => k.startsWith(`${type}_ui${i}_cust_`));

                // Determinar si hay checks usados
                let usedCount = 0;
                checksArray.forEach((chk, idx) => {
                    const chkId = `${type}_ui${i}_c${idx}`;
                    if(data.checks[chkId] && (data.checks[chkId].status !== "" || data.checks[chkId].date !== "")) usedCount++;
                });
                custKeys.forEach(ck => {
                    const obj = data.checks[ck];
                    if (obj && (obj.label || obj.status || obj.date)) usedCount++;
                });
                const customId = `${type}_ui${i}_custom`;
                if (data.checks[customId] && data.checks[customId].label && data.checks[customId].label.trim()) {
                    const migKey = `${type}_ui${i}_cust_mig_${Date.now()}`;
                    data.checks[migKey] = { label: data.checks[customId].label, status: data.checks[customId].status || '', date: data.checks[customId].date || '', isCustom: true };
                    delete data.checks[customId];
                }
                if(data.checks[uiDateId]) usedCount++;

                if (usedCount > 0) totalUsedInType++;

                const hideUnused = false;

                let checksHtml = `<div class="eh-ui-header" style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap: 0.75rem; border-bottom: 1px solid var(--border); padding-bottom: 0.6rem; margin-bottom:0.75rem; background: #f8fafc; padding: 0.6rem; border-radius: 4px;">
                    <div style="display:flex; align-items:center; gap: 0.5rem;">
                        <span style="background: var(--primary); color: white; padding: 0.25rem 0.6rem; border-radius: 4px; font-weight: bold; font-size: 0.85rem;">UI #${i}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap: 0.4rem;">
                        <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); white-space:nowrap;">Lote:</label>
                        <input type="text" class="eh-uilote form-control" data-id="${uiLoteId}" value="${escHtml(data.checks[uiLoteId])}" placeholder="Ej. Lote 1" style="width: 110px; padding: 0.25rem 0.5rem; font-size: 0.85rem;">
                    </div>
                    <div style="display:flex; align-items:center; gap: 0.4rem; flex: 1; min-width: 220px;">
                        <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); white-space:nowrap;">Unidad / Elemento:</label>
                        <input type="text" class="eh-uiname form-control" data-id="${uiNameId}" value="${escHtml(data.checks[uiNameId])}" placeholder="Ej. Zapatas Z1 a Z4 / Pilares PB / Forjado P1..." style="flex:1; padding: 0.25rem 0.5rem; font-size: 0.85rem;">
                    </div>
                    <div style="display:flex; align-items:center; gap: 0.4rem;">
                        <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); white-space:nowrap;">Fecha:</label>
                        <input type="date" class="eh-uidate form-control" data-id="${uiDateId}" value="${escHtml(data.checks[uiDateId])}" style="width: 135px; padding: 0.25rem; font-weight: bold; border-color: var(--primary);" title="Fecha de control">
                    </div>
                    <div style="display:flex; align-items:center; gap: 0.5rem;">
                        <button type="button" class="btn eh-btn-add-custom-point" data-type="${type}" data-ui="${i}" style="font-size:0.8rem; padding:0.25rem 0.6rem; border:1px dashed var(--primary); background:transparent; color:var(--primary); font-weight:600; cursor:pointer; border-radius:4px;" title="Añadir punto de control personalizado a esta UI">+ Añadir punto de control</button>
                        <button type="button" class="btn eh-btn-fill-all" style="font-size:0.8rem; padding:0.25rem 0.6rem; background:#10b981; color:white; border:none; border-radius:4px; font-weight:600; cursor:pointer; white-space:nowrap;" title="Poner 'Correcto' y fecha de hoy en todos los puntos de esta unidad">✓ Todo Correcto hoy</button>
                        <button type="button" class="btn eh-btn-toggle-vacios" style="font-size:0.8rem; padding:0.25rem 0.5rem; border:1px solid var(--border); white-space:nowrap;" onclick="var card = this.closest('.eh-uicard'); var rows = card.querySelectorAll('.unused-row'); var isHidden = rows[0] && rows[0].style.display === 'none'; Array.from(rows).forEach(r => r.style.display = isHidden ? 'table-row' : 'none'); this.innerText = isHidden ? 'Ocultar vacíos' : 'Mostrar vacíos';">Ocultar vacíos</button>
                    </div>
                </div>`;
                checksHtml += `<div style="overflow-x:auto;"><table style="width:100%; border-collapse: collapse; font-size:0.85rem; min-width: 600px;">
                    <thead><tr>
                        <th style="width:60%; text-align:left; border:1px solid var(--border); padding:0.4rem;">Punto de Inspección </th>
                        <th style="width:20%; border:1px solid var(--border); padding:0.4rem;">Estado</th>
                        <th style="width:20%; border:1px solid var(--border); padding:0.4rem;">Fecha de Inspección</th>
                    </tr></thead><tbody>`;

                checksArray.forEach((chk, idx) => {
                    const chkId = `${type}_ui${i}_c${idx}`;
                    if(!data.checks[chkId]) data.checks[chkId] = { status: "", date: "" };
                    const isUsed = data.checks[chkId].status !== "" || data.checks[chkId].date !== "";
                    const displayStyle = (hideUnused && !isUsed) ? 'display: none;' : 'display: table-row;';
                    const trClass = isUsed ? '' : 'unused-row';
                    
                    checksHtml += `<tr class="${trClass}" style="${displayStyle}">
                        <td style="border:1px solid var(--border); padding:0.4rem;">${chk}</td>
                        <td style="border:1px solid var(--border); padding:0.4rem;">
                            <select class="eh-status form-control" data-id="${chkId}" style="width:100%; padding:0.2rem; margin:0;">
                                <option value="" ${data.checks[chkId].status === '' ? 'selected' : ''}></option>
                                <option value="Correcto" ${data.checks[chkId].status === 'Correcto' ? 'selected' : ''}>Correcto</option>
                                <option value="Incorrecto" ${data.checks[chkId].status === 'Incorrecto' ? 'selected' : ''}>Incorrecto</option>
                            </select>
                        </td>
                        <td style="border:1px solid var(--border); padding:0.4rem;">
                            <input type="date" class="eh-date form-control" data-id="${chkId}" value="${escHtml(data.checks[chkId].date)}" style="width:100%; padding:0.2rem; margin:0;">
                        </td>
                    </tr>`;
                });

                // Puntos de control personalizados
                custKeys.forEach(custKey => {
                    const chkObj = data.checks[custKey] || { label: '', status: '', date: '' };
                    const isUsed = (chkObj.label && chkObj.label !== "") || chkObj.status !== "" || chkObj.date !== "";
                    const displayStyle = (hideUnused && !isUsed) ? 'display: none;' : 'display: table-row;';
                    const trClass = isUsed ? '' : 'unused-row';
                    const isHab = window.CustomControlsManager && window.CustomControlsManager.isHabitual(materialId, type, chkObj.label);

                    checksHtml += `<tr class="${trClass}" style="${displayStyle}">
                        <td style="border:1px solid var(--border); padding:0.4rem;">
                            <div style="display:flex; align-items:center; gap:0.4rem; width:100%;">
                                <input type="text" class="eh-label form-control" data-id="${custKey}" placeholder="Punto de control personalizado..." value="${(chkObj.label || '').replace(/'/g, '&#39;')}" style="width:100%; padding:0.25rem 0.4rem; font-size:0.85rem; border:1px solid var(--border); border-radius:4px; flex:1;">
                                ${isHab 
                                    ? `<span class="badge print-hidden" title="Punto guardado en tu base de datos propia" style="background:#e0e7ff; color:#3730a3; font-size:0.7rem; padding:0.2rem 0.45rem; border-radius:4px; white-space:nowrap; font-weight:600;">⭐ Habitual</span>`
                                    : `<button type="button" class="btn eh-btn-make-habitual" data-type="${type}" data-id="${custKey}" title="Guardar como habitual en tu archivo .json" style="font-size:0.75rem; padding:0.2rem 0.45rem; background:#f8fafc; border:1px solid #cbd5e1; border-radius:4px; cursor:pointer; white-space:nowrap; color:#475569; font-weight:600;">⭐ Guardar habitual</button>`
                                }
                                <button type="button" class="btn eh-btn-del-custom" data-type="${type}" data-id="${custKey}" title="Eliminar punto de control" style="background:transparent; border:none; color:#ef4444; cursor:pointer; font-size:1rem; padding:0.15rem; line-height:1;">🗑️</button>
                            </div>
                        </td>
                        <td style="border:1px solid var(--border); padding:0.4rem;">
                            <select class="eh-status form-control" data-id="${custKey}" style="width:100%; padding:0.2rem; margin:0;">
                                <option value="" ${chkObj.status === '' ? 'selected' : ''}></option>
                                <option value="Correcto" ${chkObj.status === 'Correcto' ? 'selected' : ''}>Correcto</option>
                                <option value="Incorrecto" ${chkObj.status === 'Incorrecto' ? 'selected' : ''}>Incorrecto</option>
                            </select>
                        </td>
                        <td style="border:1px solid var(--border); padding:0.4rem;">
                            <input type="date" class="eh-date form-control" data-id="${custKey}" value="${escHtml(chkObj.date || '')}" style="width:100%; padding:0.2rem; margin:0;">
                        </td>
                    </tr>`;
                });
                checksHtml += '</tbody></table></div>';
                uiCard.innerHTML = checksHtml;

                // Evento para el botón de rellenar todo en Correcto con fecha de hoy / Deshacer
                const fillBtn = uiCard.querySelector('.eh-btn-fill-all');
                if (fillBtn) {
                    fillBtn.addEventListener('click', () => {
                        const isUndo = fillBtn.dataset.state === 'undo';

                        if (!isUndo) {
                            // Guardar backup antes de rellenar
                            const backup = {
                                mainDate: data.checks[uiDateId] || "",
                                checks: {}
                            };
                            checksArray.forEach((chk, idx) => {
                                const chkId = `${type}_ui${i}_c${idx}`;
                                backup.checks[chkId] = data.checks[chkId] ? { ...data.checks[chkId] } : { status: "", date: "" };
                            });
                            custKeys.forEach(custKey => {
                                backup.checks[custKey] = data.checks[custKey] ? { ...data.checks[custKey] } : { label: "", status: "", date: "" };
                            });
                            backup.checks[customId] = data.checks[customId] ? { ...data.checks[customId] } : { label: "", status: "", date: "" };
                            fillBtn._backup = backup;

                            const today = localToday();
                            
                            // Si la fecha general de la UI está vacía, rellenarla con la fecha de hoy
                            if (!data.checks[uiDateId]) {
                                data.checks[uiDateId] = today;
                                const mainDateInput = uiCard.querySelector(`.eh-uidate[data-id="${uiDateId}"]`);
                                if (mainDateInput) {
                                    mainDateInput.value = today;
                                    mainDateInput.setAttribute('value', today);
                                }
                            }
                            
                            // Marcar todos los checks predefinidos
                            checksArray.forEach((chk, idx) => {
                                const chkId = `${type}_ui${i}_c${idx}`;
                                if (!data.checks[chkId]) data.checks[chkId] = {};
                                data.checks[chkId].status = "Correcto";
                                data.checks[chkId].date = today;
                                
                                const sel = uiCard.querySelector(`.eh-status[data-id="${chkId}"]`);
                                if (sel) sel.value = "Correcto";
                                const dateInput = uiCard.querySelector(`.eh-date[data-id="${chkId}"]`);
                                if (dateInput) {
                                    dateInput.value = today;
                                    dateInput.setAttribute('value', today);
                                }
                            });

                            // Marcar puntos personalizados
                            custKeys.forEach(custKey => {
                                if (!data.checks[custKey]) data.checks[custKey] = { label: '', status: '', date: '', isCustom: true };
                                data.checks[custKey].status = "Correcto";
                                data.checks[custKey].date = today;
                                const sel = uiCard.querySelector(`.eh-status[data-id="${custKey}"]`);
                                if (sel) sel.value = "Correcto";
                                const dateInput = uiCard.querySelector(`.eh-date[data-id="${custKey}"]`);
                                if (dateInput) {
                                    dateInput.value = today;
                                    dateInput.setAttribute('value', today);
                                }
                            });
                            
                            // Si hay fila personalizada con texto, marcarla también
                            if (data.checks[customId] && data.checks[customId].label && data.checks[customId].label.trim() !== '') {
                                data.checks[customId].status = "Correcto";
                                data.checks[customId].date = today;
                                const customSel = uiCard.querySelector(`.eh-status[data-id="${customId}"]`);
                                if (customSel) customSel.value = "Correcto";
                                const customDate = uiCard.querySelector(`.eh-date[data-id="${customId}"]`);
                                if (customDate) {
                                    customDate.value = today;
                                    customDate.setAttribute('value', today);
                                }
                            }
                            
                            // Asegurar que todas las filas se muestren visibles
                            uiCard.querySelectorAll('tr').forEach(tr => {
                                tr.style.display = 'table-row';
                                tr.classList.remove('unused-row');
                            });
                            
                            const toggleBtn = uiCard.querySelector('.eh-btn-toggle-vacios');
                            if (toggleBtn) {
                                toggleBtn.innerText = 'Ocultar vacíos';
                            }

                            fillBtn.dataset.state = 'undo';
                            fillBtn.innerHTML = '↺ Deshacer todo';
                            fillBtn.style.background = '#64748b';
                            fillBtn.title = 'Deshacer y volver al estado anterior';
                        } else {
                            // DESHACER
                            const backup = fillBtn._backup;
                            if (backup) {
                                data.checks[uiDateId] = backup.mainDate;
                                const mainDateInput = uiCard.querySelector(`.eh-uidate[data-id="${uiDateId}"]`);
                                if (mainDateInput) {
                                    mainDateInput.value = backup.mainDate;
                                    mainDateInput.setAttribute('value', backup.mainDate);
                                }

                                checksArray.forEach((chk, idx) => {
                                    const chkId = `${type}_ui${i}_c${idx}`;
                                    const prev = backup.checks[chkId] || { status: "", date: "" };
                                    data.checks[chkId] = { ...prev };

                                    const sel = uiCard.querySelector(`.eh-status[data-id="${chkId}"]`);
                                    if (sel) sel.value = prev.status;
                                    const dateInput = uiCard.querySelector(`.eh-date[data-id="${chkId}"]`);
                                    if (dateInput) {
                                        dateInput.value = prev.date;
                                        dateInput.setAttribute('value', prev.date);
                                    }

                                    const tr = sel ? sel.closest('tr') : null;
                                    if (tr) {
                                        const isUsed = prev.status !== "" || prev.date !== "";
                                        if (!isUsed) tr.classList.add('unused-row');
                                        else tr.classList.remove('unused-row');
                                    }
                                });

                                custKeys.forEach(custKey => {
                                    if (backup.checks[custKey]) {
                                        const prev = backup.checks[custKey];
                                        data.checks[custKey].status = prev.status;
                                        data.checks[custKey].date = prev.date;
                                        const sel = uiCard.querySelector(`.eh-status[data-id="${custKey}"]`);
                                        if (sel) sel.value = prev.status;
                                        const dateInput = uiCard.querySelector(`.eh-date[data-id="${custKey}"]`);
                                        if (dateInput) {
                                            dateInput.value = prev.date;
                                            dateInput.setAttribute('value', prev.date);
                                        }
                                        const tr = sel ? sel.closest('tr') : null;
                                        if (tr) {
                                            const isUsed = (prev.label && prev.label !== "") || prev.status !== "" || prev.date !== "";
                                            if (!isUsed) tr.classList.add('unused-row');
                                            else tr.classList.remove('unused-row');
                                        }
                                    }
                                });

                                if (backup.checks[customId]) {
                                    const prevCustom = backup.checks[customId];
                                    data.checks[customId].status = prevCustom.status;
                                    data.checks[customId].date = prevCustom.date;
                                    const customSel = uiCard.querySelector(`.eh-status[data-id="${customId}"]`);
                                    if (customSel) customSel.value = prevCustom.status;
                                    const customDate = uiCard.querySelector(`.eh-date[data-id="${customId}"]`);
                                    if (customDate) {
                                        customDate.value = prevCustom.date;
                                        customDate.setAttribute('value', prevCustom.date);
                                    }
                                    const trCustom = customSel ? customSel.closest('tr') : null;
                                    if (trCustom) {
                                        const isUsedCustom = (prevCustom.label && prevCustom.label !== "") || prevCustom.status !== "" || prevCustom.date !== "";
                                        if (!isUsedCustom) trCustom.classList.add('unused-row');
                                        else trCustom.classList.remove('unused-row');
                                    }
                                }
                            } else {
                                checksArray.forEach((chk, idx) => {
                                    const chkId = `${type}_ui${i}_c${idx}`;
                                    data.checks[chkId] = { status: "", date: "" };
                                    const sel = uiCard.querySelector(`.eh-status[data-id="${chkId}"]`);
                                    if (sel) sel.value = "";
                                    const dateInput = uiCard.querySelector(`.eh-date[data-id="${chkId}"]`);
                                    if (dateInput) {
                                        dateInput.value = "";
                                        dateInput.setAttribute('value', "");
                                    }
                                    const tr = sel ? sel.closest('tr') : null;
                                    if (tr) tr.classList.add('unused-row');
                                });
                            }

                            fillBtn.dataset.state = 'fill';
                            fillBtn.innerHTML = '✓ Todo Correcto hoy';
                            fillBtn.style.background = '#10b981';
                            fillBtn.title = 'Poner "Correcto" y fecha de hoy en todos los puntos de esta unidad';
                        }
                    });
                }

                sec.appendChild(uiCard);
            }

            // Controles de añadir / quitar UI
            const btnContainer = document.createElement('div');
            btnContainer.style.display = 'flex';
            btnContainer.style.gap = '10px';
            btnContainer.style.marginTop = '10px';

            const addBtn = document.createElement('button');
            addBtn.className = 'btn btn-secondary';
            addBtn.innerHTML = `+ Añadir Unidad de Inspección`;
            addBtn.onclick = () => {
                data.uisCreated[type]++;
                const newIdx = data.uisCreated[type];
                const newDateId = `${type}_ui${newIdx}_date`;
                data.checks[newDateId] = localToday();
                calculateAndRender();
            };
            btnContainer.appendChild(addBtn);

            if (currentCount > 0) {
                const removeBtn = document.createElement('button');
                removeBtn.className = 'btn';
                removeBtn.style.color = '#dc2626';
                removeBtn.style.background = 'transparent';
                removeBtn.style.border = '1px solid #dc2626';
                removeBtn.innerHTML = `Eliminar última`;
                removeBtn.onclick = async () => {
                    if (await window.appConfirmar(`¿Eliminar la Unidad de Inspección ${currentCount} de esta fase? Se perderán las fechas y datos marcados.`)) {
                        // Limpiar las keys asociadas a la última UI para no dejarlas huérfanas
                        checksArray.forEach((chk, idx) => {
                            const chkId = `${type}_ui${currentCount}_c${idx}`;
                            delete data.checks[chkId];
                        });
                        Object.keys(data.checks).forEach(k => {
                            if (k.startsWith(`${type}_ui${currentCount}_cust_`)) {
                                delete data.checks[k];
                            }
                        });
                        delete data.checks[`${type}_ui${currentCount}_custom`];
                        delete data.checks[`${type}_ui${currentCount}_date`];
                        delete data.checks[`${type}_ui${currentCount}_lote`];
                        delete data.checks[`${type}_ui${currentCount}_name`];
                        
                        data.uisCreated[type]--;
                        calculateAndRender();
                    }
                };
                btnContainer.appendChild(removeBtn);
            }

            sec.dataset.hasData = totalUsedInType > 0 ? 'true' : 'false';
            if (totalUsedInType === 0) {
                sec.classList.add('eh-no-data');
            }

            sec.appendChild(btnContainer);
            uiContainer.appendChild(sec);
        }

        renderUIBlocks('Cimentación', 'cim', checklists.cim);
        renderUIBlocks('Estructura Vertical', 'vert', checklists.vert);
        renderUIBlocks('Estructura Horizontal', 'horiz', checklists.horiz);

        // Eventos a los checks
        container.querySelectorAll('.eh-status').forEach(el => {
            el.addEventListener('change', (e) => {
                data.checks[e.target.dataset.id].status = e.target.value;
            });
        });
        container.querySelectorAll('.eh-date').forEach(el => {
            el.addEventListener('change', (e) => {
                data.checks[e.target.dataset.id].date = e.target.value;
                e.target.setAttribute('value', e.target.value);
            });
        });

        container.querySelectorAll('.eh-uilote').forEach(el => {
            el.addEventListener('input', (e) => {
                data.checks[e.target.dataset.id] = e.target.value;
                e.target.setAttribute('value', e.target.value);
            });
        });
        container.querySelectorAll('.eh-uiname').forEach(el => {
            el.addEventListener('input', (e) => {
                data.checks[e.target.dataset.id] = e.target.value;
                e.target.setAttribute('value', e.target.value);
            });
        });

        container.querySelectorAll('.eh-uidate').forEach(el => {
            el.addEventListener('change', (e) => {
                data.checks[e.target.dataset.id] = e.target.value;
                e.target.setAttribute('value', e.target.value);
            });
        });
        container.querySelectorAll('.eh-label').forEach(el => {
            el.addEventListener('input', (e) => {
                data.checks[e.target.dataset.id].label = e.target.value;
                e.target.setAttribute('value', e.target.value);
            });
        });

        // Eventos para puntos personalizados en ejec-hormigon
        container.querySelectorAll('.eh-btn-add-custom-point').forEach(btn => {
            btn.onclick = () => {
                const type = btn.dataset.type;
                const uiIdx = btn.dataset.ui;
                const newKey = `${type}_ui${uiIdx}_cust_${Date.now()}`;
                data.checks[newKey] = { label: '', status: '', date: '', isCustom: true };
                calculateAndRender();
                setTimeout(() => {
                    const newInput = container.querySelector(`.eh-label[data-id="${newKey}"]`);
                    if (newInput) newInput.focus();
                }, 50);
            };
        });

        container.querySelectorAll('.eh-btn-make-habitual').forEach(btn => {
            btn.onclick = async () => {
                const type = btn.dataset.type;
                const custKey = btn.dataset.id;
                const chkObj = data.checks[custKey];
                if (!chkObj || !chkObj.label || !chkObj.label.trim()) {
                    alert('Escribe primero el texto del punto de control antes de guardarlo como habitual.');
                    return;
                }
                if (window.CustomControlsManager) {
                    await window.CustomControlsManager.addHabitualPoint('ejec_hormigon', type, chkObj.label.trim());
                    calculateAndRender();
                }
            };
        });

        container.querySelectorAll('.eh-btn-del-custom').forEach(btn => {
            btn.onclick = async () => {
                const type = btn.dataset.type;
                const custKey = btn.dataset.id;
                const chkObj = data.checks[custKey];
                const pointName = chkObj ? chkObj.label : '';
                const isHab = window.CustomControlsManager && window.CustomControlsManager.isHabitual('ejec_hormigon', type, pointName);
                
                if (isHab) {
                    const res = await window.CustomControlsManager.promptDelete(pointName, 'ejec_hormigon', type);
                    if (res === 'cancel') return;
                    if (res === 'all') {
                        await window.CustomControlsManager.removeHabitualPoint('ejec_hormigon', type, pointName);
                    }
                    delete data.checks[custKey];
                    calculateAndRender();
                } else {
                    if (await window.appConfirmar(`¿Eliminar este punto de control?`)) {
                        delete data.checks[custKey];
                        calculateAndRender();
                    }
                }
            };
        });
    }

    calculateAndRender();
}
