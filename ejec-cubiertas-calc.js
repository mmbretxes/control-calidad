window.renderEjecCubiertasCalc = function(container, materialId) {
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

    const controlesPlana = [
        "Replanteo pendientes, bajantes y pasos de instalaciones",
        "Pendientes máximas y mínimas",
        "Disposición de capas previstas en proyecto",
        "Ajuste de planchas de aislamiento (sin discontinuidades)",
        "Material de aislamiento, grosor y conductividad termica según proyecto",
        "Resolución y encuentros de puntos singulares",
        "Juntas de dilatación, disposición, material y profundidad",
        "Tipo de impermeabilización según proyecto",
        "Capas previstas en impermeabilizaciones líquidas",
        "Solapes de la impermeabilización en dirección pendiente y ancho solape",
        "Encuentros con paramentos verticales de la impermeabilización",
        "Radio curvatura impermeabilización o chaflán mínimo 5 cm",
        "Roza en paramento vertical para encuentro impermeabilización",
        "Encuentros con bordes libres de la impermeabilización",
        "Encuentros con sumideros: rebaje del soporte para evitar contrapendientes.",
        "Sumidero con sistema de retención de sólidos",
        "Colocación de rebosaderos",
        "Cubiertas de grava: disposición del geotextil",
        "Cubiertas de grava: espesor y tamaño de la grava",
        "Antepechos y albardillas: vierteaguas impermeable o provisto de barrera impermeable con goterón",
        "Altura libre de pretiles según proyecto"
    ];

    const controlesInclinada = [
        "Replanteo tabiquillos y pendientes",
        "Replanteo viguetas y encuentros con apoyos",
        "Fábrica según especificaciones de proyecto",
        "Bovedillas planas previstas según control de recepcion",
        "Colocación de impermeabilización si procede",
        "Solapes de la impermeabilización en dirección pendiente y ancho solape",
        "Encuentros con paramentos verticales de la impermeabilización",
        "Roza en paramento vertical para encuentro impermeabilización",
        "Disposición de aperturas de ventilación de camara de aire",
        "Disposición de aislamiento cuando proceda.",
        "Tejas: grado de humectación de las piezas",
        "Tejas: solape, amorterado, encuentro con paramentos verticales",
        "Tejas: bandas completamente amorteradas",
        "Tejas: vuelo del alero",
        "Piezas especiales en cumbreras, limatesas y limahoyas"
    ];

    container.innerHTML = `
        <div class="card" style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem;">
                <h2>Control de Ejecución: Cubiertas</h2>
                <button id="ec-btn-add" class="btn btn-primary" style="font-size: 0.9rem;">+ Añadir zona de control</button>
            </div>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">Añade zonas de control e indica si se trata de una cubierta plana o inclinada.</p>
            
            <div id="ec-instances-container"></div>
            
            <div style="margin-top: 2rem; border-top: 2px solid var(--border); padding-top: 1rem;">
                <h4 style="font-size: 0.95rem; font-weight: bold; margin-bottom: 0.5rem; color: var(--text-main);">Observaciones generales</h4>
                <textarea id="ec-obs" class="form-control" style="width:100%; min-height:80px; resize:vertical;">${escHtml(data.observaciones || '')}</textarea>
                
                <h4 style="font-size: 0.95rem; font-weight: bold; margin-bottom: 0.5rem; margin-top: 1rem; color: var(--text-main);">Laboratorios intervinientes / Entidades de control</h4>
                <textarea id="ec-lab" class="form-control" style="width:100%; min-height:60px; resize:vertical;">${escHtml(data.laboratorios || '')}</textarea>
            </div>
        </div>
    `;

    const btnAdd = container.querySelector('#ec-btn-add');
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

    const obsNode = container.querySelector('#ec-obs');
    if(obsNode) obsNode.addEventListener('change', (e) => data.observaciones = e.target.value);
    const labNode = container.querySelector('#ec-lab');
    if(labNode) labNode.addEventListener('change', (e) => data.laboratorios = e.target.value);

    function initChecksForType(inst) {
        inst.checks = {};
        let lista = [];
        if (inst.tipo === 'Plana') lista = controlesPlana;
        else if (inst.tipo === 'Inclinada') lista = controlesInclinada;
        
        if (window.CustomControlsManager) {
            window.CustomControlsManager.prepareChecks(inst, materialId, inst.tipo, lista);
        } else {
            lista.forEach((c, idx) => {
                inst.checks['chk_'+idx] = { val: '', obs: '', date: '', name: c };
            });
        }
    }

    function renderAll() {
        const wrapper = container.querySelector('#ec-instances-container');
        if (!wrapper) return;
        wrapper.innerHTML = '';

        data.instances.forEach((inst, index) => {
            if (inst.tipo === 'Plana' && inst.checks) {
                if (inst.checks['chk_6'] && inst.checks['chk_6'].name && inst.checks['chk_6'].name.toLowerCase().includes("capas previstas en impermeabilizaciones")) {
                    const keys = Object.keys(inst.checks)
                        .filter(k => k.startsWith('chk_'))
                        .map(k => parseInt(k.replace('chk_', ''), 10))
                        .filter(num => !isNaN(num) && num >= 6)
                        .sort((a, b) => b - a);
                    keys.forEach(num => {
                        inst.checks['chk_' + (num + 1)] = inst.checks['chk_' + num];
                    });
                    inst.checks['chk_6'] = { val: '', obs: '', date: '', name: "Tipo de impermeabilización según proyecto" };
                }
            }

            const block = document.createElement('div');
            block.style.border = "1px solid var(--border)";
            block.style.borderRadius = "8px";
            block.style.padding = "1rem";
            block.style.marginBottom = "1.5rem";
            block.style.background = "#f8fafc";

            let html = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem; gap: 1rem;">
                    <input type="text" class="form-control ec-name" data-idx="${index}" value="${escHtml(inst.customName)}" placeholder="Identificador..." style="font-weight:bold; font-size:1.1rem; border-color:var(--primary); flex: 1;">
                    <input type="date" class="form-control ec-zonadate" data-idx="${index}" value="${escHtml(inst.zonaDate || '')}" style="width: 150px; padding: 0.4rem; font-weight: bold; border-color: var(--primary);" title="Fecha del control">
                    <button class="btn ec-btn-remove" data-idx="${index}" style="margin-left:1rem; color: #dc2626; border: 1px solid #dc2626; background:transparent;">Eliminar</button>
                </div>
            `;

            html += `
                <div class="dynamic-grid" style="margin-bottom: 1.5rem; gap: 1rem;">
                    <div>
                        <label class="form-label">Ubicación / Nivel</label>
                        <input type="text" class="form-control ec-ubic" data-idx="${index}" value="${escHtml(inst.ubicacion || '')}" placeholder="Ej. Cubierta principal...">
                    </div>
                    <div>
                        <label class="form-label">Tipo de cubierta</label>
                        <select class="form-control ec-tipo" data-idx="${index}">
                            <option value="" ${inst.tipo===''?'selected':''}>Seleccione tipo...</option>
                            <option value="Plana" ${inst.tipo==='Plana'?'selected':''}>Cubierta Plana / Pretil</option>
                            <option value="Inclinada" ${inst.tipo==='Inclinada'?'selected':''}>Cubierta Inclinada</option>
                        </select>
                    </div>
                </div>
            `;

            if (inst.tipo !== '') {
                let listaControles = inst.tipo === 'Plana' ? controlesPlana : controlesInclinada;
                
                const items = window.CustomControlsManager
                    ? window.CustomControlsManager.prepareChecks(inst, materialId, inst.tipo, listaControles)
                    : listaControles.map((c, i) => ({ cId: 'chk_' + i, name: c, isBase: c !== 'Otros', isOtros: c === 'Otros' }));

                let usedCount = 0;
                items.forEach((it) => {
                    const cId = it.cId;
                    const cVal = (inst.checks[cId] && inst.checks[cId].val) || '';
                    const cObs = (inst.checks[cId] && inst.checks[cId].obs) || '';
                    const cDate = (inst.checks[cId] && inst.checks[cId].date) || '';
                    const cName = (inst.checks[cId] && inst.checks[cId].name !== undefined) ? inst.checks[cId].name : it.name;
                    if (cVal !== "" || cObs !== "" || cDate !== "" || (it.isOtros && cName !== "Otros" && cName !== "") || (it.isCustom && cName !== "")) usedCount++;
                });
                const hideUnused = false;

                html += `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem; margin-top: 1.5rem; gap: 0.5rem; flex-wrap: wrap;">
                    <h4 style="font-size: 0.95rem; font-weight: bold; color: var(--primary); border-bottom: 2px solid var(--primary); display: inline-block; padding-bottom: 0.2rem; margin:0;">Puntos de Inspección</h4>
                    <div style="display:flex; align-items:center; gap: 0.5rem; flex-wrap: wrap;">
                        <button type="button" class="btn ec-btn-fill-all" data-idx="${index}" style="font-size:0.8rem; padding:0.25rem 0.6rem; background:#10b981; color:white; border:none; border-radius:4px; font-weight:600; cursor:pointer; white-space:nowrap;" title="Poner 'Correcto' y fecha de hoy en todos los puntos de esta zona">✓ Todo Correcto hoy</button>
                        ${window.CustomControlsManager ? window.CustomControlsManager.renderAddPointButton(index, 'ec') : ''}
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
                
                items.forEach((it) => {
                    const cId = it.cId;
                    const cVal = (inst.checks[cId] && inst.checks[cId].val) || '';
                    const cName = (inst.checks[cId] && inst.checks[cId].name !== undefined) ? inst.checks[cId].name : it.name;
                    const cObs = (inst.checks[cId] && inst.checks[cId].obs) || '';
                    const cDate = (inst.checks[cId] && inst.checks[cId].date) || '';
                    
                    const isUsed = cVal !== "" || cObs !== "" || cDate !== "" || (it.isOtros && cName !== "Otros" && cName !== "") || (it.isCustom && cName !== "");
                    const displayStyle = (hideUnused && !isUsed) ? 'display: none;' : 'display: table-row;';
                    const trClass = isUsed ? '' : 'unused-row';

                    let nameHtml = window.CustomControlsManager 
                        ? window.CustomControlsManager.renderPointCell(inst, index, it, 'ec', materialId, inst.tipo)
                        : (it.isOtros ? `<input type="text" class="form-control ec-chk-name" data-idx="${index}" data-cid="${cId}" value="${escHtml(cName)}" placeholder="Otros (especificar)..." style="border:none; width:100%; padding:0.2rem; font-size:0.85rem; background:transparent;">` : it.name);

                    html += `
                        <tr class="${trClass}" style="border-bottom: 1px solid var(--border); ${displayStyle}">
                            <td style="padding:0.6rem;">${nameHtml}</td>
                            <td style="padding:0.4rem;">
                                <input type="date" class="form-control ec-chk-date" data-idx="${index}" data-cid="${cId}" value="${escHtml(cDate)}" style="padding:0.3rem; font-size:0.85rem; border:none; background:#f8fafc; width:100%;">
                            </td>
                            <td style="padding:0.4rem;">
                                <select class="form-control ec-chk-sel" data-idx="${index}" data-cid="${cId}" style="padding:0.3rem; font-size:0.85rem; width:100%;">
                                    <option value="" ${cVal===''?'selected':''}></option>
                                    <option value="Correcto" ${cVal==='Correcto'?'selected':''}>Correcto</option>
                                    <option value="No Correcto" ${cVal==='No Correcto'?'selected':''}>No Correcto</option>
                                    <option value="No procede" ${cVal==='No procede'?'selected':''}>No procede</option>
                                </select>
                            </td>
                            <td style="padding:0.4rem;">
                                <input type="text" class="form-control ec-chk-obs" data-idx="${index}" data-cid="${cId}" value="${escHtml(cObs)}" placeholder="Observaciones..." style="background:#f8fafc; border:none; width:100%; padding:0.4rem; font-size:0.85rem;">
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
                html += `<p style="font-size:0.85rem; color:var(--text-muted); font-style:italic;">Selecciona un tipo de cubierta para cargar los puntos de inspección.</p>`;
            }

            block.innerHTML = html;
            wrapper.appendChild(block);
        });

        wrapper.querySelectorAll('.ec-name').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].customName = e.target.value;
            });
        });

        wrapper.querySelectorAll('.ec-zonadate').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].zonaDate = e.target.value;
            });
        });
        wrapper.querySelectorAll('.ec-btn-remove').forEach(el => el.addEventListener('click', e => { 
            if(confirm("¿Eliminar zona de control?")) {
                data.instances.splice(e.target.dataset.idx, 1);
                renderAll();
            }
        }));
        
        wrapper.querySelectorAll('.ec-ubic').forEach(el => el.addEventListener('change', e => { data.instances[e.target.dataset.idx].ubicacion = e.target.value; }));
        wrapper.querySelectorAll('.ec-tipo').forEach(el => el.addEventListener('change', e => { 
            const idx = e.target.dataset.idx;
            const newTipo = e.target.value;
            if (data.instances[idx].tipo !== newTipo) {
                data.instances[idx].tipo = newTipo;
                initChecksForType(data.instances[idx]);
                renderAll();
            }
        }));
        
        wrapper.querySelectorAll('.ec-chk-date').forEach(el => el.addEventListener('change', e => { 
            data.instances[e.target.dataset.idx].checks[e.target.dataset.cid].date = e.target.value; 
        }));
        wrapper.querySelectorAll('.ec-chk-sel').forEach(el => el.addEventListener('change', e => { 
            data.instances[e.target.dataset.idx].checks[e.target.dataset.cid].val = e.target.value; 
        }));
        wrapper.querySelectorAll('.ec-chk-obs').forEach(el => el.addEventListener('change', e => { 
            data.instances[e.target.dataset.idx].checks[e.target.dataset.cid].obs = e.target.value; 
        }));
        wrapper.querySelectorAll('.ec-chk-name').forEach(el => el.addEventListener('change', e => { 
            data.instances[e.target.dataset.idx].checks[e.target.dataset.cid].name = e.target.value; 
        }));

        if (window.CustomControlsManager) {
            window.CustomControlsManager.bindCustomEvents(wrapper, data, materialId, inst => inst.tipo, renderAll, 'ec');
        }

        wrapper.querySelectorAll('.ec-btn-fill-all').forEach(btn => {
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
                            const dateHeaderInput = blockDiv.querySelector('.ec-zonadate');
                            if (dateHeaderInput) {
                                dateHeaderInput.value = today;
                                dateHeaderInput.setAttribute('value', today);
                            }
                        }
                    }

                    Object.keys(inst.checks).forEach(cId => {
                        inst.checks[cId].val = 'Correcto';
                        inst.checks[cId].date = today;
                        if (blockDiv) {
                            const sel = blockDiv.querySelector(`.ec-chk-sel[data-cid="${cId}"]`);
                            if (sel) sel.value = 'Correcto';
                            const dt = blockDiv.querySelector(`.ec-chk-date[data-cid="${cId}"]`);
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
                            const dateHeaderInput = blockDiv.querySelector('.ec-zonadate');
                            if (dateHeaderInput) {
                                dateHeaderInput.value = backup.zonaDate;
                                dateHeaderInput.setAttribute('value', backup.zonaDate);
                            }
                        }
                        inst.checks = JSON.parse(JSON.stringify(backup.checks));

                        Object.keys(inst.checks).forEach(cId => {
                            const prev = inst.checks[cId] || { val: '', obs: '', date: '' };
                            if (blockDiv) {
                                const sel = blockDiv.querySelector(`.ec-chk-sel[data-cid="${cId}"]`);
                                if (sel) sel.value = prev.val || "";
                                const dt = blockDiv.querySelector(`.ec-chk-date[data-cid="${cId}"]`);
                                if (dt) {
                                    dt.value = prev.date || "";
                                    dt.setAttribute('value', prev.date || "");
                                }
                                const obs = blockDiv.querySelector(`.ec-chk-obs[data-cid="${cId}"]`);
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
                            inst.checks[cId].val = "";
                            inst.checks[cId].date = "";
                            if (blockDiv) {
                                const sel = blockDiv.querySelector(`.ec-chk-sel[data-cid="${cId}"]`);
                                if (sel) sel.value = "";
                                const dt = blockDiv.querySelector(`.ec-chk-date[data-cid="${cId}"]`);
                                if (dt) {
                                    dt.value = "";
                                    dt.setAttribute('value', "");
                                }
                                const obs = blockDiv.querySelector(`.ec-chk-obs[data-cid="${cId}"]`);
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
    }

    renderAll();
};
