window.renderEjecOtrosCalc = function(container, materialId) {
    var projectData = currentProject;
    if (!projectData.formData) projectData.formData = {};
    if (!projectData.formData[materialId] || !projectData.formData[materialId].instances) {
        projectData.formData[materialId] = {
            instances: [],
            observaciones: '',
            laboratorios: ''
        };
    }

    var data = projectData.formData[materialId];

    // Capítulo en blanco por defecto: los puntos provienen de los añadidos por el usuario o de su base de datos activa
    var controlesOtros = [];

    container.innerHTML = "<div class='card' style='margin-bottom: 2rem;'>" +
        "<div style='display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;'>" +
        "<h2 style='margin:0;'>Control de Ejecución: Otros</h2>" +
        "<div style='display:flex; gap: 1rem;'>" +
        "<button id='eo-btn-add' class='btn btn-primary' style='font-size: 0.9rem;'>+ Añadir Zona de Control</button>" +
        "</div>" +
        "</div>" +
        "<p style='font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;'>Añade zonas de control y define tus propios puntos de inspección personalizados (puedes guardarlos con ⭐ en tu base de datos particular).</p>" +
        "<div id='eo-instances-container'></div>" +
        "<div style='margin-top: 2rem; border-top: 2px solid var(--border); padding-top: 1rem;'>" +
        "<h4 style='font-size: 0.95rem; font-weight: bold; margin-bottom: 0.5rem; color: var(--text-main);'>Observaciones generales</h4>" +
        "<textarea id='eo-obs' class='form-control' style='width:100%; min-height:80px; resize:vertical;'>" + (data.observaciones || '') + "</textarea>" +
        "<h4 style='font-size: 0.95rem; font-weight: bold; margin-bottom: 0.5rem; margin-top: 1rem; color: var(--text-main);'>Laboratorios intervinientes / Entidades de control</h4>" +
        "<textarea id='eo-lab' class='form-control' style='width:100%; min-height:60px; resize:vertical;'>" + (data.laboratorios || '') + "</textarea>" +
        "</div></div>";

    var btnAdd = container.querySelector('#eo-btn-add');
    if (btnAdd) {
        btnAdd.addEventListener('click', function() {
            var checksObj = {};
            if (window.CustomControlsManager) {
                window.CustomControlsManager.prepareChecks({ checks: checksObj }, materialId, '', controlesOtros);
            }

            // Si no hay puntos habituales cargados en la base de datos para este capítulo, crear una primera fila en blanco lista para rellenar
            var pointKeys = Object.keys(checksObj).filter(function(k) { return k !== '_dbId'; });
            if (pointKeys.length === 0) {
                var newCid = 'chk_cust_' + Date.now();
                checksObj[newCid] = { val: '', obs: '', date: '', name: '', isCustom: true, isManual: true };
            }

            data.instances.push({
                uid: Date.now().toString(),
                customName: "Zona de Control " + (data.instances.length + 1),
                ubicacion: '',
                zonaDate: new Date().toISOString().split('T')[0],
                checks: checksObj
            });
            renderAll();
        });
    }

    var obsNode = container.querySelector('#eo-obs');
    if (obsNode) obsNode.addEventListener('change', function(e) { data.observaciones = e.target.value; });
    var labNode = container.querySelector('#eo-lab');
    if (labNode) labNode.addEventListener('change', function(e) { data.laboratorios = e.target.value; });

    function renderAll() {
        var wrapper = container.querySelector('#eo-instances-container');
        if (!wrapper) return;
        wrapper.innerHTML = '';

        data.instances.forEach(function(inst, index) {
            if (!inst.checks) inst.checks = {};
            var items = window.CustomControlsManager
                ? window.CustomControlsManager.prepareChecks(inst, materialId, '', controlesOtros)
                : Object.keys(inst.checks).filter(function(k) { return k !== '_dbId'; }).map(function(k) {
                    return { cId: k, name: inst.checks[k].name || '', isBase: false, isCustom: true };
                });

            var block = document.createElement('div');
            block.style.border = "1px solid var(--border)";
            block.style.borderRadius = "8px";
            block.style.padding = "1rem";
            block.style.marginBottom = "1.5rem";
            block.style.background = "#f8fafc";

            var html = "<div style='display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem; gap: 1rem;'>" +
                "<input type='text' class='form-control eo-name' data-idx='" + index + "' value='" + (inst.customName || '') + "' placeholder='Identificador...' style='font-weight:bold; font-size:1.1rem; border-color:var(--primary); flex: 1;'>" +
                "<input type='date' class='form-control eo-zonadate' data-idx='" + index + "' value='" + (inst.zonaDate || '') + "' style='width: 150px; padding: 0.4rem; font-weight: bold; border-color: var(--primary);' title='Fecha del control'>" +
                "<button class='btn eo-btn-remove' data-idx='" + index + "' style='margin-left:1rem; color: #dc2626; border: 1px solid #dc2626; background:transparent;'>Eliminar</button>" +
                "</div>" +
                "<div style='margin-bottom: 1.5rem;'>" +
                "<label class='form-label'>Zona controlada / Ubicación</label>" +
                "<input type='text' class='form-control eo-ubic' data-idx='" + index + "' value='" + (inst.ubicacion || '') + "' placeholder='Ej. Planta 1, Sector A, Unidad de obra...'>" +
                "</div>";

            var usedCount = 0;
            items.forEach(function(it) {
                var cId = it.cId;
                var chk = inst.checks[cId] || {};
                var cVal = chk.val || '';
                var cObs = chk.obs || '';
                var cDate = chk.date || '';
                var cName = chk.name || it.name;
                if (cVal !== "" || cObs !== "" || cDate !== "" || (it.isOtros && cName !== "Otros" && cName !== "") || (it.isCustom && cName !== "")) usedCount++;
            });
            var hideUnused = false;

            html += "<div style='display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem; margin-top: 1.5rem; gap: 0.5rem; flex-wrap: wrap;'>" +
                "<h4 style='font-size: 0.95rem; font-weight: bold; margin:0; color: var(--primary); border-bottom: 2px solid var(--primary); display: inline-block; padding-bottom: 0.2rem;'>Puntos de Inspección</h4>" +
                "<div style='display:flex; align-items:center; gap: 0.5rem; flex-wrap: wrap;'>" +
                (window.CustomControlsManager ? window.CustomControlsManager.renderAddPointButton(index, 'eo') : '') +
                "<button type='button' class='btn eo-btn-fill-all' data-idx='" + index + "' style='font-size:0.8rem; padding:0.25rem 0.6rem; background:#10b981; color:white; border:none; border-radius:4px; font-weight:600; cursor:pointer; white-space:nowrap;' title=\"Poner 'Correcto' y fecha de hoy en todos los puntos de esta zona\">✓ Todo Correcto hoy</button>" +
                "<button class='btn' style='font-size:0.8rem; padding:0.25rem 0.5rem; border:1px solid var(--border); white-space:nowrap;' onclick=\"var rows = this.parentElement.nextElementSibling ? this.parentElement.nextElementSibling.querySelectorAll('.unused-row') : this.closest('div[style*=\\'border\\']').querySelectorAll('.unused-row'); var isHidden = rows[0] && rows[0].style.display === 'none'; Array.from(rows).forEach(function(r){ r.style.display = isHidden ? 'table-row' : 'none'; }); this.innerText = isHidden ? 'Ocultar vacíos' : 'Mostrar vacíos';\">" + (hideUnused ? 'Mostrar vacíos' : 'Ocultar vacíos') + "</button>" +
                "</div>" +
                "</div>" +
                "<div class='table-container' style='margin-bottom: 1.5rem;'>" +
                "<table style='width:100%; border-collapse: collapse; font-size:0.85rem; background: white; border: 1px solid var(--border);'>" +
                "<thead>" +
                "<tr style='border-bottom: 1px solid var(--border); color: var(--text-muted); background: #f1f5f9;'>" +
                "<th style='padding:0.6rem; text-align:left; width:45%; font-weight:600; font-size:0.75rem;'>PUNTO DE INSPECCIÓN</th>" +
                "<th style='padding:0.6rem; text-align:left; width:15%; font-weight:600; font-size:0.75rem;'>FECHA</th>" +
                "<th style='padding:0.6rem; text-align:left; width:15%; font-weight:600; font-size:0.75rem;'>RESULTADO</th>" +
                "<th style='padding:0.6rem; text-align:left; width:25%; font-weight:600; font-size:0.75rem;'>OBSERVACIONES</th>" +
                "</tr>" +
                "</thead><tbody>";

            if (items.length === 0) {
                html += "<tr class='unused-row'><td colspan='4' style='padding:1rem; text-align:center; color:var(--text-muted); font-style:italic;'>No hay puntos de inspección en esta zona. Pulsa «+ Añadir punto de control» para añadir uno.</td></tr>";
            } else {
                items.forEach(function(it) {
                    var cId = it.cId;
                    var chk = inst.checks[cId] || { val: '', obs: '', date: '', name: it.name };
                    var cVal = chk.val || '';
                    var cName = chk.name !== undefined ? chk.name : it.name;
                    var cObs = chk.obs || '';
                    var cDate = chk.date || '';

                    var isUsed = cVal !== "" || cObs !== "" || cDate !== "" || (it.isOtros && cName !== "Otros" && cName !== "") || (it.isCustom && cName !== "");
                    var displayStyle = (hideUnused && !isUsed) ? 'display: none;' : 'display: table-row;';
                    var trClass = isUsed ? '' : 'unused-row';

                    var nameHtml = window.CustomControlsManager
                        ? window.CustomControlsManager.renderPointCell(inst, index, it, 'eo', materialId, '')
                        : "<input type='text' class='form-control eo-chk-name' data-idx='" + index + "' data-cid='" + cId + "' value='" + cName + "' placeholder='Punto de control personalizado...' style='border:1px solid var(--border); border-radius:4px; width:100%; padding:0.25rem 0.4rem; font-size:0.85rem; background:#fff;'>";

                    html += "<tr class='" + trClass + "' style='border-bottom: 1px solid var(--border); " + displayStyle + "'>" +
                        "<td style='padding:0.6rem;'>" + nameHtml + "</td>" +
                        "<td style='padding:0.4rem;'>" +
                        "<input type='date' class='form-control eo-chk-date' data-idx='" + index + "' data-cid='" + cId + "' value='" + cDate + "' style='padding:0.3rem; font-size:0.85rem; border:none; background:#f8fafc; width:100%;'>" +
                        "</td>" +
                        "<td style='padding:0.4rem;'>" +
                        "<select class='form-control eo-chk-sel' data-idx='" + index + "' data-cid='" + cId + "' style='padding:0.3rem; font-size:0.85rem; width:100%;'>" +
                        "<option value='' " + (cVal === '' ? 'selected' : '') + "></option>" +
                        "<option value='Correcto' " + (cVal === 'Correcto' ? 'selected' : '') + ">Correcto</option>" +
                        "<option value='No Correcto' " + (cVal === 'No Correcto' ? 'selected' : '') + ">No Correcto</option>" +
                        "<option value='No procede' " + (cVal === 'No procede' ? 'selected' : '') + ">No procede</option>" +
                        "</select></td>" +
                        "<td style='padding:0.4rem;'>" +
                        "<input type='text' class='form-control eo-chk-obs' data-idx='" + index + "' data-cid='" + cId + "' value='" + cObs + "' placeholder='Observaciones...' style='background:#f8fafc; border:none; width:100%; padding:0.4rem; font-size:0.85rem;'>" +
                        "</td></tr>";
                });
            }

            html += "</tbody></table></div>";

            block.innerHTML = html;
            wrapper.appendChild(block);
        });

        wrapper.querySelectorAll('.eo-name').forEach(function(el) {
            el.addEventListener('change', function(e) {
                data.instances[e.target.dataset.idx].customName = e.target.value;
            });
        });

        wrapper.querySelectorAll('.eo-zonadate').forEach(function(el) {
            el.addEventListener('change', function(e) {
                data.instances[e.target.dataset.idx].zonaDate = e.target.value;
            });
        });

        Array.from(wrapper.querySelectorAll('.eo-btn-remove')).forEach(function(el) {
            el.addEventListener('click', function(e) {
                if (confirm("¿Eliminar zona de control?")) {
                    data.instances.splice(e.target.dataset.idx, 1);
                    renderAll();
                }
            });
        });

        Array.from(wrapper.querySelectorAll('.eo-ubic')).forEach(function(el) {
            el.addEventListener('change', function(e) {
                data.instances[e.target.dataset.idx].ubicacion = e.target.value;
            });
        });

        Array.from(wrapper.querySelectorAll('.eo-chk-date')).forEach(function(el) {
            el.addEventListener('change', function(e) {
                data.instances[e.target.dataset.idx].checks[e.target.dataset.cid].date = e.target.value;
            });
        });

        Array.from(wrapper.querySelectorAll('.eo-chk-sel')).forEach(function(el) {
            el.addEventListener('change', function(e) {
                data.instances[e.target.dataset.idx].checks[e.target.dataset.cid].val = e.target.value;
            });
        });

        Array.from(wrapper.querySelectorAll('.eo-chk-obs')).forEach(function(el) {
            el.addEventListener('change', function(e) {
                data.instances[e.target.dataset.idx].checks[e.target.dataset.cid].obs = e.target.value;
            });
        });

        Array.from(wrapper.querySelectorAll('.eo-chk-name')).forEach(function(el) {
            el.addEventListener('change', function(e) {
                data.instances[e.target.dataset.idx].checks[e.target.dataset.cid].name = e.target.value;
            });
        });

        wrapper.querySelectorAll('.eo-btn-fill-all').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                var idx = e.target.dataset.idx;
                var inst = data.instances[idx];
                if (!inst) return;
                var blockDiv = e.target.closest('div[style*="border"]');
                var isUndo = btn.dataset.state === 'undo';

                if (!isUndo) {
                    btn._backup = {
                        zonaDate: inst.zonaDate || "",
                        checks: JSON.parse(JSON.stringify(inst.checks || {}))
                    };

                    var today = new Date().toISOString().split('T')[0];

                    if (!inst.zonaDate) {
                        inst.zonaDate = today;
                        if (blockDiv) {
                            var dateHeaderInput = blockDiv.querySelector('.eo-zonadate');
                            if (dateHeaderInput) {
                                dateHeaderInput.value = today;
                                dateHeaderInput.setAttribute('value', today);
                            }
                        }
                    }

                    Object.keys(inst.checks).forEach(function(cId) {
                        if (cId === '_dbId') return;
                        inst.checks[cId].val = 'Correcto';
                        inst.checks[cId].date = today;
                        if (blockDiv) {
                            var sel = blockDiv.querySelector('.eo-chk-sel[data-cid="' + cId + '"]');
                            if (sel) sel.value = 'Correcto';
                            var dt = blockDiv.querySelector('.eo-chk-date[data-cid="' + cId + '"]');
                            if (dt) {
                                dt.value = today;
                                dt.setAttribute('value', today);
                            }
                        }
                    });

                    if (blockDiv) {
                        blockDiv.querySelectorAll('.unused-row').forEach(function(tr) {
                            tr.style.display = 'table-row';
                            tr.classList.remove('unused-row');
                        });
                    }

                    btn.dataset.state = 'undo';
                    btn.innerHTML = '↺ Deshacer todo';
                    btn.style.background = '#64748b';
                    btn.title = 'Deshacer y volver al estado anterior';
                } else {
                    var backup = btn._backup;
                    if (backup) {
                        inst.zonaDate = backup.zonaDate;
                        if (blockDiv) {
                            var dateHeaderInput = blockDiv.querySelector('.eo-zonadate');
                            if (dateHeaderInput) {
                                dateHeaderInput.value = backup.zonaDate;
                                dateHeaderInput.setAttribute('value', backup.zonaDate);
                            }
                        }
                        inst.checks = JSON.parse(JSON.stringify(backup.checks));

                        Object.keys(inst.checks).forEach(function(cId) {
                            if (cId === '_dbId') return;
                            var prev = inst.checks[cId] || { val: '', obs: '', date: '' };
                            if (blockDiv) {
                                var sel = blockDiv.querySelector('.eo-chk-sel[data-cid="' + cId + '"]');
                                if (sel) sel.value = prev.val || "";
                                var dt = blockDiv.querySelector('.eo-chk-date[data-cid="' + cId + '"]');
                                if (dt) {
                                    dt.value = prev.date || "";
                                    dt.setAttribute('value', prev.date || "");
                                }
                                var obs = blockDiv.querySelector('.eo-chk-obs[data-cid="' + cId + '"]');
                                if (obs) obs.value = prev.obs || "";
                                var tr = sel ? sel.closest('tr') : null;
                                if (tr) {
                                    var isUsed = (prev.val && prev.val !== "") || (prev.obs && prev.obs !== "") || (prev.date && prev.date !== "") || (prev.name && prev.name !== "Otros" && prev.name !== "");
                                    if (!isUsed) tr.classList.add('unused-row');
                                    else tr.classList.remove('unused-row');
                                }
                            }
                        });
                    } else {
                        Object.keys(inst.checks).forEach(function(cId) {
                            if (cId === '_dbId') return;
                            inst.checks[cId].val = "";
                            inst.checks[cId].date = "";
                            if (blockDiv) {
                                var sel = blockDiv.querySelector('.eo-chk-sel[data-cid="' + cId + '"]');
                                if (sel) sel.value = "";
                                var dt = blockDiv.querySelector('.eo-chk-date[data-cid="' + cId + '"]');
                                if (dt) {
                                    dt.value = "";
                                    dt.setAttribute('value', "");
                                }
                                var obs = blockDiv.querySelector('.eo-chk-obs[data-cid="' + cId + '"]');
                                if (obs) obs.value = "";
                                var tr = sel ? sel.closest('tr') : null;
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
            window.CustomControlsManager.bindCustomEvents(wrapper, data, materialId, function() { return ''; }, renderAll, 'eo');
        }
    }

    renderAll();
};
