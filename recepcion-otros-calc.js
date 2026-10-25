window.renderRecepcionOtrosCalc = function(container, materialId) {
    const projectData = currentProject;
    if (!projectData.formData) projectData.formData = {};
    if (!projectData.formData[materialId]) projectData.formData[materialId] = { instances: [] };
    const data = projectData.formData[materialId];

    if (!data.instances) {
        data.instances = [];
    }

    const baseDocs = [
        { id: "doc_otros_1", phase: "Pre-Suministro", name: "Declaración de prestaciones / Marcado CE", desc: "Según normativa aplicable al producto o equipo." },
        { id: "doc_otros_2", phase: "Pre-Suministro", name: "Ficha técnica / Distintivo de calidad", desc: "Especificaciones técnicas del fabricante." },
        { id: "doc_otros_prev_otro", phase: "Pre-Suministro", name: "Otros", desc: "", custom: true },
        { id: "doc_otros_3", phase: "Durante Suministro", name: "Hoja de suministro / Albarán", desc: "Trazabilidad de cada entrega en obra." },
        { id: "doc_otros_4", phase: "Durante Suministro", name: "Verificación de marcado CE y etiquetado", desc: "Comprobación visual de los suministros." },
        { id: "doc_otros_dur_otro", phase: "Durante Suministro", name: "Otros", desc: "", custom: true },
        { id: "doc_otros_5", phase: "Final Suministro", name: "Certificado final de suministro / Garantía", desc: "Acreditación final del fabricante o suministrador." },
        { id: "doc_otros_fin_otro", phase: "Final Suministro", name: "Otros", desc: "", custom: true }
    ];

    // Impresión desde los datos
    if (window.registrarImpresionFicha) registrarImpresionFicha(materialId, (d, soloDatos, H) => {
        let html = '', n = 0, nDocs = 0, nOk = 0;
        (d.instances || []).forEach(inst => {
            const caracteristicas = Object.keys(inst.caract || {}).map(id => inst.caract[id] || {})
                .filter(c => c.label || c.valor || c.verificado)
                .map(c => ({ label: c.label || '', valor: c.valor || '', verificado: !!c.verificado }));
            const docs = [];
            baseDocs.forEach(doc => {
                const c = (inst.checks || {})[doc.id] || {};
                const label = doc.custom ? (c.label && c.label !== 'Otros' ? c.label : '') : doc.name;
                if (doc.custom && !label && !c.status && !c.date) return;
                docs.push({ fase: doc.phase, label, estado: H.estadoDoc(c.status), fecha: c.date || '' });
            });
            const b = H.bloqueSuministro({ nombre: inst.customName || 'Suministro', meta: [['Ubicación / destino', inst.ubicacion]], caracteristicas, docs, obs: inst.observaciones }, soloDatos);
            if (!b) return;
            n++; nDocs += b.nDocs; nOk += b.nDocsOk; html += b.html;
        });
        if (d.observaciones) html += H.notasHtml([['Observaciones generales', d.observaciones]]);
        return { html, resumen: [H.plural(n, 'suministro', 'suministros'), nDocs ? `${nOk} de ${nDocs} documentos resueltos` : ''] };
    });

    container.innerHTML = `
        <div class="card" style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
                <h2 style="margin:0;">Control Documental de Recepción: Otros</h2>
                <button id="rotros-btn-add" class="btn btn-primary" style="font-size: 0.9rem;">+ Añadir tipología / suministro</button>
            </div>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">Añade productos, equipos o sistemas no incluidos en otros capítulos. Puedes personalizar sus características exigidas y documentación y guardarlas con ⭐ en tu base de datos particular.</p>
            <div id="rotros-instances-container"></div>
        </div>
    `;

    function createNewInstance(idxNum) {
        const inst = {
            uid: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 4),
            customName: `Suministro / Material ${idxNum}`,
            ubicacion: "",
            caract: {},
            checks: {},
            observaciones: ""
        };

        // Cargar características habituales guardadas en la base de datos activa
        const habCaract = (window.CustomControlsManager && typeof window.CustomControlsManager.getPoints === 'function')
            ? window.CustomControlsManager.getPoints(materialId, '')
            : [];

        if (habCaract.length > 0) {
            habCaract.forEach((hText, i) => {
                const cid = 'car_cust_' + (window.CustomControlsManager ? window.CustomControlsManager.hashCode(hText) : i);
                inst.caract[cid] = { label: hText, valor: "", verificado: false, isCustom: true };
            });
        } else {
            // Crear una primera fila en blanco lista para rellenar
            const cid = 'car_cust_' + Date.now();
            inst.caract[cid] = { label: "", valor: "", verificado: false, isCustom: true };
        }

        return inst;
    }

    const btnAdd = container.querySelector('#rotros-btn-add');
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            data.instances.push(createNewInstance(data.instances.length + 1));
            renderAll();
        });
    }

    function renderAll() {
        const wrapper = container.querySelector('#rotros-instances-container');
        if (!wrapper) return;
        wrapper.innerHTML = '';

        data.instances.forEach((inst, index) => {
            if (!inst.caract) inst.caract = {};
            if (!inst.checks) inst.checks = {};

            // Inyectar si hay características habituales y la instancia es nueva o vacía
            if (Object.keys(inst.caract).length === 0) {
                const cid = 'car_cust_' + Date.now();
                inst.caract[cid] = { label: "", valor: "", verificado: false, isCustom: true };
            }

            const block = document.createElement('div');
            block.style.border = "1px solid var(--border)";
            block.style.borderRadius = "8px";
            block.style.padding = "1rem";
            block.style.marginBottom = "1.5rem";
            block.style.background = "#f8fafc";

            let html = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem;">
                    <div style="flex:1;">
                        <input type="text" class="unified-title rotros-name" data-idx="${index}" value="${escHtml(inst.customName || '')}" placeholder="Identificación del producto / equipo (Ej. Puerta cortafuegos, Lucernario, Geotextil...)">
                    </div>
                    <button class="btn rotros-btn-remove" data-idx="${index}" style="margin-left:1rem; color: #dc2626; border: 1px solid #dc2626; background:transparent;">Eliminar</button>
                </div>
                <div class="dynamic-grid" style="margin-bottom: 1.5rem; gap: 1rem;">
                    <div><label class="form-label">Ubicación / Destino en obra</label><input type="text" class="form-control rotros-ubicacion" data-idx="${index}" value="${escHtml(inst.ubicacion || '')}" placeholder="Ej. Sótano -1, Cubierta, Zonas comunes..."></div>
                </div>
                
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem; margin-bottom:0.5rem; flex-wrap:wrap; gap:0.5rem;">
                    <h4 class="unified-title" style="margin:0; font-size:1rem; color:#475569;">1. Características Exigidas</h4>
                    <button type="button" class="btn rotros-btn-add-caract print-hidden" data-idx="${index}" style="font-size:0.8rem; padding:0.25rem 0.6rem; border:1px dashed var(--primary); background:transparent; color:var(--primary); font-weight:600; cursor:pointer; border-radius:4px;">+ Añadir característica</button>
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

            Object.keys(inst.caract).forEach(carId => {
                const carObj = inst.caract[carId] || { label: "", valor: "", verificado: false };
                const cLabel = carObj.label || "";
                const isHab = window.CustomControlsManager && cLabel.trim() !== "" && window.CustomControlsManager.isHabitual(materialId, '', cLabel.trim());

                const habButtonsHtml = window.CustomControlsManager ? `
                    ${isHab
                        ? `<span class="badge cc-badge-habitual print-hidden" title="Característica guardada en tu base de datos activa" style="background:#e0e7ff; color:#3730a3; font-size:0.7rem; padding:0.2rem 0.45rem; border-radius:4px; white-space:nowrap; font-weight:600;">⭐ Habitual</span>`
                        : `<button type="button" class="btn rotros-btn-hab-caract print-hidden" data-idx="${index}" data-carid="${carId}" title="Guardar como característica habitual en la base de datos activa" style="font-size:0.75rem; padding:0.2rem 0.45rem; background:#f8fafc; border:1px solid #cbd5e1; border-radius:4px; cursor:pointer; white-space:nowrap; color:#475569; font-weight:600;">⭐ Guardar habitual</button>`
                    }
                    <button type="button" class="btn rotros-btn-del-caract print-hidden" data-idx="${index}" data-carid="${carId}" title="Eliminar característica" style="background:transparent; border:none; color:#ef4444; cursor:pointer; font-size:1rem; padding:0.15rem; line-height:1;">🗑️</button>
                ` : '';

                html += `
                    <tr>
                        <td style="border:1px solid var(--border); padding:0.4rem;">
                            <div style="display:flex; align-items:center; gap:0.4rem; width:100%;">
                                <input type="text" class="rotros-caract-label form-control" data-uid="${inst.uid}" data-carid="${carId}" value="${cLabel.replace(/"/g, '&quot;')}" placeholder="Característica exigida (especificar)..." style="border:1px solid var(--border); border-radius:4px; padding:0.25rem 0.4rem; font-size:0.85rem; background:#fff; font-weight:600; flex:1;">
                                ${habButtonsHtml}
                            </div>
                        </td>
                        <td style="border:1px solid var(--border); padding:0.4rem;">
                            <input type="text" class="rotros-caract-valor form-control" data-uid="${inst.uid}" data-carid="${carId}" value="${(carObj.valor || '').replace(/"/g, '&quot;')}" style="width:100%; padding:0.2rem; margin:0; border:1px solid transparent;" placeholder="Valor / Prestación...">
                        </td>
                        <td style="border:1px solid var(--border); padding:0.4rem; text-align:center;">
                            <input type="checkbox" class="rotros-caract-verif" data-uid="${inst.uid}" data-carid="${carId}" ${carObj.verificado ? 'checked' : ''} style="width:1.2rem; height:1.2rem; cursor:pointer;">
                        </td>
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

            baseDocs.forEach((doc) => {
                if (!inst.checks[doc.id]) inst.checks[doc.id] = { label: doc.name, status: "", date: "" };
                let phaseColor = doc.phase === "Pre-Suministro" ? "#b45309" : (doc.phase === "Durante Suministro" ? "#0f766e" : "#1d4ed8");
                let nameHtml = `<strong>${doc.name}</strong>` + (doc.desc ? `<br><span style="color:var(--text-muted); font-size:0.8rem;">${doc.desc}</span>` : '');
                if (doc.custom) {
                    nameHtml = `<input type="text" class="rotros-label form-control" data-uid="${inst.uid}" data-docid="${doc.id}" placeholder="Otra documentación..." value="${escHtml(inst.checks[doc.id].label === 'Otros' ? '' : (inst.checks[doc.id].label || ''))}" style="width:100%; padding:0.2rem; margin:0; font-size: 0.85rem; border:none; background:transparent; font-weight:600;">`;
                }
                html += `<tr>
                    <td style="border:1px solid var(--border); padding:0.4rem; text-align:center; font-weight:bold; color:${phaseColor};">${doc.phase}</td>
                    <td style="border:1px solid var(--border); padding:0.4rem;">${nameHtml}</td>
                    <td style="border:1px solid var(--border); padding:0.4rem;">
                        <select class="rotros-status form-control" data-uid="${inst.uid}" data-docid="${doc.id}" style="width:100%; padding:0.2rem; margin:0;">
                            <option value="" ${inst.checks[doc.id].status === '' ? 'selected' : ''}></option>
                            <option value="Entregado" ${['Entregado','Aceptado','Recibido'].includes(inst.checks[doc.id].status) ? 'selected' : ''}>Entregado</option>
                            <option value="Pendiente" ${inst.checks[doc.id].status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="No procede" ${['No procede','No Entregado','No aplica'].includes(inst.checks[doc.id].status) ? 'selected' : ''}>No procede</option>
                        </select>
                    </td>
                    <td style="border:1px solid var(--border); padding:0.4rem;"><input type="date" class="rotros-date form-control" data-uid="${inst.uid}" data-docid="${doc.id}" value="${escHtml(inst.checks[doc.id].date || '')}" style="width:100%; padding:0.2rem; margin:0;"></td>
                </tr>`;
            });

            html += `</tbody></table></div>
                <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
                    <div class="form-group" style="display:flex; border:1px solid var(--border); background:white;">
                        <div class="form-label" style="width:150px; background:#f1f5f9; padding:0.75rem; border-right:1px solid var(--border); font-weight:600; font-size:0.85rem;">Observaciones</div>
                        <textarea class="form-control rotros-observaciones" data-idx="${index}" style="flex:1; border:none; padding:0.75rem; min-height:60px; resize:vertical; font-size:0.85rem;">${escHtml(inst.observaciones || '')}</textarea>
                    </div>
                </div>`;

            block.innerHTML = html;
            wrapper.appendChild(block);
        });

        wrapper.querySelectorAll('.rotros-name').forEach(el => el.addEventListener('change', e => { data.instances[e.target.dataset.idx].customName = e.target.value; }));
        wrapper.querySelectorAll('.rotros-ubicacion').forEach(el => el.addEventListener('change', e => { data.instances[e.target.dataset.idx].ubicacion = e.target.value; }));
        wrapper.querySelectorAll('.rotros-btn-remove').forEach(el => el.addEventListener('click', e => {
            if (window.appConfirm) {
                window.appConfirm("¿Eliminar esta tipología y su control documental?", () => {
                    data.instances.splice(e.target.dataset.idx, 1);
                    renderAll();
                });
            } else if (confirm("¿Eliminar esta tipología y su control documental?")) {
                data.instances.splice(e.target.dataset.idx, 1);
                renderAll();
            }
        }));

        wrapper.querySelectorAll('.rotros-btn-add-caract').forEach(btn => {
            btn.addEventListener('click', e => {
                const idx = e.currentTarget.dataset.idx;
                const inst = data.instances[idx];
                if (!inst) return;
                if (!inst.caract) inst.caract = {};
                const newCarId = 'car_cust_' + Date.now();
                inst.caract[newCarId] = { label: "", valor: "", verificado: false, isCustom: true };
                renderAll();
            });
        });

        wrapper.querySelectorAll('.rotros-btn-hab-caract').forEach(btn => {
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
                await window.CustomControlsManager.addHabitual(materialId, '', text);
                renderAll();
            });
        });

        wrapper.querySelectorAll('.rotros-btn-del-caract').forEach(btn => {
            btn.addEventListener('click', e => {
                const idx = e.currentTarget.dataset.idx;
                const carId = e.currentTarget.dataset.carid;
                const inst = data.instances[idx];
                if (!inst || !inst.caract[carId]) return;
                const text = (inst.caract[carId].label || '').trim();
                if (window.CustomControlsManager) {
                    window.CustomControlsManager.promptDeletePoint(materialId, '', text, () => {
                        delete inst.caract[carId];
                        renderAll();
                    });
                } else if (confirm('¿Eliminar esta característica?')) {
                    delete inst.caract[carId];
                    renderAll();
                }
            });
        });

        wrapper.querySelectorAll('.rotros-caract-label').forEach(el => el.addEventListener('change', e => {
            const inst = data.instances.find(i => i.uid === e.target.dataset.uid);
            if (inst && inst.caract[e.target.dataset.carid]) {
                inst.caract[e.target.dataset.carid].label = e.target.value;
            }
        }));
        wrapper.querySelectorAll('.rotros-caract-valor').forEach(el => el.addEventListener('change', e => {
            const inst = data.instances.find(i => i.uid === e.target.dataset.uid);
            if (inst && inst.caract[e.target.dataset.carid]) {
                inst.caract[e.target.dataset.carid].valor = e.target.value;
            }
        }));
        wrapper.querySelectorAll('.rotros-caract-verif').forEach(el => el.addEventListener('change', e => {
            const inst = data.instances.find(i => i.uid === e.target.dataset.uid);
            if (inst && inst.caract[e.target.dataset.carid]) {
                inst.caract[e.target.dataset.carid].verificado = e.target.checked;
            }
        }));

        wrapper.querySelectorAll('.rotros-status').forEach(el => el.addEventListener('change', e => {
            const inst = data.instances.find(i => i.uid === e.target.dataset.uid);
            if (inst && inst.checks[e.target.dataset.docid]) {
                inst.checks[e.target.dataset.docid].status = e.target.value;
            }
        }));
        wrapper.querySelectorAll('.rotros-date').forEach(el => el.addEventListener('change', e => {
            const inst = data.instances.find(i => i.uid === e.target.dataset.uid);
            if (inst && inst.checks[e.target.dataset.docid]) {
                inst.checks[e.target.dataset.docid].date = e.target.value;
            }
        }));
        wrapper.querySelectorAll('.rotros-label').forEach(el => el.addEventListener('change', e => {
            const inst = data.instances.find(i => i.uid === e.target.dataset.uid);
            if (inst && inst.checks[e.target.dataset.docid]) {
                inst.checks[e.target.dataset.docid].label = e.target.value;
            }
        }));
        wrapper.querySelectorAll('.rotros-observaciones').forEach(el => el.addEventListener('change', e => {
            data.instances[e.target.dataset.idx].observaciones = e.target.value;
        }));
    }

    renderAll();
};
