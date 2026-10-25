// ==========================================================================
// Motor común de las fichas de CONTROL DE EJECUCIÓN por zonas de control
// --------------------------------------------------------------------------
// Cada ficha (ejec-*-calc.js) solo describe su configuración (textos, puntos
// de inspección, tipos...) y llama a ZonasControl.render(). El formato de los
// datos guardados es el mismo que tenían las fichas originales, de modo que
// las obras existentes se abren sin cambios.
//
// Configuración (cfg):
//   prefijo            Prefijo de clases/ids de la zona (p. ej. 'ef')
//   prefijoPuntos      Prefijo de los campos de cada punto (por defecto = prefijo)
//   titulo, descripcion
//   botones            [{ id, texto, tipo?, nombre(data) , secundario? }]  (por defecto, uno)
//   textoBoton         Texto del botón por defecto ('+ Añadir zona de control')
//   nombreZona(data)   Nombre por defecto de una zona nueva
//   campoNombre        'customName' (defecto) o 'zonaName'
//   claseNombre        Clase del campo nombre ('form-control' por defecto)
//   placeholderNombre
//   ubicacion          { label, placeholder } o null si la ficha no tiene ubicación
//   camposExtra        [{ id: 'elementos', clase: 'elem', label, placeholder }]
//   obsGenerales       true (defecto) / false
//   puntos             Lista de puntos (fichas sin tipo)
//   tipos              [{ valor, texto, puntos, alias? }]  (selector de tipo por zona)
//   selectorTipo       { label, placeholder, mensajeSinTipo }  (si hay tipos elegibles)
//   tituloPuntos       Texto o función(inst) del encabezado de la tabla
//   cabeceraObs, placeholderObs
//   textoEliminar      Pregunta al eliminar una zona
//   textoOtros         'Otros' (defecto) u 'Otro'
//   fechaZonaInicial   true: la zona nueva lleva la fecha de hoy
//   filaVaciaSiNoHayPuntos  true: zona nueva sin puntos → una fila personalizada en blanco
//   mensajeSinPuntos   Texto cuando la zona no tiene puntos
//   fechaAutoAlResultado true: al elegir resultado sin fecha se pone la de hoy
//   migrarDatos(data), migrarZona(inst, cfg)   Compatibilidad con datos antiguos
// ==========================================================================
(function () {
    'use strict';

    const esc = (v) => (window.escHtml ? window.escHtml(v) : String(v == null ? '' : v));
    const hoy = () => (window.localToday ? window.localToday() : new Date().toISOString().split('T')[0]);
    const CCM = () => window.CustomControlsManager;
    const esClaveInterna = (k) => k.startsWith('_');

    function confirmar(mensaje, onOk) {
        if (window.appConfirm) window.appConfirm(mensaje, onOk);
        else if (confirm(mensaje)) onOk();
    }

    function render(container, materialId, cfg) {
        const P = cfg.prefijo;
        const PP = cfg.prefijoPuntos || P;
        const campoNombre = cfg.campoNombre || 'customName';
        const textoOtros = cfg.textoOtros || 'Otros';
        const conObs = cfg.obsGenerales !== false;
        const hayTipos = Array.isArray(cfg.tipos) && cfg.tipos.length > 0;
        const haySelector = hayTipos && !!cfg.selectorTipo;

        // ---------- Datos ----------
        const projectData = currentProject;
        if (!projectData.formData) projectData.formData = {};
        if (!projectData.formData[materialId] || !projectData.formData[materialId].instances) {
            projectData.formData[materialId] = conObs
                ? { instances: [], observaciones: '', laboratorios: '' }
                : { instances: [] };
        }
        const data = projectData.formData[materialId];
        if (typeof cfg.migrarDatos === 'function') cfg.migrarDatos(data);

        const opcionDeTipo = (tipo) => (cfg.tipos || []).find(o => o.valor === tipo || (o.alias || []).includes(tipo));
        const puntosDe = (inst) => {
            if (!hayTipos) return cfg.puntos || [];
            const o = opcionDeTipo(inst.tipo);
            return o ? o.puntos : [];
        };
        const subTipo = (inst) => (hayTipos ? (inst.tipo || '') : '');

        // Crea los puntos de una zona nueva (o al elegir su tipo), con los habituales de la base activa
        function crearPuntos(inst) {
            const lista = puntosDe(inst);
            const tmp = { checks: {} }; // sin uid: el gestor lo trata como zona nueva
            if (CCM()) {
                CCM().prepareChecks(tmp, materialId, subTipo(inst), lista);
            } else {
                lista.forEach((c, idx) => { tmp.checks['chk_' + idx] = { val: '', obs: '', date: '', name: c }; });
            }
            if (cfg.filaVaciaSiNoHayPuntos && Object.keys(tmp.checks).filter(k => !esClaveInterna(k)).length === 0) {
                tmp.checks['chk_cust_' + Date.now()] = { val: '', obs: '', date: '', name: '', isCustom: true, isManual: true };
            }
            inst.checks = tmp.checks;
        }

        function nuevaZona(boton) {
            const inst = { uid: Date.now().toString() };
            inst[campoNombre] = typeof boton.nombre === 'function' ? boton.nombre(data)
                : (typeof cfg.nombreZona === 'function' ? cfg.nombreZona(data) : `Zona ${data.instances.length + 1}`);
            if (cfg.ubicacion) inst.ubicacion = '';
            (cfg.camposExtra || []).forEach(c => { inst[c.id] = ''; });
            if (cfg.fechaZonaInicial) inst.zonaDate = hoy();
            if (boton.tipo !== undefined) inst.tipo = boton.tipo;
            else if (haySelector) inst.tipo = '';
            inst.checks = {};
            if (!haySelector) crearPuntos(inst);
            data.instances.push(inst);
            renderAll();
        }

        // ---------- Estructura de la ficha ----------
        const botones = (cfg.botones && cfg.botones.length)
            ? cfg.botones
            : [{ id: P + '-btn-add', texto: cfg.textoBoton || '+ Añadir zona de control' }];

        container.innerHTML = `
            <div class="card" style="margin-bottom: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
                    <h2 style="margin:0;">${esc(cfg.titulo)}</h2>
                    <div style="display:flex; gap: 0.5rem; flex-wrap: wrap;">
                        ${botones.map(b => `<button id="${b.id}" class="btn ${b.secundario ? 'btn-secondary' : 'btn-primary'}" style="font-size: 0.9rem;">${esc(b.texto)}</button>`).join('')}
                    </div>
                </div>
                <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">${esc(cfg.descripcion || '')}</p>
                <div id="${P}-instances-container"></div>
                ${conObs ? `
                <div style="margin-top: 2rem; border-top: 2px solid var(--border); padding-top: 1rem;">
                    <h4 style="font-size: 0.95rem; font-weight: bold; margin-bottom: 0.5rem; color: var(--text-main);">Observaciones generales</h4>
                    <textarea id="${P}-obs" class="form-control" style="width:100%; min-height:80px; resize:vertical;">${esc(data.observaciones || '')}</textarea>
                    <h4 style="font-size: 0.95rem; font-weight: bold; margin-bottom: 0.5rem; margin-top: 1rem; color: var(--text-main);">Laboratorios intervinientes / Entidades de control</h4>
                    <textarea id="${P}-lab" class="form-control" style="width:100%; min-height:60px; resize:vertical;">${esc(data.laboratorios || '')}</textarea>
                </div>` : ''}
            </div>
        `;

        botones.forEach(b => {
            const el = container.querySelector('#' + CSS.escape(b.id));
            if (el) el.addEventListener('click', () => nuevaZona(b));
        });
        if (conObs) {
            const obsNode = container.querySelector('#' + P + '-obs');
            if (obsNode) obsNode.addEventListener('change', e => { data.observaciones = e.target.value; });
            const labNode = container.querySelector('#' + P + '-lab');
            if (labNode) labNode.addEventListener('change', e => { data.laboratorios = e.target.value; });
        }

        // ---------- Dibujo de las zonas ----------
        function htmlCampos(inst, index) {
            const celdas = [];
            if (cfg.ubicacion) {
                celdas.push(`<div>
                        <label class="form-label">${esc(cfg.ubicacion.label)}</label>
                        <input type="text" class="form-control ${P}-ubic" data-idx="${index}" value="${esc(inst.ubicacion || '')}" placeholder="${esc(cfg.ubicacion.placeholder || '')}">
                    </div>`);
            }
            (cfg.camposExtra || []).forEach(c => {
                celdas.push(`<div>
                        <label class="form-label">${esc(c.label)}</label>
                        <input type="text" class="form-control ${P}-${c.clase}" data-idx="${index}" data-campo="${esc(c.id)}" value="${esc(inst[c.id] || '')}" placeholder="${esc(c.placeholder || '')}">
                    </div>`);
            });
            if (haySelector) {
                const tipoActual = inst.tipo || '';
                const opciones = cfg.tipos.map(o => {
                    const sel = (tipoActual === o.valor || (o.alias || []).includes(tipoActual)) ? 'selected' : '';
                    return `<option value="${esc(o.valor)}" ${sel}>${esc(o.texto || o.valor)}</option>`;
                }).join('');
                celdas.push(`<div>
                        <label class="form-label">${esc(cfg.selectorTipo.label)}</label>
                        <select class="form-control ${P}-tipo" data-idx="${index}">
                            <option value="" ${tipoActual === '' ? 'selected' : ''}>${esc(cfg.selectorTipo.placeholder || 'Seleccione tipo...')}</option>
                            ${opciones}
                        </select>
                    </div>`);
            }
            if (celdas.length === 0) return '';
            if (celdas.length === 1) return `<div style="margin-bottom: 1.5rem;">${celdas[0].replace(/^<div>|<\/div>$/g, '')}</div>`;
            return `<div class="dynamic-grid" style="margin-bottom: 1.5rem; gap: 1rem;">${celdas.join('')}</div>`;
        }

        function estaUsado(it, chk) {
            const cName = chk.name !== undefined ? chk.name : it.name;
            return (chk.val || '') !== '' || (chk.obs || '') !== '' || (chk.date || '') !== '' || (Array.isArray(chk.fotos) && chk.fotos.length > 0) ||
                (it.isOtros && cName !== textoOtros && cName !== '') || (it.isCustom && cName !== '');
        }

        // Fotos del punto: miniaturas + botón para añadir (el botón no se imprime)
        function htmlFotos(chk, index, cId) {
            const fotos = Array.isArray(chk.fotos) ? chk.fotos : [];
            const minis = fotos.map((f, i) => f.mini
                ? `<span class="zc-foto"><img class="foto-mini zc-foto-ver" src="${f.mini}" data-w="${f.w || ''}" data-h="${f.h || ''}" data-idx="${index}" data-cid="${esc(cId)}" data-n="${i}" alt="${esc(f.archivo || 'Foto')}" title="${esc(f.archivo || '')}"><button type="button" class="zc-foto-quitar print-hidden" data-idx="${index}" data-cid="${esc(cId)}" data-n="${i}" title="Quitar la foto de este punto" aria-label="Quitar foto">✕</button></span>`
                : `<span class="zc-foto zc-foto-sin-mini"><button type="button" class="zc-foto-ver zc-foto-archivo" data-idx="${index}" data-cid="${esc(cId)}" data-n="${i}" title="${esc(f.archivo || '')}">📄 ${esc(f.archivo || 'Foto')}</button><button type="button" class="zc-foto-quitar print-hidden" data-idx="${index}" data-cid="${esc(cId)}" data-n="${i}" title="Quitar la foto de este punto" aria-label="Quitar foto">✕</button></span>`
            ).join('');
            return `<div class="zc-fotos">${minis}<button type="button" class="zc-btn-foto print-hidden" data-idx="${index}" data-cid="${esc(cId)}" title="Añadir fotos a este punto de inspección">📷 Foto</button></div>`;
        }

        function renderAll() {
            const wrapper = container.querySelector('#' + P + '-instances-container');
            if (!wrapper) return;
            wrapper.innerHTML = '';

            data.instances.forEach((inst, index) => {
                if (!inst.checks) inst.checks = {};
                if (typeof cfg.migrarZona === 'function') cfg.migrarZona(inst, cfg);

                const block = document.createElement('div');
                block.className = 'zc-zona';
                block.style.border = '1px solid var(--border)';
                block.style.borderRadius = '8px';
                block.style.padding = '1rem';
                block.style.marginBottom = '1.5rem';
                block.style.background = '#f8fafc';

                let html = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem; gap: 1rem; flex-wrap: wrap;">
                        <input type="text" class="${cfg.claseNombre || 'form-control'} ${P}-name" data-idx="${index}" value="${esc(inst[campoNombre] || '')}" placeholder="${esc(cfg.placeholderNombre || 'Identificador...')}" style="font-weight:bold; font-size:1.1rem; border-color:var(--primary); flex: 1; min-width: 12rem;">
                        <input type="date" class="form-control ${P}-zonadate" data-idx="${index}" value="${esc(inst.zonaDate || '')}" style="width: 150px; padding: 0.4rem; font-weight: bold; border-color: var(--primary);" title="Fecha del control">
                        <button class="btn ${P}-btn-remove" data-idx="${index}" style="color: #dc2626; border: 1px solid #dc2626; background:transparent;">Eliminar</button>
                    </div>
                    ${htmlCampos(inst, index)}
                `;

                if (haySelector && !inst.tipo) {
                    html += `<p style="font-size:0.85rem; color:var(--text-muted); font-style:italic;">${esc(cfg.selectorTipo.mensajeSinTipo || 'Selecciona un tipo para cargar los puntos de inspección.')}</p>`;
                } else {
                    const lista = puntosDe(inst);
                    const items = CCM()
                        ? CCM().prepareChecks(inst, materialId, subTipo(inst), lista)
                        : lista.map((c, idx) => {
                            if (!inst.checks['chk_' + idx]) inst.checks['chk_' + idx] = { val: '', obs: '', date: '', name: c };
                            return { cId: 'chk_' + idx, name: c, isBase: c !== textoOtros, isOtros: c === textoOtros };
                        });
                    const titulo = typeof cfg.tituloPuntos === 'function' ? cfg.tituloPuntos(inst) : (cfg.tituloPuntos || 'Puntos de Inspección');

                    html += `
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem; margin-top: 1.5rem; gap: 0.5rem; flex-wrap: wrap;">
                            <h4 style="font-size: 0.95rem; font-weight: bold; margin:0; color: var(--primary); border-bottom: 2px solid var(--primary); display: inline-block; padding-bottom: 0.2rem;">${esc(titulo)}</h4>
                            <div style="display:flex; align-items:center; gap: 0.5rem; flex-wrap: wrap;">
                                ${CCM() ? CCM().renderAddPointButton(index, PP) : ''}
                                <button type="button" class="btn ${PP}-btn-fill-all" data-idx="${index}" style="font-size:0.8rem; padding:0.25rem 0.6rem; background:#10b981; color:white; border:none; border-radius:4px; font-weight:600; cursor:pointer; white-space:nowrap;" title="Poner 'Correcto' y fecha de hoy en todos los puntos de esta zona">✓ Todo Correcto hoy</button>
                                <button type="button" class="btn zc-btn-toggle-vacios" style="font-size:0.8rem; padding:0.25rem 0.5rem; border:1px solid var(--border); white-space:nowrap;">Ocultar vacíos</button>
                            </div>
                        </div>
                        <div class="table-container" style="margin-bottom: 1.5rem;">
                            <table style="width:100%; border-collapse: collapse; font-size:0.85rem; background: white; border: 1px solid var(--border);">
                                <thead>
                                    <tr style="border-bottom: 1px solid var(--border); color: var(--text-muted); background: #f1f5f9;">
                                        <th style="padding:0.6rem; text-align:left; width:45%; font-weight:600; font-size:0.75rem;">PUNTO DE INSPECCIÓN</th>
                                        <th style="padding:0.6rem; text-align:left; width:15%; font-weight:600; font-size:0.75rem;">FECHA</th>
                                        <th style="padding:0.6rem; text-align:left; width:15%; font-weight:600; font-size:0.75rem;">RESULTADO</th>
                                        <th style="padding:0.6rem; text-align:left; width:25%; font-weight:600; font-size:0.75rem;">${esc(cfg.cabeceraObs || 'OBSERVACIONES')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                    `;

                    if (items.length === 0) {
                        html += `<tr class="unused-row"><td colspan="4" style="padding:1rem; text-align:center; color:var(--text-muted); font-style:italic;">${esc(cfg.mensajeSinPuntos || 'No hay puntos de inspección en esta zona. Pulsa «+ Añadir punto de control» para añadir uno.')}</td></tr>`;
                    }

                    items.forEach(it => {
                        const cId = it.cId;
                        const chk = inst.checks[cId] || { val: '', obs: '', date: '', name: it.name };
                        const cVal = chk.val || '';
                        const cName = chk.name !== undefined ? chk.name : it.name;
                        const cObs = chk.obs || '';
                        const cDate = chk.date || '';
                        const trClass = estaUsado(it, chk) ? '' : 'unused-row';

                        const nameHtml = CCM()
                            ? CCM().renderPointCell(inst, index, it, PP, materialId, subTipo(inst))
                            : (it.isOtros
                                ? `<input type="text" class="form-control ${PP}-chk-name" data-idx="${index}" data-cid="${esc(cId)}" value="${esc(cName)}" placeholder="${esc(textoOtros)} (especificar)..." style="border:none; width:100%; padding:0.2rem; font-size:0.85rem; background:transparent;">`
                                : esc(cName));

                        const opt = (v, t) => `<option value="${v}" ${cVal === v ? 'selected' : ''}>${t}</option>`;
                        html += `
                            <tr class="${trClass}" style="border-bottom: 1px solid var(--border); display: table-row;">
                                <td style="padding:0.6rem;">${nameHtml}${htmlFotos(chk, index, cId)}</td>
                                <td style="padding:0.4rem;">
                                    <input type="date" class="form-control ${PP}-chk-date" data-idx="${index}" data-cid="${esc(cId)}" value="${esc(cDate)}" style="padding:0.3rem; font-size:0.85rem; border:none; background:#f8fafc; width:100%;">
                                </td>
                                <td style="padding:0.4rem;">
                                    <select class="form-control ${PP}-chk-sel" data-idx="${index}" data-cid="${esc(cId)}" style="padding:0.3rem; font-size:0.85rem; width:100%;">
                                        ${opt('', '')}${opt('Correcto', 'Correcto')}${opt('No Correcto', 'No Correcto')}${opt('No procede', 'No procede')}
                                    </select>
                                </td>
                                <td style="padding:0.4rem;">
                                    <input type="text" class="form-control ${PP}-chk-obs" data-idx="${index}" data-cid="${esc(cId)}" value="${esc(cObs)}" placeholder="${esc(cfg.placeholderObs || 'Observaciones...')}" style="background:#f8fafc; border:none; width:100%; padding:0.4rem; font-size:0.85rem;">
                                </td>
                            </tr>
                        `;
                    });

                    html += `</tbody></table></div>`;
                }

                block.innerHTML = html;
                wrapper.appendChild(block);
            });

            enlazarEventos(wrapper);
        }

        // ---------- Eventos ----------
        function punto(e) {
            const inst = data.instances[e.target.dataset.idx];
            if (!inst) return null;
            const cid = e.target.dataset.cid;
            if (!inst.checks[cid]) inst.checks[cid] = { val: '', obs: '', date: '', name: '' };
            return inst.checks[cid];
        }

        function enlazarEventos(wrapper) {
            const on = (sel, ev, fn) => wrapper.querySelectorAll(sel).forEach(el => el.addEventListener(ev, fn));

            on(`.${P}-name`, 'change', e => { data.instances[e.target.dataset.idx][campoNombre] = e.target.value; });
            on(`.${P}-zonadate`, 'change', e => { data.instances[e.target.dataset.idx].zonaDate = e.target.value; });
            on(`.${P}-ubic`, 'change', e => { data.instances[e.target.dataset.idx].ubicacion = e.target.value; });
            (cfg.camposExtra || []).forEach(c => {
                on(`.${P}-${c.clase}`, 'change', e => { data.instances[e.target.dataset.idx][c.id] = e.target.value; });
            });
            on(`.${P}-btn-remove`, 'click', e => {
                const idx = e.currentTarget.dataset.idx;
                confirmar(cfg.textoEliminar || '¿Eliminar zona de control?', () => {
                    data.instances.splice(idx, 1);
                    renderAll();
                });
            });
            on(`.${P}-tipo`, 'change', e => {
                const inst = data.instances[e.target.dataset.idx];
                const nuevo = e.target.value;
                if (inst.tipo !== nuevo) {
                    inst.tipo = nuevo;
                    crearPuntos(inst);
                    renderAll();
                }
            });
            on(`.${PP}-chk-date`, 'change', e => { const c = punto(e); if (c) c.date = e.target.value; });
            on(`.${PP}-chk-sel`, 'change', e => {
                const c = punto(e);
                if (!c) return;
                c.val = e.target.value;
                if (cfg.fechaAutoAlResultado && e.target.value && !c.date) {
                    c.date = hoy();
                    const tr = e.target.closest('tr');
                    const d = tr && tr.querySelector(`.${PP}-chk-date`);
                    if (d) d.value = c.date;
                }
            });
            on(`.${PP}-chk-obs`, 'change', e => { const c = punto(e); if (c) c.obs = e.target.value; });
            on(`.${PP}-chk-name`, 'change', e => { const c = punto(e); if (c) c.name = e.target.value; });

            on('.zc-btn-toggle-vacios', 'click', e => {
                const btn = e.currentTarget;
                const zona = btn.closest('.zc-zona');
                const filas = zona ? zona.querySelectorAll('.unused-row') : [];
                const ocultas = filas[0] && filas[0].style.display === 'none';
                filas.forEach(r => { r.style.display = ocultas ? 'table-row' : 'none'; });
                btn.textContent = ocultas ? 'Ocultar vacíos' : 'Mostrar vacíos';
            });

            on(`.${PP}-btn-fill-all`, 'click', e => rellenarTodo(e.currentTarget));

            // Fotos
            const chkDe = (el) => {
                const inst = data.instances[el.dataset.idx];
                return inst ? inst.checks[el.dataset.cid] : null;
            };
            on('.zc-btn-foto', 'click', e => {
                const btn = e.currentTarget;
                const inst = data.instances[btn.dataset.idx];
                const chk = chkDe(btn);
                if (!inst || !chk) return;
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.multiple = true;
                input.style.display = 'none';
                document.body.appendChild(input);
                input.addEventListener('change', async () => {
                    const files = Array.from(input.files || []);
                    input.remove();
                    if (!files.length || !window.AppFotos) return;
                    btn.disabled = true; btn.textContent = 'Guardando...';
                    const zona = inst[campoNombre] || 'Zona';
                    const puntoTxt = (chk.name || '').slice(0, 40);
                    const nuevas = await window.AppFotos.adjuntar(materialId, files, `${zona} - ${puntoTxt}`);
                    if (nuevas.length) {
                        if (!Array.isArray(chk.fotos)) chk.fotos = [];
                        chk.fotos.push(...nuevas);
                        if (typeof markDirty === 'function') markDirty();
                    }
                    renderAll();
                });
                input.click();
            });
            on('.zc-foto-ver', 'click', e => {
                const chk = chkDe(e.currentTarget);
                const f = chk && chk.fotos ? chk.fotos[e.currentTarget.dataset.n] : null;
                if (f && window.AppFotos) window.AppFotos.ver(materialId, f);
            });
            on('.zc-foto-quitar', 'click', e => {
                const el = e.currentTarget;
                const chk = chkDe(el);
                if (!chk || !chk.fotos) return;
                confirmar('¿Quitar esta foto del punto de inspección? El archivo se conserva en la carpeta del capítulo.', () => {
                    chk.fotos.splice(Number(el.dataset.n), 1);
                    renderAll();
                });
            });

            if (CCM()) CCM().bindCustomEvents(wrapper, data, materialId, subTipo, renderAll, PP);
        }

        function ponerCampo(zona, clase, cId, valor) {
            const el = zona.querySelector(`.${PP}-${clase}[data-cid="${CSS.escape(cId)}"]`);
            if (el) { el.value = valor; if (el.tagName === 'INPUT') el.setAttribute('value', valor); }
            return el;
        }

        function rellenarTodo(btn) {
            const inst = data.instances[btn.dataset.idx];
            if (!inst) return;
            const zona = btn.closest('.zc-zona');
            const claves = Object.keys(inst.checks).filter(k => !esClaveInterna(k) && inst.checks[k] && typeof inst.checks[k] === 'object');

            if (btn.dataset.state !== 'undo') {
                btn._backup = { zonaDate: inst.zonaDate || '', checks: JSON.parse(JSON.stringify(inst.checks || {})) };
                const h = hoy();
                if (!inst.zonaDate) {
                    inst.zonaDate = h;
                    const fz = zona && zona.querySelector(`.${P}-zonadate`);
                    if (fz) { fz.value = h; fz.setAttribute('value', h); }
                }
                claves.forEach(cId => {
                    inst.checks[cId].val = 'Correcto';
                    inst.checks[cId].date = h;
                    if (zona) { ponerCampo(zona, 'chk-sel', cId, 'Correcto'); ponerCampo(zona, 'chk-date', cId, h); }
                });
                if (zona) zona.querySelectorAll('.unused-row').forEach(tr => { tr.style.display = 'table-row'; tr.classList.remove('unused-row'); });
                btn.dataset.state = 'undo';
                btn.innerHTML = '↺ Deshacer todo';
                btn.style.background = '#64748b';
                btn.title = 'Deshacer y volver al estado anterior';
            } else {
                const backup = btn._backup;
                if (backup) {
                    inst.zonaDate = backup.zonaDate;
                    inst.checks = JSON.parse(JSON.stringify(backup.checks));
                } else {
                    claves.forEach(cId => { inst.checks[cId].val = ''; inst.checks[cId].date = ''; });
                }
                btn.dataset.state = 'fill';
                renderAll(); // redibujar desde los datos restaurados
            }
        }

        renderAll();
    }

    window.ZonasControl = { render };
})();
