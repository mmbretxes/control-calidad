window.renderRecepcionForjadosCalc = function(container, materialId) {
    const projectData = currentProject;
    if (!projectData.formData) projectData.formData = {};
    if (!projectData.formData[materialId] || !projectData.formData[materialId].instances) {
        projectData.formData[materialId] = {
            instances: []
        };
    }
    
    const data = projectData.formData[materialId];

    const documentosRequeridos = [
        { id: "ddp", phase: "Pre-Suministro", name: "Declaración de Prestaciones (DdP)", desc: "Acredita el cumplimiento de los requisitos del Código Estructural." },
        { id: "ce", phase: "Pre-Suministro", name: "Marcado CE de elementos", desc: "Etiqueta y documentación del marcado CE obligatorio para elementos prefabricados." },
        { id: "ficha_tec", phase: "Pre-Suministro", name: "Ficha de Características Técnicas", desc: "Ficha técnica que incluye geometría, armados y características de los materiales." },
        { id: "cpf", phase: "Pre-Suministro", name: "Certificado Control Producción CPF", desc: "Certificado del Control de Producción en Fábrica expedido por organismo notificado." },
        { id: "aceros", phase: "Pre-Suministro", name: "Certificados de los Aceros/Cables", desc: "Marcado CE o certificados de calidad del acero pasivo y activo empleado." },
        { id: "prev_otros", phase: "Pre-Suministro", name: "Otros", desc: "", isOther: true },
        { id: "albaran", phase: "Durante Suministro", name: "Albarán de Suministro", desc: "Identificación de los elementos recibidos conforme a plano." },
        { id: "hormigon_obra", phase: "Durante Suministro", name: "Documentación Hormigón HA de Obra", desc: "En caso de hormigón vertido in situ para relleno o capa de compresión." },
        { id: "dur_otros", phase: "Durante Suministro", name: "Otros", desc: "", isOther: true },
        { id: "cert_final", phase: "Final Suministro", name: "Certificado Final de Suministro", desc: "Certificado emitido por el fabricante al concluir el suministro." },
        { id: "fin_otros", phase: "Final Suministro", name: "Otros", desc: "", isOther: true }
    ];

    // Impresión desde los datos
    if (window.registrarImpresionFicha) registrarImpresionFicha(materialId, (d, soloDatos, H) => {
        let html = '', n = 0, nDocs = 0, nOk = 0;
        (d.instances || []).forEach(inst => {
            const caracteristicas = [
                { label: 'Bovedilla colaborante', valor: inst.bovColab_val || '', verificado: !!inst.bovColab_chk },
                { label: 'Reacción a fuego bovedillas EPS', valor: inst.reacEps_val || '', verificado: !!inst.reacEps_chk },
                { label: 'Expansión humedad bov. cerámica', valor: inst.expHum_val || '', verificado: !!inst.expHum_chk }
            ];
            if (inst.otra_exigida || inst.otra_val || inst.otra_chk) caracteristicas.push({ label: inst.otra_exigida || '', valor: inst.otra_val || '', verificado: !!inst.otra_chk });
            const docs = documentosRequeridos.map(doc => {
                const c = (inst.checks || {})[doc.id] || {};
                return { fase: doc.phase, label: doc.isOther ? (c.label || '') : doc.name, estado: c.status || '', fecha: c.date || '', custom: doc.isOther };
            }).filter(x => !(x.custom && !x.label && !x.estado && !x.fecha));
            const b = H.bloqueSuministro({ nombre: inst.customName || 'Forjado', meta: [['Tipo de forjado', inst.forjadoType], ['Canto requerido', inst.canto]], caracteristicas, cabeceraValor: 'Valor requerido', docs, obs: inst.observaciones }, soloDatos);
            if (!b) return;
            n++; nDocs += b.nDocs; nOk += b.nDocsOk; html += b.html;
        });
        if (d.observaciones) html += H.notasHtml([['Observaciones generales', d.observaciones]]);
        return { html, resumen: [H.plural(n, 'forjado', 'forjados'), nDocs ? `${nOk} de ${nDocs} documentos resueltos` : ''] };
    });

    container.innerHTML = `
        <div class="card" style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem;">
                <h2>Control Documental de Recepción de Forjados Prefabricados</h2>
                <button id="rf-btn-add" class="btn btn-primary" style="font-size: 0.9rem;">+ Añadir forjado prefabricado</button>
            </div>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">Añade los diferentes tipos de forjado empleados en obra y verifica los documentos exigibles según la normativa.</p>
            
            <div id="rf-instances-container"></div>
        </div>
    `;

    const btnAdd = container.querySelector('#rf-btn-add');
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            data.instances.push({
                uid: Date.now().toString(),
                customName: `Forjado ${data.instances.length + 1}`,
                forjadoType: '',
                canto: '',
                bovColab_val: '', bovColab_chk: false,
                reacEps_val: '', reacEps_chk: false,
                expHum_val: '', expHum_chk: false,
                otra_exigida: '', otra_val: '', otra_chk: false,
                checks: {}
            });
            renderAll();
        });
    }

    function renderAll() {
        const wrapper = container.querySelector('#rf-instances-container');
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
                        <input type="text" class="unified-title rf-name" data-idx="${index}" value="${escHtml(inst.customName)}" placeholder="Identificador (Ej. Forjado Sanitario, Planta Baja...)">
                    </div>
                    <button class="btn rf-btn-remove" data-idx="${index}" style="margin-left:1rem; color: #dc2626; border: 1px solid #dc2626; background:transparent;">Eliminar</button>
                </div>
            `;

            // Opciones y parámetros
            html += `
                <div class="dynamic-grid" style="margin-bottom: 1.5rem; gap: 1rem;">
                    <div>
                        <label class="form-label">Tipo de forjado prefabricado</label>
                        <input type="text" class="form-control rf-type" data-idx="${index}" value="${escHtml(inst.forjadoType)}" placeholder="Ej. Vigueta y bovedilla, Placa alveolar...">
                    </div>
                    <div>
                        <label class="form-label">Canto requerido</label>
                        <input type="text" class="form-control rf-canto" data-idx="${index}" value="${escHtml(inst.canto)}" placeholder="Ej. 25+5 cm, 30 cm...">
                    </div>
                </div>

                <h4 class="unified-title">Características exigidas</h4>
                <div class="table-container" style="margin-bottom: 1.5rem;">
                    <table style="width:100%; border-collapse: collapse; font-size:0.85rem; background: white; border: 1px solid var(--border);">
                        <thead>
                            <tr style="border-bottom: 1px solid var(--border); color: var(--text-muted);">
                                <th style="padding:0.6rem; text-align:left; width:50%; font-weight:600; font-size:0.75rem; letter-spacing:0.5px;">EXIGIDA</th>
                                <th style="padding:0.6rem; text-align:left; width:35%; font-weight:600; font-size:0.75rem; letter-spacing:0.5px;">VALOR REQUERIDO</th>
                                <th style="padding:0.6rem; text-align:center; width:15%; font-weight:600; font-size:0.75rem; letter-spacing:0.5px;">VERIFICADO</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Fila 1 -->
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding:0.6rem;">Bovedilla colaborante</td>
                                <td style="padding:0.4rem;">
                                    <select class="form-control rf-bov-val" data-idx="${index}" style="background:#f8fafc; border:none; width:100%; padding:0.4rem;">
                                        <option value="" ${inst.bovColab_val === '' ? 'selected' : ''}></option>
                                        <option value="Sí" ${inst.bovColab_val === 'Sí' ? 'selected' : ''}>Sí</option>
                                        <option value="No" ${inst.bovColab_val === 'No' ? 'selected' : ''}>No</option>
                                    </select>
                                </td>
                                <td style="padding:0.6rem; text-align:center;">
                                    <input type="checkbox" class="rf-bov-chk" data-idx="${index}" ${inst.bovColab_chk ? 'checked' : ''} style="width:1.2rem; height:1.2rem; cursor:pointer;">
                                </td>
                            </tr>
                            <!-- Fila 2 -->
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding:0.6rem;">Reacción a fuego bovedillas EPS</td>
                                <td style="padding:0.4rem;">
                                    <input type="text" class="form-control rf-eps-val" data-idx="${index}" value="${escHtml(inst.reacEps_val || '')}" style="background:#f8fafc; border:none; width:100%; padding:0.4rem;" placeholder="Ej. B-s1,d0">
                                </td>
                                <td style="padding:0.6rem; text-align:center;">
                                    <input type="checkbox" class="rf-eps-chk" data-idx="${index}" ${inst.reacEps_chk ? 'checked' : ''} style="width:1.2rem; height:1.2rem; cursor:pointer;">
                                </td>
                            </tr>
                            <!-- Fila 3 -->
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding:0.6rem;">Expansión humedad bov. cerámica</td>
                                <td style="padding:0.4rem;">
                                    <select class="form-control rf-exp-val" data-idx="${index}" style="background:#f8fafc; border:none; width:100%; padding:0.4rem;">
                                        <option value="" ${inst.expHum_val === '' ? 'selected' : ''}></option>
                                        <option value="Sí" ${inst.expHum_val === 'Sí' ? 'selected' : ''}>Sí</option>
                                        <option value="No" ${inst.expHum_val === 'No' ? 'selected' : ''}>No</option>
                                    </select>
                                </td>
                                <td style="padding:0.6rem; text-align:center;">
                                    <input type="checkbox" class="rf-exp-chk" data-idx="${index}" ${inst.expHum_chk ? 'checked' : ''} style="width:1.2rem; height:1.2rem; cursor:pointer;">
                                </td>
                            </tr>
                            <!-- Fila 4: Personalizable -->
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding:0.4rem;">
                                    <input type="text" class="form-control rf-otra-ex" data-idx="${index}" value="${escHtml(inst.otra_exigida || '')}" placeholder="Otra..." style="border:none; width:100%; padding:0.4rem; font-size:0.85rem;">
                                </td>
                                <td style="padding:0.4rem;">
                                    <input type="text" class="form-control rf-otra-val" data-idx="${index}" value="${escHtml(inst.otra_val || '')}" style="background:#f8fafc; border:none; width:100%; padding:0.4rem;">
                                </td>
                                <td style="padding:0.6rem; text-align:center;">
                                    <input type="checkbox" class="rf-otra-chk" data-idx="${index}" ${inst.otra_chk ? 'checked' : ''} style="width:1.2rem; height:1.2rem; cursor:pointer;">
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;

            // Checklist Documental
            html += `<h4 class="unified-title">Relación de Documentación Exigible</h4>`;
            html += `<div style="overflow-x:auto;"><table style="width:100%; border-collapse: collapse; font-size:0.85rem; min-width: 600px; background: white;">
                <thead><tr>
                    <th style="width:15%; border:1px solid var(--border); padding:0.4rem; background:#f1f5f9;">Fase</th>
                    <th style="width:45%; text-align:left; border:1px solid var(--border); padding:0.4rem; background:#f1f5f9;">Documento / Certificado</th>
                    <th style="width:20%; border:1px solid var(--border); padding:0.4rem; background:#f1f5f9;">Estado</th>
                    <th style="width:20%; border:1px solid var(--border); padding:0.4rem; background:#f1f5f9;">Fecha</th>
                </tr></thead><tbody>`;

            documentosRequeridos.forEach((doc) => {
                if(!inst.checks[doc.id]) inst.checks[doc.id] = { status: "", date: "" };
                
                // Color fase
                let phaseColor = "var(--text-muted)";
                if (doc.phase === "Pre-Suministro") phaseColor = "#b45309"; // amber-700
                if (doc.phase === "Durante Suministro") phaseColor = "#0f766e"; // teal-700
                if (doc.phase === "Final Suministro") phaseColor = "#1d4ed8"; // blue-700

                let nameHtml = `<strong>${doc.name}</strong><br><span style="color:var(--text-muted); font-size:0.8rem;">${doc.desc || ''}</span>`;
                if (doc.isOther) {
                    nameHtml = `<input type="text" class="rf-custom-label form-control" data-uid="${inst.uid}" data-docid="${doc.id}" placeholder="Otros (especificar)..." value="${escHtml(inst.checks[doc.id].label || '')}" style="width:100%; padding:0.2rem; margin:0; font-size: 0.85rem; border:none; background:transparent; font-weight:600;">`;
                }

                html += `<tr>
                    <td style="border:1px solid var(--border); padding:0.4rem; text-align:center; font-weight:bold; color:${phaseColor};">${doc.phase}</td>
                    <td style="border:1px solid var(--border); padding:0.4rem;">
                        ${nameHtml}
                    </td>
                    <td style="border:1px solid var(--border); padding:0.4rem;">
                        <select class="rf-status form-control" data-uid="${inst.uid}" data-docid="${doc.id}" style="width:100%; padding:0.2rem; margin:0;">
                            <option value="" ${inst.checks[doc.id].status === '' ? 'selected' : ''}></option>
                            <option value="Entregado" ${inst.checks[doc.id].status === 'Entregado' ? 'selected' : ''}>Entregado</option>
                            <option value="Pendiente" ${inst.checks[doc.id].status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="No procede" ${inst.checks[doc.id].status === 'No procede' ? 'selected' : ''}>No procede</option>
                        </select>
                    </td>
                    <td style="border:1px solid var(--border); padding:0.4rem;">
                        <input type="date" class="rf-date form-control" data-uid="${inst.uid}" data-docid="${doc.id}" value="${escHtml(inst.checks[doc.id].date)}" style="width:100%; padding:0.2rem; margin:0;">
                    </td>
                </tr>`;
            });

            html += `</tbody></table></div>`;
            block.innerHTML = html;
            wrapper.appendChild(block);
        });

        // Asignar eventos tras el renderizado
        wrapper.querySelectorAll('.rf-name').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].customName = e.target.value;
            });
        });

        wrapper.querySelectorAll('.rf-type').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].forjadoType = e.target.value;
            });
        });

        wrapper.querySelectorAll('.rf-canto').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].canto = e.target.value;
            });
        });

        wrapper.querySelectorAll('.rf-bov-val').forEach(el => {
            el.addEventListener('change', (e) => data.instances[e.target.dataset.idx].bovColab_val = e.target.value);
        });
        wrapper.querySelectorAll('.rf-bov-chk').forEach(el => {
            el.addEventListener('change', (e) => data.instances[e.target.dataset.idx].bovColab_chk = e.target.checked);
        });

        wrapper.querySelectorAll('.rf-eps-val').forEach(el => {
            el.addEventListener('change', (e) => data.instances[e.target.dataset.idx].reacEps_val = e.target.value);
        });
        wrapper.querySelectorAll('.rf-eps-chk').forEach(el => {
            el.addEventListener('change', (e) => data.instances[e.target.dataset.idx].reacEps_chk = e.target.checked);
        });

        wrapper.querySelectorAll('.rf-exp-val').forEach(el => {
            el.addEventListener('change', (e) => data.instances[e.target.dataset.idx].expHum_val = e.target.value);
        });
        wrapper.querySelectorAll('.rf-exp-chk').forEach(el => {
            el.addEventListener('change', (e) => data.instances[e.target.dataset.idx].expHum_chk = e.target.checked);
        });

        wrapper.querySelectorAll('.rf-otra-ex').forEach(el => {
            el.addEventListener('change', (e) => data.instances[e.target.dataset.idx].otra_exigida = e.target.value);
        });
        wrapper.querySelectorAll('.rf-otra-val').forEach(el => {
            el.addEventListener('change', (e) => data.instances[e.target.dataset.idx].otra_val = e.target.value);
        });
        wrapper.querySelectorAll('.rf-otra-chk').forEach(el => {
            el.addEventListener('change', (e) => data.instances[e.target.dataset.idx].otra_chk = e.target.checked);
        });

        wrapper.querySelectorAll('.rf-btn-remove').forEach(el => {
            el.addEventListener('click', (e) => {
                appConfirm("¿Eliminar este forjado y todo su control documental?", () => {
                    data.instances.splice(e.target.dataset.idx, 1);
                    renderAll();
                });
            });
        });

        wrapper.querySelectorAll('.rf-status').forEach(el => {
            el.addEventListener('change', (e) => {
                const inst = data.instances.find(i => i.uid === e.target.dataset.uid);
                if (inst) inst.checks[e.target.dataset.docid].status = e.target.value;
            });
        });

        wrapper.querySelectorAll('.rf-date').forEach(el => {
            el.addEventListener('change', (e) => {
                const inst = data.instances.find(i => i.uid === e.target.dataset.uid);
                if (inst) inst.checks[e.target.dataset.docid].date = e.target.value;
            });
        });

        wrapper.querySelectorAll('.rf-custom-label').forEach(el => {
            el.addEventListener('change', (e) => {
                const inst = data.instances.find(i => i.uid === e.target.dataset.uid);
                if (inst) inst.checks[e.target.dataset.docid].label = e.target.value;
            });
        });
    }

    renderAll();
};
