window.renderRecepcionElectricidadCalc = function(container, materialId) {
    const projectData = currentProject;
    if (!projectData.formData) projectData.formData = {};
    if (!projectData.formData[materialId]) projectData.formData[materialId] = { instances: [] };
    const data = projectData.formData[materialId];

    if (!data.instances) {
        data.instances = [{
            uid: Date.now().toString(),
            customName: data.identificacion || "Electricidad 1",
            ubicacion: data.ubicacion || "",
            caract: data.checks || {},
            checks: data.checks || {},
            observaciones: data.observaciones || ""
        }];
        delete data.identificacion; delete data.ubicacion; delete data.checks; delete data.observaciones;
    }

    const requiredDocs = [
        { id: "doc_elec_1", phase: "Pre-Suministro", name: "Marcado CE cableado", desc: "" },
        { id: "doc_elec_2", phase: "Pre-Suministro", name: "Marcado CE interruptores...", desc: "" },
        { id: "doc_elec_3", phase: "Pre-Suministro", name: "Sello calidad bases de enchufe", desc: "" },
        { id: "doc_elec_4", phase: "Pre-Suministro", name: "Sello calidad interruptores...", desc: "" },
        { id: "doc_elec_5", phase: "Pre-Suministro", name: "Clasificación reacción al fuego...", desc: "" },
        { id: "doc_elec_6", phase: "Pre-Suministro", name: "Certificado resistencia mecánica conductos...", desc: "" },
        { id: "doc_elec_7", phase: "Pre-Suministro", name: "Certificado grado proteccion IP...", desc: "" },
        { id: "doc_elec_prev_otro", phase: "Pre-Suministro", name: "Otros", desc: "", custom: true },
        { id: "doc_elec_8", phase: "Durante Suministro", name: "Hoja de suministro/Albarán", desc: "" },
        { id: "doc_elec_9", phase: "Durante Suministro", name: "Verificación marcado CE", desc: "" },
        { id: "doc_elec_dur_otro", phase: "Durante Suministro", name: "Otras", desc: "", custom: true },
        { id: "doc_elec_10", phase: "Final Suministro", name: "Certificado final de suministro", desc: "" },
        { id: "doc_elec_fin_otro", phase: "Final Suministro", name: "Otros", desc: "", custom: true }
    ];

    const caracteristicasExigidas = [
        { id: "elec_pias", name: "Magnetotérmicos (PIAs): In y Poder de corte" },
        { id: "elec_dif", name: "Interruptores Diferenciales: Sensibilidad y Clase" },
        { id: "elec_mec", name: "Mecanismos (Enchufes/Interrup): Grado de protección (IP)" },
        { id: "elec_cond", name: "Conductores: Sección y Clasificación al fuego (CPR)" },
        { id: "elec_tubo", name: "Tubos protectores (Corrugado): Resistencia a compresión" },
        { id: "elec_otras", name: "Otra característica (especificar)", custom: true }
    ];

    container.innerHTML = `
        <div class="card" style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem;">
                <h2>Control Documental: Electricidad</h2>
                <button id="relec-btn-add" class="btn btn-primary" style="font-size: 0.9rem;">+ Añadir tipología</button>
            </div>
            <div id="relec-instances-container"></div>
        </div>
    `;

    const btnAdd = container.querySelector('#relec-btn-add');
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            data.instances.push({ uid: Date.now().toString(), customName: `Electricidad ${data.instances.length + 1}`, ubicacion: "", caract: {}, checks: {}, observaciones: "" });
            renderAll();
        });
    }

    function renderAll() {
        const wrapper = container.querySelector('#relec-instances-container');
        if (!wrapper) return;
        wrapper.innerHTML = '';
        data.instances.forEach((inst, index) => {
            if (!inst.caract) inst.caract = {};
            const block = document.createElement('div');
            block.style.border = "1px solid var(--border)"; block.style.borderRadius = "8px"; block.style.padding = "1rem"; block.style.marginBottom = "1.5rem"; block.style.background = "#f8fafc";
            
            let html = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem;">
                    <div style="flex:1;">
                        <input type="text" class="unified-title relec-name" data-idx="${index}" value="${escHtml(inst.customName)}" placeholder="Identificación producto (Ej. Cableado libre halógenos)">
                    </div>
                    <button class="btn relec-btn-remove" data-idx="${index}" style="margin-left:1rem; color: #dc2626; border: 1px solid #dc2626; background:transparent;">Eliminar</button>
                </div>
                <div class="dynamic-grid" style="margin-bottom: 1.5rem; gap: 1rem;">
                    <div><label class="form-label">Ubicación</label><input type="text" class="form-control relec-ubicacion" data-idx="${index}" value="${escHtml(inst.ubicacion || '')}" placeholder="Ej. Planta 1"></div>
                </div>
                
                <h4 class="unified-title" style="margin-top:1rem; font-size:1rem; color:#475569;">1. Características Exigidas</h4>
                <div style="overflow-x:auto; margin-bottom: 2rem;">
                    <table style="width:100%; border-collapse: collapse; font-size:0.85rem; background: white; min-width: 500px;">
                        <thead>
                            <tr>
                                <th style="border:1px solid var(--border); padding:0.4rem; background:#f1f5f9; text-align:left; width:40%;">Exigida</th>
                                <th style="border:1px solid var(--border); padding:0.4rem; background:#f1f5f9; text-align:left; width:40%;">Valor Proyecto</th>
                                <th style="border:1px solid var(--border); padding:0.4rem; background:#f1f5f9; text-align:center; width:20%;">Verificado</th>
                            </tr>
                        </thead>
                        <tbody>`;
            caracteristicasExigidas.forEach(car => {
                if(!inst.caract[car.id]) inst.caract[car.id] = { label: car.name, valor: "", verificado: false };
                let labelHtml = `<strong>${car.name}</strong>`;
                if(car.custom) {
                    labelHtml = `<input type="text" class="relec-caract-label form-control" data-uid="${inst.uid}" data-carid="${car.id}" value="${escHtml(inst.caract[car.id].label === 'Otra característica (especificar)' ? '' : inst.caract[car.id].label)}" placeholder="Otra característica (especificar)..." style="border:none; padding:0; font-size:0.85rem; background:transparent; font-weight:600; width:100%;">`;
                }
                html += `
                    <tr>
                        <td style="border:1px solid var(--border); padding:0.4rem;">${labelHtml}</td>
                        <td style="border:1px solid var(--border); padding:0.4rem;"><input type="text" class="relec-caract-valor form-control" data-uid="${inst.uid}" data-carid="${car.id}" value="${escHtml(inst.caract[car.id].valor || '')}" style="width:100%; padding:0.2rem; margin:0; border:1px solid transparent;" placeholder="..."></td>
                        <td style="border:1px solid var(--border); padding:0.4rem; text-align:center;"><input type="checkbox" class="relec-caract-verif" data-uid="${inst.uid}" data-carid="${car.id}" ${inst.caract[car.id].verificado ? 'checked' : ''} style="width:1.2rem; height:1.2rem; cursor:pointer;"></td>
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

            requiredDocs.forEach((doc) => {
                if(!inst.checks[doc.id]) inst.checks[doc.id] = { label: doc.name, status: "", date: "" };
                let phaseColor = doc.phase === "Pre-Suministro" ? "#b45309" : (doc.phase === "Durante Suministro" ? "#0f766e" : "#1d4ed8");
                let nameHtml = `<strong>${doc.name}</strong><br><span style="color:var(--text-muted); font-size:0.8rem;">${doc.desc}</span>`;
                if (doc.custom) nameHtml = `<input type="text" class="relec-label form-control" data-uid="${inst.uid}" data-docid="${doc.id}" placeholder="Otra documentación..." value="${escHtml(inst.checks[doc.id].label === 'Otros' || inst.checks[doc.id].label === 'Otras' ? '' : inst.checks[doc.id].label)}" style="width:100%; padding:0.2rem; margin:0; font-size: 0.85rem; border:none; background:transparent; font-weight:600;">`;
                html += `<tr>
                    <td style="border:1px solid var(--border); padding:0.4rem; text-align:center; font-weight:bold; color:${phaseColor};">${doc.phase}</td>
                    <td style="border:1px solid var(--border); padding:0.4rem;">${nameHtml}</td>
                    <td style="border:1px solid var(--border); padding:0.4rem;">
                        <select class="relec-status form-control" data-uid="${inst.uid}" data-docid="${doc.id}" style="width:100%; padding:0.2rem; margin:0;">
                            <option value="" ${inst.checks[doc.id].status === '' ? 'selected' : ''}></option>
                            <option value="Entregado" ${['Entregado','Aceptado'].includes(inst.checks[doc.id].status) ? 'selected' : ''}>Entregado</option>
                            <option value="Pendiente" ${inst.checks[doc.id].status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="No procede" ${['No procede','No Entregado'].includes(inst.checks[doc.id].status) ? 'selected' : ''}>No procede</option>
                        </select>
                    </td>
                    <td style="border:1px solid var(--border); padding:0.4rem;"><input type="date" class="relec-date form-control" data-uid="${inst.uid}" data-docid="${doc.id}" value="${escHtml(inst.checks[doc.id].date || '')}" style="width:100%; padding:0.2rem; margin:0;"></td>
                </tr>`;
            });
            html += `</tbody></table></div>
                <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
                    <div class="form-group" style="display:flex; border:1px solid var(--border); background:white;">
                        <div class="form-label" style="width:150px; background:#f1f5f9; padding:0.75rem; border-right:1px solid var(--border); font-weight:600; font-size:0.85rem;">Observaciones</div>
                        <textarea class="form-control relec-observaciones" data-idx="${index}" style="flex:1; border:none; padding:0.75rem; min-height:60px; resize:vertical; font-size:0.85rem;">${escHtml(inst.observaciones || '')}</textarea>
                    </div>
                </div>`;
            block.innerHTML = html;
            wrapper.appendChild(block);
        });

        wrapper.querySelectorAll('.relec-name').forEach(el => el.addEventListener('change', e => { data.instances[e.target.dataset.idx].customName = e.target.value; }));
        wrapper.querySelectorAll('.relec-ubicacion').forEach(el => el.addEventListener('change', e => { data.instances[e.target.dataset.idx].ubicacion = e.target.value; }));
        wrapper.querySelectorAll('.relec-btn-remove').forEach(el => el.addEventListener('click', e => {
            window.appConfirm("¿Eliminar esta tipología de electricidad y su control documental?", () => {
                data.instances.splice(e.target.dataset.idx, 1); renderAll();
            });
        }));

        wrapper.querySelectorAll('.relec-caract-label').forEach(el => el.addEventListener('change', e => { data.instances.find(i => i.uid === e.target.dataset.uid).caract[e.target.dataset.carid].label = e.target.value; }));
        wrapper.querySelectorAll('.relec-caract-valor').forEach(el => el.addEventListener('change', e => { data.instances.find(i => i.uid === e.target.dataset.uid).caract[e.target.dataset.carid].valor = e.target.value; }));
        wrapper.querySelectorAll('.relec-caract-verif').forEach(el => el.addEventListener('change', e => { data.instances.find(i => i.uid === e.target.dataset.uid).caract[e.target.dataset.carid].verificado = e.target.checked; }));

        wrapper.querySelectorAll('.relec-status').forEach(el => el.addEventListener('change', e => { data.instances.find(i => i.uid === e.target.dataset.uid).checks[e.target.dataset.docid].status = e.target.value; }));
        wrapper.querySelectorAll('.relec-date').forEach(el => el.addEventListener('change', e => { data.instances.find(i => i.uid === e.target.dataset.uid).checks[e.target.dataset.docid].date = e.target.value; }));
        wrapper.querySelectorAll('.relec-label').forEach(el => el.addEventListener('change', e => { data.instances.find(i => i.uid === e.target.dataset.uid).checks[e.target.dataset.docid].label = e.target.value; }));
        wrapper.querySelectorAll('.relec-observaciones').forEach(el => el.addEventListener('change', e => { data.instances[e.target.dataset.idx].observaciones = e.target.value; }));
    }
    renderAll();
};
