window.renderEjecAscensoresCalc = function(container, materialId) {
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

    var controlesEstructura = [
        "Dimensiones libres interiores de los huecos conforme a planos de instalación",
        "Aplomado huecos entre plantas",
        "Profundidad del foso (cota bajo nivel de parada inferior)",
        "Ejecución de impermeabilización exterior/interior. Ausencia de filtraciones de agua.",
        "Distancia libre desde la cota de última parada hasta el forjado superior de cierre"
    ];

    var controlesCerramientos = [
        "Paredes del hueco construidas con la resistencia al fuego exigida",
        "Paredes desolidarizadas o con masa/aislamiento suficiente respecto a recintos protegidos colindantes",
        "Paramentos interiores lisos y enfoscados (o panelados), sin salientes> 5 mm",
        "Disposición de rejilla o abertura de ventilación en la parte superior del hueco",
        "Dinteles, jambas frontales ejecutados tras el montaje del chasis de puertas, asegurando sellado acústico y la resistencia al fuego"
    ];

    var controlesMontaje = [
        "Anclaje, alineación y calibrado de guías",
        "Cuadro eléctrico específico para el ascensor",
        "Instalación permanente de alumbrado en el hueco",
        "Ausencia de instalaciones ajenas al ascensor dentro del hueco",
        "Cabina con dimensiones mínimas según proyecto",
        "Verificación de cumplimiento accesibilidad (paso libre, botoneras, señalización)",
        "Conexión telefónica bidireccional permanente en cabina para emergencias",
        "Amortiguadores antivibratorios en la bancada del motor",
        "Nivelación de paradas. Precisión de parada de la cabina en planta",
        "Ensayos de acuñamiento, limitador de velocidad, amortiguadores y prueba de carga"
    ];

    container.innerHTML = "<div class='card' style='margin-bottom: 2rem;'>" +
        "<div style='display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem;'>" +
        "<h2>Control de Ejecución: Ascensores</h2>" +
        "<button id='ea-btn-add' class='btn btn-primary' style='font-size: 0.9rem;'>+ Añadir zona de control</button>" +
        "</div>" +
        "<p style='font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;'>Añade zonas de control e indica si se trata de Fase estructura, Fase cerramientos o Fase montaje.</p>" +
        "<div id='ea-instances-container'></div>" +
        "<div style='margin-top: 2rem; border-top: 2px solid var(--border); padding-top: 1rem;'>" +
        "<h4 style='font-size: 0.95rem; font-weight: bold; margin-bottom: 0.5rem; color: var(--text-main);'>Observaciones generales</h4>" +
        "<textarea id='ea-obs' class='form-control' style='width:100%; min-height:80px; resize:vertical;'>" + escHtml(data.observaciones || '') + "</textarea>" +
        "<h4 style='font-size: 0.95rem; font-weight: bold; margin-bottom: 0.5rem; margin-top: 1rem; color: var(--text-main);'>Laboratorios intervinientes / Entidades de control</h4>" +
        "<textarea id='ea-lab' class='form-control' style='width:100%; min-height:60px; resize:vertical;'>" + escHtml(data.laboratorios || '') + "</textarea>" +
        "</div></div>";

    var btnAdd = container.querySelector('#ea-btn-add');
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

    var obsNode = container.querySelector('#ea-obs');
    if(obsNode) obsNode.addEventListener('change', function(e) { data.observaciones = e.target.value; });
    var labNode = container.querySelector('#ea-lab');
    if(labNode) labNode.addEventListener('change', function(e) { data.laboratorios = e.target.value; });

    function initChecksForType(inst) {
        inst.checks = {};
        var lista = [];
        if (inst.tipo === 'Fase estructura') lista = controlesEstructura;
        else if (inst.tipo === 'Fase cerramientos') lista = controlesCerramientos;
        else if (inst.tipo === 'Fase montaje') lista = controlesMontaje;
        
        if (window.CustomControlsManager) {
            window.CustomControlsManager.prepareChecks(inst, materialId, inst.tipo, lista);
        } else {
            lista.forEach(function(c, idx) {
                inst.checks['chk_'+idx] = { val: '', obs: '', date: '', name: c };
            });
        }
    }

    function renderAll() {
        var wrapper = container.querySelector('#ea-instances-container');
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
                "<input type='text' class='form-control ea-name' data-idx='" + index + "' value='" + escHtml(inst.customName) + "' placeholder='Identificador...' style='font-weight:bold; font-size:1.1rem; border-color:var(--primary); flex: 1;'>" +
                "<input type='date' class='form-control ea-zonadate' data-idx='" + index + "' value='" + escHtml((inst.zonaDate || '')) + "' style='width: 150px; padding: 0.4rem; font-weight: bold; border-color: var(--primary);' title='Fecha del control'>" +
                "<button class='btn ea-btn-remove' data-idx='" + index + "' style='margin-left:1rem; color: #dc2626; border: 1px solid #dc2626; background:transparent;'>Eliminar</button>" +
                "</div>" +
                "<div class='dynamic-grid' style='margin-bottom: 1.5rem; gap: 1rem;'>" +
                "<div>" +
                "<label class='form-label'>Ubicación / Nivel</label>" +
                "<input type='text' class='form-control ea-ubic' data-idx='" + index + "' value='" + escHtml((inst.ubicacion || '')) + "' placeholder='Ej. Patinillo 2, Sótano -1...'>" +
                "</div>" +
                "<div>" +
                "<label class='form-label'>Fase</label>" +
                "<select class='form-control ea-tipo' data-idx='" + index + "'>" +
                "<option value='' " + (inst.tipo===''?'selected':'') + ">Seleccione tipo...</option>" +
                "<option value='Fase estructura' " + (inst.tipo==='Fase estructura'?'selected':'') + ">Fase estructura</option>" +
                "<option value='Fase cerramientos' " + (inst.tipo==='Fase cerramientos'?'selected':'') + ">Fase cerramientos</option>" +
                "<option value='Fase montaje' " + (inst.tipo==='Fase montaje'?'selected':'') + ">Fase montaje</option>" +
                "</select>" +
                "</div>" +
                "</div>";

            if (inst.tipo !== '') {
                var listaControles = [];
                if (inst.tipo === 'Fase estructura') listaControles = controlesEstructura;
                else if (inst.tipo === 'Fase cerramientos') listaControles = controlesCerramientos;
                else if (inst.tipo === 'Fase montaje') listaControles = controlesMontaje;
                
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
                    "<button type='button' class='btn ea-btn-fill-all' data-idx='" + index + "' style='font-size:0.8rem; padding:0.25rem 0.6rem; background:#10b981; color:white; border:none; border-radius:4px; font-weight:600; cursor:pointer; white-space:nowrap;' title=\"Poner 'Correcto' y fecha de hoy en todos los puntos de esta zona\">✓ Todo Correcto hoy</button>" +
                    (window.CustomControlsManager ? window.CustomControlsManager.renderAddPointButton(index, 'ea') : '') +
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
                        ? window.CustomControlsManager.renderPointCell(inst, index, it, 'ea', materialId, inst.tipo)
                        : (it.isOtros ? "<input type='text' class='form-control ea-chk-name' data-idx='" + index + "' data-cid='" + cId + "' value='" + escHtml(cName) + "' placeholder='Otros (especificar)...' style='border:none; width:100%; padding:0.2rem; font-size:0.85rem; background:transparent;'>" : it.name);

                    html += "<tr class='" + trClass + "' style='border-bottom: 1px solid var(--border); " + displayStyle + "'>" +
                        "<td style='padding:0.6rem;'>" + nameHtml + "</td>" +
                        "<td style='padding:0.4rem;'>" +
                        "<input type='date' class='form-control ea-chk-date' data-idx='" + index + "' data-cid='" + cId + "' value='" + escHtml(cDate) + "' style='padding:0.3rem; font-size:0.85rem; border:none; background:#f8fafc; width:100%;'>" +
                        "</td>" +
                        "<td style='padding:0.4rem;'>" +
                        "<select class='form-control ea-chk-sel' data-idx='" + index + "' data-cid='" + cId + "' style='padding:0.3rem; font-size:0.85rem; width:100%;'>" +
                        "<option value='' " + (cVal===''?'selected':'') + "></option>" +
                        "<option value='Correcto' " + (cVal==='Correcto'?'selected':'') + ">Correcto</option>" +
                        "<option value='No Correcto' " + (cVal==='No Correcto'?'selected':'') + ">No Correcto</option>" +
                        "<option value='No procede' " + (cVal==='No procede'?'selected':'') + ">No procede</option>" +
                        "</select></td>" +
                        "<td style='padding:0.4rem;'>" +
                        "<input type='text' class='form-control ea-chk-obs' data-idx='" + index + "' data-cid='" + cId + "' value='" + escHtml(cObs) + "' placeholder='Observaciones...' style='background:#f8fafc; border:none; width:100%; padding:0.4rem; font-size:0.85rem;'>" +
                        "</td></tr>";
                });

                html += "</tbody></table></div>";
            } else {
                html += "<p style='color:var(--text-muted); font-size:0.9rem; font-style:italic;'>Seleccione una fase para ver los puntos de inspección.</p>";
            }

            block.innerHTML = html;
            wrapper.appendChild(block);
        });

        var selectsTipo = wrapper.querySelectorAll('.ea-tipo');
        for(var i=0; i<selectsTipo.length; i++) {
            selectsTipo[i].addEventListener('change', function(e) {
                var idx = e.target.getAttribute('data-idx');
                var inst = data.instances[idx];
                var oldTipo = inst.tipo;
                inst.tipo = e.target.value;
                if (oldTipo !== inst.tipo) initChecksForType(inst);

                renderAll();
            });
        }

        var btnRemove = wrapper.querySelectorAll('.ea-btn-remove');
        for(var i=0; i<btnRemove.length; i++) {
            btnRemove[i].addEventListener('click', function(e) {
                var idx = e.target.getAttribute('data-idx');
                if(confirm("¿Eliminar zona?")) {
                    data.instances.splice(idx, 1);
    
                    renderAll();
                }
            });
        }

        var inputsStr = wrapper.querySelectorAll('.ea-name, .ea-ubic, .ea-zonadate');
        for(var i=0; i<inputsStr.length; i++) {
            inputsStr[i].addEventListener('change', function(e) {
                var idx = e.target.getAttribute('data-idx');
                if (e.target.classList.contains('ea-name')) data.instances[idx].customName = e.target.value;
                if (e.target.classList.contains('ea-ubic')) data.instances[idx].ubicacion = e.target.value;
                if (e.target.classList.contains('ea-zonadate')) data.instances[idx].zonaDate = e.target.value;

            });
        }

        var chkSels = wrapper.querySelectorAll('.ea-chk-sel');
        for(var i=0; i<chkSels.length; i++) {
            chkSels[i].addEventListener('change', function(e) {
                var idx = e.target.getAttribute('data-idx');
                var cid = e.target.getAttribute('data-cid');
                if(!data.instances[idx].checks[cid]) data.instances[idx].checks[cid] = {};
                data.instances[idx].checks[cid].val = e.target.value;
                if (e.target.value && !data.instances[idx].checks[cid].date) {
                    data.instances[idx].checks[cid].date = localToday();
                    var dInp = document.querySelector('.ea-chk-date[data-idx="'+idx+'"][data-cid="'+cid+'"]');
                    if(dInp) dInp.value = data.instances[idx].checks[cid].date;
                }

            });
        }

        var chkObs = wrapper.querySelectorAll('.ea-chk-obs');
        for(var i=0; i<chkObs.length; i++) {
            chkObs[i].addEventListener('change', function(e) {
                var idx = e.target.getAttribute('data-idx');
                var cid = e.target.getAttribute('data-cid');
                if(!data.instances[idx].checks[cid]) data.instances[idx].checks[cid] = {};
                data.instances[idx].checks[cid].obs = e.target.value;

            });
        }

        var chkDates = wrapper.querySelectorAll('.ea-chk-date');
        for(var i=0; i<chkDates.length; i++) {
            chkDates[i].addEventListener('change', function(e) {
                var idx = e.target.getAttribute('data-idx');
                var cid = e.target.getAttribute('data-cid');
                if(!data.instances[idx].checks[cid]) data.instances[idx].checks[cid] = {};
                data.instances[idx].checks[cid].date = e.target.value;

            });
        }

        var chkNames = wrapper.querySelectorAll('.ea-chk-name');
        for(var i=0; i<chkNames.length; i++) {
            chkNames[i].addEventListener('change', function(e) {
                var idx = e.target.getAttribute('data-idx');
                var cid = e.target.getAttribute('data-cid');
                if(!data.instances[idx].checks[cid]) data.instances[idx].checks[cid] = {};
                data.instances[idx].checks[cid].name = e.target.value;

            });
        }

        var fillBtns = wrapper.querySelectorAll('.ea-btn-fill-all');
        for(var i=0; i<fillBtns.length; i++) {
            fillBtns[i].addEventListener('click', function(e) {
                var idx = e.target.getAttribute('data-idx');
                var inst = data.instances[idx];
                var today = localToday();
                var btn = e.target;
                
                var items = [];
                if (inst.tipo === 'Fase estructura') items = controlesEstructura;
                else if (inst.tipo === 'Fase cerramientos') items = controlesCerramientos;
                else if (inst.tipo === 'Fase montaje') items = controlesMontaje;

                var cKeys = window.CustomControlsManager ? Object.keys(inst.checks) : items.map(function(_,i) { return 'chk_'+i; });

                cKeys.forEach(function(cId) {
                    if (!inst.checks[cId]) inst.checks[cId] = {};
                    inst.checks[cId].val = 'Correcto';
                    if (!inst.checks[cId].date) inst.checks[cId].date = today;
                });
                

                renderAll();
                
                var originalText = btn.innerHTML;
                btn.innerHTML = "¡Hecho!";
                btn.style.background = "#059669";
                setTimeout(function() {
                    btn.innerHTML = originalText;
                    btn.style.background = "#10b981";
                }, 1500);
            });
        }

        if (window.CustomControlsManager) {
            window.CustomControlsManager.bindCustomEvents(wrapper, data, materialId, function(inst) { return inst.tipo; }, renderAll, 'ea');
        }
    }

    renderAll();

    // =============== IMPRESIÓN ===============
    if (!window.printGenerators) window.printGenerators = {};
    window.printGenerators[materialId] = function() {
        if (!data.instances || data.instances.length === 0) return '';
        var html = '';
        var obsText = data.observaciones ? data.observaciones.trim() : '';
        var labText = data.laboratorios ? data.laboratorios.trim() : '';

        data.instances.forEach(function(inst) {
            if (!inst.tipo) return;
            
            html += '<div class="print-page-break-avoid" style="margin-bottom: 2rem;">';
            html += '<h3 style="border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 10px;">Control de Ejecución: Ascensores - ' + (inst.customName || 'Zona sin nombre') + '</h3>';
            
            html += '<div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.9rem;">';
            html += '<div><strong>Ubicación:</strong> ' + (inst.ubicacion || '-') + '</div>';
            html += '<div><strong>Fase:</strong> ' + inst.tipo + '</div>';
            html += '<div><strong>Fecha:</strong> ' + (inst.zonaDate ? new Date(inst.zonaDate).toLocaleDateString() : '-') + '</div>';
            html += '</div>';

            html += '<table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 0.8rem;">';
            html += '<thead><tr style="background-color: #f0f0f0;">';
            html += '<th style="border: 1px solid #000; padding: 6px; text-align: left; width: 45%;">Punto de Control</th>';
            html += '<th style="border: 1px solid #000; padding: 6px; text-align: left; width: 12%;">Fecha</th>';
            html += '<th style="border: 1px solid #000; padding: 6px; text-align: left; width: 13%;">Resultado</th>';
            html += '<th style="border: 1px solid #000; padding: 6px; text-align: left; width: 30%;">Observaciones</th>';
            html += '</tr></thead><tbody>';

            var lista = [];
            if (inst.tipo === 'Fase estructura') lista = controlesEstructura;
            else if (inst.tipo === 'Fase cerramientos') lista = controlesCerramientos;
            else if (inst.tipo === 'Fase montaje') lista = controlesMontaje;

            var items = window.CustomControlsManager 
                ? window.CustomControlsManager.prepareChecks(inst, materialId, inst.tipo, lista)
                : lista.map(function(c, i) { return { cId: 'chk_' + i, name: c, isOtros: c === 'Otros' }; });

            items.forEach(function(it) {
                var cId = it.cId;
                var cVal = (inst.checks[cId] && inst.checks[cId].val) || '';
                var cObs = (inst.checks[cId] && inst.checks[cId].obs) || '';
                var cDate = (inst.checks[cId] && inst.checks[cId].date) || '';
                var cName = (inst.checks[cId] && inst.checks[cId].name !== undefined) ? inst.checks[cId].name : it.name;
                
                var isUsed = cVal !== "" || cObs !== "" || cDate !== "" || (it.isOtros && cName !== "Otros" && cName !== "") || (it.isCustom && cName !== "");
                if (!isUsed) return;

                html += '<tr>';
                html += '<td style="border: 1px solid #000; padding: 6px;">' + cName + '</td>';
                html += '<td style="border: 1px solid #000; padding: 6px;">' + (cDate ? new Date(cDate).toLocaleDateString() : '') + '</td>';
                html += '<td style="border: 1px solid #000; padding: 6px; font-weight:bold;">' + cVal + '</td>';
                html += '<td style="border: 1px solid #000; padding: 6px;">' + cObs + '</td>';
                html += '</tr>';
            });
            html += '</tbody></table>';

            if (obsText || labText) {
                html += '<div style="margin-top: 15px; padding: 10px; border: 1px solid #000; font-size: 0.85rem;">';
                if (obsText) html += '<p style="margin:0 0 5px 0;"><strong>Observaciones generales:</strong> ' + obsText + '</p>';
                if (labText) html += '<p style="margin:0;"><strong>Laboratorios / Entidades:</strong> ' + labText + '</p>';
                html += '</div>';
            }
            html += '</div>';
        });
        
        return html;
    };
};
