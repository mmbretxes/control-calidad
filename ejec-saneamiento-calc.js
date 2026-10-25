window.renderEjecSaneamientoCalc = function(container, materialId) {
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

    var controlesVentilacionEstatica = [
        "Se han colocado las aberturas de admisión que garanticen el flujo de aire",
        "Las aberturas de extracción están conectadas a los tubos de extracción",
        "Las transiciones de conductos entre sectores de incendios cumple apartado3 SI1",
        "Los conductos son estancos",
        "Revisión de anclaje y/o apoyo sobre forjados de conductos",
        "Se ha dispuesto la ventilación en los vestíbulos de independencia de los garajes",
        "Verificación altura de salida en cubierta",
        "Aspiradores híbridos o mecánicos según proyecto"
    ];
    var controlesVentilacion = controlesVentilacionEstatica;

    var controlesTratamientoAire = [
        "Replanteo instalación",
        "Toma aire exterior separación horizontal ≥ 3 m de la de expulsión o chimeneas y salidas de humos",
        "Rejillas exteriores anti pájaros/insectos",
        "Montaje unidad interior con registro accesible",
        "Suspensión antivibratoria unidad interior",
        "Anclaje de conductos",
        "Bandeja de condensados conectada a tubería evacuación, provista de sifón",
        "Conexión a la red de saneamiento mediante embudo o rotura de carga según DB-HS 5",
        "Los conductos toma aire exterior y expulsión que discurran por el interior de la vivienda cuentan con aislamiento térmico y barrera de vapor estanca continua",
        "Red de conductos independientes zonas secas y húmedas",
        "Bocas de impulsión regulables",
        "Sellado de juntas entre conductos mediante juntas EPDM o cinta homologada",
        "Comprobación funcionamiento bypass (automático/motorizado o manual)",
        "Equilibrado y medición de caudales por estancia",
        "Equilibrio general de presiones en la vivienda"
    ];

    var controlesBajantes = [
        "Número de sumideros según proyecto",
        "Replanteo sumideros y pendientes",
        "Sumideros de pluviales tipo sifónicos.",
        "Diámetro bajantes",
        "Diámetro mínimo bajantes residuales 120 mm",
        "Abrazaderas en zona embocadura y cada 150 cm",
        "Distancias mínimas en paralelo a otras instalaciones (electricidad 30 cm, gas 3 cm)",
        "Conexión desagües a bajantes ≥45º",
        "Distancia bote sifónico a bajante <2 m",
        "Altura de prolongación bajante residuales según proyecto",
        "Distancias de ventilación primaria a sistemas de ventilación y/o aperturas",
        "Las transiciones de conductos entre sectores de incendios cumple apartado3 SI1"
    ];

    var controlesColectores = [
        "Diámetro colectores según proyecto",
        "Pendiente mínima colectores 1%",
        "Abrazaderas colectores colgados cada 1,5 m, con forro interior elástico",
        "En colectores colgados: registros en encuentros y/o acoplamientos y cada 15 m.",
        "Distancias mínimas en paralelo a otras instalaciones (electricidad 30 cm, gas 3 cm)",
        "Las transiciones de conductos entre sectores de incendios cumple apartado3 SI1",
        "Registro cada 15 m en colectores enterrados",
        "Comprobación de acabado interior y estanquidad de arquetas",
        "El ángulo de conexión de colectores a arquetas en dirección de la pendiente.",
        "Disposición de arqueta separadora de grasas en garajes",
        "Las tapas de arqueta tienen la resistencia requerida para la zona de paso"
    ];

    var controlesDrenaje = [
        "Replanteo de la instalación, cotas y pendientes.",
        "Disposición de capa de apoyo adecuada para asiento tubo",
        "Tubo drenante según proyecto (diámetro, ranuras, material)",
        "Si el ranurado es parcial, las ranuras se orientan hacia el lateral-superior",
        "Comprobación de pendiente real del tubo colocado",
        "Conexiones entre tubos con piezas propias del modelo.",
        "Colocación de geotextil filtrante según proyecto.",
        "Comprobación de árido drenante. Granulometría y espesor de capas.",
        "Colocación de geotextil entre capas de tierra y gravas.",
        "Relleno con tierras seleccionadas. Prohibido escombros y restos de obra",
        "Disposición de arquetas de registro",
        "Conexión de red de drenaje con red de evacuación.",
        "Pozo de conexión decantador según proyecto."
    ];

    container.innerHTML = "<div class='card' style='margin-bottom: 2rem;'>" +
        "<div style='display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem;'>" +
        "<h2>Control de Ejecución: Saneamiento Ventilación</h2>" +
        "<button id='es-btn-add' class='btn btn-primary' style='font-size: 0.9rem;'>+ Añadir zona de control</button>" +
        "</div>" +
        "<p style='font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;'>Añade zonas de control e indica si se trata de Ventilación estática, Sistema tratamiento de aire, Bajantes, Colectores o Drenaje.</p>" +
        "<div id='es-instances-container'></div>" +
        "<div style='margin-top: 2rem; border-top: 2px solid var(--border); padding-top: 1rem;'>" +
        "<h4 style='font-size: 0.95rem; font-weight: bold; margin-bottom: 0.5rem; color: var(--text-main);'>Observaciones generales</h4>" +
        "<textarea id='es-obs' class='form-control' style='width:100%; min-height:80px; resize:vertical;'>" + escHtml(data.observaciones || '') + "</textarea>" +
        "<h4 style='font-size: 0.95rem; font-weight: bold; margin-bottom: 0.5rem; margin-top: 1rem; color: var(--text-main);'>Laboratorios intervinientes / Entidades de control</h4>" +
        "<textarea id='es-lab' class='form-control' style='width:100%; min-height:60px; resize:vertical;'>" + escHtml(data.laboratorios || '') + "</textarea>" +
        "</div></div>";

    var btnAdd = container.querySelector('#es-btn-add');
    if (btnAdd) {
        btnAdd.addEventListener('click', function() {
            data.instances.push({
                uid: Date.now().toString(),
                customName: "Zona " + (data.instances.length + 1),
                ubicacion: '',
                tipo: '',
                checks: {}
            });
            renderAll();
        });
    }

    var obsNode = container.querySelector('#es-obs');
    if(obsNode) obsNode.addEventListener('change', function(e) { data.observaciones = e.target.value; });
    var labNode = container.querySelector('#es-lab');
    if(labNode) labNode.addEventListener('change', function(e) { data.laboratorios = e.target.value; });

    function initChecksForType(inst) {
        inst.checks = {};
        var lista = [];
        if (inst.tipo === 'Ventilación estática' || inst.tipo === 'Red de ventilación') lista = controlesVentilacionEstatica;
        else if (inst.tipo === 'Sistema tratamiento de aire') lista = controlesTratamientoAire;
        else if (inst.tipo === 'Bajantes') lista = controlesBajantes;
        else if (inst.tipo === 'Colectores') lista = controlesColectores;
        else if (inst.tipo === 'Drenaje') lista = controlesDrenaje;
        
        if (window.CustomControlsManager) {
            window.CustomControlsManager.prepareChecks(inst, materialId, inst.tipo, lista);
        } else {
            lista.forEach(function(c, idx) {
                inst.checks['chk_'+idx] = { val: '', obs: '', date: '', name: c };
            });
        }
    }

    function renderAll() {
        var wrapper = container.querySelector('#es-instances-container');
        if (!wrapper) return;
        wrapper.innerHTML = '';

        data.instances.forEach(function(inst, index) {
            var block = document.createElement('div');
            block.style.border = "1px solid var(--border)";
            block.style.borderRadius = "8px";
            block.style.padding = "1rem";
            block.style.marginBottom = "1.5rem";
            block.style.background = "#f8fafc";

            var html = "<div style='display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem; gap: 1rem;'>" +
                "<input type='text' class='form-control es-name' data-idx='" + index + "' value='" + escHtml(inst.customName) + "' placeholder='Identificador...' style='font-weight:bold; font-size:1.1rem; border-color:var(--primary); flex: 1;'>" +
                "<input type='date' class='form-control es-zonadate' data-idx='" + index + "' value='" + escHtml((inst.zonaDate || '')) + "' style='width: 150px; padding: 0.4rem; font-weight: bold; border-color: var(--primary);' title='Fecha del control'>" +
                "<button class='btn es-btn-remove' data-idx='" + index + "' style='margin-left:1rem; color: #dc2626; border: 1px solid #dc2626; background:transparent;'>Eliminar</button>" +
                "</div>" +
                "<div class='dynamic-grid' style='margin-bottom: 1.5rem; gap: 1rem;'>" +
                "<div>" +
                "<label class='form-label'>Ubicación / Nivel</label>" +
                "<input type='text' class='form-control es-ubic' data-idx='" + index + "' value='" + escHtml((inst.ubicacion || '')) + "' placeholder='Ej. Patinillo 2, Sótano -1...'>" +
                "</div>" +
                "<div>" +
                "<label class='form-label'>Fase</label>" +
                "<select class='form-control es-tipo' data-idx='" + index + "'>" +
                "<option value='' " + (inst.tipo===''?'selected':'') + ">Seleccione tipo...</option>" +
                "<option value='Ventilación estática' " + ((inst.tipo==='Ventilación estática' || inst.tipo==='Red de ventilación')?'selected':'') + ">Ventilación estática</option>" +
                "<option value='Sistema tratamiento de aire' " + (inst.tipo==='Sistema tratamiento de aire'?'selected':'') + ">Sistema tratamiento de aire</option>" +
                "<option value='Bajantes' " + (inst.tipo==='Bajantes'?'selected':'') + ">Bajantes</option>" +
                "<option value='Colectores' " + (inst.tipo==='Colectores'?'selected':'') + ">Colectores</option>" +
                "<option value='Drenaje' " + (inst.tipo==='Drenaje'?'selected':'') + ">Drenaje</option>" +
                "</select>" +
                "</div>" +
                "</div>";

            if (inst.tipo !== '') {
                var listaControles = [];
                if (inst.tipo === 'Ventilación estática' || inst.tipo === 'Red de ventilación') listaControles = controlesVentilacionEstatica;
                else if (inst.tipo === 'Sistema tratamiento de aire') listaControles = controlesTratamientoAire;
                else if (inst.tipo === 'Bajantes') listaControles = controlesBajantes;
                else if (inst.tipo === 'Colectores') listaControles = controlesColectores;
                else if (inst.tipo === 'Drenaje') listaControles = controlesDrenaje;
                
                var items = window.CustomControlsManager 
                    ? window.CustomControlsManager.prepareChecks(inst, materialId, inst.tipo, listaControles)
                    : listaControles.map(function(c, i) { return { cId: 'chk_' + i, name: c, isBase: c !== 'Otros', isOtros: c === 'Otros' }; });

                var usedCount = 0;
                items.forEach(function(it) {
                    var cId = it.cId;
                    var cVal = (inst.checks[cId] && inst.checks[cId].val) || '';
                    var cObs = (inst.checks[cId] && inst.checks[cId].obs) || '';
                    var cDate = (inst.checks[cId] && inst.checks[cId].date) || '';
                    var cName = (inst.checks[cId] && inst.checks[cId].name !== undefined) ? inst.checks[cId].name : it.name;
                    if (cVal !== "" || cObs !== "" || cDate !== "" || (it.isOtros && cName !== "Otros" && cName !== "") || (it.isCustom && cName !== "")) usedCount++;
                });
                var hideUnused = false;

                html += "<div style='display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem; margin-top: 1.5rem; gap: 0.5rem; flex-wrap: wrap;'>" +
                    "<h4 style='font-size: 0.95rem; font-weight: bold; margin:0; color: var(--primary); border-bottom: 2px solid var(--primary); display: inline-block; padding-bottom: 0.2rem;'>Puntos de Inspección</h4>" +
                    "<div style='display:flex; align-items:center; gap: 0.5rem; flex-wrap: wrap;'>" +
                    "<button type='button' class='btn es-btn-fill-all' data-idx='" + index + "' style='font-size:0.8rem; padding:0.25rem 0.6rem; background:#10b981; color:white; border:none; border-radius:4px; font-weight:600; cursor:pointer; white-space:nowrap;' title=\"Poner 'Correcto' y fecha de hoy en todos los puntos de esta zona\">✓ Todo Correcto hoy</button>" +
                    (window.CustomControlsManager ? window.CustomControlsManager.renderAddPointButton(index, 'es') : '') +
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
                
                items.forEach(function(it) {
                    var cId = it.cId;
                    var cVal = (inst.checks[cId] && inst.checks[cId].val) || '';
                    var cName = (inst.checks[cId] && inst.checks[cId].name !== undefined) ? inst.checks[cId].name : it.name;
                    var cDate = (inst.checks[cId] && inst.checks[cId].date) || '';
                    var cObs = (inst.checks[cId] && inst.checks[cId].obs) || '';
                    
                    var isUsed = cVal !== "" || cObs !== "" || cDate !== "" || (it.isOtros && cName !== "Otros" && cName !== "") || (it.isCustom && cName !== "");
                    var displayStyle = (hideUnused && !isUsed) ? 'display: none;' : 'display: table-row;';
                    var trClass = isUsed ? '' : 'unused-row';
                    
                    var nameHtml = window.CustomControlsManager 
                        ? window.CustomControlsManager.renderPointCell(inst, index, it, 'es', materialId, inst.tipo)
                        : (it.isOtros ? "<input type='text' class='form-control es-chk-name' data-idx='" + index + "' data-cid='" + cId + "' value='" + escHtml(cName) + "' placeholder='Otros (especificar)...' style='border:none; width:100%; padding:0.2rem; font-size:0.85rem; background:transparent;'>" : it.name);

                    html += "<tr class='" + trClass + "' style='border-bottom: 1px solid var(--border); " + displayStyle + "'>" +
                        "<td style='padding:0.6rem;'>" + nameHtml + "</td>" +
                        "<td style='padding:0.4rem;'>" +
                        "<input type='date' class='form-control es-chk-date' data-idx='" + index + "' data-cid='" + cId + "' value='" + escHtml(cDate) + "' style='padding:0.3rem; font-size:0.85rem; border:none; background:#f8fafc; width:100%;'>" +
                        "</td>" +
                        "<td style='padding:0.4rem;'>" +
                        "<select class='form-control es-chk-sel' data-idx='" + index + "' data-cid='" + cId + "' style='padding:0.3rem; font-size:0.85rem; width:100%;'>" +
                        "<option value='' " + (cVal===''?'selected':'') + "></option>" +
                        "<option value='Correcto' " + (cVal==='Correcto'?'selected':'') + ">Correcto</option>" +
                        "<option value='No Correcto' " + (cVal==='No Correcto'?'selected':'') + ">No Correcto</option>" +
                        "<option value='No procede' " + (cVal==='No procede'?'selected':'') + ">No procede</option>" +
                        "</select></td>" +
                        "<td style='padding:0.4rem;'>" +
                        "<input type='text' class='form-control es-chk-obs' data-idx='" + index + "' data-cid='" + cId + "' value='" + escHtml(cObs) + "' placeholder='Observaciones...' style='background:#f8fafc; border:none; width:100%; padding:0.4rem; font-size:0.85rem;'>" +
                        "</td></tr>";
                });

                html += "</tbody></table></div>";
            } else {
                html += "<p style='font-size:0.85rem; color:var(--text-muted); font-style:italic;'>Selecciona una fase para cargar los puntos de inspección.</p>";
            }

            block.innerHTML = html;
            wrapper.appendChild(block);
        });

        wrapper.querySelectorAll('.es-name').forEach(function(el) {
            el.addEventListener('change', function(e) {
                data.instances[e.target.dataset.idx].customName = e.target.value;
            });
        });

        wrapper.querySelectorAll('.es-zonadate').forEach(function(el) {
            el.addEventListener('change', function(e) {
                data.instances[e.target.dataset.idx].zonaDate = e.target.value;
            });
        });
        Array.from(wrapper.querySelectorAll('.es-btn-remove')).forEach(function(el) { el.addEventListener('click', function(e) { 
            if(confirm("¿Eliminar zona de control?")) {
                data.instances.splice(e.target.dataset.idx, 1);
                renderAll();
            }
        }); });
        
        Array.from(wrapper.querySelectorAll('.es-ubic')).forEach(function(el) { el.addEventListener('change', function(e) { data.instances[e.target.dataset.idx].ubicacion = e.target.value; }); });
        
        Array.from(wrapper.querySelectorAll('.es-tipo')).forEach(function(el) { el.addEventListener('change', function(e) { 
            var idx = e.target.dataset.idx;
            var newTipo = e.target.value;
            if (data.instances[idx].tipo !== newTipo) {
                data.instances[idx].tipo = newTipo;
                initChecksForType(data.instances[idx]);
                renderAll();
            }
        }); });
        
        Array.from(wrapper.querySelectorAll('.es-chk-date')).forEach(function(el) { el.addEventListener('change', function(e) { 
            data.instances[e.target.dataset.idx].checks[e.target.dataset.cid].date = e.target.value; 
        }); });
        Array.from(wrapper.querySelectorAll('.es-chk-sel')).forEach(function(el) { el.addEventListener('change', function(e) { 
            data.instances[e.target.dataset.idx].checks[e.target.dataset.cid].val = e.target.value; 
        }); });
        Array.from(wrapper.querySelectorAll('.es-chk-obs')).forEach(function(el) { el.addEventListener('change', function(e) { 
            data.instances[e.target.dataset.idx].checks[e.target.dataset.cid].obs = e.target.value; 
        }); });
        Array.from(wrapper.querySelectorAll('.es-chk-name')).forEach(function(el) { el.addEventListener('change', function(e) { 
            data.instances[e.target.dataset.idx].checks[e.target.dataset.cid].name = e.target.value; 
        }); });

        if (window.CustomControlsManager) {
            window.CustomControlsManager.bindCustomEvents(wrapper, data, materialId, function(inst) { return inst.tipo; }, renderAll, 'es');
        }

        wrapper.querySelectorAll('.es-btn-fill-all').forEach(function(btn) {
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
                            var dateHeaderInput = blockDiv.querySelector('.es-zonadate');
                            if (dateHeaderInput) {
                                dateHeaderInput.value = today;
                                dateHeaderInput.setAttribute('value', today);
                            }
                        }
                    }

                    Object.keys(inst.checks).forEach(function(cId) {
                        inst.checks[cId].val = 'Correcto';
                        inst.checks[cId].date = today;
                        if (blockDiv) {
                            var sel = blockDiv.querySelector('.es-chk-sel[data-cid="' + cId + '"]');
                            if (sel) sel.value = 'Correcto';
                            var dt = blockDiv.querySelector('.es-chk-date[data-cid="' + cId + '"]');
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
                            var dateHeaderInput = blockDiv.querySelector('.es-zonadate');
                            if (dateHeaderInput) {
                                dateHeaderInput.value = backup.zonaDate;
                                dateHeaderInput.setAttribute('value', backup.zonaDate);
                            }
                        }
                        inst.checks = JSON.parse(JSON.stringify(backup.checks));

                        Object.keys(inst.checks).forEach(function(cId) {
                            var prev = inst.checks[cId] || { val: '', obs: '', date: '' };
                            if (blockDiv) {
                                var sel = blockDiv.querySelector('.es-chk-sel[data-cid="' + cId + '"]');
                                if (sel) sel.value = prev.val || "";
                                var dt = blockDiv.querySelector('.es-chk-date[data-cid="' + cId + '"]');
                                if (dt) {
                                    dt.value = prev.date || "";
                                    dt.setAttribute('value', prev.date || "");
                                }
                                var obs = blockDiv.querySelector('.es-chk-obs[data-cid="' + cId + '"]');
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
                            inst.checks[cId].val = "";
                            inst.checks[cId].date = "";
                            if (blockDiv) {
                                var sel = blockDiv.querySelector('.es-chk-sel[data-cid="' + cId + '"]');
                                if (sel) sel.value = "";
                                var dt = blockDiv.querySelector('.es-chk-date[data-cid="' + cId + '"]');
                                if (dt) {
                                    dt.value = "";
                                    dt.setAttribute('value', "");
                                }
                                var obs = blockDiv.querySelector('.es-chk-obs[data-cid="' + cId + '"]');
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
    }

    renderAll();
};
