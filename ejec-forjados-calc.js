window.renderEjecucionForjadosCalc = function(container, materialId) {
    const projectData = currentProject;
    if (!projectData.formData) projectData.formData = {};
    if (!projectData.formData[materialId] || !projectData.formData[materialId].instances) {
        projectData.formData[materialId] = {
            instances: []
        };
    }
    
    const data = projectData.formData[materialId];

    const controles = [
        "Canto total a hormigonar",
        "Replanteo de viguetas",
        "Correspondencia vigas y bovedillas con el marcado CE",
        "Armaduras de refuerzo y negativos",
        "Colocación de malla de reparto (diámetro y separación)",
        "Estado general de viguetas (fisuras, roturas, etc)",
        "Disposición de zonas macizadas",
        "Colocación de sopandas"
    ];

    container.innerHTML = `
        <div class="card" style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem;">
                <h2>Control de Ejecución de Forjados Prefabricados</h2>
                <button id="ef-btn-add" class="btn btn-primary" style="font-size: 0.9rem;">+ Añadir zona de forjado</button>
            </div>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">Registra los puntos de control clave previos al hormigonado in situ de la capa de compresión por cada planta o zona.</p>
            
            <div id="ef-instances-container"></div>
        </div>
    `;

    const btnAdd = container.querySelector('#ef-btn-add');
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            const initialChecks = {};
            if (window.CustomControlsManager) {
                window.CustomControlsManager.prepareChecks({ checks: initialChecks }, materialId, '', controles);
            } else {
                controles.forEach((c, idx) => {
                    initialChecks['chk_' + idx] = { val: '', obs: '', date: '', name: c };
                });
            }
            data.instances.push({
                uid: Date.now().toString(),
                zonaName: `Forjado Planta ${data.instances.length + 1}`,
                checks: initialChecks
            });
            renderAll();
        });
    }

    function renderAll() {
        const wrapper = container.querySelector('#ef-instances-container');
        if (!wrapper) return;
        wrapper.innerHTML = '';

        data.instances.forEach((inst, index) => {
            if (!inst.checks) inst.checks = {};

            // Legacy p1..p6 and custom_0 migration
            const oldIdMap = {
                'p1': 0, 'p1b': 1, 'p2': 2, 'p3': 3, 'p3b': 4, 'p4': 5, 'p5': 6, 'p6': 7
            };
            Object.keys(oldIdMap).forEach(oldId => {
                const newId = 'chk_' + oldIdMap[oldId];
                if (inst.checks[oldId] && !inst.checks[newId]) {
                    inst.checks[newId] = inst.checks[oldId];
                    if (inst.checks[newId].name === undefined) {
                        inst.checks[newId].name = controles[oldIdMap[oldId]];
                    }
                }
            });
            if (inst.checks['custom_0']) {
                const oldCust = inst.checks['custom_0'];
                if (oldCust.label && oldCust.label.trim()) {
                    const newCustId = 'chk_cust_legacy_0';
                    if (!inst.checks[newCustId]) {
                        inst.checks[newCustId] = {
                            val: oldCust.val || (oldCust.checked ? 'Correcto' : ''),
                            obs: oldCust.obs || '',
                            date: oldCust.date || '',
                            name: oldCust.label,
                            isCustom: true
                        };
                    }
                }
            }

            const items = window.CustomControlsManager
                ? window.CustomControlsManager.prepareChecks(inst, materialId, '', controles)
                : controles.map((c, idx) => {
                    if (!inst.checks['chk_' + idx]) inst.checks['chk_' + idx] = { val: '', obs: '', date: '', name: c };
                    if (inst.checks['chk_' + idx].name === undefined) inst.checks['chk_' + idx].name = c;
                    return { cId: 'chk_' + idx, name: c, isBase: c !== "Otros", isOtros: c === "Otros" };
                });

            const block = document.createElement('div');
            block.style.border = "1px solid var(--border)";
            block.style.borderRadius = "8px";
            block.style.padding = "1rem";
            block.style.marginBottom = "1.5rem";
            block.style.background = "#f8fafc";

            let html = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem; gap: 1rem;">
                    <input type="text" class="unified-title ef-name" data-idx="${index}" value="${escHtml(inst.zonaName || '')}" placeholder="Identificación de la zona (Ej. Techo Planta Baja)" style="flex: 1;">
                    <input type="date" class="form-control ef-zonadate" data-idx="${index}" value="${escHtml(inst.zonaDate || '')}" style="width: 150px; padding: 0.4rem; font-weight: bold; border-color: var(--primary);" title="Fecha del control">
                    <button class="btn ef-btn-remove" data-idx="${index}" style="margin-left:1rem; color: #dc2626; border: 1px solid #dc2626; background:transparent;">Eliminar</button>
                </div>
            `;

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

            html += `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem; margin-top: 1rem; gap: 0.5rem; flex-wrap: wrap;">
                <h4 style="font-size: 1rem; font-weight: bold; color: var(--primary); border-bottom: 2px solid var(--primary); display: inline-block; padding-bottom: 0.2rem; margin:0;">Puntos de inspección in situ</h4>
                <div style="display:flex; align-items:center; gap: 0.5rem;">
                    ${window.CustomControlsManager ? window.CustomControlsManager.renderAddPointButton(index, 'ef') : ''}
                    <button type="button" class="btn ef-btn-fill-all" data-idx="${index}" style="font-size:0.8rem; padding:0.25rem 0.6rem; background:#10b981; color:white; border:none; border-radius:4px; font-weight:600; cursor:pointer; white-space:nowrap;" title="Poner 'Correcto' y fecha de hoy en todos los puntos de esta zona">✓ Todo Correcto hoy</button>
                    <button type="button" class="btn" style="font-size:0.8rem; padding:0.25rem 0.5rem; border:1px solid var(--border); white-space:nowrap;" onclick="var card = this.closest('div[style*=\\'border\\']'); var rows = card.querySelectorAll('.unused-row'); var isHidden = rows[0] && rows[0].style.display === 'none'; Array.from(rows).forEach(r => r.style.display = isHidden ? 'table-row' : 'none'); this.innerText = isHidden ? 'Ocultar vacíos' : 'Mostrar vacíos';">${hideUnused ? 'Mostrar vacíos' : 'Ocultar vacíos'}</button>
                </div>
            </div>`;

            html += `<div class="table-container" style="margin-bottom: 1rem;">
                    <table style="width:100%; border-collapse: collapse; font-size:0.85rem; background: white; border: 1px solid var(--border);">
                        <thead>
                            <tr style="border-bottom: 1px solid var(--border); color: var(--text-muted); background:#f1f5f9;">
                                <th style="padding:0.6rem; text-align:left; width:45%; font-weight:600; font-size:0.75rem; letter-spacing:0.5px;">PUNTO DE INSPECCIÓN</th>
                                <th style="padding:0.6rem; text-align:left; width:15%; font-weight:600; font-size:0.75rem; letter-spacing:0.5px;">FECHA</th>
                                <th style="padding:0.6rem; text-align:left; width:15%; font-weight:600; font-size:0.75rem; letter-spacing:0.5px;">RESULTADO</th>
                                <th style="padding:0.6rem; text-align:left; width:25%; font-weight:600; font-size:0.75rem; letter-spacing:0.5px;">OBSERVACIONES</th>
                            </tr>
                        </thead>
                        <tbody>`;

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
                    ? window.CustomControlsManager.renderPointCell(inst, index, it, 'ef', materialId, '')
                    : (it.isOtros ? `<input type="text" class="form-control ef-chk-name" data-idx="${index}" data-cid="${cId}" value="${escHtml(cName)}" placeholder="Otros (especificar)..." style="border:none; width:100%; padding:0.2rem; font-size:0.85rem; background:transparent;">` : cName);

                html += `
                    <tr class="${trClass}" style="border-bottom: 1px solid var(--border); ${displayStyle}">
                        <td style="padding:0.6rem;">${nameHtml}</td>
                        <td style="padding:0.4rem;">
                            <input type="date" class="form-control ef-chk-date" data-idx="${index}" data-cid="${cId}" value="${escHtml(cDate)}" style="width:100%; padding:0.4rem; border:none; background:#f8fafc; font-size:0.85rem;">
                        </td>
                        <td style="padding:0.4rem;">
                            <select class="form-control ef-chk-sel" data-idx="${index}" data-cid="${cId}" style="padding:0.3rem; font-size:0.85rem; width:100%;">
                                <option value="" ${cVal===''?'selected':''}></option>
                                <option value="Correcto" ${cVal==='Correcto'?'selected':''}>Correcto</option>
                                <option value="No Correcto" ${cVal==='No Correcto'?'selected':''}>No Correcto</option>
                                <option value="No procede" ${cVal==='No procede'?'selected':''}>No procede</option>
                            </select>
                        </td>
                        <td style="padding:0.4rem;">
                            <input type="text" class="form-control ef-chk-obs" data-idx="${index}" data-cid="${cId}" value="${escHtml(cObs)}" placeholder="Observaciones..." style="background:#f8fafc; border:none; width:100%; padding:0.4rem; font-size:0.85rem;">
                        </td>
                    </tr>
                `;
            });

            html += `</tbody></table></div>`;
            block.innerHTML = html;
            wrapper.appendChild(block);
        });

        // Eventos
        wrapper.querySelectorAll('.ef-name').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].zonaName = e.target.value;
            });
        });

        wrapper.querySelectorAll('.ef-zonadate').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].zonaDate = e.target.value;
            });
        });

        wrapper.querySelectorAll('.ef-btn-remove').forEach(el => {
            el.addEventListener('click', (e) => {
                if(confirm("¿Eliminar esta zona de forjado?")) {
                    data.instances.splice(e.target.dataset.idx, 1);
                    renderAll();
                }
            });
        });

        wrapper.querySelectorAll('.ef-chk-date').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].checks[e.target.dataset.cid].date = e.target.value;
            });
        });

        wrapper.querySelectorAll('.ef-chk-sel').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].checks[e.target.dataset.cid].val = e.target.value;
            });
        });

        wrapper.querySelectorAll('.ef-chk-obs').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].checks[e.target.dataset.cid].obs = e.target.value;
            });
        });

        wrapper.querySelectorAll('.ef-chk-name').forEach(el => {
            el.addEventListener('change', (e) => {
                data.instances[e.target.dataset.idx].checks[e.target.dataset.cid].name = e.target.value;
            });
        });

        wrapper.querySelectorAll('.ef-btn-fill-all').forEach(btn => {
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
                            const dateHeaderInput = blockDiv.querySelector('.ef-zonadate');
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
                            const sel = blockDiv.querySelector(`.ef-chk-sel[data-cid="${cId}"]`);
                            if (sel) sel.value = 'Correcto';
                            const dt = blockDiv.querySelector(`.ef-chk-date[data-cid="${cId}"]`);
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
                            const dateHeaderInput = blockDiv.querySelector('.ef-zonadate');
                            if (dateHeaderInput) {
                                dateHeaderInput.value = backup.zonaDate;
                                dateHeaderInput.setAttribute('value', backup.zonaDate);
                            }
                        }
                        inst.checks = JSON.parse(JSON.stringify(backup.checks));

                        Object.keys(inst.checks).forEach(cId => {
                            const prev = inst.checks[cId] || { val: '', obs: '', date: '' };
                            if (blockDiv) {
                                const sel = blockDiv.querySelector(`.ef-chk-sel[data-cid="${cId}"]`);
                                if (sel) sel.value = prev.val || "";
                                const dt = blockDiv.querySelector(`.ef-chk-date[data-cid="${cId}"]`);
                                if (dt) {
                                    dt.value = prev.date || "";
                                    dt.setAttribute('value', prev.date || "");
                                }
                                const obs = blockDiv.querySelector(`.ef-chk-obs[data-cid="${cId}"]`);
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
                                const sel = blockDiv.querySelector(`.ef-chk-sel[data-cid="${cId}"]`);
                                if (sel) sel.value = "";
                                const dt = blockDiv.querySelector(`.ef-chk-date[data-cid="${cId}"]`);
                                if (dt) {
                                    dt.value = "";
                                    dt.setAttribute('value', "");
                                }
                                const obs = blockDiv.querySelector(`.ef-chk-obs[data-cid="${cId}"]`);
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
            window.CustomControlsManager.bindCustomEvents(wrapper, data, materialId, () => '', renderAll, 'ef');
        }
    }

    renderAll();
};
