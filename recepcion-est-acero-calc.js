window.renderRecepcionEstAceroCalc = function(container, materialId) {
    const projectData = currentProject;
    if (!projectData.formData) projectData.formData = {};
    if (!projectData.formData[materialId]) {
        projectData.formData[materialId] = {
            instances: []
        };
    }
    
    const data = projectData.formData[materialId];

    // Migration for backward compatibility (if there was some auto-generated data)
    if (!data.instances) {
        data.instances = [{
            uid: Date.now().toString(),
            customName: data.identificacion || "Estructura 1",
            ubicacion: data.ubicacion || "",
            checks: data.checks || {},
            observaciones: data.observaciones || ""
        }];
        delete data.identificacion;
        delete data.ubicacion;
        delete data.checks;
        delete data.observaciones;
    }

    const requiredDocs = [
        // PRE-SUMINISTRO
        { id: "e1", phase: "Pre-Suministro", name: "Programa de Fabricación y Montaje", desc: "Documento del taller que define la secuencia y lotes previstos." },
        { id: "e2", phase: "Pre-Suministro", name: "Declaración de Prestaciones y Marcado CE del Taller (EN 1090-1)", desc: "Obligatorio según la clase de ejecución (EXC2, EXC3 o EXC4)." },
        { id: "e3", phase: "Pre-Suministro", name: "Certificados del Acero Base (Inspección 3.1)", desc: "Certificados de calidad de los perfiles, tubos y chapas originales (EN 10204)." },
        { id: "e4", phase: "Pre-Suministro", name: "Certificados de Consumibles", desc: "Declaración de prestaciones, Marcado CE y compatibilidad de electrodos/hilos de soldadura." },
        { id: "e5", phase: "Pre-Suministro", name: "Certificados de Tornillería y Anclajes", desc: "Declaración de prestaciones y Marcado CE de tornillería (ordinaria/pretesada) y tacos mecánicos/químicos." },
        { id: "e6", phase: "Pre-Suministro", name: "Certificados de Pinturas e Imprimaciones", desc: "Certificado de compatibilidad del sistema anticorrosivo según Categoría Ambiental (C1 a C5)." },
        { id: "e7", phase: "Pre-Suministro", name: "Homologación de Soldadores", desc: "Certificados vigentes de cualificación del personal de taller que realizará las uniones." },
        { id: "e8", phase: "Pre-Suministro", name: "Especificación de Procedimientos de Soldeo (WPS/WPQR)", desc: "Procedimientos de soldadura homologados que se van a emplear." },
        { id: "e9", phase: "Pre-Suministro", name: "Otros", desc: "", custom: true },

        // DURANTE
        { id: "e10", phase: "Durante Suministro", name: "Albaranes de Suministro a Obra", desc: "Identificación de piezas, marcas de despiece y trazabilidad de las coladas de acero." },
        { id: "e11", phase: "Durante Suministro", name: "Certificados de Ensayos No Destructivos (END) de Taller", desc: "Resultados de inspecciones (líquidos penetrantes, ultrasonidos) de las piezas servidas." },
        { id: "e12", phase: "Durante Suministro", name: "Otros", desc: "", custom: true },

        // FINAL
        { id: "e13", phase: "Final Suministro", name: "Certificado de Control de Producción y Suministro Final", desc: "Dossier de calidad y garantía global emitida por el taller estructurista." },
        { id: "e14", phase: "Final Suministro", name: "Otros", desc: "", custom: true }
    ];

    container.innerHTML = `
        <div class="card" style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem;">
                <h2>Control Documental de Recepción de Estructuras de Acero</h2>
                <button id="rest-btn-add" class="btn btn-primary" style="font-size: 0.9rem;">+ Añadir nuevo suministro</button>
            </div>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">Configura cada taller o suministro de estructura metálica a la obra para generar sus requisitos documentales (Código Estructural).</p>
            
            <div id="rest-instances-container"></div>
        </div>
    `;

    const btnAdd = container.querySelector('#rest-btn-add');
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            data.instances.push({
                uid: Date.now().toString(),
                customName: `Estructura Metálica ${data.instances.length + 1}`,
                ubicacion: "",
                checks: {},
                observaciones: ""
            });
            renderAll();
        });
    }

    function renderAll() {
        const wrapper = container.querySelector('#rest-instances-container');
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
                        <input type="text" class="unified-title rest-name" data-idx="${index}" value="${inst.customName}" placeholder="Identificación producto / taller (Ej. Taller Metálicas S.L.)">
                    </div>
                    <button class="btn rest-btn-remove" data-idx="${index}" style="margin-left:1rem; color: #dc2626; border: 1px solid #dc2626; background:transparent;">Eliminar</button>
                </div>
                
                <div class="dynamic-grid" style="margin-bottom: 1.5rem; gap: 1rem;">
                    <div>
                        <label class="form-label">Ubicación</label>
                        <input type="text" class="form-control rest-ubicacion" data-idx="${index}" value="${inst.ubicacion || ''}" placeholder="Ej. Cubierta Nave A">
                    </div>
                </div>
            `;

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
                    nameHtml = `<input type="text" class="rest-label form-control" data-uid="${inst.uid}" data-docid="${doc.id}" placeholder="Otra documentación..." value="${inst.checks[doc.id].label === 'Otros' ? '' : inst.checks[doc.id].label}" style="width:100%; padding:0.2rem; margin:0; font-size: 0.85rem; border:none; background:transparent; font-weight:600;">`;
                }

                html += `<tr>
                    <td style="border:1px solid var(--border); padding:0.4rem; text-align:center; font-weight:bold; color:${phaseColor};">${doc.phase}</td>
                    <td style="border:1px solid var(--border); padding:0.4rem;">
                        ${nameHtml}
                    </td>
                    <td style="border:1px solid var(--border); padding:0.4rem;">
                        <select class="rest-status form-control" data-uid="${inst.uid}" data-docid="${doc.id}" style="width:100%; padding:0.2rem; margin:0;">
                            <option value="" ${inst.checks[doc.id].status === '' ? 'selected' : ''}></option>
                            <option value="Entregado" ${inst.checks[doc.id].status === 'Entregado' ? 'selected' : ''}>Entregado</option>
                            <option value="Pendiente" ${inst.checks[doc.id].status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="No procede" ${inst.checks[doc.id].status === 'No procede' ? 'selected' : ''}>No procede</option>
                        </select>
                    </td>
                    <td style="border:1px solid var(--border); padding:0.4rem;">
                        <input type="date" class="rest-date form-control" data-uid="${inst.uid}" data-docid="${doc.id}" value="${inst.checks[doc.id].date || ''}" style="width:100%; padding:0.2rem; margin:0;">
                    </td>
                </tr>`;
            });

            html += `</tbody></table></div>`;
            
            html += `
                <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
                    <div class="form-group" style="display:flex; border:1px solid var(--border); background:white;">
                        <div class="form-label" style="width:150px; background:#f1f5f9; padding:0.75rem; border-right:1px solid var(--border); font-weight:600; font-size:0.85rem;">Observaciones</div>
                        <textarea class="form-control rest-observaciones" data-idx="${index}" style="flex:1; border:none; padding:0.75rem; min-height:60px; resize:vertical; font-size:0.85rem;">${inst.observaciones || ''}</textarea>
                    </div>
                </div>
            `;
            
            block.innerHTML = html;
            wrapper.appendChild(block);
        });

        wrapper.querySelectorAll('.rest-name').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].customName = e.target.value;
            });
        });
        wrapper.querySelectorAll('.rest-ubicacion').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].ubicacion = e.target.value;
            });
        });
        wrapper.querySelectorAll('.rest-btn-remove').forEach(el => {
            el.addEventListener('click', (e) => {
                appConfirm("¿Eliminar este suministro y todo su control documental?", () => {
                    data.instances.splice(e.target.dataset.idx, 1);
                    renderAll();
                });
            });
        });
        wrapper.querySelectorAll('.rest-status').forEach(el => {
            el.addEventListener('change', (e) => {
                const inst = data.instances.find(i => i.uid === e.target.dataset.uid);
                if (inst) inst.checks[e.target.dataset.docid].status = e.target.value;
            });
        });
        wrapper.querySelectorAll('.rest-date').forEach(el => {
            el.addEventListener('change', (e) => {
                const inst = data.instances.find(i => i.uid === e.target.dataset.uid);
                if (inst) inst.checks[e.target.dataset.docid].date = e.target.value;
            });
        });
        wrapper.querySelectorAll('.rest-label').forEach(el => {
            el.addEventListener('change', (e) => {
                const inst = data.instances.find(i => i.uid === e.target.dataset.uid);
                if (inst) inst.checks[e.target.dataset.docid].label = e.target.value;
            });
        });
        wrapper.querySelectorAll('.rest-observaciones').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].observaciones = e.target.value;
            });
        });
    }

    renderAll();
};
