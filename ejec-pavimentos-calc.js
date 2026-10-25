window.renderEjecPavimentosCalc = (container, materialId) => {
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
    data.instances.forEach(i => { if (i.tipo === 'Pavimentos pétreos') i.tipo = 'Piedra natural'; });

    const controlesSoleras = [
        "Base del material previsto y debidamente compactada",
        "Clase de hormigón prevista",
        "Colocación barrera impermeable",
        "Encuentro impermeabilización con paramentos",
        "Colocación armadura prevista",
        "Espesor constante de la solera",
        "Curado del hormigón",
        "Juntas perimetrales, encuentros con paramentos",
        "Ejecución de las juntas de dilatación y retracción, espesor y profundidad"
    ];

    const controlesCeramica = [
        "Comprobación criterios de resbaladicidad",
        "Mortero de agarre o adhesivo compatible con la tipología de baldosa",
        "Grado de humectación de las piezas y/o soporte según tipo de adhesivo",
        "Técnica de encolado adecuada (doble encolado en grandes formatos o exterior) y macizado sin huecos",
        "Ancho de juntas según especificaciones fabricante",
        "Control de planeidad y ausencia de cejas entre piezas",
        "Juntas perimetrales, encuentros con paramentos",
        "Juntas estructurales y/o de dilatación",
        "Mortero de juntas previsto y compatible con el uso",
        "Ausencia de piezas rotas, fisuradas o desportilladas",
        "Limpieza final con productos compatibles."
    ];

    const controlesPetreos = [
        "Comprobación criterios de resbaladicidad",
        "Mortero de agarre compatible con la tipología de piedra (evitar eflorescencias o manchas)",
        "Grado de humectación de las piezas o imprimación de reverso para adherencia",
        "Espesor uniforme y macizado completo de la capa de agarre sin oquedades",
        "Ancho de juntas según especificaciones fabricante",
        "Control de planeidad y pendientes de evacuación si aplica",
        "Juntas perimetrales, encuentros con paramentos",
        "Juntas estructurales y/o de dilatación (sellado neutro compatible)",
        "Mortero de juntas previsto y compatible con el uso",
        "Ausencia de piezas rotas, con pelos o fisuras",
        "Tratamiento superficial previsto (hidrofugado, pulido o abrillantado si aplica)",
        "Limpieza final con productos compatibles (neutros, no ácidos)"
    ];

    const controlesBaldosas = controlesCeramica;

    const controlesVinilico = [
        "Condiciones ambientales de la estancia: temperatura y humedad dentro de los límites del fabricante",
        "Humedad del soporte dentro del límite admisible, incluido el caso de suelo radiante",
        "Soporte limpio, liso y consistente, sin polvo, grasas ni restos",
        "Planeidad del soporte, con pasta niveladora o regularización previa si es necesaria",
        "Imprimación del soporte, si la exige el fabricante del adhesivo",
        "Adhesivo compatible con el vinílico, el soporte y el suelo radiante",
        "Suelo radiante: puesta en marcha y secado previos realizados, y temperatura superficial controlada",
        "Replanteo y dirección de colocación (dibujo, lamas o losetas, tono y lote mezclados)",
        "Contacto completo con el soporte, sin burbujas ni zonas huecas (paso de rodillo)",
        "Juntas entre piezas, o soldadura en caliente de las juntas si se especifica, bien ejecutadas",
        "Juntas perimetrales y encuentros con paramentos y elementos pasantes",
        "Juntas estructurales respetadas y no cubiertas por el pavimento",
        "Encuentros con otros pavimentos y puertas resueltos con perfil adecuado",
        "Planeidad final y ausencia de huellas, resaltos o marcas de llana",
        "Remates en paramentos (rodapié o zócalo), con la media caña o el perfil previsto",
        "Ausencia de piezas dañadas o con defectos",
        "Protección final y limpieza con productos compatibles"
    ];

    const controlesMaderaComunes = [
        "Condiciones ambientales de la estancia: cerramientos acabados, ventanas colocadas, humedad relativa y temperatura dentro de los límites del fabricante",
        "Trabajos húmedos terminados y secos (yesos, pinturas, alicatados) antes de colocar la madera",
        "Humedad de la madera dentro del rango exigido",
        "Humedad del soporte dentro del límite admisible según el tipo de soporte y la existencia de calefacción radiante",
        "Soporte limpio, sin polvo, grasas ni restos de pintura o yeso",
        "Planeidad del soporte dentro de las tolerancias admisibles, con regularización previa si es necesaria",
        "Resistencia y consistencia del soporte (dureza superficial, ausencia de fisuras o disgregación)",
        "Barrera de vapor o lámina anti-humedad en contacto con el terreno, con solapes sellados",
        "Suelo radiante: protocolo de puesta en marcha y secado previos realizado, y temperatura superficial controlada",
        "Junta perimetral de dilatación con paramentos, pilares y elementos pasantes según especificaciones",
        "Juntas estructurales del edificio respetadas y no cubiertas por el pavimento",
        "Juntas de dilatación intermedias en grandes superficies o pasos de puertas según especificaciones",
        "Dirección de colocación y aspecto del conjunto (desfase de juntas, mezcla de piezas, ausencia de defectos)",
        "Planeidad final del pavimento y ausencia de resaltos entre piezas",
        "Encuentros con otros pavimentos y puertas resueltos con perfil o remate adecuado",
        "Rodapiés fijados al paramento y no al pavimento, permitiendo el libre movimiento",
        "Protección final del pavimento y limpieza con productos compatibles"
    ];

    const controlesParquetEncolado = [
        ...controlesMaderaComunes,
        "Adhesivo adecuado y compatible con el soporte, la madera y el suelo radiante",
        "Imprimación del soporte, si la requiere el fabricante del adhesivo",
        "Consumo y espesor de la capa de adhesivo con llana dentada adecuada",
        "Tiempo abierto del adhesivo respetado y contacto completo sin huecos entre pieza y soporte",
        "Limpieza inmediata de restos de adhesivo en cara vista y juntas",
        "Tiempo de curado del adhesivo respetado antes del tránsito o tratamientos posteriores"
    ];

    const controlesTarimaFlotante = [
        ...controlesMaderaComunes,
        "Base aislante del espesor y tipo previstos, con solapes a tope o sellados",
        "Lámina anti-humedad bajo la base, con entrega y subida perimetral adecuada",
        "Sistema de unión de las piezas (click o lengüeta) correcto, sin holguras ni juntas abiertas",
        "Pavimento totalmente flotante y libre en todo su perímetro sin fijaciones ni elementos pasantes que lo coarten",
        "Longitud y anchura máxima de paño sin junta intermedia respetadas",
        "Piezas de remate y de final de hilada con dimensiones mínimas adecuadas"
    ];

    const controlesTarimaClavada = [
        ...controlesMaderaComunes,
        "Rastreles: sección, separación, nivelación, humedad y tratamiento protector de la madera",
        "Elementos de fijación (clavos, tornillos o grapas) del tipo, longitud y separación previstos, con ángulo correcto",
        "Cámara bajo pavimento con ventilación y aislamiento previstos"
    ];

    container.innerHTML = `
        <div class="card" style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem;">
                <h2>Control de Ejecución: Pavimentos</h2>
                <button id="ep-btn-add" class="btn btn-primary" style="font-size: 0.9rem;">+ Añadir zona de control</button>
            </div>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">Añade zonas de control e indica la tipología de pavimento.</p>
            
            <div id="ep-instances-container"></div>
            
            <div style="margin-top: 2rem; border-top: 2px solid var(--border); padding-top: 1rem;">
                <h4 style="font-size: 0.95rem; font-weight: bold; margin-bottom: 0.5rem; color: var(--text-main);">Observaciones generales</h4>
                <textarea id="ep-obs" class="form-control" style="width:100%; min-height:80px; resize:vertical;">${data.observaciones || ''}</textarea>
                
                <h4 style="font-size: 0.95rem; font-weight: bold; margin-bottom: 0.5rem; margin-top: 1rem; color: var(--text-main);">Laboratorios intervinientes / Entidades de control</h4>
                <textarea id="ep-lab" class="form-control" style="width:100%; min-height:60px; resize:vertical;">${data.laboratorios || ''}</textarea>
            </div>
        </div>
    `;

    const btnAdd = container.querySelector('#ep-btn-add');
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

    const obsNode = container.querySelector('#ep-obs');
    if(obsNode) obsNode.addEventListener('change', (e) => data.observaciones = e.target.value);
    const labNode = container.querySelector('#ep-lab');
    if(labNode) labNode.addEventListener('change', (e) => data.laboratorios = e.target.value);

    const initChecksForType = (inst) => {
        inst.checks = {};
        let lista = [];
        if (inst.tipo === 'Soleras') lista = controlesSoleras;
        else if (inst.tipo === 'Baldosas cerámicas' || inst.tipo === 'Baldosas') lista = controlesCeramica;
        else if (inst.tipo === 'Piedra natural') lista = controlesPetreos;
        else if (inst.tipo === 'Vinílico') lista = controlesVinilico;
        else if (inst.tipo === 'Parquet encolado') lista = controlesParquetEncolado;
        else if (inst.tipo === 'Tarima flotante') lista = controlesTarimaFlotante;
        else if (inst.tipo === 'Tarima clavada o sobre rastreles') lista = controlesTarimaClavada;
        
        if (window.CustomControlsManager) {
            window.CustomControlsManager.prepareChecks(inst, materialId, inst.tipo || '', lista);
        } else {
            lista.forEach((c, idx) => {
                inst.checks[`chk_${idx}`] = { val: '', obs: '', date: '', name: c };
            });
        }
    };

    const renderAll = () => {
        const wrapper = container.querySelector('#ep-instances-container');
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
                    <input type="text" class="form-control ep-name" data-idx="${index}" value="${inst.customName}" placeholder="Identificador..." style="font-weight:bold; font-size:1.1rem; border-color:var(--primary); flex: 1;">
                    <input type="date" class="form-control ep-zonadate" data-idx="${index}" value="${inst.zonaDate || ''}" style="width: 150px; padding: 0.4rem; font-weight: bold; border-color: var(--primary);" title="Fecha del control">
                    <button class="btn ep-btn-remove" data-idx="${index}" style="margin-left:1rem; color: #dc2626; border: 1px solid #dc2626; background:transparent;">Eliminar</button>
                </div>
            `;

            html += `
                <div class="dynamic-grid" style="margin-bottom: 1.5rem; gap: 1rem;">
                    <div>
                        <label class="form-label">Ubicación / Nivel</label>
                        <input type="text" class="form-control ep-ubic" data-idx="${index}" value="${inst.ubicacion || ''}" placeholder="Ej. Planta baja, terrazas...">
                    </div>
                    <div>
                        <label class="form-label">Tipo de pavimento</label>
                        <select class="form-control ep-tipo" data-idx="${index}">
                            <option value="" ${inst.tipo===''?'selected':''}>Seleccione tipo...</option>
                            <option value="Soleras" ${inst.tipo==='Soleras'?'selected':''}>Soleras</option>
                            <option value="Baldosas cerámicas" ${inst.tipo==='Baldosas cerámicas'||inst.tipo==='Baldosas'?'selected':''}>Baldosas cerámicas</option>
                            <option value="Piedra natural" ${inst.tipo==='Piedra natural'?'selected':''}>Piedra natural</option>
                            <option value="Vinílico" ${inst.tipo==='Vinílico'?'selected':''}>Vinílico</option>
                            <option value="Parquet encolado" ${inst.tipo==='Parquet encolado'?'selected':''}>Parquet encolado</option>
                            <option value="Tarima flotante" ${inst.tipo==='Tarima flotante'?'selected':''}>Tarima flotante</option>
                            <option value="Tarima clavada o sobre rastreles" ${inst.tipo==='Tarima clavada o sobre rastreles'?'selected':''}>Tarima clavada o sobre rastreles</option>
                        </select>
                    </div>
                </div>
            `;

            if (inst.tipo !== '') {
                let listaControles = [];
                if (inst.tipo === 'Soleras') listaControles = controlesSoleras;
                else if (inst.tipo === 'Baldosas cerámicas' || inst.tipo === 'Baldosas') listaControles = controlesCeramica;
                else if (inst.tipo === 'Piedra natural') listaControles = controlesPetreos;
                else if (inst.tipo === 'Vinílico') listaControles = controlesVinilico;
                else if (inst.tipo === 'Parquet encolado') listaControles = controlesParquetEncolado;
                else if (inst.tipo === 'Tarima flotante') listaControles = controlesTarimaFlotante;
                else if (inst.tipo === 'Tarima clavada o sobre rastreles') listaControles = controlesTarimaClavada;
                
                if (!inst.checks) inst.checks = {};
                const items = window.CustomControlsManager
                    ? window.CustomControlsManager.prepareChecks(inst, materialId, inst.tipo, listaControles)
                    : listaControles.map((c, idx) => {
                        const cId = `chk_${idx}`;
                        if(!inst.checks[cId]) inst.checks[cId] = { val: '', obs: '', date: '', name: c };
                        return { cId, name: c, isBase: c !== "Otros", isOtros: c === "Otros" };
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
                        ${window.CustomControlsManager ? window.CustomControlsManager.renderAddPointButton(index, 'ep') : ''}
                        <button type="button" class="btn ep-btn-fill-all" data-idx="${index}" style="font-size:0.8rem; padding:0.25rem 0.6rem; background:#10b981; color:white; border:none; border-radius:4px; font-weight:600; cursor:pointer; white-space:nowrap;" title="Poner 'Correcto' y fecha de hoy en todos los puntos de esta zona">✓ Todo Correcto hoy</button>
                        <button class="btn" style="font-size:0.8rem; padding:0.25rem 0.5rem; border:1px solid var(--border); white-space:nowrap;" onclick="const rows = this.parentElement.nextElementSibling ? this.parentElement.nextElementSibling.querySelectorAll('.unused-row') : this.closest('div[style*=\\'border\\']').querySelectorAll('.unused-row'); const isHidden = rows[0] && rows[0].style.display === 'none'; Array.from(rows).forEach(r => { r.style.display = isHidden ? 'table-row' : 'none'; }); this.innerText = isHidden ? 'Ocultar vacíos' : 'Mostrar vacíos';">${hideUnused ? 'Mostrar vacíos' : 'Ocultar vacíos'}</button>
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
                    
                    const isUsed = cVal !== "" || cObs !== "" || cDate !== "" || (it.isOtros && cName !== "Otros" && cName !== "") || it.isCustom;
                    const displayStyle = (hideUnused && !isUsed) ? 'display: none;' : 'display: table-row;';
                    const trClass = isUsed ? '' : 'unused-row';

                    let nameHtml = window.CustomControlsManager
                        ? window.CustomControlsManager.renderPointCell(inst, index, it, 'ep', materialId, inst.tipo)
                        : (it.isOtros ? `<input type="text" class="form-control ep-chk-name" data-idx="${index}" data-cid="${cId}" value="${cName}" placeholder="Otros (especificar)..." style="border:none; width:100%; padding:0.2rem; font-size:0.85rem; background:transparent;">` : it.name);

                    html += `
                        <tr class="${trClass}" style="border-bottom: 1px solid var(--border); ${displayStyle}">
                            <td style="padding:0.6rem;">${nameHtml}</td>
                            <td style="padding:0.4rem;">
                                <input type="date" class="form-control ep-chk-date" data-idx="${index}" data-cid="${cId}" value="${cDate}" style="padding:0.3rem; font-size:0.85rem; border:none; background:#f8fafc; width:100%;">
                            </td>
                            <td style="padding:0.4rem;">
                                <select class="form-control ep-chk-sel" data-idx="${index}" data-cid="${cId}" style="padding:0.3rem; font-size:0.85rem; width:100%;">
                                    <option value="" ${cVal===''?'selected':''}></option>
                                    <option value="Correcto" ${cVal==='Correcto'?'selected':''}>Correcto</option>
                                    <option value="No Correcto" ${cVal==='No Correcto'?'selected':''}>No Correcto</option>
                                    <option value="No procede" ${cVal==='No procede'?'selected':''}>No procede</option>
                                </select>
                            </td>
                            <td style="padding:0.4rem;">
                                <input type="text" class="form-control ep-chk-obs" data-idx="${index}" data-cid="${cId}" value="${cObs}" placeholder="Observaciones..." style="background:#f8fafc; border:none; width:100%; padding:0.4rem; font-size:0.85rem;">
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
                html += `<p style="font-size:0.85rem; color:var(--text-muted); font-style:italic;">Selecciona un tipo de pavimento para cargar los puntos de inspección.</p>`;
            }

            block.innerHTML = html;
            wrapper.appendChild(block);
        });

        wrapper.querySelectorAll('.ep-name').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].customName = e.target.value;
            });
        });

        wrapper.querySelectorAll('.ep-zonadate').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].zonaDate = e.target.value;
            });
        });
        wrapper.querySelectorAll('.ep-btn-remove').forEach(el => el.addEventListener('click', e => { 
            if(confirm("¿Eliminar zona de control?")) {
                data.instances.splice(e.target.dataset.idx, 1);
                renderAll();
            }
        }));
        
        wrapper.querySelectorAll('.ep-ubic').forEach(el => el.addEventListener('change', e => { data.instances[e.target.dataset.idx].ubicacion = e.target.value; }));
        wrapper.querySelectorAll('.ep-tipo').forEach(el => el.addEventListener('change', e => { 
            const idx = e.target.dataset.idx;
            const newTipo = e.target.value;
            if (data.instances[idx].tipo !== newTipo) {
                data.instances[idx].tipo = newTipo;
                initChecksForType(data.instances[idx]);
                renderAll();
            }
        }));
        
        Array.from(wrapper.querySelectorAll('.ep-chk-date')).forEach(el => el.addEventListener('change', e => { 
            data.instances[e.target.dataset.idx].checks[e.target.dataset.cid].date = e.target.value; 
        }));
        Array.from(wrapper.querySelectorAll('.ep-chk-sel')).forEach(el => el.addEventListener('change', e => { 
            data.instances[e.target.dataset.idx].checks[e.target.dataset.cid].val = e.target.value; 
        }));
        Array.from(wrapper.querySelectorAll('.ep-chk-obs')).forEach(el => el.addEventListener('change', e => { 
            data.instances[e.target.dataset.idx].checks[e.target.dataset.cid].obs = e.target.value; 
        }));
        Array.from(wrapper.querySelectorAll('.ep-chk-name')).forEach(el => el.addEventListener('change', e => { 
            data.instances[e.target.dataset.idx].checks[e.target.dataset.cid].name = e.target.value; 
        }));

        wrapper.querySelectorAll('.ep-btn-fill-all').forEach(btn => {
            btn.addEventListener('click', e => {
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
                            const dateHeaderInput = blockDiv.querySelector('.ep-zonadate');
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
                            const sel = blockDiv.querySelector(`.ep-chk-sel[data-cid="${cId}"]`);
                            if (sel) sel.value = 'Correcto';
                            const dt = blockDiv.querySelector(`.ep-chk-date[data-cid="${cId}"]`);
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
                            const dateHeaderInput = blockDiv.querySelector('.ep-zonadate');
                            if (dateHeaderInput) {
                                dateHeaderInput.value = backup.zonaDate;
                                dateHeaderInput.setAttribute('value', backup.zonaDate);
                            }
                        }
                        inst.checks = JSON.parse(JSON.stringify(backup.checks));

                        Object.keys(inst.checks).forEach(cId => {
                            const prev = inst.checks[cId] || { val: '', obs: '', date: '' };
                            if (blockDiv) {
                                const sel = blockDiv.querySelector(`.ep-chk-sel[data-cid="${cId}"]`);
                                if (sel) sel.value = prev.val || "";
                                const dt = blockDiv.querySelector(`.ep-chk-date[data-cid="${cId}"]`);
                                if (dt) {
                                    dt.value = prev.date || "";
                                    dt.setAttribute('value', prev.date || "");
                                }
                                const obs = blockDiv.querySelector(`.ep-chk-obs[data-cid="${cId}"]`);
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
                                const sel = blockDiv.querySelector(`.ep-chk-sel[data-cid="${cId}"]`);
                                if (sel) sel.value = "";
                                const dt = blockDiv.querySelector(`.ep-chk-date[data-cid="${cId}"]`);
                                if (dt) {
                                    dt.value = "";
                                    dt.setAttribute('value', "");
                                }
                                const obs = blockDiv.querySelector(`.ep-chk-obs[data-cid="${cId}"]`);
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
            window.CustomControlsManager.bindCustomEvents(wrapper, data, materialId, inst => inst.tipo || '', renderAll, 'ep');
        }
    };

    renderAll();
};

