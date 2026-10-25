window.renderEnsayosOtrosCalc = function(container, materialId) {
    var projectData = currentProject;
    if (!projectData.formData) projectData.formData = {};
    if (!projectData.formData[materialId]) {
        projectData.formData[materialId] = {};
    }

    var data = projectData.formData[materialId];
    if (!Array.isArray(data.lista_ensayos_varios)) {
        data.lista_ensayos_varios = [];
    }

    function renderAll() {
        var habituals = (window.CustomControlsManager && typeof window.CustomControlsManager.getPoints === 'function')
            ? window.CustomControlsManager.getPoints(materialId, '')
            : [];

        var datalistId = 'dl-ensayos-otros-' + materialId;
        var datalistOptions = habituals.map(function(h) {
            return "<option value='" + h.replace(/'/g, "&#39;") + "'></option>";
        }).join('');

        container.innerHTML = "<div class='card'>" +
            "<h2>Control de Ensayos: Otros</h2>" +
            "<p style='font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;'>Añade ensayos o pruebas de servicio que no estén incluidos en otros capítulos. Puedes escribir cualquier tipo de ensayo y guardarlo con ⭐ en tu base de datos particular para reutilizarlo.</p>" +
            "<datalist id='" + datalistId + "'>" + datalistOptions + "</datalist>" +
            "<div class='dynamic-list-container' id='eo-ensayos-list'></div>" +
            "</div>";

        var listCont = container.querySelector('#eo-ensayos-list');
        var addBtn = document.createElement('button');
        addBtn.className = 'btn btn-secondary';
        addBtn.style.marginTop = '10px';
        addBtn.textContent = '+ Añadir Ensayo';

        data.lista_ensayos_varios.forEach(function(itemData, idx) {
            // Compatibilidad con campo antiguo 'descripcion'
            if (itemData.tipo_ensayo === undefined && itemData.descripcion !== undefined) {
                itemData.tipo_ensayo = itemData.descripcion;
            }

            var itemDiv = document.createElement('div');
            itemDiv.className = 'dynamic-list-item';
            itemDiv.style.border = '1px solid var(--border)';
            itemDiv.style.padding = '15px';
            itemDiv.style.marginBottom = '15px';
            itemDiv.style.position = 'relative';
            itemDiv.style.backgroundColor = '#fff';

            // Título editable (Ensayo 1, Ensayo 2...)
            var titleContainer = document.createElement('div');
            titleContainer.style.display = 'flex';
            titleContainer.style.alignItems = 'center';
            titleContainer.style.borderBottom = '1px solid #ccc';
            titleContainer.style.marginBottom = '15px';
            titleContainer.style.paddingBottom = '5px';

            var itemTitleInput = document.createElement('input');
            itemTitleInput.type = 'text';
            itemTitleInput.className = 'dynamic-list-title';
            itemTitleInput.value = itemData._title || ('Ensayo ' + (idx + 1));
            itemTitleInput.style.fontSize = '1.17em';
            itemTitleInput.style.fontWeight = 'bold';
            itemTitleInput.style.border = 'none';
            itemTitleInput.style.outline = 'none';
            itemTitleInput.style.flex = '1';
            itemTitleInput.style.background = 'transparent';
            itemTitleInput.onchange = function(e) {
                itemData._title = e.target.value;
            };

            titleContainer.appendChild(itemTitleInput);
            itemDiv.appendChild(titleContainer);

            // Botón eliminar ensayo
            var delBtn = document.createElement('button');
            delBtn.textContent = '✕';
            delBtn.style.position = 'absolute';
            delBtn.style.top = '15px';
            delBtn.style.right = '15px';
            delBtn.style.color = 'red';
            delBtn.style.background = 'none';
            delBtn.style.border = 'none';
            delBtn.style.fontWeight = 'bold';
            delBtn.style.cursor = 'pointer';
            delBtn.style.fontSize = '1.2em';
            delBtn.onclick = async function() {
                if (await window.appConfirmar('¿Eliminar ensayo?')) {
                    data.lista_ensayos_varios.splice(idx, 1);
                    renderAll();
                }
            };
            itemDiv.appendChild(delBtn);

            var grid = document.createElement('div');
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
            grid.style.gap = '15px';

            // 1. Campo: Tipo de ensayo (con soporte de base de datos particular)
            var groupTipo = document.createElement('div');
            groupTipo.style.display = 'flex';
            groupTipo.style.flexDirection = 'column';
            var labelTipo = document.createElement('label');
            labelTipo.style.fontWeight = '600';
            labelTipo.style.marginBottom = '5px';
            labelTipo.textContent = 'Tipo de ensayo';
            groupTipo.appendChild(labelTipo);

            var inputTipo = document.createElement('input');
            inputTipo.type = 'text';
            inputTipo.className = 'form-control';
            inputTipo.setAttribute('list', datalistId);
            inputTipo.placeholder = habituals.length > 0 ? 'Escribe o elige de tu base (▼)...' : 'Escribe el tipo de ensayo...';
            inputTipo.value = itemData.tipo_ensayo || '';
            inputTipo.onchange = function(e) {
                itemData.tipo_ensayo = e.target.value;
                renderAll();
            };
            groupTipo.appendChild(inputTipo);

            // Controles de base de datos particular (ocultos en impresión y Word)
            if (window.CustomControlsManager) {
                var dbActionsDiv = document.createElement('div');
                dbActionsDiv.className = 'print-hidden';
                dbActionsDiv.style.display = 'flex';
                dbActionsDiv.style.alignItems = 'center';
                dbActionsDiv.style.gap = '0.4rem';
                dbActionsDiv.style.marginTop = '0.35rem';
                dbActionsDiv.style.flexWrap = 'wrap';

                var currentValTrim = (itemData.tipo_ensayo || '').trim();
                var isHab = currentValTrim !== '' && window.CustomControlsManager.isHabitual(materialId, '', currentValTrim);

                if (isHab) {
                    var badge = document.createElement('span');
                    badge.className = 'badge cc-badge-habitual print-hidden';
                    badge.title = 'Ensayo guardado en tu base de datos activa';
                    badge.style.cssText = 'background:#e0e7ff; color:#3730a3; font-size:0.72rem; padding:0.2rem 0.5rem; border-radius:4px; font-weight:600;';
                    badge.textContent = '⭐ Guardado en tu base';
                    dbActionsDiv.appendChild(badge);
                } else {
                    var btnSaveHab = document.createElement('button');
                    btnSaveHab.type = 'button';
                    btnSaveHab.className = 'btn print-hidden';
                    btnSaveHab.title = 'Guardar este tipo de ensayo en tu base de datos activa';
                    btnSaveHab.style.cssText = 'font-size:0.75rem; padding:0.2rem 0.5rem; background:#f8fafc; border:1px solid #cbd5e1; border-radius:4px; cursor:pointer; color:#475569; font-weight:600;';
                    btnSaveHab.textContent = '⭐ Guardar en mi base';
                    btnSaveHab.onclick = async function() {
                        var textToSave = (inputTipo.value || '').trim();
                        if (!textToSave) {
                            alert('Escribe primero el nombre del ensayo en "Tipo de ensayo" antes de guardarlo en tu base.');
                            return;
                        }
                        itemData.tipo_ensayo = textToSave;
                        await window.CustomControlsManager.addHabitual(materialId, '', textToSave);
                        renderAll();
                    };
                    dbActionsDiv.appendChild(btnSaveHab);
                }

                if (habituals.length > 0) {
                    var quickSelect = document.createElement('select');
                    quickSelect.className = 'form-control print-hidden';
                    quickSelect.style.cssText = 'font-size:0.75rem; padding:0.15rem 0.4rem; height:auto; width:auto; max-width:220px; background:#f8fafc; color:#334155;';
                    var defaultOpt = document.createElement('option');
                    defaultOpt.value = '';
                    defaultOpt.textContent = '📂 Elegir de mi base (' + habituals.length + ')...';
                    quickSelect.appendChild(defaultOpt);
                    habituals.forEach(function(h) {
                        var opt = document.createElement('option');
                        opt.value = h;
                        opt.textContent = h;
                        if (h === currentValTrim) opt.selected = true;
                        quickSelect.appendChild(opt);
                    });
                    quickSelect.onchange = function(e) {
                        if (e.target.value) {
                            itemData.tipo_ensayo = e.target.value;
                            renderAll();
                        }
                    };
                    dbActionsDiv.appendChild(quickSelect);
                }

                groupTipo.appendChild(dbActionsDiv);
            }

            grid.appendChild(groupTipo);

            // Resto de campos idénticos a Fontanería y Gas / Ensayos geotécnicos
            var otherFields = [
                { id: 'zona', label: 'Zona ensayada / Ubicación', type: 'text' },
                { id: 'laboratorio_nombre', label: 'Laboratorio (Nombre)', type: 'text' },
                { id: 'fecha', label: 'Fecha del ensayo', type: 'date' },
                { id: 'resultado', label: 'Resultado', type: 'select', options: ['', 'Correcto', 'Incorrecto'] },
                { id: 'observaciones', label: 'Observaciones', type: 'text' }
            ];

            otherFields.forEach(function(f) {
                var group = document.createElement('div');
                group.style.display = 'flex';
                group.style.flexDirection = 'column';
                group.innerHTML = '<label style="font-weight: 600; margin-bottom: 5px;">' + f.label + '</label>';

                var input;
                if (f.type === 'select') {
                    input = document.createElement('select');
                    input.className = 'form-control';
                    (f.options || []).forEach(function(opt) {
                        var option = document.createElement('option');
                        option.value = opt;
                        option.textContent = opt === '' ? 'Seleccionar...' : opt;
                        input.appendChild(option);
                    });
                } else {
                    input = document.createElement('input');
                    input.type = f.type || 'text';
                    input.className = 'form-control';
                }

                input.value = itemData[f.id] || '';
                input.onchange = function(e) {
                    itemData[f.id] = e.target.value;
                    if (f.type === 'select' && typeof updateSelectStatusAttribute === 'function') {
                        updateSelectStatusAttribute(e.target);
                    }
                };

                group.appendChild(input);
                grid.appendChild(group);
            });

            itemDiv.appendChild(grid);
            listCont.appendChild(itemDiv);
        });

        addBtn.onclick = function() {
            data.lista_ensayos_varios.push({
                _title: 'Ensayo ' + (data.lista_ensayos_varios.length + 1),
                tipo_ensayo: '',
                zona: '',
                laboratorio_nombre: '',
                fecha: '',
                resultado: '',
                observaciones: ''
            });
            renderAll();
        };

        listCont.appendChild(addBtn);

        if (typeof updateSelectStatusAttribute === 'function') {
            container.querySelectorAll('select').forEach(updateSelectStatusAttribute);
        }
    }

    renderAll();
};
