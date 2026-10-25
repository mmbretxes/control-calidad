window.renderRecepcionRellenosCalc = function(container, materialId) {
    const projectData = currentProject;
    if (!projectData.formData) projectData.formData = {};
    if (!projectData.formData[materialId]) projectData.formData[materialId] = { instances: [] };
    const data = projectData.formData[materialId];

    if (!data.instances) {
        data.instances = [];
    }

    const docsTierras = [
        { id: "doc_tierra_1", phase: "Pre-Suministro", name: "Certificado de idoneidad / Ensayos de caracterización en origen", desc: "Granulometría, Límites de Atterberg, Proctor, CBR, materia orgánica y sulfatos." },
        { id: "doc_tierra_2", phase: "Pre-Suministro", name: "Declaración de Prestaciones (DoP) y Marcado CE de áridos", desc: "Según UNE-EN 13242 para zahorras y áridos de cantera." },
        { id: "doc_tierra_prev_otro", phase: "Pre-Suministro", name: "Otros", desc: "", custom: true },
        { id: "doc_tierra_3", phase: "Durante Suministro", name: "Hojas de suministro / Albaranes de entrada en obra", desc: "Control de procedencia, cantera/préstamo y tonelaje o volumen entregado." },
        { id: "doc_tierra_4", phase: "Durante Suministro", name: "Inspección visual de las entregas y etiquetado CE", desc: "Ausencia de restos vegetales, terrones de arcilla, escombros o contaminación." },
        { id: "doc_tierra_dur_otro", phase: "Durante Suministro", name: "Otros", desc: "", custom: true },
        { id: "doc_tierra_5", phase: "Final Suministro", name: "Certificado final de suministro / Trazabilidad de lotes", desc: "Recopilación de albaranes y certificados del proveedor o cantera." },
        { id: "doc_tierra_fin_otro", phase: "Final Suministro", name: "Otros", desc: "", custom: true }
    ];

    const caractTierras = [
        { id: "tierra_clasif", name: "Clasificación del suelo / Huso granulométrico (PG-3 / UNE-EN 13242)" },
        { id: "tierra_dmax", name: "Tamaño máximo del árido (Dmáx) y contenido de finos" },
        { id: "tierra_plast", name: "Plasticidad (Límite Líquido LL e Índice de Plasticidad IP)" },
        { id: "tierra_cbr", name: "Capacidad portante (Índice CBR) y Densidad máx. Proctor" },
        { id: "tierra_quim", name: "Exención de materia orgánica, sales solubles y sulfatos" },
        { id: "tierra_otras", name: "Otra característica (especificar)", custom: true }
    ];

    const docsGeotextiles = [
        { id: "doc_geo_1", phase: "Pre-Suministro", name: "Declaración de Prestaciones (DoP) y Marcado CE", desc: "Marcado CE obligatorio (UNE-EN 13252 para geotextiles / UNE-EN 13967 para láminas)." },
        { id: "doc_geo_2", phase: "Pre-Suministro", name: "Fichas técnicas del fabricante", desc: "Características de geotextiles, láminas nodulares y tubos drenantes." },
        { id: "doc_geo_3", phase: "Pre-Suministro", name: "Distintivo de calidad voluntario", desc: "Acreditación voluntaria del producto si aplica." },
        { id: "doc_geo_prev_otro", phase: "Pre-Suministro", name: "Otros", desc: "", custom: true },
        { id: "doc_geo_4", phase: "Durante Suministro", name: "Hojas de suministro / Albaranes de entrega", desc: "Identificación en obra de las partidas y rollos suministrados." },
        { id: "doc_geo_5", phase: "Durante Suministro", name: "Verificación de Marcado CE en el etiquetado de los rollos", desc: "Comprobación visual del etiquetado sobre el embalaje del producto." },
        { id: "doc_geo_dur_otro", phase: "Durante Suministro", name: "Otros", desc: "", custom: true },
        { id: "doc_geo_6", phase: "Final Suministro", name: "Certificado final de suministro / Garantía", desc: "Acreditación final del fabricante o suministrador." },
        { id: "doc_geo_fin_otro", phase: "Final Suministro", name: "Otros", desc: "", custom: true }
    ];

    const caractGeotextiles = [
        { id: "geo_tipo", name: "Tipo de geosintético y polímero base (PP, PEAD, poliéster...)" },
        { id: "geo_gramaje", name: "Gramaje / Masa por unidad de superficie (g/m²)" },
        { id: "geo_traccion", name: "Resistencia a tracción y alargamiento (UNE-EN ISO 10319)" },
        { id: "geo_punzonamiento", name: "Resistencia al punzonamiento estático (CBR) / Perforación" },
        { id: "geo_permeabilidad", name: "Permeabilidad al agua y abertura de filtración (O90)" },
        { id: "geo_nodulos", name: "Lámina nodular: Altura de nódulos y resistencia a compresión (kN/m²)" },
        { id: "geo_otras", name: "Otra característica (especificar)", custom: true }
    ];

    // Impresión desde los datos
    if (window.registrarImpresionFicha) registrarImpresionFicha(materialId, (d, soloDatos, H) => {
        let html = '', n = 0, nDocs = 0, nOk = 0;
        (d.instances || []).forEach(inst => {
            const tierras = inst.tipo === 'Tierras, zahorras y áridos';
            const caracteristicas = [], docs = [];
            if (inst.tipo) {
                (tierras ? caractTierras : caractGeotextiles).forEach(car => {
                    const c = (inst.caract || {})[car.id] || {};
                    const label = car.custom ? (c.label && c.label !== car.name ? c.label : '') : car.name;
                    if (car.custom && !label && !c.valor && !c.verificado) return;
                    caracteristicas.push({ label, valor: c.valor || '', verificado: !!c.verificado });
                });
                Object.keys(inst.caract || {}).forEach(id => {
                    const c = inst.caract[id];
                    if (!id.startsWith('car_cust_') || !c || (c.subType && c.subType !== inst.tipo)) return;
                    caracteristicas.push({ label: c.label || '', valor: c.valor || '', verificado: !!c.verificado });
                });
                (tierras ? docsTierras : docsGeotextiles).forEach(doc => {
                    const c = (inst.checks || {})[doc.id] || {};
                    const label = doc.custom ? (c.label && c.label !== 'Otros' ? c.label : '') : doc.name;
                    if (doc.custom && !label && !c.status && !c.date) return;
                    docs.push({ fase: doc.phase, label, estado: H.estadoDoc(c.status), fecha: c.date || '' });
                });
            }
            const b = H.bloqueSuministro({ nombre: inst.customName || 'Suministro', meta: [['Tipo de material', inst.tipo], ['Ubicación / destino', inst.ubicacion], ['Procedencia', inst.procedencia]], caracteristicas, docs, obs: inst.observaciones }, soloDatos);
            if (!b) return;
            n++; nDocs += b.nDocs; nOk += b.nDocsOk; html += b.html;
        });
        if (d.observaciones) html += H.notasHtml([['Observaciones generales', d.observaciones]]);
        return { html, resumen: [H.plural(n, 'suministro', 'suministros'), nDocs ? `${nOk} de ${nDocs} documentos resueltos` : ''] };
    });

    container.innerHTML = `
        <div class="card" style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
                <h2 style="margin:0;">Control Documental de Recepción: Rellenos, Áridos y Geotextiles</h2>
                <button id="rrel-btn-add" class="btn btn-primary" style="font-size: 0.9rem;">+ Añadir suministro / material</button>
            </div>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">Añade cada material de aporte o drenaje recibido en obra y selecciona su categoría para cargar sus características y documentación exigible.</p>
            <div id="rrel-instances-container"></div>
        </div>
    `;

    const btnAdd = container.querySelector('#rrel-btn-add');
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            data.instances.push({
                uid: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 4),
                customName: `Suministro ${data.instances.length + 1}`,
                tipo: "",
                ubicacion: "",
                procedencia: "",
                caract: {},
                checks: {},
                observaciones: ""
            });
            renderAll();
        });
    }

    function renderAll() {
        const wrapper = container.querySelector('#rrel-instances-container');
        if (!wrapper) return;
        wrapper.innerHTML = '';

        data.instances.forEach((inst, index) => {
            if (!inst.caract) inst.caract = {};
            if (!inst.checks) inst.checks = {};
            if (inst.tipo === undefined) inst.tipo = "";

            const block = document.createElement('div');
            block.style.border = "1px solid var(--border)";
            block.style.borderRadius = "8px";
            block.style.padding = "1rem";
            block.style.marginBottom = "1.5rem";
            block.style.background = "#f8fafc";

            let html = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem;">
                    <div style="flex:1;">
                        <input type="text" class="unified-title rrel-name" data-idx="${index}" value="${escHtml(inst.customName || '')}" placeholder="Identificación del suministro (Ej. Zahorra ZA-20, Grava encachado, Geotextil 150 g/m²...)">
                    </div>
                    <button class="btn rrel-btn-remove" data-idx="${index}" style="margin-left:1rem; color: #dc2626; border: 1px solid #dc2626; background:transparent;">Eliminar</button>
                </div>
                <div class="dynamic-grid" style="margin-bottom: 1.5rem; gap: 1rem;">
                    <div>
                        <label class="form-label">Fase / Tipo de material</label>
                        <select class="form-control rrel-tipo" data-idx="${index}">
                            <option value="" ${inst.tipo === '' ? 'selected' : ''}>Seleccione tipo...</option>
                            <option value="Tierras, zahorras y áridos" ${inst.tipo === 'Tierras, zahorras y áridos' ? 'selected' : ''}>Tierras, zahorras y áridos</option>
                            <option value="Geotextiles y láminas" ${inst.tipo === 'Geotextiles y láminas' ? 'selected' : ''}>Geotextiles y láminas</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Ubicación / Destino en obra</label>
                        <input type="text" class="form-control rrel-ubicacion" data-idx="${index}" value="${escHtml(inst.ubicacion || '')}" placeholder="Ej. Bajo solera, Trasdós muros, Zanjas...">
                    </div>
                    <div>
                        <label class="form-label">Procedencia / Cantera / Fabricante</label>
                        <input type="text" class="form-control rrel-procedencia" data-idx="${index}" value="${escHtml(inst.procedencia || '')}" placeholder="Ej. Cantera autorizada, Fabricante...">
                    </div>
                </div>`;

            if (inst.tipo !== '') {
                const activeCaractList = inst.tipo === 'Tierras, zahorras y áridos' ? caractTierras : caractGeotextiles;
                const activeDocsList = inst.tipo === 'Tierras, zahorras y áridos' ? docsTierras : docsGeotextiles;

                // Inyectar características habituales guardadas en la base de datos activa para esta subcategoría
                const habCaract = (window.CustomControlsManager && typeof window.CustomControlsManager.getPoints === 'function')
                    ? window.CustomControlsManager.getPoints(materialId, inst.tipo)
                    : [];
                habCaract.forEach(hText => {
                    const cid = 'car_cust_' + window.CustomControlsManager.hashCode(hText);
                    if (!inst.caract[cid]) {
                        inst.caract[cid] = { label: hText, valor: "", verificado: false, isCustom: true, subType: inst.tipo };
                    }
                });

                html += `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem; margin-bottom:0.5rem; flex-wrap:wrap; gap:0.5rem;">
                    <h4 class="unified-title" style="margin:0; font-size:1rem; color:#475569;">1. Características Exigidas</h4>
                    <button type="button" class="btn rrel-btn-add-caract print-hidden" data-idx="${index}" style="font-size:0.8rem; padding:0.25rem 0.6rem; border:1px dashed var(--primary); background:transparent; color:var(--primary); font-weight:600; cursor:pointer; border-radius:4px;">+ Añadir característica</button>
                </div>
                <div style="overflow-x:auto; margin-bottom: 2rem;">
                    <table style="width:100%; border-collapse: collapse; font-size:0.85rem; background: white; min-width: 500px;">
                        <thead>
                            <tr>
                                <th style="border:1px solid var(--border); padding:0.4rem; background:#f1f5f9; text-align:left; width:45%;">Exigida</th>
                                <th style="border:1px solid var(--border); padding:0.4rem; background:#f1f5f9; text-align:left; width:35%;">Valor Proyecto</th>
                                <th style="border:1px solid var(--border); padding:0.4rem; background:#f1f5f9; text-align:center; width:20%;">Verificado</th>
                            </tr>
                        </thead>
                        <tbody>`;

                activeCaractList.forEach(car => {
                    if (!inst.caract[car.id]) inst.caract[car.id] = { label: car.name, valor: "", verificado: false };
                    let labelHtml = `<strong>${car.name}</strong>`;
                    if (car.custom) {
                        const valLabel = inst.caract[car.id].label === 'Otra característica (especificar)' ? '' : (inst.caract[car.id].label || '');
                        labelHtml = `<input type="text" class="rrel-caract-label form-control" data-uid="${inst.uid}" data-carid="${car.id}" value="${valLabel.replace(/"/g, '&quot;')}" placeholder="Otra característica (especificar)..." style="border:none; padding:0; font-size:0.85rem; background:transparent; font-weight:600; width:100%;">`;
                    }
                    html += `
                        <tr>
                            <td style="border:1px solid var(--border); padding:0.4rem;">${labelHtml}</td>
                            <td style="border:1px solid var(--border); padding:0.4rem;"><input type="text" class="rrel-caract-valor form-control" data-uid="${inst.uid}" data-carid="${car.id}" value="${(inst.caract[car.id].valor || '').replace(/"/g, '&quot;')}" style="width:100%; padding:0.2rem; margin:0; border:1px solid transparent;" placeholder="..."></td>
                            <td style="border:1px solid var(--border); padding:0.4rem; text-align:center;"><input type="checkbox" class="rrel-caract-verif" data-uid="${inst.uid}" data-carid="${car.id}" ${inst.caract[car.id].verificado ? 'checked' : ''} style="width:1.2rem; height:1.2rem; cursor:pointer;"></td>
                        </tr>
                    `;
                });

                // Renderizar características personalizadas añadidas por el usuario
                Object.keys(inst.caract).forEach(carId => {
                    if (!carId.startsWith('car_cust_')) return;
                    const carObj = inst.caract[carId];
                    if (!carObj || (carObj.subType && carObj.subType !== inst.tipo)) return;
                    const cLabel = carObj.label || "";
                    const isHab = window.CustomControlsManager && cLabel.trim() !== "" && window.CustomControlsManager.isHabitual(materialId, inst.tipo, cLabel.trim());

                    const habButtonsHtml = window.CustomControlsManager ? `
                        ${isHab
                            ? `<span class="badge cc-badge-habitual print-hidden" title="Guardada en tu base de datos activa" style="background:#e0e7ff; color:#3730a3; font-size:0.7rem; padding:0.2rem 0.45rem; border-radius:4px; white-space:nowrap; font-weight:600;">⭐ Habitual</span>`
                            : `<button type="button" class="btn rrel-btn-hab-caract print-hidden" data-idx="${index}" data-carid="${carId}" title="Guardar como habitual en la base de datos activa" style="font-size:0.75rem; padding:0.2rem 0.45rem; background:#f8fafc; border:1px solid #cbd5e1; border-radius:4px; cursor:pointer; white-space:nowrap; color:#475569; font-weight:600;">⭐ Guardar habitual</button>`
                        }
                        <button type="button" class="btn rrel-btn-del-caract print-hidden" data-idx="${index}" data-carid="${carId}" title="Eliminar característica" style="background:transparent; border:none; color:#ef4444; cursor:pointer; font-size:1rem; padding:0.15rem; line-height:1;">🗑️</button>
                    ` : '';

                    html += `
                        <tr>
                            <td style="border:1px solid var(--border); padding:0.4rem;">
                                <div style="display:flex; align-items:center; gap:0.4rem; width:100%;">
                                    <input type="text" class="rrel-caract-label form-control" data-uid="${inst.uid}" data-carid="${carId}" value="${cLabel.replace(/"/g, '&quot;')}" placeholder="Característica personalizada..." style="border:1px solid var(--border); border-radius:4px; padding:0.25rem 0.4rem; font-size:0.85rem; background:#fff; font-weight:600; flex:1;">
                                    ${habButtonsHtml}
                                </div>
                            </td>
                            <td style="border:1px solid var(--border); padding:0.4rem;"><input type="text" class="rrel-caract-valor form-control" data-uid="${inst.uid}" data-carid="${carId}" value="${(carObj.valor || '').replace(/"/g, '&quot;')}" style="width:100%; padding:0.2rem; margin:0; border:1px solid transparent;" placeholder="..."></td>
                            <td style="border:1px solid var(--border); padding:0.4rem; text-align:center;"><input type="checkbox" class="rrel-caract-verif" data-uid="${inst.uid}" data-carid="${carId}" ${carObj.verificado ? 'checked' : ''} style="width:1.2rem; height:1.2rem; cursor:pointer;"></td>
                        </tr>
                    `;
                });

                html += `</tbody></table></div>`;

                html += `<h4 class="unified-title" style="margin-top:1rem; font-size:1rem; color:#475569;">2. Relación de Documentación Exigible</h4>
                    <div style="overflow-x:auto;"><table style="width:100%; border-collapse: collapse; font-size:0.85rem; min-width: 600px; background: white;">
                        <thead><tr>
                            <th style="width:15%; border:1px solid var(--border); padding:0.4rem; background:#f1f5f9;">Fase</th>
                            <th style="width:45%; text-align:left; border:1px solid var(--border); padding:0.4rem; background:#f1f5f9;">Documento / Certificado</th>
                            <th style="width:20%; border:1px solid var(--border); padding:0.4rem; background:#f1f5f9;">Estado</th>
                            <th style="width:20%; border:1px solid var(--border); padding:0.4rem; background:#f1f5f9;">Fecha</th>
                        </tr></thead><tbody>`;

                activeDocsList.forEach(doc => {
                    if (!inst.checks[doc.id]) inst.checks[doc.id] = { label: doc.name, status: "", date: "" };
                    let phaseColor = doc.phase === "Pre-Suministro" ? "#b45309" : (doc.phase === "Durante Suministro" ? "#0f766e" : "#1d4ed8");
                    let nameHtml = `<strong>${doc.name}</strong>` + (doc.desc ? `<br><span style="color:var(--text-muted); font-size:0.8rem;">${doc.desc}</span>` : '');
                    if (doc.custom) {
                        const customVal = inst.checks[doc.id].label === 'Otros' ? '' : (inst.checks[doc.id].label || '');
                        nameHtml = `<input type="text" class="rrel-label form-control" data-uid="${inst.uid}" data-docid="${doc.id}" placeholder="Otra documentación..." value="${customVal.replace(/"/g, '&quot;')}" style="width:100%; padding:0.2rem; margin:0; font-size: 0.85rem; border:none; background:transparent; font-weight:600;">`;
                    }
                    html += `<tr>
                        <td style="border:1px solid var(--border); padding:0.4rem; text-align:center; font-weight:bold; color:${phaseColor};">${doc.phase}</td>
                        <td style="border:1px solid var(--border); padding:0.4rem;">${nameHtml}</td>
                        <td style="border:1px solid var(--border); padding:0.4rem;">
                            <select class="rrel-status form-control" data-uid="${inst.uid}" data-docid="${doc.id}" style="width:100%; padding:0.2rem; margin:0;">
                                <option value="" ${inst.checks[doc.id].status === '' ? 'selected' : ''}></option>
                                <option value="Entregado" ${['Entregado','Aceptado','Recibido'].includes(inst.checks[doc.id].status) ? 'selected' : ''}>Entregado</option>
                                <option value="Pendiente" ${inst.checks[doc.id].status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                                <option value="No procede" ${['No procede','No Entregado','No aplica'].includes(inst.checks[doc.id].status) ? 'selected' : ''}>No procede</option>
                            </select>
                        </td>
                        <td style="border:1px solid var(--border); padding:0.4rem;"><input type="date" class="rrel-date form-control" data-uid="${inst.uid}" data-docid="${doc.id}" value="${escHtml(inst.checks[doc.id].date || '')}" style="width:100%; padding:0.2rem; margin:0;"></td>
                    </tr>`;
                });

                html += `</tbody></table></div>
                    <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
                        <div class="form-group" style="display:flex; border:1px solid var(--border); background:white;">
                            <div class="form-label" style="width:150px; background:#f1f5f9; padding:0.75rem; border-right:1px solid var(--border); font-weight:600; font-size:0.85rem;">Observaciones</div>
                            <textarea class="form-control rrel-observaciones" data-idx="${index}" style="flex:1; border:none; padding:0.75rem; min-height:60px; resize:vertical; font-size:0.85rem;">${escHtml(inst.observaciones || '')}</textarea>
                        </div>
                    </div>`;
            } else {
                html += `<p style="font-size:0.85rem; color:var(--text-muted); font-style:italic;">Selecciona el tipo de material (Tierras, zahorras y áridos / Geotextiles y láminas) para cargar las características y documentación exigible.</p>`;
            }

            block.innerHTML = html;
            wrapper.appendChild(block);
        });

        wrapper.querySelectorAll('.rrel-name').forEach(el => el.addEventListener('change', e => { data.instances[e.target.dataset.idx].customName = e.target.value; }));
        wrapper.querySelectorAll('.rrel-tipo').forEach(el => el.addEventListener('change', e => {
            data.instances[e.target.dataset.idx].tipo = e.target.value;
            renderAll();
        }));
        wrapper.querySelectorAll('.rrel-ubicacion').forEach(el => el.addEventListener('change', e => { data.instances[e.target.dataset.idx].ubicacion = e.target.value; }));
        wrapper.querySelectorAll('.rrel-procedencia').forEach(el => el.addEventListener('change', e => { data.instances[e.target.dataset.idx].procedencia = e.target.value; }));
        wrapper.querySelectorAll('.rrel-btn-remove').forEach(el => el.addEventListener('click', e => {
            if (window.appConfirm) {
                window.appConfirm("¿Eliminar este suministro y su control documental?", () => {
                    data.instances.splice(e.target.dataset.idx, 1);
                    renderAll();
                });
            } else if (confirm("¿Eliminar este suministro y su control documental?")) {
                data.instances.splice(e.target.dataset.idx, 1);
                renderAll();
            }
        }));

        wrapper.querySelectorAll('.rrel-btn-add-caract').forEach(btn => {
            btn.addEventListener('click', e => {
                const idx = e.currentTarget.dataset.idx;
                const inst = data.instances[idx];
                if (!inst) return;
                if (!inst.caract) inst.caract = {};
                const newCarId = 'car_cust_' + Date.now();
                inst.caract[newCarId] = { label: "", valor: "", verificado: false, isCustom: true, subType: inst.tipo };
                renderAll();
            });
        });

        wrapper.querySelectorAll('.rrel-btn-hab-caract').forEach(btn => {
            btn.addEventListener('click', async e => {
                const idx = e.currentTarget.dataset.idx;
                const carId = e.currentTarget.dataset.carid;
                const inst = data.instances[idx];
                if (!inst || !inst.caract[carId]) return;
                const text = (inst.caract[carId].label || '').trim();
                if (!text) {
                    alert('Escribe primero el nombre de la característica antes de guardarla como habitual.');
                    return;
                }
                await window.CustomControlsManager.addHabitual(materialId, inst.tipo || '', text);
                renderAll();
            });
        });

        wrapper.querySelectorAll('.rrel-btn-del-caract').forEach(btn => {
            btn.addEventListener('click', e => {
                const idx = e.currentTarget.dataset.idx;
                const carId = e.currentTarget.dataset.carid;
                const inst = data.instances[idx];
                if (!inst || !inst.caract[carId]) return;
                const text = (inst.caract[carId].label || '').trim();
                if (window.CustomControlsManager) {
                    window.CustomControlsManager.promptDeletePoint(materialId, inst.tipo || '', text, () => {
                        delete inst.caract[carId];
                        renderAll();
                    });
                } else if (confirm('¿Eliminar esta característica?')) {
                    delete inst.caract[carId];
                    renderAll();
                }
            });
        });

        wrapper.querySelectorAll('.rrel-caract-label').forEach(el => el.addEventListener('change', e => {
            const inst = data.instances.find(i => i.uid === e.target.dataset.uid);
            if (inst && inst.caract[e.target.dataset.carid]) {
                inst.caract[e.target.dataset.carid].label = e.target.value;
            }
        }));
        wrapper.querySelectorAll('.rrel-caract-valor').forEach(el => el.addEventListener('change', e => {
            const inst = data.instances.find(i => i.uid === e.target.dataset.uid);
            if (inst && inst.caract[e.target.dataset.carid]) {
                inst.caract[e.target.dataset.carid].valor = e.target.value;
            }
        }));
        wrapper.querySelectorAll('.rrel-caract-verif').forEach(el => el.addEventListener('change', e => {
            const inst = data.instances.find(i => i.uid === e.target.dataset.uid);
            if (inst && inst.caract[e.target.dataset.carid]) {
                inst.caract[e.target.dataset.carid].verificado = e.target.checked;
            }
        }));

        wrapper.querySelectorAll('.rrel-status').forEach(el => el.addEventListener('change', e => {
            const inst = data.instances.find(i => i.uid === e.target.dataset.uid);
            if (inst && inst.checks[e.target.dataset.docid]) {
                inst.checks[e.target.dataset.docid].status = e.target.value;
            }
        }));
        wrapper.querySelectorAll('.rrel-date').forEach(el => el.addEventListener('change', e => {
            const inst = data.instances.find(i => i.uid === e.target.dataset.uid);
            if (inst && inst.checks[e.target.dataset.docid]) {
                inst.checks[e.target.dataset.docid].date = e.target.value;
            }
        }));
        wrapper.querySelectorAll('.rrel-label').forEach(el => el.addEventListener('change', e => {
            const inst = data.instances.find(i => i.uid === e.target.dataset.uid);
            if (inst && inst.checks[e.target.dataset.docid]) {
                inst.checks[e.target.dataset.docid].label = e.target.value;
            }
        }));
        wrapper.querySelectorAll('.rrel-observaciones').forEach(el => el.addEventListener('change', e => {
            data.instances[e.target.dataset.idx].observaciones = e.target.value;
        }));
    }

    renderAll();
};
