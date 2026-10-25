window.renderEjecRevFachadaCalc = function(container, materialId) {
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

    const controlesEnfoscados = [
        "Regularización del soporte para conseguir espesor uniforme",
        "Ejecución de maestras si procede y guardavivos",
        "Se colocan mallas de refuerzo en discontinuidades de material y puntos singulares",
        "Comprobación de las condiciones ambientales para su colocación",
        "Resistencia a compresión prevista (clasificación CS)",
        "Requisito de absorción de agua",
        "Requisito de transpirabilidad",
        "Ejecución de juntas según proyecto.",
        "Comprobación grado de planeidad exigido",
        "Control de acabado superficial, posibles fisuraciones."
    ];

    const controlesSATE = [
        "Revisión tipo soporte. Fábrica directa / enfoscado",
        "Estado del soporte. Planeidad uniforme",
        "Cota de arranque y colocación perfil de arranque",
        "Separadores y empalmes de perfiles de arranque",
        "Método de adhesión de los paneles según DIT o especificaciones de proyecto",
        "Colocación paneles a rompejuntas",
        "Encuentros en esquinas mediante traba dentada",
        "Ausencia de adhesivo entre juntas.",
        "Encuentro entre paneles < 2 mm",
        "Numero de anclajes mecánicos por m2 y por placa según DIT o especificaciones de proyecto",
        "El plato de la espiga queda correctamente enrasado con el panel",
        "Instalación de franjas cortafuegos si procede según proyecto",
        "Instalación de mallas y cantoneras en esquinas y encuentros especiales",
        "Colocación de mallas de refuerzo de alto impacto en zonas expuestas",
        "Comprobación de capas: capa base, imprimación y revestimiento de acabado",
        "Sellado con cinta expansiva o perfiles de conexión en carpinterías y alféizares",
        "Colocación de anclajes para elementos pesados con rotura de puente térmico"
    ];

    const controlesVentiladas = [
        "Si es un Kit comercial completo, comprobación de todos sus componentes según marcado CE o ETE",
        "Replanteo de montantes y travesaños. Aplomado y alineación",
        "Espesor constante de la cámara",
        "Aberturas de ventilación en arranque y coronacion fachada",
        "Colocación de barreras cortafuegos en interior cámara (cada 3 plantas o 10m)",
        "Reacción al fuego de los componentes, especialmente los aislamientos",
        "Materiales metálicos resistentes a la corrosión galvánica",
        "Separadores plásticos entre mensulas y muro portante.",
        "Revisión piezas de acabado. Fisuras, roturas, etc.",
        "Alineamiento y espesor constante de juntas entre placas"
    ];

    const controlesAplacados = [
        "Estado del soporte. Planeidad uniforme",
        "Curado y humedad del soporte adecuada",
        "Aplicación de mortero impermeable si lo requiere el grado de impermeabilidad del muro",
        "Doble encolado. Aplicación con llana dentada. Mortero en el 100% de la superficie de la pieza",
        "Macizado mediante maceteado.",
        "Grosor capa adhesivo según especificaciones fabricante y tipo de pieza a encolar.",
        "Instalación de anclajes mecánicos según UNE 138002/CTE DBHS1",
        "Número de anclajes por pieza según tamaño y riesgo",
        "Anclajes y tornillería acero inoxidable A2 o A4 si ambiente marino",
        "Mecanizado de piezas, para anclajes ocultos, realizado en taller",
        "Junta mínima entre piezas según tamaño. Mínimo 3 mm",
        "Utilización de crucetas para garntizar alineacion de piezas",
        "Respeto de jutnas de dilatación edificio",
        "Disposición, separación y material de sellado de juntas de movimiento, según proyecto",
        "Mortero de juntas compatible con las piezas y el ambiente.",
        "Limpieza final con producto compatible con las piezas y el mortero de juntas."
    ];

    container.innerHTML = `
        <div class="card" style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem;">
                <h2>Control de Ejecución: Revestimientos de Fachada</h2>
                <button id="erf-btn-add" class="btn btn-primary" style="font-size: 0.9rem;">+ Añadir zona de control</button>
            </div>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">Añade zonas de control e indica el tipo de revestimiento de fachada.</p>
            
            <div id="erf-instances-container"></div>
            
            <div style="margin-top: 2rem; border-top: 2px solid var(--border); padding-top: 1rem;">
                <h4 style="font-size: 0.95rem; font-weight: bold; margin-bottom: 0.5rem; color: var(--text-main);">Observaciones generales</h4>
                <textarea id="erf-obs" class="form-control" style="width:100%; min-height:80px; resize:vertical;">${data.observaciones || ''}</textarea>
                
                <h4 style="font-size: 0.95rem; font-weight: bold; margin-bottom: 0.5rem; margin-top: 1rem; color: var(--text-main);">Laboratorios intervinientes / Entidades de control</h4>
                <textarea id="erf-lab" class="form-control" style="width:100%; min-height:60px; resize:vertical;">${data.laboratorios || ''}</textarea>
            </div>
        </div>
    `;

    const btnAdd = container.querySelector('#erf-btn-add');
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

    const obsNode = container.querySelector('#erf-obs');
    if(obsNode) obsNode.addEventListener('change', (e) => data.observaciones = e.target.value);
    const labNode = container.querySelector('#erf-lab');
    if(labNode) labNode.addEventListener('change', (e) => data.laboratorios = e.target.value);

    function initChecksForType(inst) {
        inst.checks = {};
        let lista = [];
        if (inst.tipo === 'Enfoscados/Monocapas') lista = controlesEnfoscados;
        else if (inst.tipo === 'SATE') lista = controlesSATE;
        else if (inst.tipo === 'Fachadas ventiladas') lista = controlesVentiladas;
        else if (inst.tipo === 'Aplacados') lista = controlesAplacados;
        
        if (window.CustomControlsManager) {
            window.CustomControlsManager.prepareChecks(inst, materialId, inst.tipo || '', lista);
        } else {
            lista.forEach((c, idx) => {
                inst.checks['chk_'+idx] = { val: '', obs: '', date: '', name: c };
            });
        }
    }

    function renderAll() {
        const wrapper = container.querySelector('#erf-instances-container');
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
                    <input type="text" class="form-control erf-name" data-idx="${index}" value="${inst.customName}" placeholder="Identificador..." style="font-weight:bold; font-size:1.1rem; border-color:var(--primary); flex: 1;">
                    <input type="date" class="form-control erf-zonadate" data-idx="${index}" value="${inst.zonaDate || ''}" style="width: 150px; padding: 0.4rem; font-weight: bold; border-color: var(--primary);" title="Fecha del control">
                    <button class="btn erf-btn-remove" data-idx="${index}" style="margin-left:1rem; color: #dc2626; border: 1px solid #dc2626; background:transparent;">Eliminar</button>
                </div>
                <div class="dynamic-grid" style="margin-bottom: 1.5rem; gap: 1rem;">
                    <div>
                        <label class="form-label">Ubicación / Nivel</label>
                        <input type="text" class="form-control erf-ubic" data-idx="${index}" value="${inst.ubicacion || ''}" placeholder="Ej. Fachada Sur...">
                    </div>
                    <div>
                        <label class="form-label">Tipo</label>
                        <select class="form-control erf-tipo" data-idx="${index}">
                            <option value="" ${inst.tipo===''?'selected':''}>Seleccione tipo...</option>
                            <option value="Enfoscados/Monocapas" ${inst.tipo==='Enfoscados/Monocapas'?'selected':''}>Enfoscados/Monocapas</option>
                            <option value="SATE" ${inst.tipo==='SATE'?'selected':''}>SATE</option>
                            <option value="Fachadas ventiladas" ${inst.tipo==='Fachadas ventiladas'?'selected':''}>Fachadas ventiladas</option>
                            <option value="Aplacados" ${inst.tipo==='Aplacados'?'selected':''}>Aplacados</option>
                        </select>
                    </div>
                </div>
            `;

            if (inst.tipo !== '') {
                let listaControles = [];
                if (inst.tipo === 'Enfoscados/Monocapas') listaControles = controlesEnfoscados;
                else if (inst.tipo === 'SATE') listaControles = controlesSATE;
                else if (inst.tipo === 'Fachadas ventiladas') listaControles = controlesVentiladas;
                else if (inst.tipo === 'Aplacados') listaControles = controlesAplacados;
                
                if (!inst.checks) inst.checks = {};
                const items = window.CustomControlsManager
                    ? window.CustomControlsManager.prepareChecks(inst, materialId, inst.tipo, listaControles)
                    : listaControles.map((c, idx) => {
                        const cId = 'chk_'+idx;
                        if(!inst.checks[cId]) inst.checks[cId] = { val: '', obs: '', date: '', name: c };
                        return { cId: cId, name: c, isBase: c !== "Otro", isOtros: c === "Otro" };
                    });

                let usedCount = 0;
                items.forEach(it => {
                    const cId = it.cId;
                    const chk = inst.checks[cId] || {};
                    const cVal = chk.val || '';
                    const cObs = chk.obs || '';
                    const cDate = chk.date || '';
                    const cName = chk.name || it.name;
                    if (cVal !== "" || cObs !== "" || cDate !== "" || (it.isOtros && cName !== "Otro" && cName !== "") || it.isCustom) usedCount++;
                });
                const hideUnused = false;

                html += `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem; margin-top: 1.5rem; gap: 0.5rem; flex-wrap: wrap;">
                    <h4 style="font-size: 0.95rem; font-weight: bold; margin:0; color: var(--primary); border-bottom: 2px solid var(--primary); display: inline-block; padding-bottom: 0.2rem;">Puntos de Inspección</h4>
                    <div style="display:flex; align-items:center; gap: 0.5rem;">
                        ${window.CustomControlsManager ? window.CustomControlsManager.renderAddPointButton(index, 'erf') : ''}
                        <button type="button" class="btn erf-btn-fill-all" data-idx="${index}" style="font-size:0.8rem; padding:0.25rem 0.6rem; background:#10b981; color:white; border:none; border-radius:4px; font-weight:600; cursor:pointer; white-space:nowrap;" title="Poner 'Correcto' y fecha de hoy en todos los puntos de esta zona">✓ Todo Correcto hoy</button>
                        <button class="btn" style="font-size:0.8rem; padding:0.25rem 0.5rem; border:1px solid var(--border); white-space:nowrap;" onclick="var rows = this.parentElement.nextElementSibling ? this.parentElement.nextElementSibling.querySelectorAll('.unused-row') : this.closest('div[style*=\\'border\\']').querySelectorAll('.unused-row'); var isHidden = rows[0] && rows[0].style.display === 'none'; Array.from(rows).forEach(function(r){ r.style.display = isHidden ? 'table-row' : 'none'; }); this.innerText = isHidden ? 'Ocultar vacíos' : 'Mostrar vacíos';">${hideUnused ? 'Mostrar vacíos' : 'Ocultar vacíos'}</button>
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
                    const cDate = chk.date || '';
                    const cObs = chk.obs || '';
                    
                    const isUsed = cVal !== "" || cObs !== "" || cDate !== "" || (it.isOtros && cName !== "Otro" && cName !== "") || it.isCustom;
                    const displayStyle = (hideUnused && !isUsed) ? 'display: none;' : 'display: table-row;';
                    const trClass = isUsed ? '' : 'unused-row';
                    
                    const nameHtml = window.CustomControlsManager
                        ? window.CustomControlsManager.renderPointCell(inst, index, it, 'erf', materialId, inst.tipo)
                        : (it.isOtros ? `<input type="text" class="form-control erf-chk-name" data-idx="${index}" data-cid="${cId}" value="${cName}" placeholder="Otro (especificar)..." style="border:none; width:100%; padding:0.2rem; font-size:0.85rem; background:transparent;">` : it.name);
                    
                    html += `
                        <tr class="${trClass}" style="border-bottom: 1px solid var(--border); ${displayStyle}">
                            <td style="padding:0.6rem;">${nameHtml}</td>
                            <td style="padding:0.4rem;">
                                <input type="date" class="form-control erf-chk-date" data-idx="${index}" data-cid="${cId}" value="${cDate}" style="padding:0.3rem; font-size:0.85rem; border:none; background:#f8fafc; width:100%;">
                            </td>
                            <td style="padding:0.4rem;">
                                <select class="form-control erf-chk-sel" data-idx="${index}" data-cid="${cId}" style="padding:0.3rem; font-size:0.85rem; width:100%;">
                                    <option value="" ${cVal===''?'selected':''}></option>
                                    <option value="Correcto" ${cVal==='Correcto'?'selected':''}>Correcto</option>
                                    <option value="No Correcto" ${cVal==='No Correcto'?'selected':''}>No Correcto</option>
                                    <option value="No procede" ${cVal==='No procede'?'selected':''}>No procede</option>
                                </select>
                            </td>
                            <td style="padding:0.4rem;">
                                <input type="text" class="form-control erf-chk-obs" data-idx="${index}" data-cid="${cId}" value="${cObs}" placeholder="Observaciones..." style="background:#f8fafc; border:none; width:100%; padding:0.4rem; font-size:0.85rem;">
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
                html += `<p style="font-size:0.85rem; color:var(--text-muted); font-style:italic;">Selecciona el tipo de revestimiento para cargar los puntos de inspección correspondientes.</p>`;
            }

            block.innerHTML = html;
            wrapper.appendChild(block);
        });

        wrapper.querySelectorAll('.erf-name').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].customName = e.target.value;
            });
        });

        wrapper.querySelectorAll('.erf-zonadate').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].zonaDate = e.target.value;
            });
        });
        
        wrapper.querySelectorAll('.erf-btn-remove').forEach(el => el.addEventListener('click', (e) => { 
            if(confirm("¿Eliminar zona de control?")) {
                data.instances.splice(e.target.dataset.idx, 1);
                renderAll();
            }
        }));
        
        wrapper.querySelectorAll('.erf-ubic').forEach(el => el.addEventListener('change', (e) => { data.instances[e.target.dataset.idx].ubicacion = e.target.value; }));
        
        wrapper.querySelectorAll('.erf-tipo').forEach(el => el.addEventListener('change', (e) => { 
            const idx = e.target.dataset.idx;
            const newTipo = e.target.value;
            if (data.instances[idx].tipo !== newTipo) {
                data.instances[idx].tipo = newTipo;
                initChecksForType(data.instances[idx]);
                renderAll();
            }
        }));
        
        wrapper.querySelectorAll('.erf-chk-date').forEach(el => el.addEventListener('change', (e) => { 
            data.instances[e.target.dataset.idx].checks[e.target.dataset.cid].date = e.target.value; 
        }));
        wrapper.querySelectorAll('.erf-chk-sel').forEach(el => el.addEventListener('change', (e) => { 
            data.instances[e.target.dataset.idx].checks[e.target.dataset.cid].val = e.target.value; 
        }));
        wrapper.querySelectorAll('.erf-chk-obs').forEach(el => el.addEventListener('change', (e) => { 
            data.instances[e.target.dataset.idx].checks[e.target.dataset.cid].obs = e.target.value; 
        }));
        wrapper.querySelectorAll('.erf-chk-name').forEach(el => el.addEventListener('change', (e) => { 
            data.instances[e.target.dataset.idx].checks[e.target.dataset.cid].name = e.target.value; 
        }));

        wrapper.querySelectorAll('.erf-btn-fill-all').forEach(btn => {
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
                            const dateHeaderInput = blockDiv.querySelector('.erf-zonadate');
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
                            const sel = blockDiv.querySelector(`.erf-chk-sel[data-cid="${cId}"]`);
                            if (sel) sel.value = 'Correcto';
                            const dt = blockDiv.querySelector(`.erf-chk-date[data-cid="${cId}"]`);
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
                            const dateHeaderInput = blockDiv.querySelector('.erf-zonadate');
                            if (dateHeaderInput) {
                                dateHeaderInput.value = backup.zonaDate;
                                dateHeaderInput.setAttribute('value', backup.zonaDate);
                            }
                        }
                        inst.checks = JSON.parse(JSON.stringify(backup.checks));

                        Object.keys(inst.checks).forEach(cId => {
                            const prev = inst.checks[cId] || { val: '', obs: '', date: '' };
                            if (blockDiv) {
                                const sel = blockDiv.querySelector(`.erf-chk-sel[data-cid="${cId}"]`);
                                if (sel) sel.value = prev.val || "";
                                const dt = blockDiv.querySelector(`.erf-chk-date[data-cid="${cId}"]`);
                                if (dt) {
                                    dt.value = prev.date || "";
                                    dt.setAttribute('value', prev.date || "");
                                }
                                const obs = blockDiv.querySelector(`.erf-chk-obs[data-cid="${cId}"]`);
                                if (obs) obs.value = prev.obs || "";
                                const tr = sel ? sel.closest('tr') : null;
                                if (tr) {
                                    const isUsed = (prev.val && prev.val !== "") || (prev.obs && prev.obs !== "") || (prev.date && prev.date !== "") || (prev.name && prev.name !== "Otro" && prev.name !== "");
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
                                const sel = blockDiv.querySelector(`.erf-chk-sel[data-cid="${cId}"]`);
                                if (sel) sel.value = "";
                                const dt = blockDiv.querySelector(`.erf-chk-date[data-cid="${cId}"]`);
                                if (dt) {
                                    dt.value = "";
                                    dt.setAttribute('value', "");
                                }
                                const obs = blockDiv.querySelector(`.erf-chk-obs[data-cid="${cId}"]`);
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
            window.CustomControlsManager.bindCustomEvents(wrapper, data, materialId, inst => inst.tipo || '', renderAll, 'erf');
        }
    }

    renderAll();
};

