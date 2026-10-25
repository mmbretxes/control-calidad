window.renderRecepcionHormigonCalc = function(container, materialId) {
    const projectData = currentProject;
    if (!projectData.formData) projectData.formData = {};
    if (!projectData.formData[materialId] || !projectData.formData[materialId].instances) {
        projectData.formData[materialId] = {
            instances: []
        };
    }
    
    const data = projectData.formData[materialId];

    const database = {
        central: {
            dcorTrue: [
                { id: "c1", phase: "Pre-Suministro", name: "Declaración de Conformidad del Hormigón", desc: "Firmada por el técnico de la central. Certifica que el hormigón cumple con el Código Estructural." },
                { id: "c2", phase: "Pre-Suministro", name: "Certificado de Distintivo de Calidad Oficialmente Reconocido (DCOR)", desc: "Acreditación de la marca voluntaria oficial vigente (p.ej. Marca AENOR N) concedida a la planta de fabricación." },
                { id: "c4", phase: "Durante Suministro", name: "Hojas de Suministro (Albaranes) de cada Camión", desc: "Verificación obligatoria del albarán de cada camión antes del vertido. Debe indicar expresamente la dosificación de cemento (Mínimo en Kg cemento/m³), relación agua/cemento máxima, aditivos y prohibición de agua no autorizada." }
            ],
            dcorFalse: [
                { id: "cn1", phase: "Pre-Suministro", name: "Declaración de Conformidad del Hormigón", desc: "Firmada por el fabricante que garantiza el cumplimiento estricto con el RD 470/2021 y resistencia fck." },
                { id: "cn3", phase: "Durante Suministro", name: "Hojas de Suministro (Albaranes) de cada Camión", desc: "Verificación obligatoria de albaranes por cada camión antes del vertido. El albarán debe registrar expresamente la dosificación de cemento, a/c, aditivos y prohibición de agua." }
            ]
        },
        obra: {
            dcorTrue: [
                { id: "o1", phase: "Pre-Suministro", name: "Declaración de Conformidad del Constructor como Fabricante", desc: "La constructora asume toda la responsabilidad y obligaciones de un fabricante industrial de hormigón." },
                { id: "o2", phase: "Pre-Suministro", name: "Certificados de Calidad de las Materias Primas", desc: "Marcado CE de los áridos y marcado CE del cemento empleado." },
                { id: "o_prev1", phase: "Pre-Suministro", name: "Ensayos Previos para Determinar la Dosificación", desc: "Ensayos físicos y mecánicos de tipo iniciales que avalan que la fórmula elegida en la planta de obra es la óptima para alcanzar el fck de diseño." }
            ],
            dcorFalse: [
                { id: "on1", phase: "Pre-Suministro", name: "Declaración de Responsabilidad del Constructor como Fabricante", desc: "Documento legal donde el constructor asume la producción, dosificación y controles del hormigón sin DCOR." },
                { id: "on2", phase: "Pre-Suministro", name: "Ensayos de Idoneidad del Agua de Amasado (No Potable)", desc: "En caso de no proceder de red pública, análisis químicos obligatorios de acidez pH, contenido de cloruros y sulfatos." },
                { id: "on3", phase: "Pre-Suministro", name: "Certificados CE de Áridos, Aditivos y Cemento de cada Suministrador", desc: "Acrédito independiente de origen y prestaciones de cada ingrediente del hormigón." },
                { id: "on_prev1", phase: "Pre-Suministro", name: "Ensayos Previos para Determinar la Dosificación", desc: "Al no contar con garantía certificada externa, es obligatorio justificar mediante ensayos de laboratorio previos que la dosificación elegida alcanza la resistencia." },
                { id: "on5", phase: "Durante Suministro", name: "Toma Obligatoria de Probetas para Control Estadístico al 100%", desc: "Planificación del control físico sistemático diario al carecer de sello de garantía oficial." }
            ]
        }
    };

    container.innerHTML = `
        <div class="card" style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem;">
                <h2>Control Documental de Recepción de Hormigón</h2>
                <button id="rh-btn-add" class="btn btn-primary" style="font-size: 0.9rem;">+ Añadir nuevo hormigón</button>
            </div>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">Configura cada tipo de hormigón suministrado a la obra para generar sus requisitos documentales obligatorios (Código Estructural).</p>
            
            <div id="rh-instances-container"></div>
        </div>
    `;

    const btnAdd = container.querySelector('#rh-btn-add');
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            data.instances.push({
                uid: Date.now().toString(),
                customName: `Hormigón ${data.instances.length + 1}`,
                origin: 'central',
                dcor: true,
                waterproof: false,
                dispCert: false,
                checks: {}
            });
            renderAll();
        });
    }

    function renderAll() {
        const wrapper = container.querySelector('#rh-instances-container');
        if (!wrapper) return;
        wrapper.innerHTML = '';

        data.instances.forEach((inst, index) => {
            const block = document.createElement('div');
            block.style.border = "1px solid var(--border)";
            block.style.borderRadius = "8px";
            block.style.padding = "1rem";
            block.style.marginBottom = "1.5rem";
            block.style.background = "#f8fafc";

            // Header del bloque
            let html = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem;">
                    <div style="flex:1;">
                        <input type="text" class="unified-title rh-name" data-idx="${index}" value="${escHtml(inst.customName)}" placeholder="Nombre / Elemento destino (Ej. HA-25/B/20/XC2 Pilares)">
                    </div>
                    <button class="btn rh-btn-remove" data-idx="${index}" style="margin-left:1rem; color: #dc2626; border: 1px solid #dc2626; background:transparent;">Eliminar</button>
                </div>
            `;

            // Opciones
            html += `
                <div class="dynamic-grid" style="margin-bottom: 1.5rem; gap: 1rem;">
                    <div>
                        <label class="form-label">Origen</label>
                        <select class="form-control rh-origin" data-idx="${index}">
                            <option value="central" ${inst.origin === 'central' ? 'selected' : ''}>De Central</option>
                            <option value="obra" ${inst.origin === 'obra' ? 'selected' : ''}>Hecho en Obra</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Distintivo de Calidad (DCOR)</label>
                        <select class="form-control rh-dcor" data-idx="${index}">
                            <option value="true" ${inst.dcor ? 'selected' : ''}>Con Distintivo</option>
                            <option value="false" ${!inst.dcor ? 'selected' : ''}>Sin Distintivo</option>
                        </select>
                    </div>
            `;

            if (!inst.dcor && inst.origin === 'central') {
                html += `
                    <div>
                        <label class="form-label">Dispersión Certificada</label>
                        <select class="form-control rh-disp" data-idx="${index}">
                            <option value="false" ${!inst.dispCert ? 'selected' : ''}>No aporta</option>
                            <option value="true" ${inst.dispCert ? 'selected' : ''}>Aporta Certificado</option>
                        </select>
                    </div>
                `;
            } else {
                inst.dispCert = false; // Reset if not applicable
            }

            html += `
                    <div>
                        <label class="form-label">Impermeabilidad / Agresividad</label>
                        <select class="form-control rh-waterproof" data-idx="${index}">
                            <option value="false" ${!inst.waterproof ? 'selected' : ''}>Estándar</option>
                            <option value="true" ${inst.waterproof ? 'selected' : ''}>Requiere Impermeabilidad</option>
                        </select>
                    </div>
                </div>
            `;

            // Construir lista de requisitos según estado
            const key = inst.dcor ? 'dcorTrue' : 'dcorFalse';
            let baseDocs = JSON.parse(JSON.stringify(database[inst.origin][key]));

            if (inst.waterproof) {
                baseDocs.unshift({
                    id: "perm1",
                    phase: "Pre-Suministro",
                    name: "Certificado de Ensayo de Permeabilidad al Agua (UNE-EN 12390-8)",
                    desc: "Validez máxima de 6 meses de antigüedad."
                });
            }

            if (!inst.dcor && inst.dispCert && inst.origin === 'central') {
                baseDocs.unshift({
                    id: "disp1",
                    phase: "Pre-Suministro",
                    name: "Certificado de Desviación Típica de la Central",
                    desc: "Para aplicar el Caso 1 de control estadístico (Art. 57.5.4.3)."
                });
            }

            // Agrupar por fases e insertar "Otros"
            const preDocs = baseDocs.filter(d => d.phase === "Pre-Suministro");
            const durDocs = baseDocs.filter(d => d.phase === "Durante Suministro");
            
            preDocs.push({ id: "pre_otros", phase: "Pre-Suministro", name: "Otros", desc: "", isOther: true });
            durDocs.push({ id: "dur_otros", phase: "Durante Suministro", name: "Otros", desc: "", isOther: true });
            const finDocs = [{ id: "custom_0", phase: "Final Suministro", name: "Otros", desc: "", isOther: true }];
            
            let requiredDocs = [...preDocs, ...durDocs, ...finDocs];

            // Checklist Documental
            html += `<h4 class="unified-title">Relación de Documentación Exigible</h4>`;
            html += `<div style="overflow-x:auto;"><table style="width:100%; border-collapse: collapse; font-size:0.85rem; min-width: 600px; background: white;">
                <thead><tr>
                    <th style="width:15%; border:1px solid var(--border); padding:0.4rem; background:#f1f5f9;">Fase</th>
                    <th style="width:45%; text-align:left; border:1px solid var(--border); padding:0.4rem; background:#f1f5f9;">Documento / Certificado</th>
                    <th style="width:20%; border:1px solid var(--border); padding:0.4rem; background:#f1f5f9;">Estado</th>
                    <th style="width:20%; border:1px solid var(--border); padding:0.4rem; background:#f1f5f9;">Fecha</th>
                </tr></thead><tbody>`;

            requiredDocs.forEach((doc) => {
                if(!inst.checks[doc.id]) inst.checks[doc.id] = { status: "", date: "", proyecto: "", entregado: false, label: "" };
                else {
                    if (inst.checks[doc.id].proyecto === undefined) inst.checks[doc.id].proyecto = "";
                    if (inst.checks[doc.id].entregado === undefined) inst.checks[doc.id].entregado = (inst.checks[doc.id].status === 'Aceptado');
                }
                
                let phaseColor = "var(--text-muted)";
                if (doc.phase === "Pre-Suministro") phaseColor = "#b45309";
                if (doc.phase === "Durante Suministro") phaseColor = "#0f766e";
                if (doc.phase === "Final Suministro") phaseColor = "#1d4ed8";

                let nameHtml = `<strong>${doc.name}</strong><br><span style="color:var(--text-muted); font-size:0.8rem;">${doc.desc}</span>`;
                if (doc.isOther) {
                    nameHtml = `<input type="text" class="rh-custom-label form-control" data-uid="${inst.uid}" data-docid="${doc.id}" placeholder="Otros (especificar)..." value="${escHtml(inst.checks[doc.id].label || '')}" style="width:100%; padding:0.2rem; margin:0; font-size: 0.85rem; border:none; background:transparent; font-weight:600;">`;
                }

                html += `<tr>
                    <td style="border:1px solid var(--border); padding:0.4rem; text-align:center; font-weight:bold; color:${phaseColor};">${doc.phase}</td>
                    <td style="border:1px solid var(--border); padding:0.4rem;">
                        ${nameHtml}
                    </td>
                    <td style="border:1px solid var(--border); padding:0.4rem;">
                        <select class="rh-status form-control" data-uid="${inst.uid}" data-docid="${doc.id}" style="width:100%; padding:0.2rem; margin:0;">
                            <option value="" ${inst.checks[doc.id].status === '' ? 'selected' : ''}></option>
                            <option value="Entregado" ${inst.checks[doc.id].status === 'Entregado' ? 'selected' : ''}>Entregado</option>
                            <option value="Pendiente" ${inst.checks[doc.id].status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="No procede" ${inst.checks[doc.id].status === 'No procede' ? 'selected' : ''}>No procede</option>
                        </select>
                    </td>
                    <td style="border:1px solid var(--border); padding:0.4rem;">
                        <input type="date" class="rh-date form-control" data-uid="${inst.uid}" data-docid="${doc.id}" value="${escHtml(inst.checks[doc.id].date || '')}" style="width:100%; padding:0.2rem; margin:0;">
                    </td>
                </tr>`;
            });

            html += `</tbody></table></div>`;
            block.innerHTML = html;
            wrapper.appendChild(block);
        });

        // Asignar eventos tras el renderizado
        wrapper.querySelectorAll('.rh-name').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].customName = e.target.value;
            });
        });

        wrapper.querySelectorAll('.rh-btn-remove').forEach(el => {
            el.addEventListener('click', (e) => {
                appConfirm("¿Eliminar este hormigón y todo su control documental?", () => {
                    data.instances.splice(e.target.dataset.idx, 1);
                    renderAll();
                });
            });
        });

        wrapper.querySelectorAll('.rh-origin').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].origin = e.target.value;
                renderAll();
            });
        });

        wrapper.querySelectorAll('.rh-dcor').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].dcor = e.target.value === 'true';
                renderAll();
            });
        });

        wrapper.querySelectorAll('.rh-disp').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].dispCert = e.target.value === 'true';
                renderAll();
            });
        });

        wrapper.querySelectorAll('.rh-waterproof').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].waterproof = e.target.value === 'true';
                renderAll();
            });
        });

        wrapper.querySelectorAll('.rh-status').forEach(el => {
            el.addEventListener('change', (e) => {
                const inst = data.instances.find(i => i.uid === e.target.dataset.uid);
                if (inst) inst.checks[e.target.dataset.docid].status = e.target.value;
            });
        });

        wrapper.querySelectorAll('.rh-date').forEach(el => {
            el.addEventListener('change', (e) => {
                const inst = data.instances.find(i => i.uid === e.target.dataset.uid);
                if (inst) inst.checks[e.target.dataset.docid].date = e.target.value;
            });
        });

        wrapper.querySelectorAll('.rh-custom-label').forEach(el => {
            el.addEventListener('change', (e) => {
                const inst = data.instances.find(i => i.uid === e.target.dataset.uid);
                if (inst) inst.checks[e.target.dataset.docid].label = e.target.value;
            });
        });
    }

    renderAll();
};
