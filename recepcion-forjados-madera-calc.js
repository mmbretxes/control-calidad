window.renderRecepcionForjadosMaderaCalc = function(container, materialId) {
    const projectData = currentProject;
    if (!projectData.formData) projectData.formData = {};
    if (!projectData.formData[materialId]) {
        projectData.formData[materialId] = { instances: [] };
    }
    const data = projectData.formData[materialId];

    if (!data.instances) {
        data.instances = [{
            uid: Date.now().toString(),
            customName: data.identificacion || "Forjado de Madera 1",
            ubicacion: data.ubicacion || "",
            checks: data.checks || {},
            observaciones: data.observaciones || ""
        }];
        delete data.identificacion; delete data.ubicacion; delete data.checks; delete data.observaciones;
    }

    const requiredDocs = [
        { id: "e1", phase: "Pre-Suministro", name: "Declaración de prestaciones CE", desc: "Declaración de prestaciones y Marcado CE de la madera estructural empleada." },
        { id: "e2", phase: "Pre-Suministro", name: "Certificado de procedencia", desc: "Acreditación del origen geográfico de la madera." },
        { id: "e3", phase: "Pre-Suministro", name: "Certificado explotación sostenible", desc: "Certificación FSC, PEFC o equivalente que garantice la gestión forestal." },
        { id: "e4", phase: "Pre-Suministro", name: "Otros", desc: "", custom: true },
        { id: "e5", phase: "Durante Suministro", name: "Hoja de suministro/albarán", desc: "Identificación de los elementos, dimensiones y clase resistente." },
        { id: "e6", phase: "Durante Suministro", name: "Marcado CE", desc: "Comprobación del marcado CE físico en las piezas o paquetes suministrados." },
        { id: "e7", phase: "Durante Suministro", name: "Otros", desc: "", custom: true },
        { id: "e8", phase: "Final Suministro", name: "Certificado final de suministro", desc: "Certificación final que ampare todas las remesas servidas." },
        { id: "e9", phase: "Final Suministro", name: "Otros", desc: "", custom: true }
    ];

    container.innerHTML = `
        <div class="card" style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem;">
                <h2>Control Documental: Forjados de Madera</h2>
                <button id="rfm-btn-add" class="btn btn-primary" style="font-size: 0.9rem;">+ Añadir suministro</button>
            </div>
            <div id="rfm-instances-container"></div>
        </div>
    `;

    const btnAdd = container.querySelector('#rfm-btn-add');
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            data.instances.push({ uid: Date.now().toString(), customName: `Forjado Madera ${data.instances.length + 1}`, ubicacion: "", checks: {}, observaciones: "" });
            renderAll();
        });
    }

    function renderAll() {
        const wrapper = container.querySelector('#rfm-instances-container');
        if (!wrapper) return;
        wrapper.innerHTML = '';
        data.instances.forEach((inst, index) => {
            const block = document.createElement('div');
            block.style.border = "1px solid var(--border)"; block.style.borderRadius = "8px"; block.style.padding = "1rem"; block.style.marginBottom = "1.5rem"; block.style.background = "#f8fafc";
            
            let html = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem;">
                    <div style="flex:1;">
                        <input type="text" class="unified-title rfm-name" data-idx="${index}" value="${escHtml(inst.customName)}" placeholder="Identificación producto (Ej. Forjado C14)">
                    </div>
                    <button class="btn rfm-btn-remove" data-idx="${index}" style="margin-left:1rem; color: #dc2626; border: 1px solid #dc2626; background:transparent;">Eliminar</button>
                </div>
                <div class="dynamic-grid" style="margin-bottom: 1.5rem; gap: 1rem;">
                    <div><label class="form-label">Ubicación</label><input type="text" class="form-control rfm-ubicacion" data-idx="${index}" value="${escHtml(inst.ubicacion || '')}" placeholder="Ej. Cubierta"></div>
                </div>
                <h4 class="unified-title" style="margin-top:1rem; font-size:1rem;">Relación de Documentación Exigible</h4>
                <div style="overflow-x:auto;"><table style="width:100%; border-collapse: collapse; font-size:0.85rem; min-width: 600px; background: white;">
                    <thead><tr>
                        <th style="width:15%; border:1px solid var(--border); padding:0.4rem; background:#f1f5f9;">Fase</th>
                        <th style="width:45%; text-align:left; border:1px solid var(--border); padding:0.4rem; background:#f1f5f9;">Documento / Certificado</th>
                        <th style="width:20%; border:1px solid var(--border); padding:0.4rem; background:#f1f5f9;">Estado</th>
                        <th style="width:20%; border:1px solid var(--border); padding:0.4rem; background:#f1f5f9;">Fecha</th>
                    </tr></thead><tbody>`;

            requiredDocs.forEach((doc) => {
                if(!inst.checks[doc.id]) inst.checks[doc.id] = { label: doc.name, status: "", date: "" };
                let phaseColor = doc.phase === "Pre-Suministro" ? "#b45309" : (doc.phase === "Durante Suministro" ? "#0f766e" : "#1d4ed8");
                let nameHtml = `<strong>${doc.name}</strong><br><span style="color:var(--text-muted); font-size:0.8rem;">${doc.desc}</span>`;
                if (doc.custom) nameHtml = `<input type="text" class="rfm-label form-control" data-uid="${inst.uid}" data-docid="${doc.id}" placeholder="Otra documentación..." value="${escHtml(inst.checks[doc.id].label === 'Otros' ? '' : inst.checks[doc.id].label)}" style="width:100%; padding:0.2rem; margin:0; font-size: 0.85rem; border:none; background:transparent; font-weight:600;">`;
                html += `<tr>
                    <td style="border:1px solid var(--border); padding:0.4rem; text-align:center; font-weight:bold; color:${phaseColor};">${doc.phase}</td>
                    <td style="border:1px solid var(--border); padding:0.4rem;">${nameHtml}</td>
                    <td style="border:1px solid var(--border); padding:0.4rem;">
                        <select class="rfm-status form-control" data-uid="${inst.uid}" data-docid="${doc.id}" style="width:100%; padding:0.2rem; margin:0;">
                            <option value="" ${inst.checks[doc.id].status === '' ? 'selected' : ''}></option>
                            <option value="Entregado" ${inst.checks[doc.id].status === 'Entregado' ? 'selected' : ''}>Entregado</option>
                            <option value="Pendiente" ${inst.checks[doc.id].status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="No procede" ${inst.checks[doc.id].status === 'No procede' ? 'selected' : ''}>No procede</option>
                        </select>
                    </td>
                    <td style="border:1px solid var(--border); padding:0.4rem;"><input type="date" class="rfm-date form-control" data-uid="${inst.uid}" data-docid="${doc.id}" value="${escHtml(inst.checks[doc.id].date || '')}" style="width:100%; padding:0.2rem; margin:0;"></td>
                </tr>`;
            });
            html += `</tbody></table></div>
                <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
                    <div class="form-group" style="display:flex; border:1px solid var(--border); background:white;">
                        <div class="form-label" style="width:150px; background:#f1f5f9; padding:0.75rem; border-right:1px solid var(--border); font-weight:600; font-size:0.85rem;">Observaciones</div>
                        <textarea class="form-control rfm-observaciones" data-idx="${index}" style="flex:1; border:none; padding:0.75rem; min-height:60px; resize:vertical; font-size:0.85rem;">${escHtml(inst.observaciones || '')}</textarea>
                    </div>
                </div>`;
            block.innerHTML = html;
            wrapper.appendChild(block);
        });

        wrapper.querySelectorAll('.rfm-name').forEach(el => el.addEventListener('change', e => { data.instances[e.target.dataset.idx].customName = e.target.value; }));
        wrapper.querySelectorAll('.rfm-ubicacion').forEach(el => el.addEventListener('change', e => { data.instances[e.target.dataset.idx].ubicacion = e.target.value; }));
        wrapper.querySelectorAll('.rfm-btn-remove').forEach(el => el.addEventListener('click', e => {
            window.appConfirm("¿Eliminar este forjado y su control documental?", () => {
                data.instances.splice(e.target.dataset.idx, 1); renderAll();
            });
        }));
        wrapper.querySelectorAll('.rfm-status').forEach(el => el.addEventListener('change', e => { data.instances.find(i => i.uid === e.target.dataset.uid).checks[e.target.dataset.docid].status = e.target.value; }));
        wrapper.querySelectorAll('.rfm-date').forEach(el => el.addEventListener('change', e => { data.instances.find(i => i.uid === e.target.dataset.uid).checks[e.target.dataset.docid].date = e.target.value; }));
        wrapper.querySelectorAll('.rfm-label').forEach(el => el.addEventListener('change', e => { data.instances.find(i => i.uid === e.target.dataset.uid).checks[e.target.dataset.docid].label = e.target.value; }));
        wrapper.querySelectorAll('.rfm-observaciones').forEach(el => el.addEventListener('change', e => { data.instances[e.target.dataset.idx].observaciones = e.target.value; }));
    }
    renderAll();
};
