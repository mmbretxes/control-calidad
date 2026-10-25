// ==========================================================================
// Motor común de las fichas de CONTROL DE RECEPCIÓN (control documental por suministro)
// --------------------------------------------------------------------------
// Cada ficha (recepcion-*-calc.js) describe su configuración y llama a
// SuministrosRecepcion.render(). El formato de los datos guardados es el mismo
// que tenían las fichas originales.
//
// Configuración (cfg):
//   prefijo, titulo, descripcion?
//   textoBoton, nombreSuministro(data), placeholderNombre
//   campos            [{ id, clase, label, placeholder }]  en orden (incluida la ubicación)
//   selectorDcor      true: selector "Distintivo de Calidad (DCOR)" y documento DCOR condicional
//   tipos             { label, placeholder, opciones: [...], mensajeSinTipo, porDefecto }
//   caracteristicas   lista o función(inst) → lista, o null si la ficha no tiene características
//   documentos        lista o función(inst) → lista
//   verificadoInicial false (defecto) o '' (algunas fichas antiguas)
//   textoEliminar
//   instanciaInicial(data)   Compatibilidad: datos antiguos sin lista de suministros
// ==========================================================================
(function () {
    'use strict';

    const esc = (v) => (window.escHtml ? window.escHtml(v) : String(v == null ? '' : v));
    const ENTREGADO = ['Entregado', 'Aceptado', 'Recibido'];
    const NO_PROCEDE = ['No procede', 'No Entregado', 'No aplica'];
    const ETIQUETAS_GENERICAS = ['Otra', 'Otras', 'Otros', 'Otro'];
    const DOC_DCOR = { id: 'e_dcor', phase: 'Pre-Suministro', name: 'Distintivo de Calidad Oficialmente Reconocido (DCOR)', desc: 'Certificado vigente emitido por entidad de certificación oficial.' };

    function confirmar(mensaje, onOk) {
        if (window.appConfirm) window.appConfirm(mensaje, onOk);
        else if (confirm(mensaje)) onOk();
    }
    const colorFase = (fase) => fase === 'Pre-Suministro' ? '#b45309' : (fase === 'Durante Suministro' ? '#0f766e' : (fase === 'Final Suministro' ? '#1d4ed8' : 'var(--text-muted)'));

    function render(container, materialId, cfg) {
        // Registro de la configuración, para generar la impresión a partir de los datos
        (window.__configFichas = window.__configFichas || {})[materialId] = { tipo: 'suministros', cfg };
        const P = cfg.prefijo;
        const projectData = currentProject;
        if (!projectData.formData) projectData.formData = {};
        if (!projectData.formData[materialId]) projectData.formData[materialId] = { instances: [] };
        const data = projectData.formData[materialId];
        if (!data.instances) data.instances = typeof cfg.instanciaInicial === 'function' ? [cfg.instanciaInicial(data)] : [];
        if (cfg.tipos && cfg.tipos.porDefecto) data.instances.forEach(inst => { if (!inst.tipo) inst.tipo = cfg.tipos.porDefecto; });

        const conCaract = !!cfg.caracteristicas;
        const caractDe = (inst) => typeof cfg.caracteristicas === 'function' ? cfg.caracteristicas(inst) : (cfg.caracteristicas || []);
        const docsDe = (inst) => {
            const lista = typeof cfg.documentos === 'function' ? cfg.documentos(inst) : [...cfg.documentos];
            if (cfg.selectorDcor && inst.dcor) lista.splice(2, 0, DOC_DCOR);
            return lista;
        };
        const buscar = (uid) => data.instances.find(i => i.uid === uid);

        container.innerHTML = `
            <div class="card" style="margin-bottom: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
                    <h2 style="margin:0;">${esc(cfg.titulo)}</h2>
                    <button id="${P}-btn-add" class="btn btn-primary" style="font-size: 0.9rem;">${esc(cfg.textoBoton || '+ Añadir tipología')}</button>
                </div>
                ${cfg.descripcion ? `<p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">${esc(cfg.descripcion)}</p>` : ''}
                <div id="${P}-instances-container"></div>
            </div>
        `;

        container.querySelector('#' + P + '-btn-add').addEventListener('click', () => {
            let uid = Date.now().toString();
            while (data.instances.some(i => i.uid === uid)) uid = String(Number(uid) + 1); // identificador único
            const inst = { uid, customName: cfg.nombreSuministro(data) };
            (cfg.campos || []).forEach(c => { inst[c.id] = ''; });
            if (cfg.selectorDcor) inst.dcor = false;
            if (cfg.tipos) inst.tipo = '';
            if (conCaract) inst.caract = {};
            inst.checks = {};
            inst.observaciones = '';
            data.instances.push(inst);
            renderAll();
        });

        function htmlCabecera(inst, index) {
            const celdas = (cfg.campos || []).map(c => `<div><label class="form-label">${esc(c.label)}</label><input type="text" class="form-control ${P}-${c.clase}" data-idx="${index}" value="${esc(inst[c.id] || '')}" placeholder="${esc(c.placeholder || '')}"></div>`);
            if (cfg.selectorDcor) {
                celdas.push(`<div>
                    <label class="form-label">Distintivo de Calidad (DCOR)</label>
                    <select class="form-control ${P}-dcor" data-idx="${index}">
                        <option value="true" ${inst.dcor ? 'selected' : ''}>Con Distintivo DCOR</option>
                        <option value="false" ${!inst.dcor ? 'selected' : ''}>Sin Distintivo</option>
                    </select>
                </div>`);
            }
            if (cfg.tipos) {
                celdas.push(`<div><label class="form-label">${esc(cfg.tipos.label)}</label>
                    <select class="form-control ${P}-tipo" data-idx="${index}">
                        <option value="" ${!inst.tipo ? 'selected' : ''}>${esc(cfg.tipos.placeholder || 'Seleccione tipo...')}</option>
                        ${cfg.tipos.opciones.map(t => `<option value="${esc(t)}" ${inst.tipo === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}
                    </select>
                </div>`);
            }
            return `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem; gap: 1rem; flex-wrap: wrap;">
                    <div style="flex:1; min-width: 12rem;">
                        <input type="text" class="unified-title ${P}-name" data-idx="${index}" value="${esc(inst.customName || '')}" placeholder="${esc(cfg.placeholderNombre || '')}">
                    </div>
                    <button class="btn ${P}-btn-remove" data-idx="${index}" style="color: #dc2626; border: 1px solid #dc2626; background:transparent;">Eliminar</button>
                </div>
                <div class="dynamic-grid" style="margin-bottom: 1.5rem; gap: 1rem;">${celdas.join('')}</div>
            `;
        }

        function htmlCaracteristicas(inst) {
            if (!inst.caract) inst.caract = {};
            let html = `
                <h4 class="unified-title" style="margin-top:1rem; font-size:1rem; color:#475569;">1. Características Exigidas</h4>
                <div style="overflow-x:auto; margin-bottom: 2rem;">
                    <table style="width:100%; border-collapse: collapse; font-size:0.85rem; background: white; min-width: 500px;">
                        <thead><tr>
                            <th style="border:1px solid var(--border); padding:0.4rem; background:#f1f5f9; text-align:left; width:40%;">Exigida</th>
                            <th style="border:1px solid var(--border); padding:0.4rem; background:#f1f5f9; text-align:left; width:40%;">Valor Proyecto</th>
                            <th style="border:1px solid var(--border); padding:0.4rem; background:#f1f5f9; text-align:center; width:20%;">Verificado</th>
                        </tr></thead><tbody>`;
            caractDe(inst).forEach(car => {
                if (!inst.caract[car.id]) inst.caract[car.id] = { label: car.name, valor: '', verificado: cfg.verificadoInicial !== undefined ? cfg.verificadoInicial : false };
                const c = inst.caract[car.id];
                let labelHtml = `<strong>${esc(car.name)}</strong>`;
                if (car.custom) {
                    const v = (c.label === car.name || ETIQUETAS_GENERICAS.includes(c.label)) ? '' : c.label;
                    labelHtml = `<input type="text" class="${P}-caract-label form-control" data-uid="${esc(inst.uid)}" data-carid="${esc(car.id)}" value="${esc(v)}" placeholder="Otra característica..." style="border:none; padding:0; font-size:0.85rem; background:transparent; font-weight:600; width:100%;">`;
                }
                html += `
                    <tr>
                        <td style="border:1px solid var(--border); padding:0.4rem;">${labelHtml}</td>
                        <td style="border:1px solid var(--border); padding:0.4rem;"><input type="text" class="${P}-caract-valor form-control" data-uid="${esc(inst.uid)}" data-carid="${esc(car.id)}" value="${esc(c.valor || '')}" style="width:100%; padding:0.2rem; margin:0; border:1px solid transparent;" placeholder="..."></td>
                        <td style="border:1px solid var(--border); padding:0.4rem; text-align:center;"><input type="checkbox" class="${P}-caract-verif" data-uid="${esc(inst.uid)}" data-carid="${esc(car.id)}" ${c.verificado ? 'checked' : ''} style="width:1.2rem; height:1.2rem; cursor:pointer;"></td>
                    </tr>`;
            });
            return html + `</tbody></table></div>`;
        }

        function htmlDocumentos(inst) {
            let html = `<h4 class="unified-title" style="margin-top:1rem; font-size:1rem; color:#475569;">${conCaract ? '2. ' : ''}Relación de Documentación Exigible</h4>
                <div style="overflow-x:auto;"><table style="width:100%; border-collapse: collapse; font-size:0.85rem; min-width: 600px; background: white;">
                    <thead><tr>
                        <th style="width:15%; border:1px solid var(--border); padding:0.4rem; background:#f1f5f9;">Fase</th>
                        <th style="width:45%; text-align:left; border:1px solid var(--border); padding:0.4rem; background:#f1f5f9;">Documento / Certificado</th>
                        <th style="width:20%; border:1px solid var(--border); padding:0.4rem; background:#f1f5f9;">Estado</th>
                        <th style="width:20%; border:1px solid var(--border); padding:0.4rem; background:#f1f5f9;">Fecha</th>
                    </tr></thead><tbody>`;
            docsDe(inst).forEach(doc => {
                if (!inst.checks[doc.id]) inst.checks[doc.id] = { label: doc.name, status: '', date: '' };
                const d = inst.checks[doc.id];
                if (d.status === undefined) d.status = '';
                if (d.date === undefined) d.date = '';
                let nameHtml = `<strong>${esc(doc.name)}</strong><br><span style="color:var(--text-muted); font-size:0.8rem;">${esc(doc.desc || '')}</span>`;
                if (doc.custom) {
                    const v = (d.label === doc.name || ETIQUETAS_GENERICAS.includes(d.label)) ? '' : d.label;
                    nameHtml = `<input type="text" class="${P}-label form-control" data-uid="${esc(inst.uid)}" data-docid="${esc(doc.id)}" placeholder="Otra documentación..." value="${esc(v)}" style="width:100%; padding:0.2rem; margin:0; font-size: 0.85rem; border:none; background:transparent; font-weight:600;">`;
                }
                const st = d.status;
                html += `<tr>
                    <td style="border:1px solid var(--border); padding:0.4rem; text-align:center; font-weight:bold; color:${colorFase(doc.phase)};">${esc(doc.phase)}</td>
                    <td style="border:1px solid var(--border); padding:0.4rem;">${nameHtml}</td>
                    <td style="border:1px solid var(--border); padding:0.4rem;">
                        <select class="${P}-status form-control" data-uid="${esc(inst.uid)}" data-docid="${esc(doc.id)}" style="width:100%; padding:0.2rem; margin:0;">
                            <option value="" ${st === '' ? 'selected' : ''}></option>
                            <option value="Entregado" ${ENTREGADO.includes(st) ? 'selected' : ''}>Entregado</option>
                            <option value="Pendiente" ${st === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="No procede" ${NO_PROCEDE.includes(st) ? 'selected' : ''}>No procede</option>
                        </select>
                    </td>
                    <td style="border:1px solid var(--border); padding:0.4rem;"><input type="date" class="${P}-date form-control" data-uid="${esc(inst.uid)}" data-docid="${esc(doc.id)}" value="${esc(d.date || '')}" style="width:100%; padding:0.2rem; margin:0;"></td>
                </tr>`;
            });
            return html + `</tbody></table></div>`;
        }

        function renderAll() {
            const wrapper = container.querySelector('#' + P + '-instances-container');
            if (!wrapper) return;
            wrapper.innerHTML = '';
            data.instances.forEach((inst, index) => {
                if (!inst.checks) inst.checks = {};
                const block = document.createElement('div');
                block.className = 'sr-suministro';
                block.style.border = '1px solid var(--border)'; block.style.borderRadius = '8px'; block.style.padding = '1rem'; block.style.marginBottom = '1.5rem'; block.style.background = '#f8fafc';

                let html = htmlCabecera(inst, index);
                if (cfg.tipos && !inst.tipo) {
                    html += `<p style="font-size:0.85rem; color:var(--text-muted); font-style:italic;">${esc(cfg.tipos.mensajeSinTipo || '')}</p>`;
                } else {
                    if (conCaract) html += htmlCaracteristicas(inst);
                    html += htmlDocumentos(inst);
                    html += `
                        <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
                            <div class="form-group" style="display:flex; border:1px solid var(--border); background:white;">
                                <div class="form-label" style="width:150px; background:#f1f5f9; padding:0.75rem; border-right:1px solid var(--border); font-weight:600; font-size:0.85rem;">Observaciones</div>
                                <textarea class="form-control ${P}-observaciones" data-idx="${index}" style="flex:1; border:none; padding:0.75rem; min-height:60px; resize:vertical; font-size:0.85rem;">${esc(inst.observaciones || '')}</textarea>
                            </div>
                        </div>`;
                }
                block.innerHTML = html;
                wrapper.appendChild(block);
            });

            const on = (sel, ev, fn) => wrapper.querySelectorAll(sel).forEach(el => el.addEventListener(ev, fn));
            on(`.${P}-name`, 'change', e => { data.instances[e.target.dataset.idx].customName = e.target.value; });
            (cfg.campos || []).forEach(c => on(`.${P}-${c.clase}`, 'change', e => { data.instances[e.target.dataset.idx][c.id] = e.target.value; }));
            on(`.${P}-dcor`, 'change', e => { data.instances[e.target.dataset.idx].dcor = e.target.value === 'true'; renderAll(); });
            on(`.${P}-tipo`, 'change', e => { data.instances[e.target.dataset.idx].tipo = e.target.value; renderAll(); });
            on(`.${P}-btn-remove`, 'click', e => {
                const idx = e.currentTarget.dataset.idx;
                confirmar(cfg.textoEliminar || '¿Eliminar esta tipología y su control documental?', () => { data.instances.splice(idx, 1); renderAll(); });
            });
            const car = (e) => { const i = buscar(e.target.dataset.uid); return i && i.caract ? i.caract[e.target.dataset.carid] : null; };
            const doc = (e) => { const i = buscar(e.target.dataset.uid); return i ? i.checks[e.target.dataset.docid] : null; };
            on(`.${P}-caract-label`, 'change', e => { const c = car(e); if (c) c.label = e.target.value; });
            on(`.${P}-caract-valor`, 'change', e => { const c = car(e); if (c) c.valor = e.target.value; });
            on(`.${P}-caract-verif`, 'change', e => { const c = car(e); if (c) c.verificado = e.target.checked; });
            on(`.${P}-status`, 'change', e => { const d = doc(e); if (d) d.status = e.target.value; });
            on(`.${P}-date`, 'change', e => { const d = doc(e); if (d) d.date = e.target.value; });
            on(`.${P}-label`, 'change', e => { const d = doc(e); if (d) d.label = e.target.value; });
            on(`.${P}-observaciones`, 'change', e => { data.instances[e.target.dataset.idx].observaciones = e.target.value; });
        }

        renderAll();
    }

    // Utilidades para la impresión generada a partir de los datos
    function documentosDe(cfg, inst) {
        const lista = typeof cfg.documentos === 'function' ? cfg.documentos(inst) : [...(cfg.documentos || [])];
        if (cfg.selectorDcor && inst.dcor) lista.splice(2, 0, DOC_DCOR);
        return lista;
    }
    function caracteristicasDe(cfg, inst) {
        if (!cfg.caracteristicas) return [];
        return typeof cfg.caracteristicas === 'function' ? cfg.caracteristicas(inst) : cfg.caracteristicas;
    }
    window.SuministrosRecepcion = { render, documentosDe, caracteristicasDe, ENTREGADO, NO_PROCEDE, ETIQUETAS_GENERICAS };
})();
