window.renderRecepcionAislantesCalc = function(container, materialId) {
    const projectData = currentProject;
    if (!projectData.formData) projectData.formData = {};
    if (!projectData.formData[materialId] || !projectData.formData[materialId].instances) {
        const oldData = projectData.formData[materialId] || {};
        projectData.formData[materialId] = {
            instances: [],
            observaciones: oldData.observaciones || ''
        };
        // Migración suave si existían datos previos
        if (oldData.identificacion || oldData.ubicacion) {
            projectData.formData[materialId].instances.push({
                uid: Date.now().toString(),
                customName: oldData.identificacion || 'Aislante 1',
                tipoAislante: oldData.identificacion || '',
                ubicacion: oldData.ubicacion || '',
                res_termica_val: oldData.res_termica_1 || '',
                res_termica_chk: !!oldData.res_termica_2,
                espesor_val: oldData.espesor_1 || '',
                espesor_chk: !!oldData.espesor_2,
                cond_termica_val: oldData.cond_termica_1 || '',
                cond_termica_chk: !!oldData.cond_termica_2,
                reaccion_fuego_val: oldData.reaccion_fuego_1 || '',
                reaccion_fuego_chk: !!oldData.reaccion_fuego_2,
                res_flujo_val: oldData.res_flujo_1 || '',
                res_flujo_chk: !!oldData.res_flujo_2,
                res_compresion_val: oldData.res_compresion_1 || '',
                res_compresion_chk: !!oldData.res_compresion_2,
                no_hidrofilo_val: oldData.no_hidrofilo_1 || '',
                no_hidrofilo_chk: !!oldData.no_hidrofilo_2,
                otra_exigida: oldData.otra_carac_label || '',
                otra_val: oldData.otra_carac_1 || '',
                otra_chk: !!oldData.otra_carac_2,
                checks: {}
            });
        }
    }
    
    const data = projectData.formData[materialId];

    const documentosRequeridos = [
        { id: "fichas_tec", phase: "Previo", name: "Fichas técnicas", desc: "Ficha de características técnicas del fabricante, especificaciones y marcado CE." },
        { id: "ddp_ce", phase: "Previo", name: "Declaración de Prestaciones (DdP)", desc: "Acredita el cumplimiento de los requisitos del marcado CE según norma UNE-EN aplicable." },
        { id: "calidad", phase: "Previo", name: "Distintivo de Calidad", desc: "Distintivo de calidad o certificación voluntaria reconocida (marca AENOR, etc.)." },
        { id: "prev_otros", phase: "Previo", name: "Otros", desc: "", isOther: true },
        { id: "albaran", phase: "Durante", name: "Hoja de suministro / Albarán", desc: "Identificación de los materiales recibidos (lote, dimensiones, fabricante) conforme a pedido." },
        { id: "ce_etiqueta", phase: "Durante", name: "Marcado CE en etiquetado / embalaje", desc: "Comprobación de la etiqueta física del marcado CE y código de designación en los paquetes." },
        { id: "dur_otros", phase: "Durante", name: "Otros", desc: "", isOther: true },
        { id: "cert_final", phase: "Final", name: "Certificado Final de Suministro", desc: "Certificado de suministro o garantía emitido por el fabricante o instalador." },
        { id: "fin_otros", phase: "Final", name: "Otros", desc: "", isOther: true }
    ];

    // Impresión desde los datos
    const CARACT_AISLANTES = [
        ['res_termica', 'Resistencia térmica (m²K/W)'], ['espesor', 'Espesor (mm / m)'], ['cond_termica', 'Conductividad térmica λ (W/mK)'],
        ['reaccion_fuego', 'Reacción al fuego'], ['res_flujo', 'Resistencia flujo del aire (kPa·s/m²)'], ['res_compresion', 'Resistencia a compresión (kPa)'],
        ['no_hidrofilo', 'No hidrófilo']
    ];
    const FASES_AISLANTES = { Previo: 'Previo al suministro', Durante: 'Durante el suministro', Final: 'Final del suministro' };
    if (window.registrarImpresionFicha) registrarImpresionFicha(materialId, (d, soloDatos, H) => {
        let html = '', n = 0, nDocs = 0, nOk = 0;
        (d.instances || []).forEach(inst => {
            const caracteristicas = CARACT_AISLANTES.map(([k, label]) => ({ label, valor: inst[k + '_val'] || '', verificado: !!inst[k + '_chk'] }));
            if (inst.otra_exigida || inst.otra_val || inst.otra_chk) caracteristicas.push({ label: inst.otra_exigida || '', valor: inst.otra_val || '', verificado: !!inst.otra_chk });
            const docs = documentosRequeridos.map(doc => {
                const c = (inst.checks || {})[doc.id] || {};
                const label = doc.isOther ? (c.label || '') : doc.name;
                const estado = c.status === 'Aceptado' ? 'Entregado' : c.status === 'No Entregado' ? 'No procede' : (c.status || '');
                return { fase: FASES_AISLANTES[doc.phase] || doc.phase, label, estado, fecha: c.date || '', custom: doc.isOther };
            }).filter(x => !(x.custom && !x.label && !x.estado && !x.fecha));
            const b = H.bloqueSuministro({ nombre: inst.customName || 'Aislante', meta: [['Tipo de aislante', inst.tipoAislante], ['Ubicación', inst.ubicacion]], caracteristicas, cabeceraValor: 'Valor requerido', docs }, soloDatos);
            if (!b) return;
            n++; nDocs += b.nDocs; nOk += b.nDocsOk; html += b.html;
        });
        if (d.observaciones) html += H.notasHtml([['Observaciones generales', d.observaciones]]);
        return { html, resumen: [H.plural(n, 'tipo de aislante', 'tipos de aislante'), nDocs ? `${nOk} de ${nDocs} documentos resueltos` : ''] };
    });

    container.innerHTML = `
        <div class="card" style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
                <h2>Control Documental de Recepción: Aislantes Térmicos</h2>
                <button id="ra-btn-add" class="btn btn-primary" style="font-size: 0.9rem;">+ Añadir tipo de aislante</button>
            </div>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">Añade los diferentes tipos de aislante empleados en obra y verifica las características técnicas y documentos exigibles según la normativa.</p>
            
            <div id="ra-instances-container"></div>
            
            <div style="margin-top: 2rem; border-top: 2px solid var(--border); padding-top: 1rem;">
                <h4 class="unified-title">Observaciones generales</h4>
                <textarea id="ra-obs" class="form-control" style="width:100%; min-height:80px; resize:vertical;" placeholder="Observaciones generales sobre la recepción de aislantes...">${escHtml(data.observaciones || '')}</textarea>
            </div>
        </div>
    `;

    const btnAdd = container.querySelector('#ra-btn-add');
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            data.instances.push({
                uid: Date.now().toString(),
                customName: `Aislante ${data.instances.length + 1}`,
                tipoAislante: '',
                ubicacion: '',
                res_termica_val: '', res_termica_chk: false,
                espesor_val: '', espesor_chk: false,
                cond_termica_val: '', cond_termica_chk: false,
                reaccion_fuego_val: '', reaccion_fuego_chk: false,
                res_flujo_val: '', res_flujo_chk: false,
                res_compresion_val: '', res_compresion_chk: false,
                no_hidrofilo_val: '', no_hidrofilo_chk: false,
                otra_exigida: '', otra_val: '', otra_chk: false,
                checks: {}
            });
            renderAll();
        });
    }

    const obsNode = container.querySelector('#ra-obs');
    if (obsNode) {
        obsNode.addEventListener('change', (e) => {
            data.observaciones = e.target.value;
        });
    }

    function renderAll() {
        const wrapper = container.querySelector('#ra-instances-container');
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
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem; gap: 1rem;">
                    <div style="flex:1;">
                        <input type="text" class="unified-title ra-name" data-idx="${index}" value="${escHtml(inst.customName)}" placeholder="Identificador (Ej. Lana de roca en fachada, XPS en cubierta...)">
                    </div>
                    <button class="btn ra-btn-remove" data-idx="${index}" style="margin-left:1rem; color: #dc2626; border: 1px solid #dc2626; background:transparent;">Eliminar</button>
                </div>
            `;

            // Opciones y parámetros
            html += `
                <div class="dynamic-grid" style="margin-bottom: 1.5rem; gap: 1rem;">
                    <div>
                        <label class="form-label">Tipo de aislante térmico</label>
                        <input type="text" class="form-control ra-tipo" data-idx="${index}" value="${escHtml(inst.tipoAislante || '')}" placeholder="Ej. Lana mineral, Poliestireno extruido (XPS), Poliestireno expandido (EPS)...">
                    </div>
                    <div>
                        <label class="form-label">Ubicación en obra</label>
                        <input type="text" class="form-control ra-ubic" data-idx="${index}" value="${escHtml(inst.ubicacion || '')}" placeholder="Ej. Fachada SATE, Cubierta plana, Suelo radiante...">
                    </div>
                </div>

                <h4 class="unified-title">Características exigidas</h4>
                <div class="table-container" style="margin-bottom: 1.5rem;">
                    <table style="width:100%; border-collapse: collapse; font-size:0.85rem; background: white; border: 1px solid var(--border);">
                        <thead>
                            <tr style="border-bottom: 1px solid var(--border); color: var(--text-muted); background: #f1f5f9;">
                                <th style="padding:0.6rem; text-align:left; width:50%; font-weight:600; font-size:0.75rem; letter-spacing:0.5px;">EXIGIDA</th>
                                <th style="padding:0.6rem; text-align:left; width:35%; font-weight:600; font-size:0.75rem; letter-spacing:0.5px;">VALOR REQUERIDO</th>
                                <th style="padding:0.6rem; text-align:center; width:15%; font-weight:600; font-size:0.75rem; letter-spacing:0.5px;">VERIFICADO</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Resistencia térmica -->
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding:0.6rem;">Resistencia térmica (m²K/W)</td>
                                <td style="padding:0.4rem;">
                                    <input type="text" class="form-control ra-res-termica-val" data-idx="${index}" value="${escHtml(inst.res_termica_val || '')}" style="background:#f8fafc; border:none; width:100%; padding:0.4rem;" placeholder="Ej. ≥ 2,50 m²K/W">
                                </td>
                                <td style="padding:0.6rem; text-align:center;">
                                    <input type="checkbox" class="ra-res-termica-chk" data-idx="${index}" ${inst.res_termica_chk ? 'checked' : ''} style="width:1.2rem; height:1.2rem; cursor:pointer;">
                                </td>
                            </tr>
                            <!-- Espesor -->
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding:0.6rem;">Espesor (mm / m)</td>
                                <td style="padding:0.4rem;">
                                    <input type="text" class="form-control ra-espesor-val" data-idx="${index}" value="${escHtml(inst.espesor_val || '')}" style="background:#f8fafc; border:none; width:100%; padding:0.4rem;" placeholder="Ej. 80 mm">
                                </td>
                                <td style="padding:0.6rem; text-align:center;">
                                    <input type="checkbox" class="ra-espesor-chk" data-idx="${index}" ${inst.espesor_chk ? 'checked' : ''} style="width:1.2rem; height:1.2rem; cursor:pointer;">
                                </td>
                            </tr>
                            <!-- Conductividad térmica -->
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding:0.6rem;">Conductividad térmica λ (W/mK)</td>
                                <td style="padding:0.4rem;">
                                    <input type="text" class="form-control ra-cond-termica-val" data-idx="${index}" value="${escHtml(inst.cond_termica_val || '')}" style="background:#f8fafc; border:none; width:100%; padding:0.4rem;" placeholder="Ej. ≤ 0,035 W/mK">
                                </td>
                                <td style="padding:0.6rem; text-align:center;">
                                    <input type="checkbox" class="ra-cond-termica-chk" data-idx="${index}" ${inst.cond_termica_chk ? 'checked' : ''} style="width:1.2rem; height:1.2rem; cursor:pointer;">
                                </td>
                            </tr>
                            <!-- Reacción al fuego -->
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding:0.6rem;">Reacción al fuego</td>
                                <td style="padding:0.4rem;">
                                    <input type="text" class="form-control ra-reaccion-fuego-val" data-idx="${index}" value="${escHtml(inst.reaccion_fuego_val || '')}" style="background:#f8fafc; border:none; width:100%; padding:0.4rem;" placeholder="Ej. A1, B-s1,d0, E...">
                                </td>
                                <td style="padding:0.6rem; text-align:center;">
                                    <input type="checkbox" class="ra-reaccion-fuego-chk" data-idx="${index}" ${inst.reaccion_fuego_chk ? 'checked' : ''} style="width:1.2rem; height:1.2rem; cursor:pointer;">
                                </td>
                            </tr>
                            <!-- Resistencia al flujo del aire -->
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding:0.6rem;">Resistencia flujo del aire (kPa·s/m²)</td>
                                <td style="padding:0.4rem;">
                                    <input type="text" class="form-control ra-res-flujo-val" data-idx="${index}" value="${escHtml(inst.res_flujo_val || '')}" style="background:#f8fafc; border:none; width:100%; padding:0.4rem;" placeholder="Ej. ≥ 5 kPa·s/m²">
                                </td>
                                <td style="padding:0.6rem; text-align:center;">
                                    <input type="checkbox" class="ra-res-flujo-chk" data-idx="${index}" ${inst.res_flujo_chk ? 'checked' : ''} style="width:1.2rem; height:1.2rem; cursor:pointer;">
                                </td>
                            </tr>
                            <!-- Resistencia a compresión -->
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding:0.6rem;">Resistencia a compresión (kPa)</td>
                                <td style="padding:0.4rem;">
                                    <input type="text" class="form-control ra-res-compresion-val" data-idx="${index}" value="${escHtml(inst.res_compresion_val || '')}" style="background:#f8fafc; border:none; width:100%; padding:0.4rem;" placeholder="Ej. ≥ 300 kPa">
                                </td>
                                <td style="padding:0.6rem; text-align:center;">
                                    <input type="checkbox" class="ra-res-compresion-chk" data-idx="${index}" ${inst.res_compresion_chk ? 'checked' : ''} style="width:1.2rem; height:1.2rem; cursor:pointer;">
                                </td>
                            </tr>
                            <!-- No hidrófilo -->
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding:0.6rem;">No hidrófilo</td>
                                <td style="padding:0.4rem;">
                                    <select class="form-control ra-no-hidrofilo-val" data-idx="${index}" style="background:#f8fafc; border:none; width:100%; padding:0.4rem;">
                                        <option value="" ${inst.no_hidrofilo_val === '' ? 'selected' : ''}></option>
                                        <option value="Sí" ${inst.no_hidrofilo_val === 'Sí' ? 'selected' : ''}>Sí</option>
                                        <option value="No" ${inst.no_hidrofilo_val === 'No' ? 'selected' : ''}>No</option>
                                    </select>
                                </td>
                                <td style="padding:0.6rem; text-align:center;">
                                    <input type="checkbox" class="ra-no-hidrofilo-chk" data-idx="${index}" ${inst.no_hidrofilo_chk ? 'checked' : ''} style="width:1.2rem; height:1.2rem; cursor:pointer;">
                                </td>
                            </tr>
                            <!-- Otra característica -->
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding:0.4rem;">
                                    <input type="text" class="form-control ra-otra-ex" data-idx="${index}" value="${escHtml(inst.otra_exigida || '')}" placeholder="Otra (especificar)..." style="border:none; width:100%; padding:0.4rem; font-size:0.85rem;">
                                </td>
                                <td style="padding:0.4rem;">
                                    <input type="text" class="form-control ra-otra-val" data-idx="${index}" value="${escHtml(inst.otra_val || '')}" style="background:#f8fafc; border:none; width:100%; padding:0.4rem;" placeholder="Valor requerido">
                                </td>
                                <td style="padding:0.6rem; text-align:center;">
                                    <input type="checkbox" class="ra-otra-chk" data-idx="${index}" ${inst.otra_chk ? 'checked' : ''} style="width:1.2rem; height:1.2rem; cursor:pointer;">
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;

            // Checklist Documental
            html += `<h4 class="unified-title" style="margin-top:1rem; font-size:1rem;">Relación de Documentación Exigible</h4>`;
            html += `<div style="overflow-x:auto;"><table style="width:100%; border-collapse: collapse; font-size:0.85rem; min-width: 600px; background: white; border: 1px solid var(--border);">
                <thead><tr style="background:#f1f5f9; border-bottom: 1px solid var(--border);">
                    <th style="width:15%; border:1px solid var(--border); padding:0.4rem; font-weight:600; font-size:0.75rem;">Fase</th>
                    <th style="width:45%; text-align:left; border:1px solid var(--border); padding:0.4rem; font-weight:600; font-size:0.75rem;">Documento / Certificado</th>
                    <th style="width:20%; border:1px solid var(--border); padding:0.4rem; font-weight:600; font-size:0.75rem;">Estado</th>
                    <th style="width:20%; border:1px solid var(--border); padding:0.4rem; font-weight:600; font-size:0.75rem;">Fecha</th>
                </tr></thead><tbody>`;

            documentosRequeridos.forEach((doc) => {
                if (!inst.checks[doc.id]) inst.checks[doc.id] = { status: "", date: "" };
                
                // Color fase
                let phaseColor = "var(--text-muted)";
                if (doc.phase === "Previo") phaseColor = "#b45309"; // amber-700
                if (doc.phase === "Durante") phaseColor = "#0f766e"; // teal-700
                if (doc.phase === "Final") phaseColor = "#1d4ed8"; // blue-700

                let nameHtml = `<strong>${doc.name}</strong><br><span style="color:var(--text-muted); font-size:0.8rem;">${doc.desc || ''}</span>`;
                if (doc.isOther) {
                    nameHtml = `<input type="text" class="ra-custom-label form-control" data-uid="${inst.uid}" data-docid="${doc.id}" placeholder="Otros (especificar)..." value="${escHtml(inst.checks[doc.id].label || '')}" style="width:100%; padding:0.2rem; margin:0; font-size: 0.85rem; border:none; background:transparent; font-weight:600;">`;
                }

                html += `<tr>
                    <td style="border:1px solid var(--border); padding:0.4rem; text-align:center; font-weight:bold; color:${phaseColor};">${doc.phase}</td>
                    <td style="border:1px solid var(--border); padding:0.4rem;">
                        ${nameHtml}
                    </td>
                    <td style="border:1px solid var(--border); padding:0.4rem;">
                        <select class="ra-status form-control" data-uid="${inst.uid}" data-docid="${doc.id}" style="width:100%; padding:0.2rem; margin:0;">
                            <option value="" ${inst.checks[doc.id].status === '' ? 'selected' : ''}></option>
                            <option value="Entregado" ${['Entregado','Aceptado'].includes(inst.checks[doc.id].status) ? 'selected' : ''}>Entregado</option>
                            <option value="Pendiente" ${inst.checks[doc.id].status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="No procede" ${['No procede','No Entregado'].includes(inst.checks[doc.id].status) ? 'selected' : ''}>No procede</option>
                        </select>
                    </td>
                    <td style="border:1px solid var(--border); padding:0.4rem;">
                        <input type="date" class="ra-date form-control" data-uid="${inst.uid}" data-docid="${doc.id}" value="${escHtml(inst.checks[doc.id].date)}" style="width:100%; padding:0.2rem; margin:0;">
                    </td>
                </tr>`;
            });

            html += `</tbody></table></div>`;
            block.innerHTML = html;
            wrapper.appendChild(block);
        });

        // Asignar eventos tras renderizado
        wrapper.querySelectorAll('.ra-name').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].customName = e.target.value;
            });
        });

        wrapper.querySelectorAll('.ra-tipo').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].tipoAislante = e.target.value;
            });
        });

        wrapper.querySelectorAll('.ra-ubic').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].ubicacion = e.target.value;
            });
        });

        // Características
        wrapper.querySelectorAll('.ra-res-termica-val').forEach(el => {
            el.addEventListener('change', (e) => data.instances[e.target.dataset.idx].res_termica_val = e.target.value);
        });
        wrapper.querySelectorAll('.ra-res-termica-chk').forEach(el => {
            el.addEventListener('change', (e) => data.instances[e.target.dataset.idx].res_termica_chk = e.target.checked);
        });

        wrapper.querySelectorAll('.ra-espesor-val').forEach(el => {
            el.addEventListener('change', (e) => data.instances[e.target.dataset.idx].espesor_val = e.target.value);
        });
        wrapper.querySelectorAll('.ra-espesor-chk').forEach(el => {
            el.addEventListener('change', (e) => data.instances[e.target.dataset.idx].espesor_chk = e.target.checked);
        });

        wrapper.querySelectorAll('.ra-cond-termica-val').forEach(el => {
            el.addEventListener('change', (e) => data.instances[e.target.dataset.idx].cond_termica_val = e.target.value);
        });
        wrapper.querySelectorAll('.ra-cond-termica-chk').forEach(el => {
            el.addEventListener('change', (e) => data.instances[e.target.dataset.idx].cond_termica_chk = e.target.checked);
        });

        wrapper.querySelectorAll('.ra-reaccion-fuego-val').forEach(el => {
            el.addEventListener('change', (e) => data.instances[e.target.dataset.idx].reaccion_fuego_val = e.target.value);
        });
        wrapper.querySelectorAll('.ra-reaccion-fuego-chk').forEach(el => {
            el.addEventListener('change', (e) => data.instances[e.target.dataset.idx].reaccion_fuego_chk = e.target.checked);
        });

        wrapper.querySelectorAll('.ra-res-flujo-val').forEach(el => {
            el.addEventListener('change', (e) => data.instances[e.target.dataset.idx].res_flujo_val = e.target.value);
        });
        wrapper.querySelectorAll('.ra-res-flujo-chk').forEach(el => {
            el.addEventListener('change', (e) => data.instances[e.target.dataset.idx].res_flujo_chk = e.target.checked);
        });

        wrapper.querySelectorAll('.ra-res-compresion-val').forEach(el => {
            el.addEventListener('change', (e) => data.instances[e.target.dataset.idx].res_compresion_val = e.target.value);
        });
        wrapper.querySelectorAll('.ra-res-compresion-chk').forEach(el => {
            el.addEventListener('change', (e) => data.instances[e.target.dataset.idx].res_compresion_chk = e.target.checked);
        });

        wrapper.querySelectorAll('.ra-no-hidrofilo-val').forEach(el => {
            el.addEventListener('change', (e) => data.instances[e.target.dataset.idx].no_hidrofilo_val = e.target.value);
        });
        wrapper.querySelectorAll('.ra-no-hidrofilo-chk').forEach(el => {
            el.addEventListener('change', (e) => data.instances[e.target.dataset.idx].no_hidrofilo_chk = e.target.checked);
        });

        wrapper.querySelectorAll('.ra-otra-ex').forEach(el => {
            el.addEventListener('change', (e) => data.instances[e.target.dataset.idx].otra_exigida = e.target.value);
        });
        wrapper.querySelectorAll('.ra-otra-val').forEach(el => {
            el.addEventListener('change', (e) => data.instances[e.target.dataset.idx].otra_val = e.target.value);
        });
        wrapper.querySelectorAll('.ra-otra-chk').forEach(el => {
            el.addEventListener('change', (e) => data.instances[e.target.dataset.idx].otra_chk = e.target.checked);
        });

        wrapper.querySelectorAll('.ra-btn-remove').forEach(el => {
            el.addEventListener('click', (e) => {
                appConfirm("¿Eliminar este tipo de aislante y su control documental?", () => {
                    data.instances.splice(e.target.dataset.idx, 1);
                    renderAll();
                });
            });
        });

        wrapper.querySelectorAll('.ra-status').forEach(el => {
            el.addEventListener('change', (e) => {
                const inst = data.instances.find(i => i.uid === e.target.dataset.uid);
                if (inst) inst.checks[e.target.dataset.docid].status = e.target.value;
            });
        });

        wrapper.querySelectorAll('.ra-date').forEach(el => {
            el.addEventListener('change', (e) => {
                const inst = data.instances.find(i => i.uid === e.target.dataset.uid);
                if (inst) inst.checks[e.target.dataset.docid].date = e.target.value;
            });
        });

        wrapper.querySelectorAll('.ra-custom-label').forEach(el => {
            el.addEventListener('change', (e) => {
                const inst = data.instances.find(i => i.uid === e.target.dataset.uid);
                if (inst) inst.checks[e.target.dataset.docid].label = e.target.value;
            });
        });


    }

    renderAll();
};
