window.renderRecepcionPavimentosCalc = function(container, materialId) {
    const projectData = currentProject;
    if (!projectData.formData) projectData.formData = {};
    if (!projectData.formData[materialId]) projectData.formData[materialId] = { instances: [] };
    const data = projectData.formData[materialId];

    if (!data.instances) {
        data.instances = [{
            uid: Date.now().toString(),
            customName: data.identificacion || "Pavimento 1",
            ubicacion: data.ubicacion || "",
            caract: data.checks || {},
            checks: data.checks || {},
            observaciones: data.observaciones || ""
        }];
        delete data.identificacion; delete data.ubicacion; delete data.checks; delete data.observaciones;
    }

    const tiposPavimento = ["Cerámico", "Vinílico", "Madera", "Piedra natural"];

    const requiredDocsAll = [
        { id: "doc_pavimento_1", phase: "Pre-Suministro", name: "Declaración de prestaciones CE", desc: "Marcado CE según norma aplicable." },
        { id: "doc_pavimento_2", phase: "Pre-Suministro", name: "Fichas técnicas", desc: "Características del material." },
        { id: "doc_pavimento_muestra", phase: "Pre-Suministro", name: "Muestra o prototipo aprobado", desc: "Aprobado por la dirección facultativa (tono, calibre, acabado)." },
        { id: "doc_pavimento_compl", phase: "Pre-Suministro", name: "Materiales de agarre y complementarios", desc: "Fichas y declaración de prestaciones de adhesivos, morteros, juntas, láminas y bases." },
        { id: "doc_pavimento_petro", phase: "Pre-Suministro", name: "Informe de ensayos / ficha petrográfica", desc: "Caracterización de la piedra y origen de cantera.", tipos: ["Piedra natural"] },
        { id: "doc_pavimento_forestal", phase: "Pre-Suministro", name: "Certificado de procedencia de la madera", desc: "Gestión forestal sostenible, si lo exige el proyecto.", tipos: ["Madera"] },
        { id: "doc_pavimento_prev_otro", phase: "Pre-Suministro", name: "Otros", desc: "", custom: true },
        { id: "doc_pavimento_3", phase: "Durante Suministro", name: "Hoja de suministro/albarán", desc: "Trazabilidad de cada entrega en obra." },
        { id: "doc_pavimento_4", phase: "Durante Suministro", name: "Marcado CE", desc: "Comprobación visual de los embalajes." },
        { id: "doc_pavimento_lote", phase: "Durante Suministro", name: "Lote, tono y calibre", desc: "Coherentes con la muestra aprobada (comprobar en albarán y embalajes)." },
        { id: "doc_pavimento_dur_otro", phase: "Durante Suministro", name: "Otros", desc: "", custom: true },
        { id: "doc_pavimento_5", phase: "Final Suministro", name: "Certificado final de suministro", desc: "Acreditación del fabricante del material total." },
        { id: "doc_pavimento_fin_otro", phase: "Final Suministro", name: "Otros", desc: "", custom: true }
    ];

    // Los ids antiguos (pavimento_deslizamiento, _climatica, _flexion, _abrasion, _rotura, _fuego, _otras) se conservan para no perder datos guardados.
    const caractPorTipo = {
        "Cerámico": [
            { id: "pavimento_absorcion", name: "Absorción de agua" },
            { id: "pavimento_flexion", name: "Resistencia a flexión" },
            { id: "pavimento_rotura", name: "Carga de rotura" },
            { id: "pavimento_abrasion", name: "Resistencia al desgaste por abrasión" },
            { id: "pavimento_climatica", name: "Resistencia a heladas (exterior)" },
            { id: "pavimento_quimica", name: "Resistencia química y a manchas" },
            { id: "pavimento_dimensiones", name: "Dimensiones, planeidad y calibre" },
            { id: "pavimento_deslizamiento", name: "Resistencia al deslizamiento" },
            { id: "pavimento_fuego", name: "Reacción al fuego" }
        ],
        "Vinílico": [
            { id: "pavimento_espesor", name: "Espesor total y de la capa de uso" },
            { id: "pavimento_desgaste", name: "Resistencia al desgaste (clase de uso)" },
            { id: "pavimento_huella", name: "Resistencia a la huella (indentación)" },
            { id: "pavimento_estabilidad", name: "Estabilidad dimensional" },
            { id: "pavimento_ruedas", name: "Resistencia a ruedas de sillas" },
            { id: "pavimento_cov", name: "Emisiones de compuestos orgánicos volátiles" },
            { id: "pavimento_radiante", name: "Compatibilidad con suelo radiante" },
            { id: "pavimento_deslizamiento", name: "Resistencia al deslizamiento" },
            { id: "pavimento_fuego", name: "Reacción al fuego" }
        ],
        "Madera": [
            { id: "pavimento_especie", name: "Especie y clase de calidad o aspecto" },
            { id: "pavimento_espesor", name: "Espesor de la capa noble y dimensiones" },
            { id: "pavimento_humedad", name: "Humedad de la madera en suministro" },
            { id: "pavimento_dureza", name: "Dureza" },
            { id: "pavimento_estabilidad", name: "Estabilidad dimensional" },
            { id: "pavimento_formaldehido", name: "Emisión de formaldehído" },
            { id: "pavimento_radiante", name: "Compatibilidad con suelo radiante" },
            { id: "pavimento_durabilidad", name: "Durabilidad biológica (exterior o zona húmeda)" },
            { id: "pavimento_fuego", name: "Reacción al fuego" }
        ],
        "Piedra natural": [
            { id: "pavimento_petrografia", name: "Denominación petrográfica y origen" },
            { id: "pavimento_absorcion", name: "Absorción de agua y porosidad" },
            { id: "pavimento_flexion", name: "Resistencia a flexión" },
            { id: "pavimento_abrasion", name: "Resistencia al desgaste por abrasión" },
            { id: "pavimento_climatica", name: "Resistencia a heladas y cristalización de sales" },
            { id: "pavimento_dimensiones", name: "Dimensiones, espesor y tolerancias" },
            { id: "pavimento_acabado", name: "Acabado superficial" },
            { id: "pavimento_deslizamiento", name: "Resistencia al deslizamiento" },
            { id: "pavimento_fuego", name: "Reacción al fuego" }
        ]
    };

    const getCaract = (tipo) => (caractPorTipo[tipo] || []).concat([{ id: "pavimento_otras", name: "Otra", custom: true }]);
    const getDocs = (tipo) => requiredDocsAll.filter(d => !d.tipos || d.tipos.includes(tipo));

    // Tipologías guardadas antes de existir el selector: se consideran Cerámico.
    data.instances.forEach(inst => { if (!inst.tipo) inst.tipo = "Cerámico"; });

    container.innerHTML = `
        <div class="card" style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem;">
                <h2>Control Documental: Pavimentos</h2>
                <button id="rpav-btn-add" class="btn btn-primary" style="font-size: 0.9rem;">+ Añadir tipología</button>
            </div>
            <div id="rpav-instances-container"></div>
        </div>
    `;

    const btnAdd = container.querySelector('#rpav-btn-add');
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            data.instances.push({ uid: Date.now().toString(), customName: `Pavimento ${data.instances.length + 1}`, ubicacion: "", tipo: "", caract: {}, checks: {}, observaciones: "" });
            renderAll();
        });
    }

    function renderAll() {
        const wrapper = container.querySelector('#rpav-instances-container');
        if (!wrapper) return;
        wrapper.innerHTML = '';
        data.instances.forEach((inst, index) => {
            if (!inst.caract) inst.caract = {};
            const block = document.createElement('div');
            block.style.border = "1px solid var(--border)"; block.style.borderRadius = "8px"; block.style.padding = "1rem"; block.style.marginBottom = "1.5rem"; block.style.background = "#f8fafc";
            
            let html = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem;">
                    <div style="flex:1;">
                        <input type="text" class="unified-title rpav-name" data-idx="${index}" value="${inst.customName}" placeholder="Identificación producto (Ej. Pavimento continuo, Alicatado...)">
                    </div>
                    <button class="btn rpav-btn-remove" data-idx="${index}" style="margin-left:1rem; color: #dc2626; border: 1px solid #dc2626; background:transparent;">Eliminar</button>
                </div>
                <div class="dynamic-grid" style="margin-bottom: 1.5rem; gap: 1rem;">
                    <div><label class="form-label">Ubicación</label><input type="text" class="form-control rpav-ubicacion" data-idx="${index}" value="${inst.ubicacion || ''}" placeholder="Ej. Zonas comunes, Baños..."></div>
                    <div><label class="form-label">Tipo de pavimento</label>
                        <select class="form-control rpav-tipo" data-idx="${index}">
                            <option value="" ${!inst.tipo ? 'selected' : ''}>Seleccione tipo...</option>
                            ${tiposPavimento.map(t => `<option value="${t}" ${inst.tipo === t ? 'selected' : ''}>${t}</option>`).join('')}
                        </select>
                    </div>
                </div>`;

            if (!inst.tipo) {
                html += `<p style="font-size:0.85rem; color:var(--text-muted); font-style:italic;">Selecciona un tipo de pavimento para cargar las características y la documentación exigibles.</p>`;
                block.innerHTML = html;
                wrapper.appendChild(block);
                return;
            }

            html += `
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
            getCaract(inst.tipo).forEach(car => {
                if(!inst.caract[car.id]) inst.caract[car.id] = { label: car.name, valor: "", verificado: false };
                let labelHtml = `<strong>${car.name}</strong>`;
                if(car.custom) {
                    labelHtml = `<input type="text" class="rpav-caract-label form-control" data-uid="${inst.uid}" data-carid="${car.id}" value="${inst.caract[car.id].label === 'Otra' ? '' : inst.caract[car.id].label}" placeholder="Otra característica..." style="border:none; padding:0; font-size:0.85rem; background:transparent; font-weight:600; width:100%;">`;
                }
                html += `
                    <tr>
                        <td style="border:1px solid var(--border); padding:0.4rem;">${labelHtml}</td>
                        <td style="border:1px solid var(--border); padding:0.4rem;"><input type="text" class="rpav-caract-valor form-control" data-uid="${inst.uid}" data-carid="${car.id}" value="${inst.caract[car.id].valor || ''}" style="width:100%; padding:0.2rem; margin:0; border:1px solid transparent;" placeholder="..."></td>
                        <td style="border:1px solid var(--border); padding:0.4rem; text-align:center;"><input type="checkbox" class="rpav-caract-verif" data-uid="${inst.uid}" data-carid="${car.id}" ${inst.caract[car.id].verificado ? 'checked' : ''} style="width:1.2rem; height:1.2rem; cursor:pointer;"></td>
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

            getDocs(inst.tipo).forEach((doc) => {
                if(!inst.checks[doc.id]) inst.checks[doc.id] = { label: doc.name, status: "", date: "" };
                let phaseColor = doc.phase === "Pre-Suministro" ? "#b45309" : (doc.phase === "Durante Suministro" ? "#0f766e" : "#1d4ed8");
                let nameHtml = `<strong>${doc.name}</strong><br><span style="color:var(--text-muted); font-size:0.8rem;">${doc.desc}</span>`;
                if (doc.custom) nameHtml = `<input type="text" class="rpav-label form-control" data-uid="${inst.uid}" data-docid="${doc.id}" placeholder="Otra documentación..." value="${inst.checks[doc.id].label === 'Otros' ? '' : inst.checks[doc.id].label}" style="width:100%; padding:0.2rem; margin:0; font-size: 0.85rem; border:none; background:transparent; font-weight:600;">`;
                html += `<tr>
                    <td style="border:1px solid var(--border); padding:0.4rem; text-align:center; font-weight:bold; color:${phaseColor};">${doc.phase}</td>
                    <td style="border:1px solid var(--border); padding:0.4rem;">${nameHtml}</td>
                    <td style="border:1px solid var(--border); padding:0.4rem;">
                        <select class="rpav-status form-control" data-uid="${inst.uid}" data-docid="${doc.id}" style="width:100%; padding:0.2rem; margin:0;">
                            <option value="" ${inst.checks[doc.id].status === '' ? 'selected' : ''}></option>
                            <option value="Entregado" ${['Entregado','Aceptado', 'Recibido'].includes(inst.checks[doc.id].status) ? 'selected' : ''}>Entregado</option>
                            <option value="Pendiente" ${inst.checks[doc.id].status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="No procede" ${['No procede','No Entregado', 'No aplica'].includes(inst.checks[doc.id].status) ? 'selected' : ''}>No procede</option>
                        </select>
                    </td>
                    <td style="border:1px solid var(--border); padding:0.4rem;"><input type="date" class="rpav-date form-control" data-uid="${inst.uid}" data-docid="${doc.id}" value="${inst.checks[doc.id].date || ''}" style="width:100%; padding:0.2rem; margin:0;"></td>
                </tr>`;
            });
            html += `</tbody></table></div>
                <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
                    <div class="form-group" style="display:flex; border:1px solid var(--border); background:white;">
                        <div class="form-label" style="width:150px; background:#f1f5f9; padding:0.75rem; border-right:1px solid var(--border); font-weight:600; font-size:0.85rem;">Observaciones</div>
                        <textarea class="form-control rpav-observaciones" data-idx="${index}" style="flex:1; border:none; padding:0.75rem; min-height:60px; resize:vertical; font-size:0.85rem;">${inst.observaciones || ''}</textarea>
                    </div>
                </div>`;
            block.innerHTML = html;
            wrapper.appendChild(block);
        });

        wrapper.querySelectorAll('.rpav-name').forEach(el => el.addEventListener('change', e => { data.instances[e.target.dataset.idx].customName = e.target.value; }));
        wrapper.querySelectorAll('.rpav-ubicacion').forEach(el => el.addEventListener('change', e => { data.instances[e.target.dataset.idx].ubicacion = e.target.value; }));
        wrapper.querySelectorAll('.rpav-tipo').forEach(el => el.addEventListener('change', e => {
            const inst = data.instances[e.target.dataset.idx];
            inst.tipo = e.target.value;
            renderAll();
        }));
        wrapper.querySelectorAll('.rpav-btn-remove').forEach(el => el.addEventListener('click', e => {
            window.appConfirm("¿Eliminar esta tipología de pavimento y su control documental?", () => {
                data.instances.splice(e.target.dataset.idx, 1); renderAll();
            });
        }));

        wrapper.querySelectorAll('.rpav-caract-label').forEach(el => el.addEventListener('change', e => { data.instances.find(i => i.uid === e.target.dataset.uid).caract[e.target.dataset.carid].label = e.target.value; }));
        wrapper.querySelectorAll('.rpav-caract-valor').forEach(el => el.addEventListener('change', e => { data.instances.find(i => i.uid === e.target.dataset.uid).caract[e.target.dataset.carid].valor = e.target.value; }));
        wrapper.querySelectorAll('.rpav-caract-verif').forEach(el => el.addEventListener('change', e => { data.instances.find(i => i.uid === e.target.dataset.uid).caract[e.target.dataset.carid].verificado = e.target.checked; }));

        wrapper.querySelectorAll('.rpav-status').forEach(el => el.addEventListener('change', e => { data.instances.find(i => i.uid === e.target.dataset.uid).checks[e.target.dataset.docid].status = e.target.value; }));
        wrapper.querySelectorAll('.rpav-date').forEach(el => el.addEventListener('change', e => { data.instances.find(i => i.uid === e.target.dataset.uid).checks[e.target.dataset.docid].date = e.target.value; }));
        wrapper.querySelectorAll('.rpav-label').forEach(el => el.addEventListener('change', e => { data.instances.find(i => i.uid === e.target.dataset.uid).checks[e.target.dataset.docid].label = e.target.value; }));
        wrapper.querySelectorAll('.rpav-observaciones').forEach(el => el.addEventListener('change', e => { data.instances[e.target.dataset.idx].observaciones = e.target.value; }));
    }
    renderAll();
};
