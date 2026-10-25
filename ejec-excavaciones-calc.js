window.renderEjecExcavacionesCalc = function(container, materialId) {
    const projectData = currentProject;
    if (!projectData.formData) projectData.formData = {};
    if (!projectData.formData[materialId] || !projectData.formData[materialId].instances) {
        projectData.formData[materialId] = {
            instances: [],
            observaciones: '',
            laboratorios: ''
        };
    }
    
    const data = projectData.formData[materialId];

    const controlesExcavaciones = [
        "Replanteo. Comprobación perímetro excavación, distancias a linderos y cota fondo excavación",
        "Comprobación coincidencia terreno con previsiones estudio geotécnico",
        "Verificación de posibles servicios afectados. En caso afirmativo, señalización, desvío, etc.",
        "Estabilidad de taludes. Ángulo de talud según estudio geotécnico",
        "Ausencia de cargas sobre bordes de taludes",
        "Revisión edificios colindantes",
        "Sistemas de drenaje en presencia de agua.",
        "Gestión de tierras según plan de residuos"
    ];

    const controlesRellenos = [
        "Comprobación de material de relleno. Tipo y granulometría",
        "Espesor de las tongadas y sistema de compactación",
        "Ausencia de restos de obra, orgánicos, plásticos, etc."
    ];

    container.innerHTML = `
        <div class="card" style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem;">
                <h2>Control de Ejecución: Excavaciones</h2>
                <button id="ex-btn-add" class="btn btn-primary" style="font-size: 0.9rem;">+ Añadir zona de control</button>
            </div>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">Añade zonas de control e indica si se trata de la fase de Excavaciones o de Rellenos.</p>
            
            <div id="ex-instances-container"></div>
            
            <div style="margin-top: 2rem; border-top: 2px solid var(--border); padding-top: 1rem;">
                <h4 style="font-size: 0.95rem; font-weight: bold; margin-bottom: 0.5rem; color: var(--text-main);">Observaciones generales</h4>
                <textarea id="ex-obs" class="form-control" style="width:100%; min-height:80px; resize:vertical;">${escHtml(data.observaciones || '')}</textarea>
                
                <h4 style="font-size: 0.95rem; font-weight: bold; margin-bottom: 0.5rem; margin-top: 1rem; color: var(--text-main);">Laboratorios intervinientes / Entidades de control</h4>
                <textarea id="ex-lab" class="form-control" style="width:100%; min-height:60px; resize:vertical;">${escHtml(data.laboratorios || '')}</textarea>
            </div>
        </div>
    `;

    const btnAdd = container.querySelector('#ex-btn-add');
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            data.instances.push({
                uid: Date.now().toString(),
                customName: `Zona ${data.instances.length + 1}`,
                ubicacion: '',
                tipo: '',
                checks: {}
            });
            renderAll();
        });
    }

    const obsNode = container.querySelector('#ex-obs');
    if (obsNode) obsNode.addEventListener('change', (e) => data.observaciones = e.target.value);
    const labNode = container.querySelector('#ex-lab');
    if (labNode) labNode.addEventListener('change', (e) => data.laboratorios = e.target.value);

    function getControlesForTipo(tipo) {
        if (tipo === 'Excavaciones' || tipo === 'Fase excavación') return controlesExcavaciones;
        if (tipo === 'Rellenos' || tipo === 'Fase rellenos') return controlesRellenos;
        return [];
    }

    function initChecksForType(inst) {
        inst.checks = {};
        const lista = getControlesForTipo(inst.tipo);
        
        if (window.CustomControlsManager) {
            window.CustomControlsManager.prepareChecks(inst, materialId, inst.tipo || '', lista);
        } else {
            lista.forEach((c, idx) => {
                inst.checks['chk_' + idx] = { val: '', obs: '', date: '', name: c };
            });
        }
    }

    function renderAll() {
        const wrapper = container.querySelector('#ex-instances-container');
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
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem; gap: 1rem;">
                    <input type="text" class="form-control ex-name" data-idx="${index}" value="${escHtml(inst.customName)}" placeholder="Identificador..." style="font-weight:bold; font-size:1.1rem; border-color:var(--primary); flex: 1;">
                    <input type="date" class="form-control ex-zonadate" data-idx="${index}" value="${escHtml(inst.zonaDate || '')}" style="width: 150px; padding: 0.4rem; font-weight: bold; border-color: var(--primary);" title="Fecha del control">
                    <button class="btn ex-btn-remove" data-idx="${index}" style="margin-left:1rem; color: #dc2626; border: 1px solid #dc2626; background:transparent;">Eliminar</button>
                </div>
            `;

            html += `
                <div class="dynamic-grid" style="margin-bottom: 1.5rem; gap: 1rem;">
                    <div>
                        <label class="form-label">Ubicación / Nivel</label>
                        <input type="text" class="form-control ex-ubic" data-idx="${index}" value="${escHtml(inst.ubicacion || '')}" placeholder="Ej. Vaciado sótano, Trasdós muros...">
                    </div>
                    <div>
                        <label class="form-label">Fase</label>
                        <select class="form-control ex-tipo" data-idx="${index}">
                            <option value="" ${inst.tipo === '' ? 'selected' : ''}>Seleccione fase...</option>
                            <option value="Excavaciones" ${(inst.tipo === 'Excavaciones' || inst.tipo === 'Fase excavación') ? 'selected' : ''}>Excavaciones</option>
                            <option value="Rellenos" ${(inst.tipo === 'Rellenos' || inst.tipo === 'Fase rellenos') ? 'selected' : ''}>Rellenos</option>
                        </select>
                    </div>
                </div>
            `;

            if (inst.tipo !== '') {
                const listaControles = getControlesForTipo(inst.tipo);
                
                if (!inst.checks) inst.checks = {};
                const items = window.CustomControlsManager
                    ? window.CustomControlsManager.prepareChecks(inst, materialId, inst.tipo, listaControles)
                    : listaControles.map((c, idx) => {
                        const cId = 'chk_' + idx;
                        if (!inst.checks[cId]) inst.checks[cId] = { val: '', obs: '', date: '', name: c };
                        if (inst.checks[cId].name === undefined) inst.checks[cId].name = c;
                        return { cId: cId, name: c, isBase: c !== "Otros", isOtros: c === "Otros" };
                    });

                let usedCount = 0;
                items.forEach(it => {
                    const cId = it.cId;
                    const chk = inst.checks[cId] || {};
                    const cVal = chk.val || '';
                    const cObs = chk.obs || '';
                    const cDate = chk.date || '';
                    const cName = chk.name || it.name;
                    if (cVal !== "" || cObs !== "" || cDate !== "" || (it.isOtros && cName !== "Otros" && cName !== "") || it.isCustom) usedCount++;
                });
                const hideUnused = false;

                html += `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem; margin-top: 1.5rem; gap: 0.5rem; flex-wrap: wrap;">
                    <h4 style="font-size: 0.95rem; font-weight: bold; color: var(--primary); border-bottom: 2px solid var(--primary); display: inline-block; padding-bottom: 0.2rem; margin:0;">Puntos de Inspección</h4>
                    <div style="display:flex; align-items:center; gap: 0.5rem;">
                        ${window.CustomControlsManager ? window.CustomControlsManager.renderAddPointButton(index, 'ex') : ''}
                        <button type="button" class="btn ex-btn-fill-all" data-idx="${index}" style="font-size:0.8rem; padding:0.25rem 0.6rem; background:#10b981; color:white; border:none; border-radius:4px; font-weight:600; cursor:pointer; white-space:nowrap;" title="Poner 'Correcto' y fecha de hoy en todos los puntos de esta zona">✓ Todo Correcto hoy</button>
                        <button class="btn" style="font-size:0.8rem; padding:0.25rem 0.5rem; border:1px solid var(--border); white-space:nowrap;" onclick="var card = this.closest('div[style*=\\'border\\']'); var rows = card.querySelectorAll('.unused-row'); var isHidden = rows[0] && rows[0].style.display === 'none'; Array.from(rows).forEach(r => r.style.display = isHidden ? 'table-row' : 'none'); this.innerText = isHidden ? 'Ocultar vacíos' : 'Mostrar vacíos';">${hideUnused ? 'Mostrar vacíos' : 'Ocultar vacíos'}</button>
                    </div>
                </div>
                <div class="table-container" style="margin-bottom: 1.5rem;">
                    <table style="width:100%; border-collapse: collapse; font-size:0.85rem; background: white; border: 1px solid var(--border);">
                        <thead>
                            <tr style="border-bottom: 1px solid var(--border); color: var(--text-muted); background: #f1f5f9;">
                                <th style="padding:0.6rem; text-align:left; width:45%; font-weight:600; font-size:0.75rem;">PUNTO DE INSPECCIÓN</th>
                                <th style="padding:0.6rem; text-align:left; width:15%; font-weight:600; font-size:0.75rem;">FECHA</th>
                                <th style="padding:0.6rem; text-align:left; width:15%; font-weight:600; font-size:0.75rem;">RESULTADO</th>
                                <th style="padding:0.6rem; text-align:left; width:25%; font-weight:600; font-size:0.75rem;">OBSERVACIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                items.forEach(it => {
                    const cId = it.cId;
                    const chk = inst.checks[cId] || { val: '', obs: '', date: '', name: it.name };
                    const cVal = chk.val || '';
                    const cName = chk.name !== undefined ? chk.name : it.name;
                    const cObs = chk.obs || '';
                    const cDate = chk.date || '';
                    
                    const isUsed = cVal !== "" || cObs !== "" || cDate !== "" || (it.isOtros && cName !== "Otros" && cName !== "") || it.isCustom;
                    const displayStyle = (hideUnused && !isUsed) ? 'display: none;' : 'display: table-row;';
                    const trClass = isUsed ? '' : 'unused-row';

                    let nameHtml = window.CustomControlsManager
                        ? window.CustomControlsManager.renderPointCell(inst, index, it, 'ex', materialId, inst.tipo)
                        : (it.isOtros ? `<input type="text" class="form-control ex-chk-name" data-idx="${index}" data-cid="${cId}" value="${escHtml(cName)}" placeholder="Otros (especificar)..." style="border:none; width:100%; padding:0.2rem; font-size:0.85rem; background:transparent;">` : cName);

                    html += `
                        <tr class="${trClass}" style="border-bottom: 1px solid var(--border); ${displayStyle}">
                            <td style="padding:0.6rem;">${nameHtml}</td>
                            <td style="padding:0.4rem;">
                                <input type="date" class="form-control ex-chk-date" data-idx="${index}" data-cid="${cId}" value="${escHtml(cDate)}" style="padding:0.3rem; font-size:0.85rem; border:none; background:#f8fafc; width:100%;">
                            </td>
                            <td style="padding:0.4rem;">
                                <select class="form-control ex-chk-sel" data-idx="${index}" data-cid="${cId}" style="padding:0.3rem; font-size:0.85rem; width:100%;">
                                    <option value="" ${cVal === '' ? 'selected' : ''}></option>
                                    <option value="Correcto" ${cVal === 'Correcto' ? 'selected' : ''}>Correcto</option>
                                    <option value="No Correcto" ${cVal === 'No Correcto' ? 'selected' : ''}>No Correcto</option>
                                    <option value="No procede" ${cVal === 'No procede' ? 'selected' : ''}>No procede</option>
                                </select>
                            </td>
                            <td style="padding:0.4rem;">
                                <input type="text" class="form-control ex-chk-obs" data-idx="${index}" data-cid="${cId}" value="${escHtml(cObs)}" placeholder="Observaciones..." style="background:#f8fafc; border:none; width:100%; padding:0.4rem; font-size:0.85rem;">
                            </td>
                        </tr>
                    `;
                });

                html += `
                            </tbody>
                        </table>
                    </div>
                `;
            } else {
                html += `<p style="font-size:0.85rem; color:var(--text-muted); font-style:italic;">Selecciona una fase (Excavaciones o Rellenos) para cargar los puntos de inspección.</p>`;
            }

            block.innerHTML = html;
            wrapper.appendChild(block);
        });

        wrapper.querySelectorAll('.ex-name').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].customName = e.target.value;
            });
        });

        wrapper.querySelectorAll('.ex-zonadate').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].zonaDate = e.target.value;
            });
        });

        wrapper.querySelectorAll('.ex-btn-remove').forEach(el => el.addEventListener('click', e => { 
            if (confirm("¿Eliminar zona de control?")) {
                data.instances.splice(e.target.dataset.idx, 1);
                renderAll();
            }
        }));
        
        wrapper.querySelectorAll('.ex-ubic').forEach(el => el.addEventListener('change', e => { 
            data.instances[e.target.dataset.idx].ubicacion = e.target.value; 
        }));

        wrapper.querySelectorAll('.ex-tipo').forEach(el => el.addEventListener('change', e => { 
            const idx = e.target.dataset.idx;
            const newTipo = e.target.value;
            if (data.instances[idx].tipo !== newTipo) {
                data.instances[idx].tipo = newTipo;
                initChecksForType(data.instances[idx]);
                renderAll();
            }
        }));
        
        wrapper.querySelectorAll('.ex-chk-date').forEach(el => el.addEventListener('change', e => { 
            data.instances[e.target.dataset.idx].checks[e.target.dataset.cid].date = e.target.value; 
        }));
        wrapper.querySelectorAll('.ex-chk-sel').forEach(el => el.addEventListener('change', e => { 
            const idx = e.target.dataset.idx;
            const cid = e.target.dataset.cid;
            data.instances[idx].checks[cid].val = e.target.value;
            if (e.target.value && !data.instances[idx].checks[cid].date) {
                const today = new Date().toISOString().split('T')[0];
                data.instances[idx].checks[cid].date = today;
                const dInp = wrapper.querySelector(`.ex-chk-date[data-idx="${idx}"][data-cid="${cid}"]`);
                if (dInp) dInp.value = today;
            }
        }));
        wrapper.querySelectorAll('.ex-chk-obs').forEach(el => el.addEventListener('change', e => { 
            data.instances[e.target.dataset.idx].checks[e.target.dataset.cid].obs = e.target.value; 
        }));
        wrapper.querySelectorAll('.ex-chk-name').forEach(el => el.addEventListener('change', e => { 
            data.instances[e.target.dataset.idx].checks[e.target.dataset.cid].name = e.target.value; 
        }));

        wrapper.querySelectorAll('.ex-btn-fill-all').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.dataset.idx;
                const inst = data.instances[idx];
                if (!inst) return;
                const blockDiv = e.target.closest('div[style*="border"]');
                const isUndo = btn.dataset.state === 'undo';

                if (!isUndo) {
                    btn._backup = {
                        zonaDate: inst.zonaDate || "",
                        checks: JSON.parse(JSON.stringify(inst.checks || {}))
                    };

                    const today = new Date().toISOString().split('T')[0];

                    if (!inst.zonaDate) {
                        inst.zonaDate = today;
                        if (blockDiv) {
                            const dateHeaderInput = blockDiv.querySelector('.ex-zonadate');
                            if (dateHeaderInput) {
                                dateHeaderInput.value = today;
                                dateHeaderInput.setAttribute('value', today);
                            }
                        }
                    }

                    Object.keys(inst.checks).forEach(cId => {
                        if (cId.startsWith('_')) return;
                        inst.checks[cId].val = 'Correcto';
                        inst.checks[cId].date = today;
                        if (blockDiv) {
                            const sel = blockDiv.querySelector(`.ex-chk-sel[data-cid="${cId}"]`);
                            if (sel) sel.value = 'Correcto';
                            const dt = blockDiv.querySelector(`.ex-chk-date[data-cid="${cId}"]`);
                            if (dt) {
                                dt.value = today;
                                dt.setAttribute('value', today);
                            }
                        }
                    });

                    if (blockDiv) {
                        blockDiv.querySelectorAll('.unused-row').forEach(tr => {
                            tr.style.display = 'table-row';
                            tr.classList.remove('unused-row');
                        });
                    }

                    btn.dataset.state = 'undo';
                    btn.innerHTML = '↺ Deshacer todo';
                    btn.style.background = '#64748b';
                    btn.title = 'Deshacer y volver al estado anterior';
                } else {
                    const backup = btn._backup;
                    if (backup) {
                        inst.zonaDate = backup.zonaDate;
                        if (blockDiv) {
                            const dateHeaderInput = blockDiv.querySelector('.ex-zonadate');
                            if (dateHeaderInput) {
                                dateHeaderInput.value = backup.zonaDate;
                                dateHeaderInput.setAttribute('value', backup.zonaDate);
                            }
                        }
                        inst.checks = JSON.parse(JSON.stringify(backup.checks));

                        Object.keys(inst.checks).forEach(cId => {
                            if (cId.startsWith('_')) return;
                            const prev = inst.checks[cId] || { val: '', obs: '', date: '' };
                            if (blockDiv) {
                                const sel = blockDiv.querySelector(`.ex-chk-sel[data-cid="${cId}"]`);
                                if (sel) sel.value = prev.val || "";
                                const dt = blockDiv.querySelector(`.ex-chk-date[data-cid="${cId}"]`);
                                if (dt) {
                                    dt.value = prev.date || "";
                                    dt.setAttribute('value', prev.date || "");
                                }
                                const obs = blockDiv.querySelector(`.ex-chk-obs[data-cid="${cId}"]`);
                                if (obs) obs.value = prev.obs || "";
                                const tr = sel ? sel.closest('tr') : null;
                                if (tr) {
                                    const isUsed = (prev.val && prev.val !== "") || (prev.obs && prev.obs !== "") || (prev.date && prev.date !== "") || (prev.name && prev.name !== "Otros" && prev.name !== "");
                                    if (!isUsed) tr.classList.add('unused-row');
                                    else tr.classList.remove('unused-row');
                                }
                            }
                        });
                    } else {
                        Object.keys(inst.checks).forEach(cId => {
                            if (cId.startsWith('_')) return;
                            inst.checks[cId].val = "";
                            inst.checks[cId].date = "";
                            if (blockDiv) {
                                const sel = blockDiv.querySelector(`.ex-chk-sel[data-cid="${cId}"]`);
                                if (sel) sel.value = "";
                                const dt = blockDiv.querySelector(`.ex-chk-date[data-cid="${cId}"]`);
                                if (dt) {
                                    dt.value = "";
                                    dt.setAttribute('value', "");
                                }
                                const obs = blockDiv.querySelector(`.ex-chk-obs[data-cid="${cId}"]`);
                                if (obs) obs.value = "";
                                const tr = sel ? sel.closest('tr') : null;
                                if (tr) tr.classList.add('unused-row');
                            }
                        });
                    }

                    btn.dataset.state = 'fill';
                    btn.innerHTML = '✓ Todo Correcto hoy';
                    btn.style.background = '#10b981';
                    btn.title = 'Poner "Correcto" y fecha de hoy en todos los puntos de esta zona';
                }
            });
        });

        if (window.CustomControlsManager) {
            window.CustomControlsManager.bindCustomEvents(wrapper, data, materialId, inst => inst.tipo, renderAll, 'ex');
        }
    }

    renderAll();
};
