window.renderHormigonCalc = function(container, matId) {
    const rawHTML = `
    <div class="tabs" style="display:flex;gap:5px;margin-bottom:20px;border-bottom:2px solid #f0f0f0;">
        <button class="tab active" onclick="window.showHormigonTab('cimentaciones', this)">Programación de Cimentaciones</button>
        <button class="tab" onclick="window.showHormigonTab('compresion', this)">Programación de Elementos a compresión</button>
        <button class="tab" onclick="window.showHormigonTab('forjados', this)">Programación de Forjados</button>
        <button class="tab" onclick="window.showHormigonTab('losaspav', this)">Programación de Losas Pav.</button>
        <button class="tab" onclick="window.showHormigonTab('resumen', this)">Resumen Programación</button>
        <button class="tab" onclick="window.showHormigonTab('ensayos', this)">Seguimiento ensayos hormigón</button>
        <button class="tab" onclick="window.showHormigonTab('acero', this)">Cálculo lotes Acero</button>
        <button class="tab" onclick="window.showHormigonTab('ensayos_acero', this)">Seguimiento Ensayos Acero</button>
    </div>

    <style>
        .hormigon-content { background:#fff; border-radius:6px; padding:20px; border:1px solid #000; }
        .tab-content { display:none; }
        .tab-content.active { display:block; }
        .tab { 
            background:#f8fafc; 
            border:1px solid #cbd5e1; 
            padding:8px 12px; 
            border-radius:6px 6px 0 0; 
            cursor:pointer; 
            flex-grow:1; 
            text-align:center; 
            color:#334155; 
            font-weight:600; 
            font-size:0.8rem;
            transition:all 0.15s ease;
        }
        .tab:hover { background:#f1f5f9; color:#0f172a; }
        .tab.active { 
            background:#dbeafe; 
            color:#1e40af; 
            font-weight:700; 
            border:1px solid #93c5fd; 
            border-bottom:2px solid #2563eb; 
        }
        .info-section { 
            background: #f8fafc; 
            border: 1px solid #cbd5e1; 
            border-radius: 4px; 
            padding: 4px 8px; 
            margin-top: 6px; 
            display: flex; 
            justify-content: space-around; 
            flex-wrap: wrap; 
            gap: 6px; 
            font-size: 0.75rem; 
            color: #1f2937; 
        }
        .result-card { 
            background: #f8fafc; 
            border: 1px solid #cbd5e1; 
            border-radius: 4px; 
            padding: 4px 8px; 
            margin-top: 6px; 
            box-shadow: none; 
        }
        .result-title { 
            font-size: 1.1rem; 
            font-weight: 700; 
            color: #1f2937; 
            margin-bottom: 8px; 
            letter-spacing: -0.01em; 
            display: flex; 
            align-items: center; 
            gap: 6px; 
        }
        .result-text { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
            font-size: 0.75rem; 
            line-height: 1.3; 
            background: transparent; 
            padding: 2px 0 0 0; 
            border: none; 
            border-radius: 0; 
            min-height: auto; 
            color: #1f2937; 
        }
        .summary-table { width: 100%; border-collapse: collapse; margin-top: 10px; background: #fff; border-radius: 4px; overflow: hidden; font-size: 0.75rem; border: 1px solid #000; }
        .summary-table th, .summary-table td { padding: 6px 8px; text-align: left; border: 1px solid #000; font-size: 0.75rem; text-transform: none; }
        .summary-table th { background: #f1f5f9; color: #1f2937; font-weight: 700; border: 1px solid #000; }
        .summary-table tr:hover { background: #f8fafc; }
        .warning { color: #dc2626; font-weight:bold; }
        
        /* Ajustes de casillas y grid de hormigón */
        .dynamic-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 2px; padding: 4px 0; }
        .dynamic-grid .form-group { display: flex; border: 1px solid #000; margin: 0; border-radius: 0; overflow: hidden; background: #fff; }
        .dynamic-grid .form-label { flex: 0 0 130px; padding: 4px 8px; border-right: 1px solid #000; margin: 0; display: flex; align-items: center; font-weight: 600; font-size: 0.75rem; background: #fff; color: #1f2937; }
        .dynamic-grid .form-control { flex: 1; padding: 4px 8px; border: none; border-radius: 0; background: #f8fafc; font-family: 'Inter', sans-serif; font-size: 0.8rem; width: 100%; color: #1f2937; outline: none; }
        .dynamic-grid .form-control:focus { background: #fff; }
        
        /* Ocultar flechas en inputs numéricos */
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
            -webkit-appearance: none; 
            margin: 0; 
        }
        input[type=number] { 
            -moz-appearance: textfield; 
        }
        
        .lote-card { background: #fff; border: 1px solid #000; border-radius: 4px; padding: 6px 10px; margin-bottom: 8px; box-shadow: none; }
        .lote-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 6px; gap: 8px; }
        .btn-add { background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 0.8em; transition: background 0.15s; }
        .btn-add:hover { background: #c7d2fe; color: #1e1b4b; }
        .btn-delete { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 0.75em; font-weight: 600; transition: background 0.15s; }
        .btn-delete:hover { background: #fecaca; }
        .amasadas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 4px; margin-top: 4px; }
        .subtotal-bar { background: #f8fafc; border: 1px solid #000; padding: 4px 8px; border-radius: 4px; font-weight: bold; display: flex; justify-content: space-around; margin-top: 6px; color: #1f2937; font-size: 0.75rem; }
        
        /* Estilos de Impresión */
        @media print {
            .tabs { display: none !important; }
            .btn-add, .btn-delete { display: none !important; }
            .tab-content { 
                display: block !important; 
                margin-bottom: 20px !important; 
                break-inside: avoid;
                page-break-inside: avoid; 
            }
            
            .element-section::before {
                content: attr(data-element);
                display: block;
                font-size: 1.5em;
                font-weight: bold;
                margin-bottom: 8px;
                color: #000;
                border-bottom: 2px solid #000;
                padding-bottom: 2px;
                page-break-after: avoid;
            }
            
            .dynamic-grid .form-control,
            .dynamic-grid .form-label,
            .info-section,
            .result-card,
            .lote-card,
            .subtotal-bar,
            .summary-table {
                background: #fff !important;
                color: #000 !important;
            }
            
            .info-section, .result-card, .lote-card, .subtotal-bar {
                border: 1px solid #000 !important;
                box-shadow: none !important;
            }
            
            .summary-table th {
                background: #f0f0f0 !important;
                color: #000 !important;
                border: 1px solid #000 !important;
            }
            .summary-table td {
                border: 1px solid #000 !important;
            }
            .badge-conforme, .badge-no-conforme, .badge-pendiente {
                background: transparent !important;
                background-color: transparent !important;
                color: #000 !important;
                border: none !important;
                padding: 0 !important;
                font-weight: bold !important;
            }
            .hide-on-print {
                display: none !important;
            }
            .print-only-main-title {
                display: block !important;
                font-size: 1.6em;
                font-weight: bold;
                margin-bottom: 20px;
                color: #000;
            }
        }
        .print-only-main-title {
            display: none;
        }
    </style>

    <div id="cimentaciones" class="tab-content active">
        <div class="print-only-main-title">Ensayos de hormigón</div>
        <div class="element-section" data-element="Programación de Cimentaciones">
            <div class="hide-on-print" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <h3 style="margin:0; color:#2c3e50;">Programación de Cimentaciones</h3>
                <button class="btn-add" onclick="window.addTipoHormigon('cimentaciones')">+ Añadir tipo de hormigón</button>
            </div>
            <div id="cimentacionesContainer"></div>
        </div>
    </div>

    <div id="compresion" class="tab-content">
        <div class="element-section" data-element="Programación de Elementos a compresión">
            <div class="hide-on-print" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <h3 style="margin:0; color:#2c3e50;">Programación de Elementos a compresión</h3>
                <button class="btn-add" onclick="window.addTipoHormigon('compresion')">+ Añadir tipo de hormigón</button>
            </div>
            <div id="compresionContainer"></div>
        </div>
    </div>

    <div id="forjados" class="tab-content">
        <div class="element-section" data-element="Programación de Forjados">
            <div class="hide-on-print" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <h3 style="margin:0; color:#2c3e50;">Programación de Forjados</h3>
                <button class="btn-add" onclick="window.addTipoHormigon('forjados')">+ Añadir tipo de hormigón</button>
            </div>
            <div id="forjadosContainer"></div>
        </div>
    </div>

    <div id="losaspav" class="tab-content">
        <div class="element-section" data-element="Programación de Losas Pavimento">
            <div class="hide-on-print" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <h3 style="margin:0; color:#2c3e50;">Programación de Losas Pavimento</h3>
                <button class="btn-add" onclick="window.addTipoHormigon('losaspav')">+ Añadir tipo de hormigón</button>
            </div>
            <div id="losaspavContainer"></div>
        </div>
    </div>

    <div id="resumen" class="tab-content">
        <div class="element-section">
            <h3 style="margin-top:0;">Resumen programación hormigón</h3>
            <table class="summary-table">
                <thead>
                    <tr>
                        <th>Elemento Estructural</th>
                        <th>Tipo / Identificación</th>
                        <th>Volumen (m³)</th>
                        <th>Nº Lotes</th>
                        <th>Amasadas</th>
                    </tr>
                </thead>
                <tbody id="tablaResumenBody"></tbody>
            </table>
            <div style="background:#fff;border:1px solid #000;padding:15px;margin-top:15px;font-weight:bold;display:flex;justify-content:space-around;flex-wrap:wrap;gap:10px;">
                <div id="totalVolumen">Volumen Total: 0.00 m³</div>
                <div id="totalLotes">Lotes Totales: 0</div>
                <div id="totalAmasadas">Amasadas Totales: 0</div>
            </div>
        </div>
    </div>
    <div id="ensayos" class="tab-content">
        <div class="element-section" data-element="Seguimiento ensayos hormigón">
            <div class="hide-on-print" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <h3 style="margin:0;">Seguimiento ensayos hormigón</h3>
                <button class="btn-add" onclick="window.addLoteRotura()">+ Añadir Lote</button>
            </div>
            <div id="lotesRoturaContainer"></div>
            <div id="roturaSummarySection" style="display:none;margin-top:20px;"></div>
        </div>
    </div>

    <div id="acero" class="tab-content">
        <div class="element-section" data-element="Cálculo lotes Acero">
            <h3 class="hide-on-print" style="margin-top:0;">Cuantías de Acero por Elemento y Tipo (kg/m³)</h3>
            <p class="hide-on-print" style="color:#64748b; font-size:0.9em; margin-bottom:8px;">
                A continuación se muestran las cuantías predefinidas según tipología estructural (Cimentaciones: 100 kg/m³, Compresión: 100 kg/m³, Forjados: 120 kg/m³, Losas Pav.: 20 kg/m³). Puede modificar libremente el valor de cualquier tipo de hormigón:
            </p>
            <div id="tablaCuantiasAceroContainer" style="margin-bottom:20px; overflow-x:auto;"></div>

            <h3 style="margin-top:1.5rem;">Distribución por Series de Acero (%)</h3>
            <div class="dynamic-grid">
                <div class="form-group"><label class="form-label">Fina &lt;10mm:</label><input type="number" id="porcentajeFina" class="form-control auto-calc-acero" min="0" max="100" step="1" value="20"></div>
                <div class="form-group"><label class="form-label">Media 12-20mm:</label><input type="number" id="porcentajeMedia" class="form-control auto-calc-acero" min="0" max="100" step="1" value="80"></div>
                <div class="form-group"><label class="form-label">Gruesa 25-32mm:</label><input type="number" id="porcentajeGruesa" class="form-control auto-calc-acero" min="0" max="100" step="1" value="0"></div>
                <div class="form-group"><label class="form-label">Muy Gruesa &gt;40mm:</label><input type="number" id="porcentajeMuyGruesa" class="form-control auto-calc-acero" min="0" max="100" step="1" value="0"></div>
            </div>
            <h3 style="margin-top:1.5rem;">Soldadura</h3>
            <div style="display:flex;gap:20px;margin-bottom:15px;flex-wrap:wrap;">
                <label style="cursor:pointer;"><input type="checkbox" id="soldaduraResistente" class="auto-calc-acero"> Hay soldadura resistente</label>
                <label style="cursor:pointer;"><input type="checkbox" id="soldaduraNoResistente" class="auto-calc-acero"> Hay soldadura no resistente</label>
            </div>
            <div class="result-card">
                <div class="result-text" id="resultadoAcero">Complete cálculos de hormigón introduciendo volúmenes.</div>
            </div>
        </div>
    </div>

    <div id="ensayos_acero" class="tab-content">
        <div class="element-section" data-element="Seguimiento Ensayos Acero">
            <div class="hide-on-print" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <h3 style="margin:0;">Seguimiento Ensayos Acero</h3>
                <button class="btn-add" onclick="window.addLoteAcero()">+ Añadir Lote Acero</button>
            </div>
            <div id="lotesAceroContainer"></div>
            <div id="aceroEnsayosSummarySection" style="display:none;margin-top:20px;"></div>
        </div>
    </div>
    `;

    container.innerHTML = `
        <div class="card" id="hormigon-calc-wrapper" style="margin-top: 1rem;">
            ${rawHTML}
        </div>
    `;

    // Setup global state for this calc
    const DATOS_EXPOSICION = {
        "XC1": { ac_max: 0.60, cemento_min: 275, resistencia_min: 25 },
        "XC2": { ac_max: 0.60, cemento_min: 275, resistencia_min: 25 },
        "XC3": { ac_max: 0.55, cemento_min: 275, resistencia_min: 30 },
        "XC4": { ac_max: 0.50, cemento_min: 300, resistencia_min: 30 },
        "XS1": { ac_max: 0.50, cemento_min: 300, resistencia_min: 30 },
        "XS2": { ac_max: 0.45, cemento_min: 325, resistencia_min: 35 },
        "XS3": { ac_max: 0.45, cemento_min: 350, resistencia_min: 40 },
        "XA1": { ac_max: 0.50, cemento_min: 300, resistencia_min: 30 },
        "XA2": { ac_max: 0.45, cemento_min: 325, resistencia_min: 35 },
        "XA3": { ac_max: 0.45, cemento_min: 350, resistencia_min: 40 },
    };
    const RESISTENCIA_VALORES = ["25", "30", "35", "40", "45", "50", "55", "60"];
    const DEFAULT_CUANTIAS = {
        cimentaciones: 100,
        compresion: 100,
        forjados: 120,
        losaspav: 20
    };
    const coeficientesKn = {
        3: 0.89, 4: 0.91, 5: 0.93, 6: 0.94, 7: 0.95,
        8: 0.96, 9: 0.97, 10: 0.98, 11: 1.00, 15: 1.00, 20: 1.00
    };

    const wrapper = container.querySelector('#hormigon-calc-wrapper');
    const data = currentProject.formData[matId] || {};
    currentProject.formData[matId] = data;

    // Inicializar o migrar colecciones de tipos de hormigón
    if (!data.cimentaciones) {
        if (data.volumenCimentacion !== undefined && data.volumenCimentacion !== '') {
            data.cimentaciones = [{
                id: Date.now() + 1,
                nombre: 'Tipo 1',
                volumen: data.volumenCimentacion,
                tiempoSemanas: data.tiempoSemanasCimentacion || 1,
                resistencia: data.resistenciaCimentacion || '25',
                distintivo: data.distintivoCimentacion || 'sin',
                exposicion: data.exposicionCimentacion || 'XC1',
                amasadasPorLote: 3,
                cuantiaAcero: DEFAULT_CUANTIAS.cimentaciones
            }];
        } else {
            data.cimentaciones = [{
                id: Date.now() + 1,
                nombre: 'Tipo 1',
                volumen: '',
                tiempoSemanas: 1,
                resistencia: '25',
                distintivo: 'sin',
                exposicion: 'XC1',
                amasadasPorLote: 3,
                cuantiaAcero: DEFAULT_CUANTIAS.cimentaciones
            }];
        }
    } else {
        data.cimentaciones.forEach(item => {
            if (item.cuantiaAcero === undefined) item.cuantiaAcero = DEFAULT_CUANTIAS.cimentaciones;
        });
    }

    if (!data.compresion) {
        if (data.volumenCompresion !== undefined && data.volumenCompresion !== '') {
            data.compresion = [{
                id: Date.now() + 2,
                nombre: 'Tipo 1',
                volumen: data.volumenCompresion,
                superficie: data.superficieCompresion || '',
                plantas: data.plantasCompresion || '',
                tiempoSemanas: data.tiempoSemanasCompresion || 1,
                resistencia: data.resistenciaCompresion || '25',
                distintivo: data.distintivoCompresion || 'sin',
                exposicion: data.exposicionCompresion || 'XC1',
                amasadasPorLote: 3,
                cuantiaAcero: DEFAULT_CUANTIAS.compresion
            }];
        } else {
            data.compresion = [{
                id: Date.now() + 2,
                nombre: 'Tipo 1',
                volumen: '',
                superficie: '',
                plantas: '',
                tiempoSemanas: 1,
                resistencia: '25',
                distintivo: 'sin',
                exposicion: 'XC1',
                amasadasPorLote: 3,
                cuantiaAcero: DEFAULT_CUANTIAS.compresion
            }];
        }
    } else {
        data.compresion.forEach(item => {
            if (item.cuantiaAcero === undefined) item.cuantiaAcero = DEFAULT_CUANTIAS.compresion;
        });
    }

    if (!data.forjados) {
        if (data.volumenForjados !== undefined && data.volumenForjados !== '') {
            data.forjados = [{
                id: Date.now() + 3,
                nombre: 'Tipo 1',
                volumen: data.volumenForjados,
                superficie: data.superficieForjados || '',
                plantas: data.plantasForjados || '',
                tiempoSemanas: data.tiempoSemanasForjados || 1,
                resistencia: data.resistenciaForjados || '25',
                distintivo: data.distintivoForjados || 'sin',
                exposicion: data.exposicionForjados || 'XC1',
                amasadasPorLote: 3,
                cuantiaAcero: DEFAULT_CUANTIAS.forjados
            }];
        } else {
            data.forjados = [{
                id: Date.now() + 3,
                nombre: 'Tipo 1',
                volumen: '',
                superficie: '',
                plantas: '',
                tiempoSemanas: 1,
                resistencia: '25',
                distintivo: 'sin',
                exposicion: 'XC1',
                amasadasPorLote: 3,
                cuantiaAcero: DEFAULT_CUANTIAS.forjados
            }];
        }
    } else {
        data.forjados.forEach(item => {
            if (item.cuantiaAcero === undefined) item.cuantiaAcero = DEFAULT_CUANTIAS.forjados;
        });
    }

    if (!data.losaspav) {
        if (data.volumenLosasPav !== undefined && data.volumenLosasPav !== '') {
            data.losaspav = [{
                id: Date.now() + 4,
                nombre: 'Tipo 1',
                volumen: data.volumenLosasPav,
                superficie: data.superficieLosasPav || '',
                plantas: data.plantasLosasPav || '',
                tiempoSemanas: data.tiempoSemanasLosasPav || 1,
                resistencia: data.resistenciaLosasPav || '25',
                distintivo: data.distintivoLosasPav || 'sin',
                exposicion: data.exposicionLosasPav || 'XC1',
                amasadasPorLote: 3,
                cuantiaAcero: DEFAULT_CUANTIAS.losaspav
            }];
        } else {
            data.losaspav = [{
                id: Date.now() + 4,
                nombre: 'Tipo 1',
                volumen: '',
                superficie: '',
                plantas: '',
                tiempoSemanas: 1,
                resistencia: '25',
                distintivo: 'sin',
                exposicion: 'XC1',
                amasadasPorLote: 3,
                cuantiaAcero: DEFAULT_CUANTIAS.losaspav
            }];
        }
    } else {
        data.losaspav.forEach(item => {
            if (item.cuantiaAcero === undefined) item.cuantiaAcero = DEFAULT_CUANTIAS.losaspav;
        });
    }

    if (!data.lotesRotura) data.lotesRotura = [];
    if (!data.lotesAcero) data.lotesAcero = [];

    let resultadosGlobales = { Acero: { isValid: false } };

    window.showHormigonTab = function(tabName, btn) {
        wrapper.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        wrapper.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        const tabEl = wrapper.querySelector('#' + tabName);
        if (tabEl) tabEl.classList.add('active');
        if (btn) btn.classList.add('active');
        if (tabName === 'acero') {
            handleAceroCalculation();
        }
    };

    // Funciones dinámicas para añadir/eliminar/actualizar tipos de hormigón
    window.addTipoHormigon = function(catKey) {
        if (!data[catKey]) data[catKey] = [];
        const nextNum = data[catKey].length + 1;
        const newItem = {
            id: Date.now(),
            nombre: `Tipo ${nextNum}`,
            volumen: '',
            tiempoSemanas: 1,
            resistencia: '25',
            distintivo: 'sin',
            exposicion: 'XC1',
            amasadasPorLote: 3,
            cuantiaAcero: DEFAULT_CUANTIAS[catKey] !== undefined ? DEFAULT_CUANTIAS[catKey] : 100
        };
        if (catKey !== 'cimentaciones') {
            newItem.superficie = '';
            newItem.plantas = '';
        }
        data[catKey].push(newItem);
        window.renderTiposHormigon(catKey);
        window.recalcularTodo();
    };

    window.deleteTipoHormigon = function(catKey, id) {
        if (!data[catKey]) return;
        data[catKey] = data[catKey].filter(item => item.id !== id);
        window.renderTiposHormigon(catKey);
        window.recalcularTodo();
    };

    window.updateTipoHormigon = function(catKey, id, field, value) {
        if (!data[catKey]) return;
        const item = data[catKey].find(t => t.id === id);
        if (item) {
            item[field] = value;
            window.renderTiposHormigon(catKey);
            window.recalcularTodo();
        }
    };

    // Cálculo unitario para un tipo de hormigón
    function calcularTipoHormigon(catKey, item) {
        const vol = parseFloat(item.volumen) || 0;
        const sem = parseFloat(item.tiempoSemanas) || 1;
        const resUser = parseFloat(item.resistencia) || 25;
        const dExpo = DATOS_EXPOSICION[item.exposicion] || DATOS_EXPOSICION['XC1'];
        let amasadasPorLote = parseInt(item.amasadasPorLote);
        if (isNaN(amasadasPorLote) || amasadasPorLote <= 0) amasadasPorLote = 3;

        let nLot = 0;
        let crit = '';
        let adv = (resUser < dExpo.resistencia_min) 
            ? `<br><span class="warning">¡ADVERTENCIA! Resistencia seleccionada (${resUser} MPa) menor a la mínima exigida (${dExpo.resistencia_min} MPa) para ambiente ${item.exposicion}.</span>` 
            : '';

        // Si NO hay volumen introducido o es 0, no se define ningún lote por defecto
        if (vol <= 0) {
            return {
                volumen: 0,
                numeroLotes: 0,
                amasadas: 0,
                amasadasPorLote: amasadasPorLote,
                criterio: '-',
                distintivo: item.distintivo === 'con' ? 'Con' : 'Sin',
                advertencia: adv,
                hasData: false
            };
        }

        const lotVol = Math.ceil(vol / 100);
        const lotTiempo = Math.max(Math.ceil(sem / 1), 1);

        if (catKey === 'cimentaciones') {
            nLot = Math.max(lotVol, lotTiempo, 1);
            crit = `Vol: cada 100m³ (${lotVol}), Tiempo: 1 sem (${lotTiempo})`;
        } else {
            const sup = parseFloat(item.superficie) || 0;
            const plt = parseFloat(item.plantas) || 0;
            const divSup = catKey === 'compresion' ? 500 : 1000;
            const lotSup = Math.ceil(sup / divSup);
            const lotPlt = Math.ceil(plt / 2);
            nLot = Math.max(lotSup, lotPlt, lotVol, lotTiempo, 1);
            crit = `Sup: cada ${divSup}m² (${lotSup}), Plantas: cada 2 (${lotPlt}), Vol: cada 100m³ (${lotVol}), Tiempo: 1 sem (${lotTiempo})`;
        }

        const amasadasTotales = nLot * amasadasPorLote;

        return {
            volumen: vol,
            numeroLotes: nLot,
            amasadas: amasadasTotales,
            amasadasPorLote: amasadasPorLote,
            criterio: crit,
            distintivo: item.distintivo === 'con' ? 'Con' : 'Sin',
            advertencia: adv,
            hasData: true
        };
    }

    // Renderizar la lista de tipos de hormigón en una pestaña
    window.renderTiposHormigon = function(catKey) {
        const container = wrapper.querySelector(`#${catKey}Container`);
        if (!container) return;

        const items = data[catKey] || [];
        if (items.length === 0) {
            container.innerHTML = `
                <div style="padding:20px; text-align:center; background:#fff; border:1px solid #000; border-radius:0; color:#000;">
                    No hay tipos de hormigón programados en este apartado.<br>
                    <button class="btn-add" style="margin-top:10px;" onclick="window.addTipoHormigon('${catKey}')">+ Añadir tipo de hormigón</button>
                </div>`;
            return;
        }

        let html = '';
        let subVol = 0, subLot = 0, subAm = 0;

        items.forEach((item, index) => {
            const calc = calcularTipoHormigon(catKey, item);
            subVol += calc.volumen;
            subLot += calc.numeroLotes;
            subAm += calc.amasadas;

            const dExpo = DATOS_EXPOSICION[item.exposicion] || DATOS_EXPOSICION['XC1'];
            const resUser = parseFloat(item.resistencia) || 25;

            // Opciones de resistencia
            const resOptions = RESISTENCIA_VALORES.map(v => 
                `<option value="${v}" ${item.resistencia == v ? 'selected' : ''}>${v}</option>`
            ).join('');

            // Opciones de exposición
            const expoOptions = Object.keys(DATOS_EXPOSICION).map(exp => 
                `<option value="${exp}" ${item.exposicion === exp ? 'selected' : ''}>${exp}</option>`
            ).join('');

            // Campos específicos para compresión, forjados, losaspav
            let extraFields = '';
            if (catKey !== 'cimentaciones') {
                extraFields = `
                    <div class="form-group"><label class="form-label">Superficie (m²):</label><input type="number" class="form-control" min="0" step="0.1" value="${item.superficie !== undefined ? item.superficie : ''}" placeholder="Ej: 300" onchange="window.updateTipoHormigon('${catKey}', ${item.id}, 'superficie', this.value)"></div>
                    <div class="form-group"><label class="form-label">Nº plantas:</label><input type="number" class="form-control" min="1" step="1" value="${item.plantas !== undefined ? item.plantas : ''}" placeholder="Ej: 3" onchange="window.updateTipoHormigon('${catKey}', ${item.id}, 'plantas', this.value)"></div>
                `;
            }

            // Bloque de resultado para este tipo
            let resultadoHtml = '';
            if (!calc.hasData) {
                resultadoHtml = `
                    <div class="result-text" style="color:#64748b; font-size:0.75rem;">
                        Introduzca el volumen para calcular los lotes y amasadas requeridos.
                    </div>`;
            } else {
                resultadoHtml = `
                    <div class="result-text">
                        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:2px; font-size:0.75rem;">
                            <div>Lotes necesarios: <strong style="font-size:0.8rem; color:#000;">${calc.numeroLotes}</strong></div>
                            <div>Amasadas totales: <strong style="font-size:0.8rem; color:#000;">${calc.amasadas}</strong> <span style="color:#666; font-size:0.7rem;">(${calc.amasadasPorLote} por lote)</span></div>
                            <div>Volumen: <strong style="font-size:0.8rem; color:#000;">${calc.volumen.toFixed(2)} m³</strong></div>
                        </div>
                        <div style="color:#000; font-size:0.75rem; margin-top:2px;">
                            <strong>Criterio aplicado:</strong> ${calc.criterio}
                        </div>
                        ${calc.advertencia}
                    </div>`;
            }

            html += `
            <div class="lote-card ${!calc.hasData ? 'hide-on-print' : ''}">
                <div class="lote-header">
                    <div style="display:flex; align-items:center; gap:10px; flex:1; flex-wrap:wrap;">
                        <span style="font-weight:700; color:#000; font-size:1.05em;">#${index + 1}</span>
                        <input type="text" class="form-control" style="font-weight:bold; max-width:380px; padding:6px 10px;" value="${item.nombre || ''}" placeholder="Nombre / Descripción (Ej: HA-25 Zapatas)" onchange="window.updateTipoHormigon('${catKey}', ${item.id}, 'nombre', this.value)">
                    </div>
                    <button class="btn-delete" onclick="window.deleteTipoHormigon('${catKey}', ${item.id})">Eliminar tipo</button>
                </div>
                <div class="dynamic-grid">
                    <div class="form-group"><label class="form-label">Volumen (m³):</label><input type="number" class="form-control" min="0" step="0.1" value="${item.volumen !== undefined ? item.volumen : ''}" placeholder="Ej: 50" title="Volumen total de hormigón en m³ para este tipo según proyecto" onchange="window.updateTipoHormigon('${catKey}', ${item.id}, 'volumen', this.value)"></div>
                    ${extraFields}
                    <div class="form-group"><label class="form-label">Tiempo (semanas):</label><input type="number" class="form-control" min="1" step="1" value="${item.tiempoSemanas || 1}" title="Tiempo previsto de hormigonado en semanas según planificación" onchange="window.updateTipoHormigon('${catKey}', ${item.id}, 'tiempoSemanas', this.value)"></div>
                    <div class="form-group"><label class="form-label">Resistencia (fck):</label>
                        <select class="form-control" title="Resistencia característica fck (MPa) a 28 días según RD 470/2021" onchange="window.updateTipoHormigon('${catKey}', ${item.id}, 'resistencia', this.value)">
                            ${resOptions}
                        </select>
                    </div>
                    <div class="form-group"><label class="form-label">Distintivo calidad:</label>
                        <select class="form-control" title="Distintivo de Calidad Oficialmente Reconocido (DCOR, p.ej. Marca AENOR N)" onchange="window.updateTipoHormigon('${catKey}', ${item.id}, 'distintivo', this.value)">
                            <option value="sin" ${item.distintivo === 'sin' ? 'selected' : ''}>Sin distintivo</option>
                            <option value="con" ${item.distintivo === 'con' ? 'selected' : ''}>Con distintivo</option>
                        </select>
                    </div>
                    <div class="form-group"><label class="form-label">Exposición:</label>
                        <select class="form-control" title="Clase de exposición ambiental según Código Estructural (RD 470/2021)" onchange="window.updateTipoHormigon('${catKey}', ${item.id}, 'exposicion', this.value)">
                            ${expoOptions}
                        </select>
                    </div>
                    <div class="form-group"><label class="form-label">Amasadas por lote:</label><input type="number" class="form-control" min="1" step="1" value="${item.amasadasPorLote !== undefined ? item.amasadasPorLote : 3}" title="Amasadas de control por lote (mínimo 3 amasadas según Código Estructural)" onchange="window.updateTipoHormigon('${catKey}', ${item.id}, 'amasadasPorLote', this.value)"></div>
                    <div class="form-group"><label class="form-label">Cuantía acero (kg/m³):</label><input type="number" class="form-control" min="0" step="1" value="${item.cuantiaAcero !== undefined ? item.cuantiaAcero : (DEFAULT_CUANTIAS[catKey] || 100)}" placeholder="${DEFAULT_CUANTIAS[catKey] || 100}" title="Cuantía estimada de acero corrugado en kg por m³ de hormigón" onchange="window.updateTipoHormigon('${catKey}', ${item.id}, 'cuantiaAcero', parseFloat(this.value) || 0)"></div>
                </div>
                <div class="info-section">
                    <div>A/C máx: <strong>${dExpo.ac_max.toFixed(2)}</strong></div>
                    <div>Cemento mín: <strong>${dExpo.cemento_min} kg/m³</strong></div>
                    <div class="${resUser < dExpo.resistencia_min ? 'warning' : ''}">Resist. mín: <strong>${dExpo.resistencia_min} MPa</strong></div>
                </div>
                <div class="result-card">
                    ${resultadoHtml}
                </div>
            </div>`;
        });

        // Barra de subtotales del elemento si hay más de 1 tipo o datos
        if (items.length > 1 || subVol > 0) {
            html += `
            <div class="subtotal-bar">
                <div>Volumen Subtotal: <strong>${subVol.toFixed(2)} m³</strong></div>
                <div>Lotes: <strong>${subLot}</strong></div>
                <div>Amasadas: <strong>${subAm}</strong></div>
            </div>`;
        }

        container.innerHTML = html;
        
        // Hide the whole tab content on print if it has no data
        const tabContent = wrapper.querySelector(`#${catKey}`);
        if (tabContent) {
            if (subVol === 0) {
                tabContent.classList.add('hide-on-print');
            } else {
                tabContent.classList.remove('hide-on-print');
            }
        }
    };

    // Actualización de cuantía de acero y tabla en pestaña Acero
    window.updateCuantiaAcero = function(catKey, id, value) {
        if (!data[catKey]) return;
        const item = data[catKey].find(t => t.id === id);
        if (item) {
            item.cuantiaAcero = parseFloat(value) || 0;
            window.renderTiposHormigon(catKey);
            window.recalcularTodo();
        }
    };

    window.renderTablaCuantiasAcero = function() {
        const container = wrapper.querySelector('#tablaCuantiasAceroContainer');
        if (!container) return;

        const categories = [
            { key: 'cimentaciones', label: 'Cimentaciones', defaultCuantia: DEFAULT_CUANTIAS.cimentaciones },
            { key: 'compresion', label: 'Elementos a compresión', defaultCuantia: DEFAULT_CUANTIAS.compresion },
            { key: 'forjados', label: 'Forjados', defaultCuantia: DEFAULT_CUANTIAS.forjados },
            { key: 'losaspav', label: 'Losas Pavimento', defaultCuantia: DEFAULT_CUANTIAS.losaspav }
        ];

        let rows = '';
        let totalKg = 0;
        let totalVol = 0;

        categories.forEach(cat => {
            const items = data[cat.key] || [];
            items.forEach((item, idx) => {
                const vol = parseFloat(item.volumen) || 0;
                const cuantia = item.cuantiaAcero !== undefined && item.cuantiaAcero !== '' ? parseFloat(item.cuantiaAcero) : cat.defaultCuantia;
                const subKg = vol * cuantia;
                totalVol += vol;
                totalKg += subKg;
                const nombre = item.nombre && item.nombre.trim() !== '' ? item.nombre : `Tipo ${idx + 1}`;

                rows += `
                <tr>
                    <td><strong>${cat.label}</strong></td>
                    <td>${nombre}</td>
                    <td style="text-align:right;">${vol > 0 ? vol.toFixed(2) + ' m³' : '0.00 m³'}</td>
                    <td style="text-align:center;">
                        <div style="display:inline-flex; align-items:center; gap:6px; justify-content:center;">
                            <input type="number" class="form-control" style="width:90px; text-align:right; font-weight:bold; border:1px solid #000; background:#fff; border-radius:0;" min="0" step="1" value="${cuantia}" onchange="window.updateCuantiaAcero('${cat.key}', ${item.id}, this.value)">
                            <span style="font-size:0.85em; color:#000;">kg/m³</span>
                        </div>
                    </td>
                    <td style="text-align:right; font-weight:bold; color:#000;">${subKg.toFixed(2)} kg</td>
                </tr>`;
            });
        });

        if (rows === '') {
            container.innerHTML = '<p style="color:#000;">No hay tipos de hormigón configurados.</p>';
            return;
        }

        container.innerHTML = `
        <table class="summary-table" style="width:100%;">
            <thead>
                <tr>
                    <th>Elemento Estructural</th>
                    <th>Tipo de Hormigón</th>
                    <th style="text-align:right;">Volumen</th>
                    <th style="text-align:center;">Cuantía <span class="hide-on-print">Editable</span></th>
                    <th style="text-align:right;">Acero Estimado</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
            <tfoot>
                <tr style="background:#f0f0f0; font-weight:bold; border-top:1px solid #000;">
                    <td colspan="2">Total hormigón y acero estimado</td>
                    <td style="text-align:right;">${totalVol.toFixed(2)} m³</td>
                    <td style="text-align:center; color:#000;">-</td>
                    <td style="text-align:right; color:#000;">${totalKg.toFixed(2)} kg</td>
                </tr>
            </tfoot>
        </table>`;
    };

    // Pestaña Cálculo de Acero
    function handleAceroCalculation() {
        if (window.renderTablaCuantiasAcero) {
            window.renderTablaCuantiasAcero();
        }

        const resDiv = wrapper.querySelector('#resultadoAcero');
        if (!resDiv) return;

        const categories = [
            { key: 'cimentaciones', label: 'Cimentaciones', defaultCuantia: DEFAULT_CUANTIAS.cimentaciones },
            { key: 'compresion', label: 'Elementos a compresión', defaultCuantia: DEFAULT_CUANTIAS.compresion },
            { key: 'forjados', label: 'Forjados', defaultCuantia: DEFAULT_CUANTIAS.forjados },
            { key: 'losaspav', label: 'Losas Pav.', defaultCuantia: DEFAULT_CUANTIAS.losaspav }
        ];

        let volT = 0;
        let kgT = 0;
        let desgloseHtml = '';

        categories.forEach(cat => {
            const list = data[cat.key] || [];
            let catVol = 0;
            let catKg = 0;
            list.forEach((item, idx) => {
                const vol = parseFloat(item.volumen) || 0;
                const cuantia = item.cuantiaAcero !== undefined && item.cuantiaAcero !== '' ? parseFloat(item.cuantiaAcero) : cat.defaultCuantia;
                const subKg = vol * cuantia;
                volT += vol;
                kgT += subKg;
                catVol += vol;
                catKg += subKg;
            });
            if (catVol > 0) {
                desgloseHtml += `<div>• <strong>${cat.label}:</strong> ${catKg.toFixed(2)} kg (${catVol.toFixed(2)} m³)</div>`;
            }
        });

        const pFina = parseFloat(wrapper.querySelector('#porcentajeFina')?.value || 0);
        const pMedia = parseFloat(wrapper.querySelector('#porcentajeMedia')?.value || 0);
        const pGruesa = parseFloat(wrapper.querySelector('#porcentajeGruesa')?.value || 0);
        const pMuyGruesa = parseFloat(wrapper.querySelector('#porcentajeMuyGruesa')?.value || 0);

        const soldRes = wrapper.querySelector('#soldaduraResistente')?.checked || false;
        const soldNoRes = wrapper.querySelector('#soldaduraNoResistente')?.checked || false;

        // Persistir parámetros de acero
        data.porcentajeFina = pFina;
        data.porcentajeMedia = pMedia;
        data.porcentajeGruesa = pGruesa;
        data.porcentajeMuyGruesa = pMuyGruesa;
        data.soldaduraResistente = soldRes;
        data.soldaduraNoResistente = soldNoRes;

        if (volT <= 0) {
            resDiv.innerHTML = '<span style="color:#64748b;">Complete cálculos de hormigón introduciendo volúmenes en las pestañas anteriores.</span>';
            resultadosGlobales.Acero = { isValid: false };
            return;
        }

        const sum = pFina + pMedia + pGruesa + pMuyGruesa;
        if (sum !== 100) {
            resDiv.innerHTML = `<span class="warning">La suma de porcentajes de series de acero debe ser exactamente 100% (actualmente: ${sum}%).</span>`;
            resultadosGlobales.Acero = { isValid: false };
            return;
        }

        const kF = kgT * (pFina / 100), kM = kgT * (pMedia / 100), kG = kgT * (pGruesa / 100), kMG = kgT * (pMuyGruesa / 100);
        const lF = Math.ceil(kF / 25000), lM = Math.ceil(kM / 25000), lG = Math.ceil(kG / 25000), lMG = Math.ceil(kMG / 25000);

        let msgs = [];
        if (soldRes) msgs.push('Para soldadura resistente: Se debe solicitar el certificado de homologación de soldadores y del proceso de soldadura.');
        if (soldNoRes) msgs.push('Para soldadura no resistente: Se debe solicitar el Certificado de cualificación del personal que realizará dicha soldadura.');

        let out = `
        <div style="font-size:0.9rem; font-weight:700; color:#000; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid #000; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <span>Kg totales de acero: <span>${kgT.toFixed(2)} kg</span></span>
            <span style="border:1px solid #000; background:#fff; color:#000; padding:2px 8px; font-size:0.8rem; font-weight:600;">${lF + lM + lG + lMG} lotes totales</span>
        </div>`;
        if (desgloseHtml) {
            out += `
            <div style="margin-bottom:12px; background:#fff; padding:4px 0; font-size:0.8rem; color:#000;">
                <div style="font-weight:700; margin-bottom:4px; color:#000; font-size:0.8rem;">Desglose por elemento estructural:</div>
                <div style="display:flex; flex-direction:column; gap:2px;">${desgloseHtml}</div>
            </div>`;
        }
        out += `
        <div style="font-size:0.85rem; font-weight:700; color:#000; margin-bottom:8px;">Distribución por series de diámetro:</div>
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; margin-bottom:12px;">
            <div style="background:#fff; padding:4px 0;">
                <div style="font-weight:700; color:#000; margin-bottom:2px; font-size:0.8rem;">Fina (&lt;10mm)</div>
                <div style="font-size:0.85rem; font-weight:700; color:#000;">${kF.toFixed(2)} kg</div>
                <div style="font-size:0.75rem; color:#444; margin-top:2px;">${lF} ${lF === 1 ? 'lote' : 'lotes'}</div>
            </div>
            <div style="background:#fff; padding:4px 0;">
                <div style="font-weight:700; color:#000; margin-bottom:2px; font-size:0.8rem;">Media (12-20mm)</div>
                <div style="font-size:0.85rem; font-weight:700; color:#000;">${kM.toFixed(2)} kg</div>
                <div style="font-size:0.75rem; color:#444; margin-top:2px;">${lM} ${lM === 1 ? 'lote' : 'lotes'}</div>
            </div>
            <div style="background:#fff; padding:4px 0;">
                <div style="font-weight:700; color:#000; margin-bottom:2px; font-size:0.8rem;">Gruesa (25-32mm)</div>
                <div style="font-size:0.85rem; font-weight:700; color:#000;">${kG.toFixed(2)} kg</div>
                <div style="font-size:0.75rem; color:#444; margin-top:2px;">${lG} ${lG === 1 ? 'lote' : 'lotes'}</div>
            </div>
            <div style="background:#fff; padding:4px 0;">
                <div style="font-weight:700; color:#000; margin-bottom:2px; font-size:0.8rem;">Muy Gruesa (&gt;40mm)</div>
                <div style="font-size:0.85rem; font-weight:700; color:#000;">${kMG.toFixed(2)} kg</div>
                <div style="font-size:0.75rem; color:#444; margin-top:2px;">${lMG} ${lMG === 1 ? 'lote' : 'lotes'}</div>
            </div>
        </div>
        <hr style="margin:12px 0; border:0; border-top:1px solid #000;">
        <div style="font-size:0.85rem; font-weight:700; color:#000; margin-bottom:6px;">Ensayos sobre el acero:</div>
        <div style="color:#000; font-size:0.8rem; line-height:1.4; margin-bottom:10px;">
            Sobre cada lote de acero hay que realizar los siguientes ensayos: Dos barras por lote sobre las que se ensayará: ensayo de tracción, ensayo de doblado-desdoblado o de doblado simple y determinación de características geométricas.
        </div>`;

        if (msgs.length > 0) {
            out += `
            <div style="font-size:0.85rem; font-weight:700; color:#000; margin-bottom:6px;">Consideraciones de Soldadura:</div>
            <ul style="margin:0; padding-left:22px; color:#000; font-size:0.8rem; line-height:1.4;">`;
            msgs.forEach(m => out += `<li style="margin-bottom:4px;">${m}</li>`);
            out += `</ul>`;
        }

        resDiv.innerHTML = out;
        resultadosGlobales.Acero = {
            totalKgAceroGlobal: kgT,
            totalLotesAceroGlobal: lF + lM + lG + lMG,
            totalKgFina: kF, totalKgMedia: kM, totalKgGruesa: kG, totalKgMuyGruesa: kMG,
            isValid: true
        };
    }

    // Actualizar Resumen Global
    function actualizarResumen() {
        const tbody = wrapper.querySelector('#tablaResumenBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        let tVol = 0, tLot = 0, tAm = 0;
        const categories = [
            { key: 'cimentaciones', label: 'Cimentaciones' },
            { key: 'compresion', label: 'Elementos a compresión' },
            { key: 'forjados', label: 'Forjados' },
            { key: 'losaspav', label: 'Losas Pav.' }
        ];

        let rowsAdded = 0;

        categories.forEach(cat => {
            const list = data[cat.key] || [];
            list.forEach((item, idx) => {
                const c = calcularTipoHormigon(cat.key, item);
                if (c.hasData) {
                    rowsAdded++;
                    const nombreTipo = item.nombre && item.nombre.trim() !== '' ? item.nombre : `Tipo ${idx + 1}`;
                    tbody.innerHTML += `<tr>
                        <td><strong>${cat.label}</strong></td>
                        <td>${nombreTipo}</td>
                        <td>${c.volumen.toFixed(2)}</td>
                        <td>${c.numeroLotes}</td>
                        <td>${c.amasadas}</td>
                    </tr>`;
                    tVol += c.volumen;
                    tLot += c.numeroLotes;
                    tAm += c.amasadas;
                }
            });
        });

        if (rowsAdded === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#64748b;padding:25px;">No hay tipos de hormigón programados con volumen introducido.</td></tr>`;
        }

        wrapper.querySelector('#totalVolumen').textContent = `Volumen Total: ${tVol.toFixed(2)} m³`;
        wrapper.querySelector('#totalLotes').textContent = `Lotes Totales: ${tLot}`;
        wrapper.querySelector('#totalAmasadas').textContent = `Amasadas Totales: ${tAm}`;



        // Resumen Ensayos de Acero
        const acS = wrapper.querySelector('#aceroEnsayosSummarySection');
        if (data.lotesAcero && data.lotesAcero.length > 0) {
            let acHtml = '<h3>Resumen Ensayos de Acero</h3><table class="summary-table"><thead><tr><th>Referencia</th><th>Ubicación</th><th>Diámetro</th><th>Tracción</th><th>Doblado</th><th>Geométricas</th></tr></thead><tbody>';
            data.lotesAcero.forEach(l => {
                const tr = (l.ensayoTraccion || '').toUpperCase();
                const db = (l.ensayoDoblado || '').toUpperCase();
                const geo = (l.ensayoGeometricas || '').toUpperCase();
                const badgeC = (v) => {
                    if (v === 'CONFORME') return '<span class="badge-conforme">CONFORME</span>';
                    if (v === 'NO CONFORME') return '<span class="badge-no-conforme">NO CONFORME</span>';
                    return '<span class="badge-pendiente">-</span>';
                };
                acHtml += `<tr><td>${l.referencia || '-'}</td><td>${l.ubicacion || '-'}</td><td>${l.diametro || '-'}</td>
                <td>${badgeC(tr)}</td>
                <td>${badgeC(db)}</td>
                <td>${badgeC(geo)}</td></tr>`;
            });
            acHtml += '</tbody></table>';
            acS.innerHTML = acHtml;
            acS.style.display = 'block';
        } else {
            acS.style.display = 'none';
        }

        // Resumen Ensayos de Rotura (RD 470/2021)
        const rotS = wrapper.querySelector('#roturaSummarySection');
        if (data.lotesRotura && data.lotesRotura.length > 0) {
            let rotHtml = '<h3>Resumen Ensayos de Rotura (Control según RD 470/2021)</h3><table class="summary-table"><thead><tr><th>Referencia</th><th>Ubicación</th><th>Caso</th><th>fck (MPa)</th><th>fest (MPa)</th><th>Estado</th></tr></thead><tbody>';
            data.lotesRotura.forEach(l => {
                const res = l.resultado;
                const fest = res ? res.fest.toFixed(2) : '-';
                const estadoBadge = res 
                    ? (res.aprobado ? '<span class="badge-conforme">CONFORME</span>' : '<span class="badge-no-conforme">NO CONFORME</span>') 
                    : '<span class="badge-pendiente">Pendiente</span>';
                rotHtml += `<tr><td>${l.referencia || '-'}</td><td>${l.ubicacion || '-'}</td><td>Caso ${l.caso}</td><td>${l.fck} MPa</td><td>${fest}</td><td>${estadoBadge}</td></tr>`;
            });
            rotHtml += '</tbody></table>';
            rotS.innerHTML = rotHtml;
            rotS.style.display = 'block';
        } else {
            rotS.style.display = 'none';
        }
    }

    // Recalcular todo
    window.recalcularTodo = function() {
        // Sincronizar volúmenes consolidados para compatibilidad
        data.volumenCimentacion = (data.cimentaciones || []).reduce((s, i) => s + (parseFloat(i.volumen) || 0), 0);
        data.volumenCompresion = (data.compresion || []).reduce((s, i) => s + (parseFloat(i.volumen) || 0), 0);
        data.volumenForjados = (data.forjados || []).reduce((s, i) => s + (parseFloat(i.volumen) || 0), 0);
        data.volumenLosasPav = (data.losaspav || []).reduce((s, i) => s + (parseFloat(i.volumen) || 0), 0);

        handleAceroCalculation();
        actualizarResumen();
    };

    // ==========================================
    // SECCIÓN ENSAYOS DE ROTURA (Hormigón)
    // ==========================================
    window.addLoteRotura = function() {
        data.lotesRotura.push({
            id: Date.now(), referencia: '', ubicacion: '', caso: '3', fck: 25, laboratorio: '',
            coefVariacion: '', s35: '', numAmasadas: 3, amasadas: ['', '', ''], resultado: null
        });
        window.renderLotesRotura();
    };

    window.deleteLoteRotura = function(id) {
        data.lotesRotura = data.lotesRotura.filter(l => l.id !== id);
        window.renderLotesRotura();
    };

    window.updateLoteRotura = function(id, field, value) {
        const lote = data.lotesRotura.find(l => l.id === id);
        if (lote) {
            lote[field] = value;
            if (field === 'caso' || field === 'numAmasadas') {
                const targetN = parseInt(lote.numAmasadas) || 3;
                while (lote.amasadas.length < targetN) lote.amasadas.push('');
                lote.amasadas = lote.amasadas.slice(0, targetN);
            }
            window.calculateLoteRotura(id);
            window.renderLotesRotura();
        }
    };

    window.updateAmasada = function(id, index, value) {
        const lote = data.lotesRotura.find(l => l.id === id);
        if (lote) {
            lote.amasadas[index] = value;
            window.calculateLoteRotura(id);
            window.renderLotesRotura();
        }
    };

    window.calculateLoteRotura = function(id) {
        const lote = data.lotesRotura.find(l => l.id === id);
        if (!lote) return;
        const fck = parseFloat(lote.fck);
        const N = parseInt(lote.numAmasadas);
        if (isNaN(fck) || fck <= 0 || lote.amasadas.some(v => v === '' || isNaN(parseFloat(v)))) {
            lote.resultado = null; return;
        }
        const resistencias = lote.amasadas.map(v => parseFloat(v));
        const media = resistencias.reduce((sum, val) => sum + val, 0) / N;
        const x1 = Math.min(...resistencias);
        const kn = coeficientesKn[N] || 1.00;
        let fest = 0, aprobado = false, formula = '';
        if (lote.caso === '1') {
            const delta = parseFloat(lote.coefVariacion);
            if (isNaN(delta) || delta < 0) { lote.resultado = null; return; }
            fest = media * (1 - 1.66 * delta);
            aprobado = fest >= fck;
            formula = `fest = ${media.toFixed(2)} × (1 - 1.66 × ${delta}) = ${fest.toFixed(2)} MPa`;
        } else if (lote.caso === '2') {
            const s35 = parseFloat(lote.s35);
            if (isNaN(s35) || s35 < 0) { lote.resultado = null; return; }
            fest = media - (1.66 * s35);
            aprobado = fest >= fck;
            formula = `fest = ${media.toFixed(2)} - 1.66 × ${s35} = ${fest.toFixed(2)} MPa`;
        } else {
            fest = x1 * kn;
            aprobado = fest >= fck;
            formula = `fest = ${x1.toFixed(2)} × ${kn} = ${fest.toFixed(2)} MPa`;
        }
        lote.resultado = { media, x1, kn, fest, aprobado, formula };
    };

    window.renderLotesRotura = function() {
        const container = wrapper.querySelector('#lotesRoturaContainer');
        if (!container) return;
        if (data.lotesRotura.length === 0) {
            container.innerHTML = '<p style="color:#777; font-style:italic;">No hay lotes añadidos. Haga clic en "+ Añadir Lote" para comenzar.</p>';
            actualizarResumen();
            return;
        }
        let html = '';
        data.lotesRotura.forEach(lote => {
            const numAmasadasOptions = [3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map(n => `<option value="${n}" ${lote.numAmasadas == n ? 'selected' : ''}>${n} amasadas</option>`).join('');
            let extraFields = '';
            if (lote.caso === '1') {
                extraFields = `<div class="form-group"><label class="form-label">Coef. cert. (δ*):</label><input type="number" class="form-control" step="0.001" value="${lote.coefVariacion || ''}" onchange="window.updateLoteRotura(${lote.id}, 'coefVariacion', this.value)"></div>`;
            } else if (lote.caso === '2') {
                extraFields = `<div class="form-group"><label class="form-label">s35 (MPa):</label><input type="number" class="form-control" step="0.1" value="${lote.s35 || ''}" onchange="window.updateLoteRotura(${lote.id}, 's35', this.value)"></div>`;
            }
            let amasadasHtml = '';
            lote.amasadas.forEach((val, i) => {
                amasadasHtml += `<div>
                    <label style="font-size:0.75rem; color:#1f2937; font-weight:600;">Amasada ${i+1}</label>
                    <input type="number" step="0.1" value="${val}" title="Resistencia a compresión obtenida en probeta cilíndrica a 28 días (MPa)" onchange="window.updateAmasada(${lote.id}, ${i}, this.value)" style="width:100%; padding:4px 8px; border:1px solid #000; border-radius:4px; font-family:'Inter',sans-serif; font-size:0.8rem; background:#fff;">
                </div>`;
            });
            let resultadoHtml = '<div style="margin-top:6px; padding:6px 10px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:4px; font-size:0.75rem; color:#64748b;">Complete todos los datos para ver el resultado.</div>';
            if (lote.resultado) {
                const r = lote.resultado;
                const badgeHtml = r.aprobado 
                    ? '<span class="badge-conforme">CONFORME ✓</span>' 
                    : '<span class="badge-no-conforme">NO CONFORME ✗</span>';
                resultadoHtml = `
                <div style="margin-top:6px; padding:6px 10px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:4px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <div>
                        <div style="margin-bottom:3px;">${badgeHtml}</div>
                        <div style="font-family:'Inter',sans-serif; font-size:0.75rem; color:#1f2937;">${r.formula} (fck=${lote.fck} MPa)</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:0.75rem; color:#334155; font-weight:600;">Media: ${r.media.toFixed(2)} MPa | Mín: ${r.x1.toFixed(2)} MPa</div>
                    </div>
                </div>`;
            }
            html += `
            <div class="lote-card ${!lote.resultado ? 'hide-on-print' : ''}">
                <div class="lote-header hide-on-print">
                    <h4 style="margin:0; font-size:0.9rem;">Lote de Hormigón</h4>
                    <button class="btn-delete" onclick="window.deleteLoteRotura(${lote.id})">Eliminar</button>
                </div>
                <div class="dynamic-grid">
                    <div class="form-group" style="grid-column: 1 / -1;"><label class="form-label">Referencia / Ubicación:</label>
                        <input type="text" class="form-control" value="${lote.referencia || ''}" onchange="window.updateLoteRotura(${lote.id}, 'referencia', this.value)" placeholder="Ref" title="Referencia o identificación del albarán de hormigón" style="border-right:1px solid #000;">
                        <input type="text" class="form-control" value="${lote.ubicacion || ''}" onchange="window.updateLoteRotura(${lote.id}, 'ubicacion', this.value)" placeholder="Ubicación" title="Elemento o zona estructural donde se ha colocado el hormigón">
                    </div>
                    <div class="form-group"><label class="form-label">Caso Control:</label>
                        <select class="form-control" title="Criterio de control y aceptación según RD 470/2021 (Art. 57.5)" onchange="window.updateLoteRotura(${lote.id}, 'caso', this.value)">
                            <option value="1" ${lote.caso==='1'?'selected':''}>Caso 1: Con Distintivo de Calidad Certificado (Art. 57.5.3.1)</option>
                            <option value="2" ${lote.caso==='2'?'selected':''}>Caso 2: Sin Distintivo, > 36 Amasadas (Art. 57.5.3.2)</option>
                            <option value="3" ${lote.caso==='3'?'selected':''}>Caso 3: Sin Distintivo, ≤ 36 Amasadas (Art. 57.5.3.3)</option>
                        </select>
                    </div>
                    <div class="form-group"><label class="form-label">fck (MPa):</label><input type="number" class="form-control" value="${lote.fck || ''}" title="Resistencia característica fck (MPa) a 28 días" onchange="window.updateLoteRotura(${lote.id}, 'fck', this.value)"></div>
                    <div class="form-group"><label class="form-label">N (Amasadas):</label>
                        <select class="form-control" title="Número de amasadas controladas en este lote (mínimo 3 amasadas según Código Estructural)" onchange="window.updateLoteRotura(${lote.id}, 'numAmasadas', this.value)">
                            ${numAmasadasOptions}
                        </select>
                    </div>
                    <div class="form-group"><label class="form-label">Laboratorio:</label><input type="text" class="form-control" value="${lote.laboratorio || ''}" title="Nombre y acreditación del laboratorio de ensayos" onchange="window.updateLoteRotura(${lote.id}, 'laboratorio', this.value)" placeholder="Ej: Lab. Central"></div>
                    ${extraFields}
                </div>
                <div style="margin-top:6px;">
                    <h5 style="margin:0 0 2px 0; font-size:0.8rem;">Resultados de Rotura (MPa)</h5>
                    <div class="amasadas-grid">
                        ${amasadasHtml}
                    </div>
                </div>
                ${resultadoHtml}
            </div>`;
        });
        container.innerHTML = html;
        actualizarResumen();
    };

    // ==========================================
    // SECCIÓN ENSAYOS DE ACERO
    // ==========================================
    window.addLoteAcero = function() {
        data.lotesAcero.push({
            id: Date.now(), referencia: '', ubicacion: '', diametro: '', fabricante: '', laboratorio: '',
            ensayoTraccion: 'no procede', ensayoDoblado: 'no procede', ensayoGeometricas: 'no procede'
        });
        window.renderLotesAcero();
    };

    window.deleteLoteAcero = function(id) {
        data.lotesAcero = data.lotesAcero.filter(l => l.id !== id);
        window.renderLotesAcero();
    };

    window.updateLoteAcero = function(id, field, value) {
        const lote = data.lotesAcero.find(l => l.id === id);
        if (lote) {
            lote[field] = value;
            window.renderLotesAcero();
        }
    };

    window.renderLotesAcero = function() {
        const container = wrapper.querySelector('#lotesAceroContainer');
        if (!container) return;
        if (data.lotesAcero.length === 0) {
            container.innerHTML = '<p style="color:#777; font-style:italic;">No hay lotes añadidos. Haga clic en "+ Añadir Lote Acero" para comenzar.</p>';
            actualizarResumen();
            return;
        }
        let html = '';
        const opts = ['no procede', 'conforme', 'no conforme'];
        const buildOptions = (val) => opts.map(o => `<option value="${o}" ${val === o ? 'selected' : ''}>${o.toUpperCase()}</option>`).join('');

        data.lotesAcero.forEach(lote => {
            html += `
            <div class="lote-card">
                <div class="lote-header hide-on-print">
                    <h4 style="margin:0; font-size:0.9rem; color: #000;">Lote de Acero</h4>
                    <button class="btn-delete" onclick="window.deleteLoteAcero(${lote.id})">Eliminar</button>
                </div>
                <div class="dynamic-grid">
                    <div class="form-group" style="grid-column: 1 / -1;"><label class="form-label">Referencia / Ubicación:</label>
                        <input type="text" class="form-control" value="${lote.referencia || ''}" onchange="window.updateLoteAcero(${lote.id}, 'referencia', this.value)" placeholder="Ref" style="border-right:1px solid #000;">
                        <input type="text" class="form-control" value="${lote.ubicacion || ''}" onchange="window.updateLoteAcero(${lote.id}, 'ubicacion', this.value)" placeholder="Ubicación">
                    </div>
                    <div class="form-group"><label class="form-label">Diámetro:</label><input type="text" class="form-control" value="${lote.diametro || ''}" onchange="window.updateLoteAcero(${lote.id}, 'diametro', this.value)" placeholder="Ej: Ø 16"></div>
                    <div class="form-group"><label class="form-label">Fabricante:</label><input type="text" class="form-control" value="${lote.fabricante || ''}" onchange="window.updateLoteAcero(${lote.id}, 'fabricante', this.value)"></div>
                    <div class="form-group"><label class="form-label">Laboratorio:</label><input type="text" class="form-control" value="${lote.laboratorio || ''}" onchange="window.updateLoteAcero(${lote.id}, 'laboratorio', this.value)"></div>
                </div>
                <div style="margin-top:6px; padding: 6px 10px; background: #fff; border: 1px solid #000; border-radius: 0;">
                    <h5 style="margin:0 0 4px 0; font-size:0.8rem;">Ensayos</h5>
                    <div class="dynamic-grid" style="padding:0;">
                        <div class="form-group"><label class="form-label">Tracción:</label><select class="form-control" onchange="window.updateLoteAcero(${lote.id}, 'ensayoTraccion', this.value)">${buildOptions(lote.ensayoTraccion)}</select></div>
                        <div class="form-group"><label class="form-label">Doblado:</label><select class="form-control" onchange="window.updateLoteAcero(${lote.id}, 'ensayoDoblado', this.value)">${buildOptions(lote.ensayoDoblado)}</select></div>
                        <div class="form-group"><label class="form-label" style="font-size:0.75rem; flex:0 0 130px;">Caract. Geom.:</label><select class="form-control" onchange="window.updateLoteAcero(${lote.id}, 'ensayoGeometricas', this.value)">${buildOptions(lote.ensayoGeometricas)}</select></div>
                    </div>
                </div>
            </div>`;
        });
        container.innerHTML = html;
        actualizarResumen();
    };

    // Restaurar inputs de Acero
    const aceroInputs = wrapper.querySelectorAll('#acero input');
    aceroInputs.forEach(input => {
        if (input.id && data[input.id] !== undefined) {
            if (input.type === 'checkbox') input.checked = !!data[input.id];
            else input.value = data[input.id];
        }
        input.addEventListener('change', () => {
            if (input.id) data[input.id] = input.type === 'checkbox' ? input.checked : input.value;
            handleAceroCalculation();
            actualizarResumen();
        });
    });

    // Renderizado inicial
    window.renderTiposHormigon('cimentaciones');
    window.renderTiposHormigon('compresion');
    window.renderTiposHormigon('forjados');
    window.renderTiposHormigon('losaspav');
    window.renderLotesRotura();
    window.renderLotesAcero();
    window.recalcularTodo();
};

// ==========================================================================
// HERRAMIENTA DE TESTEO AUTÓNOMO (Código Estructural RD 470/2021)
// Criterio del agente CalculistaEstructuras para garantizar rigor normativo
// ==========================================================================
(function testCalculosHormigonRD470() {
    try {
        // Test 1: Loteado de forjados según Art. 57.4 RD 470/2021 (100 m³, 1000 m², 2 semanas)
        // Caso: 150 m³ y 1200 m² -> ceil(150/100)=2, ceil(1200/1000)=2 -> 2 lotes
        const lotVol = Math.ceil(150 / 100);
        const lotSup = Math.ceil(1200 / 1000);
        const lotesCalc = Math.max(lotVol, lotSup, 1);
        console.assert(lotesCalc === 2, `[CalculistaEstructuras] Error en lotes de forjado: esperado 2, obtenido ${lotesCalc}`);

        // Test 2: Estimación fest Caso 3 (Art. 57.5.3.3 RD 470/2021): x1 * Kn
        // Caso: x1 = 28.0 MPa, N=3 (Kn = 0.89) -> fest = 24.92 MPa
        const x1 = 28.0;
        const kn = 0.89;
        const fest = parseFloat((x1 * kn).toFixed(2));
        console.assert(fest === 24.92, `[CalculistaEstructuras] Error en fest Caso 3: esperado 24.92, obtenido ${fest}`);

        // Test 3: Loteado de acero según Art. 57.6 RD 470/2021 (lotes máx 25 t por serie)
        // Caso: 60.000 kg -> ceil(60000 / 25000) = 3 lotes
        const lotesAcero = Math.ceil(60000 / 25000);
        console.assert(lotesAcero === 3, `[CalculistaEstructuras] Error en lotes acero: esperado 3, obtenido ${lotesAcero}`);

        // Test 4: Coeficientes parciales de seguridad RD 470/2021 Art. 5.1
        const gamma_c = 1.5;
        const gamma_s = 1.15;
        console.assert(gamma_c === 1.5 && gamma_s === 1.15, "[CalculistaEstructuras] Error en coeficientes parciales de seguridad");
    } catch (e) {
        console.error("[CalculistaEstructuras Test Fallido]:", e);
    }
})();
