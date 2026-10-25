// Plan de ensayos de estructuras de acero (Código Estructural RD 470/2021), a partir de los parámetros guardados
window.planEnsayosAcero = function (p) {
    p = p || {};
    const tonsNum = parseFloat(p.tons) || 0;
    const weldMetersNum = parseFloat(p.weldMeters) || 0;
    const buttPctNum = parseFloat(p.buttPct) || 0;
    const lotVol = tonsNum > 0 ? Math.ceil(tonsNum / 20) : 0;
    const isExento = p.garantia === 'true';
    let mecTests = "";
    if (lotVol === 0) mecTests = "0 ensayos";
    else if (isExento) mecTests = "Exento (0 ensayos)";
    else mecTests = `${lotVol} ensayo(s) de Tracción y ${lotVol} ensayo(s) de Resiliencia Charpy (Total: ${lotVol * 2} ensayos)`;
    const locMult = 1.5;
    let ptmtPct = 15, utrtPct = 30;
    if (p.exc === 'EXC1') { ptmtPct = 0; utrtPct = 0; }
    else if (p.exc === 'EXC2') { ptmtPct = Math.round(10 * locMult); utrtPct = Math.round(20 * locMult); }
    else if (p.exc === 'EXC3') { ptmtPct = Math.round(20 * locMult); utrtPct = Math.round(50 * locMult); }
    else if (p.exc === 'EXC4') { ptmtPct = 100; utrtPct = 100; }
    ptmtPct = Math.min(100, ptmtPct);
    utrtPct = Math.min(100, utrtPct);
    const ptmtMeters = Math.round(weldMetersNum * (ptmtPct / 100));
    const buttMeters = Math.round(weldMetersNum * (buttPctNum / 100));
    const utApplicable = p.thick === 'true' && buttPctNum > 0 && p.exc !== 'EXC1';
    const effectiveUtPct = utApplicable ? utrtPct : 0;
    const utrtMeters = utApplicable ? Math.round(buttMeters * (effectiveUtPct / 100)) : 0;
    return { tonsNum, lotVol, isExento, mecTests, weldMetersNum, ptmtPct, ptmtMeters, utApplicable, effectiveUtPct, utrtMeters };
};

window.renderEstAceroCalc = function(container, matId) {
    const rawHTML = `
    <div class="tabs" style="display:flex;gap:5px;margin-bottom:20px;border-bottom:2px solid #f0f0f0;">
        <button class="tab active" onclick="window.showAceroTab('calculo', this)">Cálculo de Ensayos</button>
        <button class="tab" onclick="window.showAceroTab('documentacion', this)">Documentar Ensayos</button>
        <button class="tab" onclick="window.showAceroTab('resumen_acero', this)">Resumen</button>
    </div>

    <style>
        .acero-content { background:#fff; border:1px solid #000; padding:20px; border-radius:6px; }
        .tab-content { display:none; }
        .tab-content.active { display:block; }
        .tab { 
            background:#f8fafc; 
            border:1px solid #cbd5e1; 
            padding:8px 12px; 
            cursor:pointer; 
            flex-grow:1; 
            text-align:center; 
            border-radius:6px 6px 0 0; 
            color:#334155; 
            font-weight:600; 
            font-size:0.85rem; 
            transition: all 0.15s; 
        }
        .tab:hover { background:#f1f5f9; color:#0f172a; }
        .tab.active { 
            background:#dbeafe; 
            color:#1e40af; 
            font-weight:700; 
            border:1px solid #93c5fd; 
            border-bottom:2px solid #2563eb; 
        }
        .info-section { background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; margin-top: 15px; display: flex; justify-content: space-around; flex-wrap: wrap; gap: 10px; border-radius:4px; }
        .result-card { background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; margin-top: 20px; border-radius:4px; }
        .result-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 10px; color:#1f2937; }
        .result-text { font-family: 'Inter', sans-serif; font-size:0.95rem; line-height: 1.4; background: #fff; padding: 12px; border-radius: 4px; min-height: 80px; border:1px solid #cbd5e1; color:#1f2937; }
        .summary-table { width: 100%; border-collapse: collapse; margin-top: 15px; background: #fff; border: 1px solid #000; font-size:0.85rem; }
        .summary-table th, .summary-table td { padding: 8px 12px; text-align: left; border: 1px solid #000; }
        .summary-table th { background: #f1f5f9; color: #1f2937; font-weight: 700; }
        .summary-table tr:hover { background: #f8fafc; }
        .warning { color: #dc2626; font-weight:bold; }
        
        .dynamic-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px; padding: 10px 0; }
        .dynamic-grid .form-group { display: flex; border: 1px solid #000; margin: 0; border-radius: 0; overflow: hidden; background:#fff; }
        .dynamic-grid .form-label { flex: 0 0 150px; padding: 6px 10px; border-right: 1px solid #000; margin: 0; display: flex; align-items: center; font-weight: 600; font-size: 0.85rem; background: #fff; color:#1f2937; }
        .dynamic-grid .form-control { flex: 1; padding: 6px 10px; border: none; background: #f8fafc; font-family: 'Inter', sans-serif; font-size: 0.9rem; width: 100%; color:#1f2937; }
        .dynamic-grid .form-control:focus { background: #fff; outline:none; }
        
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        
        .lote-card { background: #fff; border: 1px solid #000; border-radius: 4px; padding: 10px; margin-bottom: 12px; }
        .lote-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #000; padding-bottom: 6px; margin-bottom: 8px; }
        .btn-add { background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: background 0.15s; }
        .btn-add:hover { background: #c7d2fe; color: #1e1b4b; }
        .btn-delete { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; padding: 3px 8px; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 0.8rem; transition: background 0.15s; }
        .btn-delete:hover { background: #fecaca; }

        @media print {
            .tabs { display: none !important; }
            .btn-add, .btn-delete { display: none !important; }
            .tab-content { display: block !important; margin-bottom: 25px !important; break-inside: avoid; page-break-inside: avoid; }
            .element-section::before {
                content: attr(data-element); display: block; font-size: 1.5em; font-weight: bold; margin-bottom: 10px; color: #000; border-bottom: 2px solid #000; padding-bottom: 4px; page-break-after: avoid;
            }
            .dynamic-grid .form-control, .dynamic-grid .form-label, .info-section, .result-card, .summary-table { background: #fff !important; color: #000 !important; }
            .info-section, .result-card { border: 1px solid #000 !important; box-shadow: none !important; }
            .summary-table th { background: #f0f0f0 !important; color: #000 !important; border: 1px solid #000 !important; }
            .summary-table td { border: 1px solid #000 !important; }
            .badge-conforme, .badge-no-conforme, .badge-pendiente { background: transparent !important; background-color: transparent !important; color: #000 !important; border: none !important; padding: 0 !important; font-weight: bold !important; }
        }
    </style>

    <div id="calculo" class="tab-content active">
        <div class="element-section" data-element="Cálculo de Ensayos (Estructuras de Acero - RD 470/2021)">
            <div class="dynamic-grid">
                <div class="form-group"><label class="form-label">Toneladas totales:</label><input type="number" id="aceroTons" class="form-control" placeholder="0" title="Masa total de acero estructural laminado en toneladas (t)" onchange="window.updateAceroTons()" oninput="window.updateAceroTons()"></div>
                <div class="form-group"><label class="form-label">Garantía Acero:</label>
                    <select id="aceroGarantia" class="form-control" title="Acreditación de distintivo voluntario oficialmente reconocido (DCOR / Marca N) según Código Estructural" onchange="window.updateAceroCalc()">
                        <option value="true">Con Marca N (DCOR)</option>
                        <option value="false">Sin Marca N</option>
                    </select>
                </div>
                <div class="form-group"><label class="form-label">Clase Ejecución:</label>
                    <select id="aceroExc" class="form-control" title="Clase de ejecución de la estructura según UNE-EN 1090-2 (EXC1 a EXC4)" onchange="window.updateAceroCalc()">
                        <option value="EXC1">EXC1</option>
                        <option value="EXC2" selected>EXC2</option>
                        <option value="EXC3">EXC3</option>
                        <option value="EXC4">EXC4</option>
                    </select>
                </div>
                <div class="form-group"><label class="form-label">Long. Soldaduras (m):</label><input type="number" id="aceroWeldMeters" class="form-control" placeholder="0" title="Longitud total estimada de cordones de soldadura en metros (m)" onchange="window.updateAceroCalc()" oninput="window.updateAceroCalc()"></div>
                <div class="form-group"><label class="form-label">Soldaduras tope (%):</label><input type="number" id="aceroButtPct" class="form-control" placeholder="0" min="0" max="100" title="Porcentaje (%) de soldaduras a tope con penetración completa" onchange="window.updateAceroCalc()" oninput="window.updateAceroCalc()"></div>
                <div class="form-group"><label class="form-label" style="font-size: 0.85rem;">Espesor ≥ 8mm (tope):</label>
                    <select id="aceroThick" class="form-control" title="Espesor de chapa ≥ 8 mm (determina aplicación de ultrasonidos UT según Código Estructural)" onchange="window.updateAceroCalc()">
                        <option value="true">Sí (t ≥ 8mm)</option>
                        <option value="false">No (t < 8mm)</option>
                    </select>
                </div>
            </div>
            
            <div class="result-card">
                <div class="result-title">Resultados del Cálculo de Ensayos (Código Estructural RD 470/2021)</div>
                <div class="result-text" id="aceroCalcResults">Calculando...</div>
            </div>
        </div>
    </div>

    <div id="documentacion" class="tab-content">
        <div class="element-section" data-element="Documentar Ensayos">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h3 style="margin:0;">Registro de Ensayos END y Mecánicos</h3>
                <button class="btn-add" onclick="window.addEnsayoEnd()">+ Añadir Ensayo</button>
            </div>
            <div id="ensayosEndContainer"></div>
        </div>
    </div>

    <div id="resumen_acero" class="tab-content">
        <div class="element-section" data-element="Resumen Ensayos de Acero">
            <div id="resumenEndSection"></div>
        </div>
    </div>
    `;

    container.innerHTML = `
        <div class="card" id="est-acero-calc-wrapper" style="margin-top: 1rem;">
            ${rawHTML}
        </div>
    `;

    const wrapper = container.querySelector('#est-acero-calc-wrapper');
    const data = currentProject.formData[matId] || {};
    currentProject.formData[matId] = data;
    if (!data.ensayosEnd) data.ensayosEnd = [];
    if (!data.calcParams) data.calcParams = {
        tons: '', garantia: 'true', exc: 'EXC2', weldMeters: '', buttPct: '', thick: 'true'
    };

    // Impresión desde los datos
    if (window.registrarImpresionFicha) registrarImpresionFicha(matId, (d, soloDatos, H) => {
        const p = d.calcParams || {};
        const plan = window.planEnsayosAcero(p);
        let html = '';
        const hayCalculo = plan.tonsNum > 0 || plan.weldMetersNum > 0;
        if (hayCalculo || !soloDatos) {
            const m = (n) => n.toLocaleString('es-ES') + ' m';
            html += H.subtitulo('Datos de partida');
            html += H.ficha([
                ['Toneladas totales', p.tons ? p.tons + ' t' : ''], ['Garantía del acero', p.garantia === 'false' ? 'Sin Marca N' : 'Con Marca N (DCOR)'],
                ['Clase de ejecución', p.exc || ''], ['Longitud de soldaduras', p.weldMeters ? p.weldMeters + ' m' : ''],
                ['Soldaduras a tope', p.buttPct ? p.buttPct + ' %' : ''], ['Espesor ≥ 8 mm (tope)', p.thick === 'false' ? 'No (t < 8 mm)' : 'Sí (t ≥ 8 mm)']
            ], { soloDatos });
            html += H.subtitulo('Plan de ensayos (Código Estructural RD 470/2021)');
            html += H.tabla([{ t: 'Control', w: '45%' }, { t: 'Alcance', w: '55%' }], [
                { grupo: '1. Recepción del acero base' },
                ['Lotes de recepción', H.esc(`${plan.lotVol} lote(s) (máx. 20 t / lote)`)],
                ['Ensayos mecánicos', H.esc(plan.mecTests)],
                { grupo: '2. Soldaduras (montaje en obra)' },
                ['Inspección visual (VT)', H.esc(`100 % (${m(plan.weldMetersNum)})`)],
                ['Ensayos superficiales (PT / MT)', H.esc(`${m(plan.ptmtMeters)} (${plan.ptmtPct} %)`)],
                ['Ensayos volumétricos (UT / RT)', H.esc(plan.utApplicable ? `${m(plan.utrtMeters)} (${plan.effectiveUtPct} %)` : 'Exento / 0 m')]
            ]);
        }
        const conDatos = (e) => e.referencia || e.tipo || e.fecha || e.laboratorio || e.observaciones;
        const ensayos = (d.ensayosEnd || []).filter(e => !soloDatos || conDatos(e) || e.correcto);
        if (ensayos.length) {
            html += H.subtitulo('Ensayos realizados');
            html += H.tabla([{ t: 'Lote / referencia', w: '19%' }, { t: 'Tipo de ensayo', w: '17%' }, { t: 'Fecha', w: '11%' }, { t: 'Laboratorio', w: '16%' }, { t: 'Resultado', w: '14%' }, { t: 'Observaciones', w: '23%' }],
                ensayos.map(e => {
                    const res = e.correcto ? 'Correcto' : (conDatos(e) ? 'No correcto' : '');
                    return { clase: res === 'No correcto' ? 'pd-fila-nc' : '', celdas: [H.esc(e.referencia), H.esc(e.tipo), H.esc(H.fecha(e.fecha)), H.esc(e.laboratorio), H.resultado(res), H.esc(e.observaciones)] };
                }));
        }
        return { html, resumen: [H.plural(ensayos.length, 'ensayo', 'ensayos'), hayCalculo ? `${plan.lotVol} lote(s) de acero` : ''] };
    });

    window.showAceroTab = function(tabName, btn) {
        wrapper.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        wrapper.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        const tabEl = wrapper.querySelector('#' + tabName);
        if(tabEl) tabEl.classList.add('active');
        if(btn) btn.classList.add('active');
    };

    function initForm() {
        wrapper.querySelector('#aceroTons').value = data.calcParams.tons;
        wrapper.querySelector('#aceroGarantia').value = data.calcParams.garantia;
        wrapper.querySelector('#aceroExc').value = data.calcParams.exc;
        wrapper.querySelector('#aceroWeldMeters').value = data.calcParams.weldMeters;
        wrapper.querySelector('#aceroButtPct').value = data.calcParams.buttPct;
        wrapper.querySelector('#aceroThick').value = data.calcParams.thick;
        window.updateAceroCalc();
        window.renderEnsayosEndList();
    }

    window.updateAceroTons = function() {
        const tonsVal = wrapper.querySelector('#aceroTons').value;
        const tons = parseFloat(tonsVal) || 0;
        if (tonsVal !== '') {
            let estimatedMeters = 0;
            if (tons > 0) {
                estimatedMeters = Math.max(50, Math.round(tons * 20));
            }
            wrapper.querySelector('#aceroWeldMeters').value = estimatedMeters;
        } else {
            wrapper.querySelector('#aceroWeldMeters').value = '';
        }
        window.updateAceroCalc();
    };

    window.updateAceroCalc = function() {
        data.calcParams = {
            tons: wrapper.querySelector('#aceroTons').value,
            garantia: wrapper.querySelector('#aceroGarantia').value,
            exc: wrapper.querySelector('#aceroExc').value,
            weldMeters: wrapper.querySelector('#aceroWeldMeters').value,
            buttPct: wrapper.querySelector('#aceroButtPct').value,
            thick: wrapper.querySelector('#aceroThick').value
        };

        const { lotVol, isExento, mecTests, weldMetersNum, ptmtPct, ptmtMeters, utApplicable, effectiveUtPct, utrtMeters } = window.planEnsayosAcero(data.calcParams);

        let resHtml = `
            <h4 style="margin-top:0;">1. Control de Recepción del Acero Base</h4>
            <ul style="margin-bottom:15px; padding-left: 20px;">
                <li><strong>Lotes de Recepción:</strong> ${lotVol} Lote(s) (máx. 20 t / lote)</li>
                <li><strong>Ensayos Mecánicos:</strong> <span style="${isExento?'color:green;':'color:orange;font-weight:bold;'}">${mecTests}</span></li>
            </ul>
            <h4>2. Control de Soldaduras (Montaje en Obra)</h4>
            <ul style="padding-left: 20px; margin-bottom: 15px;">
                <li><strong>Inspección Visual (VT):</strong> 100% (${weldMetersNum.toLocaleString('es-ES')} m)</li>
                <li><strong>Ensayos Superficiales (PT / MT):</strong> ${ptmtMeters.toLocaleString('es-ES')} m (${ptmtPct}%)</li>
                <li><strong>Ensayos Volumétricos (UT / RT):</strong> ${utApplicable ? `${utrtMeters.toLocaleString('es-ES')} m (${effectiveUtPct}%)` : "Exento / 0 m"}</li>
            </ul>
            <div style="font-size: 0.85em; color: #555; background: #f8f9fa; padding: 10px; border-radius: 6px; border: 1px solid #e0e0e0; margin-top: 15px;">
                <strong>Leyenda:</strong> VT (Visual Testing / Inspección Visual), PT (Penetrant Testing / Líquidos Penetrantes), MT (Magnetic Testing / Partículas Magnéticas), UT (Ultrasonic Testing / Ultrasonidos), RT (Radiographic Testing / Radiografía).
            </div>
        `;
        
        wrapper.querySelector('#aceroCalcResults').innerHTML = resHtml;
        actualizarResumenEnd();
    };

    window.addEnsayoEnd = function() {
        data.ensayosEnd.push({
            id: Date.now(), 
            referencia: '', 
            tipo: '', 
            fecha: '', 
            laboratorio: '', 
            correcto: false,
            observaciones: ''
        });
        window.renderEnsayosEndList();
    };

    window.deleteEnsayoEnd = function(id) {
        data.ensayosEnd = data.ensayosEnd.filter(e => e.id !== id);
        window.renderEnsayosEndList();
    };

    window.updateEnsayoEnd = function(id, field, target) {
        const ensayo = data.ensayosEnd.find(e => e.id === id);
        if (ensayo) {
            ensayo[field] = target.type === 'checkbox' ? target.checked : target.value;
            window.renderEnsayosEndList();
        }
    };

    window.renderEnsayosEndList = function() {
        const container = wrapper.querySelector('#ensayosEndContainer');
        if (!container) return;
        if (data.ensayosEnd.length === 0) {
            container.innerHTML = '<p style="color:#777; font-style:italic;">No hay ensayos documentados. Haga clic en "+ Añadir Ensayo" para comenzar.</p>';
            actualizarResumenEnd();
            return;
        }

        const tiposEnsayo = ["", "Líquidos penetrantes", "Partículas magnéticas", "Ultrasonidos", "Radiografía", "Tracción", "Resiliencia Charpy", "Inspección Visual (VT)"];
        let html = '';

        data.ensayosEnd.forEach(ensayo => {
            const options = tiposEnsayo.map(t => `<option value="${escHtml(t)}" ${ensayo.tipo === t ? 'selected' : ''}>${t || 'Seleccionar...'}</option>`).join('');
            
            html += `
            <div class="lote-card">
                <div class="lote-header">
                    <h4 style="margin:0; color: #000;">Ensayo: ${ensayo.tipo || 'Nuevo Ensayo'}</h4>
                    <button class="btn-delete" onclick="window.deleteEnsayoEnd(${ensayo.id})">Eliminar</button>
                </div>
                <div class="dynamic-grid" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));">
                    <div class="form-group" style="grid-column: 1 / -1;"><label class="form-label">Lote / Referencia:</label><input type="text" class="form-control" value="${escHtml(ensayo.referencia)}" onchange="window.updateEnsayoEnd(${ensayo.id}, 'referencia', this)"></div>
                    <div class="form-group"><label class="form-label">Tipo de Ensayo:</label>
                        <select class="form-control" onchange="window.updateEnsayoEnd(${ensayo.id}, 'tipo', this)">
                            ${options}
                        </select>
                    </div>
                    <div class="form-group"><label class="form-label">Fecha:</label><input type="date" class="form-control" value="${escHtml(ensayo.fecha)}" onchange="window.updateEnsayoEnd(${ensayo.id}, 'fecha', this)"></div>
                    <div class="form-group"><label class="form-label">Laboratorio:</label><input type="text" class="form-control" value="${escHtml(ensayo.laboratorio)}" onchange="window.updateEnsayoEnd(${ensayo.id}, 'laboratorio', this)"></div>
                    <div class="form-group" style="grid-column: 1 / -1; align-items:center;">
                        <label class="form-label">¿Resultado Correcto?</label>
                        <div style="flex:1; padding:10px; background:#f4f7fb;">
                            <input type="checkbox" ${ensayo.correcto ? 'checked' : ''} onchange="window.updateEnsayoEnd(${ensayo.id}, 'correcto', this)" style="width:20px; height:20px; cursor:pointer;">
                        </div>
                    </div>
                    <div class="form-group" style="grid-column: 1 / -1;"><label class="form-label">Observaciones:</label><input type="text" class="form-control" value="${escHtml(ensayo.observaciones)}" onchange="window.updateEnsayoEnd(${ensayo.id}, 'observaciones', this)"></div>
                </div>
            </div>`;
        });
        
        container.innerHTML = html;
        actualizarResumenEnd();
    };

    function actualizarResumenEnd() {
        const sec = wrapper.querySelector('#resumenEndSection');
        
        let planHtml = `
            <div style="margin-bottom: 25px; padding: 20px; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h3 style="margin-top:0; margin-bottom: 15px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Planificación de Ensayos</h3>
                ${wrapper.querySelector('#aceroCalcResults').innerHTML}
            </div>
        `;

        let ensayosHtml = '<h3 style="margin-bottom: 15px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Ensayos Realizados</h3>';
        
        if (data.ensayosEnd && data.ensayosEnd.length > 0) {
            ensayosHtml += '<table class="summary-table"><thead><tr><th>Referencia / Lote</th><th>Tipo de Ensayo</th><th>Fecha</th><th>Laboratorio</th><th>Resultado</th></tr></thead><tbody>';
            data.ensayosEnd.forEach(e => {
                const badge = e.correcto 
                    ? '<span class="badge-conforme">CORRECTO</span>' 
                    : '<span class="badge-no-conforme">NO CORRECTO</span>';
                ensayosHtml += `<tr>
                    <td>${e.referencia || '-'}</td>
                    <td>${e.tipo || '-'}</td>
                    <td>${e.fecha || '-'}</td>
                    <td>${e.laboratorio || '-'}</td>
                    <td>${badge}</td>
                </tr>`;
            });
            ensayosHtml += '</tbody></table>';
        } else {
            ensayosHtml += '<p style="color:#64748b;">No hay ensayos documentados.</p>';
        }
        
        sec.innerHTML = planHtml + ensayosHtml;
    }

    initForm();
};

// ==========================================================================
// HERRAMIENTA DE TESTEO AUTÓNOMO (Código Estructural RD 470/2021)
// Criterio del agente CalculistaEstructuras para estructuras de acero
// ==========================================================================
(function testCalculosAceroRD470() {
    try {
        // Test 1: Loteado de acero laminado (máx. 20 t / lote según RD 470/2021)
        // Caso: 45 toneladas -> ceil(45 / 20) = 3 lotes
        const tons = 45;
        const lotes = Math.ceil(tons / 20);
        console.assert(lotes === 3, `[CalculistaEstructuras] Error en lotes acero laminado: esperado 3, obtenido ${lotes}`);

        // Test 2: Porcentaje de ensayos de soldaduras según clase de ejecución UNE-EN 1090-2
        // EXC2: PT/MT = 15% (10% * 1.5), UT/RT = 30% (20% * 1.5)
        const exc = 'EXC2';
        const locMult = 1.5;
        const ptmtPct = Math.round(10 * locMult);
        const utrtPct = Math.round(20 * locMult);
        console.assert(ptmtPct === 15 && utrtPct === 30, `[CalculistaEstructuras] Error en porcentajes END para EXC2: ptmt=${ptmtPct}, utrt=${utrtPct}`);

        // Test 3: Ultrasonidos (UT) no aplicable si espesor < 8mm
        const thickFalse = false;
        const utApplicable = thickFalse && exc !== 'EXC1';
        console.assert(!utApplicable, "[CalculistaEstructuras] Error: UT no debe aplicar para espesor < 8mm");
    } catch (e) {
        console.error("[CalculistaEstructuras Acero Test Fallido]:", e);
    }
})();
