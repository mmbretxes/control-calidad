window.renderRecepcionFerrallaCalc = function(container, materialId) {
    const projectData = currentProject;
    if (!projectData.formData) projectData.formData = {};
    if (!projectData.formData[materialId]) {
        projectData.formData[materialId] = {
            instances: []
        };
    }
    
    const data = projectData.formData[materialId];

    // Migration for backward compatibility
    if (!data.instances) {
        data.instances = [{
            uid: Date.now().toString(),
            customName: data.identificacion || "Ferralla 1",
            ubicacion: data.ubicacion || "",
            dcor: data.activeTab === 'dcor',
            checks: data.checks || {},
            observaciones: data.observaciones || ""
        }];
        delete data.identificacion;
        delete data.ubicacion;
        delete data.activeTab;
        delete data.checks;
        delete data.ensayos;
        delete data.observaciones;
    }

    const database = {
        dcorTrue: [
            { id: "dc1", phase: "Pre-Suministro", name: "Certificado del Distintivo de Calidad (DCOR)", desc: "Acreditación vigente de la marca de calidad (ej. AENOR) de la instalación elaboradora." },
            { id: "dc2", phase: "Pre-Suministro", name: "Certificado de Adherencia del Acero", desc: "Ensayo oficial que garantiza la geometría de las corrugas y la adherencia del acero empleado." },
            { id: "dc3", phase: "Pre-Suministro", name: "Programa de Fabricación del Elaborador", desc: "Documento del taller que planifica los despieces y lotes de suministro previstos." },
            { id: "dc4", phase: "Pre-Suministro", name: "Soldadura resistente: Homologacion soldadores", desc: "Certificado que acredita la cualificación del personal para uniones soldadas resistentes." },
            { id: "dc5", phase: "Pre-Suministro", name: "Soldadura resistente: Procedimiento soldadura", desc: "Especificación del procedimiento de soldeo (WPS) cualificado aplicable en obra/taller." },
            { id: "dc6", phase: "Pre-Suministro", name: "Soldadura resistente: Ensayos soldadura", desc: "Resultados de los ensayos mecánicos previos sobre probetas soldadas de prueba." },
            { id: "dc7", phase: "Pre-Suministro", name: "Otros", desc: "", custom: true },
            { id: "dc8", phase: "Durante Suministro", name: "Hoja de suministro/Albarán (con sello DCOR)", desc: "Debe identificar la clase de acero, dimensiones, posiciones de despiece y lucir el sello DCOR." },
            { id: "dc9", phase: "Durante Suministro", name: "Otros", desc: "", custom: true },
            { id: "dc10", phase: "Final Suministro", name: "Certificado de Suministro con Sello DCOR", desc: "Garantía global emitida al finalizar la obra que ampara toda la ferralla suministrada." },
            { id: "dc11", phase: "Final Suministro", name: "Otros", desc: "", custom: true }
        ],
        dcorFalse: [
            { id: "nd1", phase: "Pre-Suministro", name: "Declaración Responsable del Suministrador", desc: "Documento firmado donde el taller asume el cumplimiento íntegro del Código Estructural." },
            { id: "nd2", phase: "Pre-Suministro", name: "Documentación del Acero de Origen", desc: "Certificados de calidad o marcado CE de las bobinas/barras de acero base originales." },
            { id: "nd3", phase: "Pre-Suministro", name: "Certificado de Adherencia del Acero", desc: "Ensayo oficial que garantiza la geometría de las corrugas y la adherencia del acero empleado." },
            { id: "nd4", phase: "Pre-Suministro", name: "Soldadura resistente: Homologacion soldadores", desc: "Certificado que acredita la cualificación del personal para uniones soldadas resistentes." },
            { id: "nd5", phase: "Pre-Suministro", name: "Soldadura resistente: Procedimiento soldadura", desc: "Especificación del procedimiento de soldeo (WPS) cualificado aplicable." },
            { id: "nd6", phase: "Pre-Suministro", name: "Soldadura resistente: Ensayos soldadura", desc: "Resultados de los ensayos mecánicos previos sobre probetas soldadas de prueba." },
            { id: "nd7", phase: "Pre-Suministro", name: "Otros", desc: "", custom: true },
            { id: "nd8", phase: "Durante Suministro", name: "Hoja de suministro/Albarán", desc: "Identificación de los elementos, diámetros, clase de acero y trazabilidad de las coladas." },
            { id: "nd9", phase: "Durante Suministro", name: "Certificación de Ensayo de cada Colada/Lote", desc: "Obligatorio aportar los certificados de ensayo mecánicos por cada colada recibida al no tener DCOR." },
            { id: "nd10", phase: "Durante Suministro", name: "Otros", desc: "", custom: true },
            { id: "nd11", phase: "Final Suministro", name: "Certificado de Suministro", desc: "Documento final detallando las cantidades totales servidas y amparando la trazabilidad." },
            { id: "nd12", phase: "Final Suministro", name: "Otros", desc: "", custom: true }
        ]
    };

    // Impresión desde los datos
    if (window.registrarImpresionFicha) registrarImpresionFicha(materialId, (d, soloDatos, H) => {
        let html = '', n = 0, nDocs = 0, nOk = 0;
        (d.instances || []).forEach(inst => {
            const docs = database[inst.dcor ? 'dcorTrue' : 'dcorFalse'].map(doc => {
                const c = (inst.checks || {})[doc.id] || {};
                const label = doc.custom ? ((c.label && c.label !== 'Otros') ? c.label : '') : doc.name;
                return { fase: doc.phase, label, estado: c.status || '', fecha: c.date || '', custom: doc.custom };
            }).filter(x => !(x.custom && !x.label && !x.estado && !x.fecha));
            const b = H.bloqueSuministro({ nombre: inst.customName || 'Suministro de ferralla', meta: [['Ubicación', inst.ubicacion], ['Distintivo de calidad', inst.dcor ? 'Con distintivo DCOR' : 'Sin distintivo']], docs, obs: inst.observaciones }, soloDatos);
            if (!b) return;
            n++; nDocs += b.nDocs; nOk += b.nDocsOk; html += b.html;
        });
        return { html, resumen: [H.plural(n, 'suministro', 'suministros'), nDocs ? `${nOk} de ${nDocs} documentos resueltos` : ''] };
    });

    container.innerHTML = `
        <div class="card" style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem;">
                <h2>Control Documental de Recepción de Acero y Ferralla</h2>
                <button id="rfer-btn-add" class="btn btn-primary" style="font-size: 0.9rem;">+ Añadir nuevo suministro</button>
            </div>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">Configura cada suministro de acero o ferralla a la obra para generar sus requisitos documentales (Código Estructural).</p>
            
            <div id="rfer-instances-container"></div>
        </div>
    `;

    const btnAdd = container.querySelector('#rfer-btn-add');
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            data.instances.push({
                uid: Date.now().toString(),
                customName: `Suministro de Ferralla ${data.instances.length + 1}`,
                ubicacion: "",
                dcor: false,
                checks: {},
                observaciones: ""
            });
            renderAll();
        });
    }

    function renderAll() {
        const wrapper = container.querySelector('#rfer-instances-container');
        if (!wrapper) return;
        wrapper.innerHTML = '';

        data.instances.forEach((inst, index) => {
            const block = document.createElement('div');
            block.style.border = "1px solid var(--border)";
            block.style.borderRadius = "8px";
            block.style.padding = "1rem";
            block.style.marginBottom = "1.5rem";
            block.style.background = "#f8fafc";

            let html = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem;">
                    <div style="flex:1;">
                        <input type="text" class="unified-title rfer-name" data-idx="${index}" value="${escHtml(inst.customName)}" placeholder="Identificación producto (Ej. Acero Celsa)">
                    </div>
                    <button class="btn rfer-btn-remove" data-idx="${index}" style="margin-left:1rem; color: #dc2626; border: 1px solid #dc2626; background:transparent;">Eliminar</button>
                </div>
                
                <div class="dynamic-grid" style="margin-bottom: 1.5rem; gap: 1rem;">
                    <div>
                        <label class="form-label">Ubicación</label>
                        <input type="text" class="form-control rfer-ubicacion" data-idx="${index}" value="${escHtml(inst.ubicacion || '')}" placeholder="Ej. Toda la obra">
                    </div>
                    <div>
                        <label class="form-label">Distintivo de Calidad (DCOR)</label>
                        <select class="form-control rfer-dcor" data-idx="${index}">
                            <option value="true" ${inst.dcor ? 'selected' : ''}>Con Distintivo DCOR</option>
                            <option value="false" ${!inst.dcor ? 'selected' : ''}>Sin Distintivo</option>
                        </select>
                    </div>
                </div>
            `;

            const key = inst.dcor ? 'dcorTrue' : 'dcorFalse';
            let requiredDocs = database[key];

            html += `<h4 class="unified-title" style="margin-top:1rem; font-size:1rem;">Relación de Documentación Exigible</h4>`;
            html += `<div style="overflow-x:auto;"><table style="width:100%; border-collapse: collapse; font-size:0.85rem; min-width: 600px; background: white;">
                <thead><tr>
                    <th style="width:15%; border:1px solid var(--border); padding:0.4rem; background:#f1f5f9;">Fase</th>
                    <th style="width:45%; text-align:left; border:1px solid var(--border); padding:0.4rem; background:#f1f5f9;">Documento / Certificado</th>
                    <th style="width:20%; border:1px solid var(--border); padding:0.4rem; background:#f1f5f9;">Estado</th>
                    <th style="width:20%; border:1px solid var(--border); padding:0.4rem; background:#f1f5f9;">Fecha</th>
                </tr></thead><tbody>`;

            requiredDocs.forEach((doc) => {
                if(!inst.checks[doc.id]) inst.checks[doc.id] = { label: doc.name, status: "", date: "" };
                if (inst.checks[doc.id].status === undefined) inst.checks[doc.id].status = "";
                if (inst.checks[doc.id].date === undefined) inst.checks[doc.id].date = "";
                
                let phaseColor = "var(--text-muted)";
                if (doc.phase === "Pre-Suministro") phaseColor = "#b45309";
                if (doc.phase === "Durante Suministro") phaseColor = "#0f766e";
                if (doc.phase === "Final Suministro") phaseColor = "#1d4ed8";

                let nameHtml = `<strong>${doc.name}</strong><br><span style="color:var(--text-muted); font-size:0.8rem;">${doc.desc}</span>`;
                if (doc.custom) {
                    nameHtml = `<input type="text" class="rfer-label form-control" data-uid="${inst.uid}" data-docid="${doc.id}" placeholder="Otra documentación..." value="${escHtml(inst.checks[doc.id].label === 'Otros' ? '' : inst.checks[doc.id].label)}" style="width:100%; padding:0.2rem; margin:0; font-size: 0.85rem; border:none; background:transparent; font-weight:600;">`;
                }

                html += `<tr>
                    <td style="border:1px solid var(--border); padding:0.4rem; text-align:center; font-weight:bold; color:${phaseColor};">${doc.phase}</td>
                    <td style="border:1px solid var(--border); padding:0.4rem;">
                        ${nameHtml}
                    </td>
                    <td style="border:1px solid var(--border); padding:0.4rem;">
                        <select class="rfer-status form-control" data-uid="${inst.uid}" data-docid="${doc.id}" style="width:100%; padding:0.2rem; margin:0;">
                            <option value="" ${inst.checks[doc.id].status === '' ? 'selected' : ''}></option>
                            <option value="Entregado" ${inst.checks[doc.id].status === 'Entregado' ? 'selected' : ''}>Entregado</option>
                            <option value="Pendiente" ${inst.checks[doc.id].status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="No procede" ${inst.checks[doc.id].status === 'No procede' ? 'selected' : ''}>No procede</option>
                        </select>
                    </td>
                    <td style="border:1px solid var(--border); padding:0.4rem;">
                        <input type="date" class="rfer-date form-control" data-uid="${inst.uid}" data-docid="${doc.id}" value="${escHtml(inst.checks[doc.id].date || '')}" style="width:100%; padding:0.2rem; margin:0;">
                    </td>
                </tr>`;
            });

            html += `</tbody></table></div>`;
            
            html += `
                <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
                    <div class="form-group" style="display:flex; border:1px solid var(--border); background:white;">
                        <div class="form-label" style="width:150px; background:#f1f5f9; padding:0.75rem; border-right:1px solid var(--border); font-weight:600; font-size:0.85rem;">Observaciones</div>
                        <textarea class="form-control rfer-observaciones" data-idx="${index}" style="flex:1; border:none; padding:0.75rem; min-height:60px; resize:vertical; font-size:0.85rem;">${escHtml(inst.observaciones || '')}</textarea>
                    </div>
                </div>
            `;
            
            block.innerHTML = html;
            wrapper.appendChild(block);
        });

        wrapper.querySelectorAll('.rfer-name').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].customName = e.target.value;
            });
        });
        wrapper.querySelectorAll('.rfer-ubicacion').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].ubicacion = e.target.value;
            });
        });
        wrapper.querySelectorAll('.rfer-dcor').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].dcor = e.target.value === 'true';
                renderAll();
            });
        });
        wrapper.querySelectorAll('.rfer-btn-remove').forEach(el => {
            el.addEventListener('click', (e) => {
                appConfirm("¿Eliminar este suministro y todo su control documental?", () => {
                    data.instances.splice(e.target.dataset.idx, 1);
                    renderAll();
                });
            });
        });
        wrapper.querySelectorAll('.rfer-status').forEach(el => {
            el.addEventListener('change', (e) => {
                const inst = data.instances.find(i => i.uid === e.target.dataset.uid);
                if (inst) inst.checks[e.target.dataset.docid].status = e.target.value;
            });
        });
        wrapper.querySelectorAll('.rfer-date').forEach(el => {
            el.addEventListener('change', (e) => {
                const inst = data.instances.find(i => i.uid === e.target.dataset.uid);
                if (inst) inst.checks[e.target.dataset.docid].date = e.target.value;
            });
        });
        wrapper.querySelectorAll('.rfer-label').forEach(el => {
            el.addEventListener('change', (e) => {
                const inst = data.instances.find(i => i.uid === e.target.dataset.uid);
                if (inst) inst.checks[e.target.dataset.docid].label = e.target.value;
            });
        });
        wrapper.querySelectorAll('.rfer-observaciones').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].observaciones = e.target.value;
            });
        });
    }

    renderAll();
};
