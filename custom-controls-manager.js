// ==========================================================================
// Gestor de Puntos de Control Personalizados con Múltiples Bases de Datos
// ==========================================================================
(function() {
    const DB_NAME = 'CustomControlsDB_Multi';
    const DB_VERSION = 1;
    const STORE_NAME = 'databases';

    const DRIVE_FILENAME = 'puntos_personalizados.json';

    const CustomControlsManager = {
        catalog: {},
        activeDbId: 'internal', // 'internal', 'drive' o 'file_<nombre>'
        activeDbHandle: null,
        driveFileHandle: null, // Handle del archivo en Drive (si procede)
        dbHandles: [], // Lista de { id: string, name: string, handle: FileSystemFileHandle }
        get soportaDrive() { return !!window.DriveStore; },

        async initDB() {
            return new Promise((resolve, reject) => {
                const req = indexedDB.open(DB_NAME, DB_VERSION);
                req.onerror = () => reject(req.error);
                req.onsuccess = () => resolve(req.result);
                req.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    }
                };
            });
        },

        async loadSettingsAndHandles() {
            try {
                const db = await this.initDB();
                return new Promise((resolve) => {
                    const tx = db.transaction(STORE_NAME, 'readonly');
                    const store = tx.objectStore(STORE_NAME);
                    const req = store.getAll();
                    req.onsuccess = () => {
                        const all = req.result || [];
                        const activeSetting = all.find(x => x.id === 'settings_active_db');
                        if (activeSetting && activeSetting.value) {
                            this.activeDbId = activeSetting.value;
                        } else {
                            this.activeDbId = 'internal';
                        }
                        
                        this.dbHandles = all.filter(x => x.id.startsWith('file_'));
                        resolve();
                    };
                    req.onerror = () => resolve();
                });
            } catch (e) {
                console.warn('Error reading from DB:', e);
            }
        },

        async saveHandle(name, handle) {
            try {
                const db = await this.initDB();
                return new Promise((resolve, reject) => {
                    const tx = db.transaction(STORE_NAME, 'readwrite');
                    const store = tx.objectStore(STORE_NAME);
                    const id = 'file_' + name;
                    const req = store.put({ id: id, name: name, handle: handle, updatedAt: Date.now() });
                    req.onsuccess = () => {
                        if (!this.dbHandles.find(h => h.id === id)) {
                            this.dbHandles.push({ id, name, handle });
                        } else {
                            this.dbHandles.find(h => h.id === id).handle = handle;
                        }
                        resolve();
                    };
                    req.onerror = () => reject(req.error);
                });
            } catch (e) {
                console.warn('Error saving handle:', e);
            }
        },
        
        async removeHandle(id) {
            try {
                const db = await this.initDB();
                return new Promise((resolve, reject) => {
                    const tx = db.transaction(STORE_NAME, 'readwrite');
                    const store = tx.objectStore(STORE_NAME);
                    const req = store.delete(id);
                    req.onsuccess = () => {
                        this.dbHandles = this.dbHandles.filter(h => h.id !== id);
                        resolve();
                    };
                    req.onerror = () => reject(req.error);
                });
            } catch (e) {
                console.warn('Error removing handle:', e);
            }
        },

        async setActiveDb(dbId, isUserGesture = true) {
            this.activeDbId = dbId;
            try {
                const db = await this.initDB();
                await new Promise((resolve) => {
                    const tx = db.transaction(STORE_NAME, 'readwrite');
                    const store = tx.objectStore(STORE_NAME);
                    const req = store.put({ id: 'settings_active_db', value: dbId });
                    req.onsuccess = () => resolve();
                });
            } catch (e) {
                console.warn('Error saving active DB setting:', e);
            }
            
            await this.reloadActiveCatalog(isUserGesture);
            this.updateStatusUI();
            // Refrescar el modal solo si estaba abierto
            if (document.getElementById('cc-manager-modal')) {
                this.openManagerModal();
            }
        },

        async reloadActiveCatalog(isUserGesture = false) {
            this.catalog = {}; // Limpiar siempre antes de recargar
            if (this.activeDbId === 'internal') {
                this.activeDbHandle = null;
                this.driveFileHandle = null;
                try {
                    const localData = localStorage.getItem('cc_catalog_backup');
                    const parsed = localData ? JSON.parse(localData) : {};
                    // Adaptar si viene con el formato completo {version, points}
                    if (parsed && typeof parsed === 'object' && parsed.points && !Array.isArray(parsed.points)) {
                        this.catalog = parsed.points;
                    } else if (parsed && typeof parsed === 'object' && parsed.categories && !Array.isArray(parsed.categories)) {
                        this.catalog = parsed.categories;
                    } else {
                        this.catalog = parsed || {};
                    }
                } catch (e) {
                    this.catalog = {};
                }
            } else if (this.activeDbId === 'drive') {
                this.activeDbHandle = null;
                if (!window.DriveStore) {
                    // Drive no disponible: volver a modo interno sin perder la elección guardada
                    this.catalog = {};
                    return;
                }
                try {
                    if (!DriveStore.estaConectado()) {
                        if (!isUserGesture) {
                            // Sin interacción del usuario no se puede pedir token:
                            // dejamos el catálogo vacío y se completará cuando el
                            // usuario abra el gestor y haga la acción.
                            return;
                        }
                        await DriveStore.conectar();
                    }
                    const raiz = DriveStore.raiz();
                    this.driveFileHandle = await raiz.getFileHandle(DRIVE_FILENAME, { create: true });
                    try {
                        await this.readFile(this.driveFileHandle);
                    } catch (e) {
                        // Archivo recién creado o vacío; catálogo arrancará vacío
                        this.catalog = {};
                    }
                } catch (err) {
                    console.warn('No se pudo cargar la BD de Drive:', err);
                    this.catalog = {};
                }
            } else {
                const dbEntry = this.dbHandles.find(h => h.id === this.activeDbId);
                if (dbEntry && dbEntry.handle) {
                    this.activeDbHandle = dbEntry.handle;
                    try {
                        let perm = await this.activeDbHandle.queryPermission({ mode: 'readwrite' });
                        if (perm !== 'granted' && isUserGesture) {
                            perm = await this.activeDbHandle.requestPermission({ mode: 'readwrite' });
                        }
                        if (perm === 'granted') {
                            await this.readFile(this.activeDbHandle);
                        } else {
                            console.log('Permisos pendientes para la base de datos', dbEntry.name);
                            // Intentamos pedir permiso si el navegador lo permite sin evento de usuario
                            // Esto puede fallar si no hay interacción, por eso se pedirá en el botón
                        }
                    } catch (e) {
                        console.warn('Error con el handle', e);
                    }
                } else {
                    // Si no existe, volvemos a internal
                    this.activeDbId = 'internal';
                    await this.reloadActiveCatalog(isUserGesture);
                }
            }
        },

        async init() {
            await this.loadSettingsAndHandles();
            await this.reloadActiveCatalog(false);
            this.updateStatusUI();
        },

        updateStatusUI() {
            const btn = document.getElementById('btn-custom-controls');
            const statusText = document.getElementById('custom-controls-status-text');
            if (btn && statusText) {
                if (this.activeDbId === 'drive') {
                    btn.title = 'Base de datos activa: Google Drive';
                    btn.classList.remove('btn-secondary');
                    btn.classList.add('btn-outline-primary');
                    statusText.innerHTML = `<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#1565c0; margin-right:4px;"></span>Google Drive`;
                } else if (this.activeDbId !== 'internal') {
                    const dbEntry = this.dbHandles.find(h => h.id === this.activeDbId);
                    const name = dbEntry ? dbEntry.name : 'Desconocida';
                    btn.title = `Base de datos activa: ${name}`;
                    btn.classList.remove('btn-secondary');
                    btn.classList.add('btn-outline-primary');
                    statusText.innerHTML = `<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981; margin-right:4px;"></span>${name}`;
                } else {
                    btn.title = 'Base de datos interna (Navegador)';
                    btn.classList.remove('btn-outline-primary');
                    btn.classList.add('btn-secondary');
                    statusText.innerHTML = `<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#64748b; margin-right:4px;"></span>Base Interna`;
                }
            }
        },

        async readFile(handle) {
            try {
                const file = await handle.getFile();
                const text = await file.text();
                if (text && text.trim() !== '') {
                    const json = JSON.parse(text);
                    this.catalog = json.points || json.categories || json || {};
                }
                return true;
            } catch (err) {
                console.warn('Error leyendo archivo de puntos personalizados:', err);
                return false;
            }
        },

        async writeFile() {
            if (this.activeDbId === 'internal') {
                localStorage.setItem('cc_catalog_backup', JSON.stringify(this.catalog));
                return true;
            }

            if (this.activeDbId === 'drive') {
                if (!this.driveFileHandle) {
                    if (!window.DriveStore) return false;
                    try {
                        if (!DriveStore.estaConectado()) {
                            await DriveStore.conectar();
                        }
                        const raiz = DriveStore.raiz();
                        this.driveFileHandle = await raiz.getFileHandle(DRIVE_FILENAME, { create: true });
                    } catch (e) {
                        console.error('No se pudo obtener el archivo de Drive:', e);
                        return false;
                    }
                }
                try {
                    const writable = await this.driveFileHandle.createWritable();
                    const payload = {
                        version: 1,
                        description: "Base de datos de puntos de control de ejecución personalizados",
                        updatedAt: new Date().toISOString(),
                        points: this.catalog
                    };
                    await writable.write(JSON.stringify(payload, null, 2));
                    await writable.close();
                    return true;
                } catch (err) {
                    console.error('Error escribiendo en Drive:', err);
                    return false;
                }
            }

            if (!this.activeDbHandle) return false;

            try {
                let perm = await this.activeDbHandle.queryPermission({ mode: 'readwrite' });
                if (perm !== 'granted') {
                    perm = await this.activeDbHandle.requestPermission({ mode: 'readwrite' });
                    if (perm !== 'granted') return false;
                }

                const writable = await this.activeDbHandle.createWritable();
                const payload = {
                    version: 1,
                    description: "Base de datos de puntos de control de ejecución personalizados",
                    updatedAt: new Date().toISOString(),
                    points: this.catalog
                };
                await writable.write(JSON.stringify(payload, null, 2));
                await writable.close();
                return true;
            } catch (err) {
                console.error('Error escribiendo en archivo de puntos personalizados:', err);
                return false;
            }
        },

        async activarDrive() {
            if (!window.DriveStore) {
                alert('Google Drive no está disponible en esta aplicación.');
                return false;
            }
            try {
                if (!DriveStore.estaConectado()) {
                    await DriveStore.conectar();
                }
                await this.setActiveDb('drive', true);
                return true;
            } catch (err) {
                console.error('Error conectando con Drive:', err);
                alert('No se pudo conectar con Google Drive: ' + (err.message || err));
                return false;
            }
        },

        async openExistingFile() {
            if (!('showOpenFilePicker' in window)) {
                alert('Tu navegador no soporta showOpenFilePicker.');
                return false;
            }
            try {
                const handles = await window.showOpenFilePicker({
                    types: [{
                        description: 'Puntos de Control Personalizados (.json)',
                        accept: { 'application/json': ['.json'] }
                    }],
                    multiple: false
                });
                if (handles && handles.length > 0) {
                    const handle = handles[0];
                    await this.saveHandle(handle.name, handle);
                    await this.setActiveDb('file_' + handle.name);
                    alert(`¡Base de datos vinculada con éxito!\n\nCargada: ${handle.name}`);
                    return true;
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error al abrir archivo:', err);
                    alert('No se pudo abrir el archivo: ' + err.message);
                }
            }
            return false;
        },

        async createNewFile() {
            if (!('showSaveFilePicker' in window)) {
                alert('Tu navegador no soporta showSaveFilePicker.');
                return false;
            }
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: 'puntos_control_calidad.json',
                    types: [{
                        description: 'Puntos de Control Personalizados (.json)',
                        accept: { 'application/json': ['.json'] }
                    }]
                });
                if (handle) {
                    await this.saveHandle(handle.name, handle);
                    this.catalog = {};
                    // Crear todos los capítulos en blanco
                    if (typeof materialesTemplate !== 'undefined') {
                        materialesTemplate.forEach(mat => {
                            if (mat.category === 'recepcion' || mat.category === 'ejecucion' || mat.id === 'ensayos_varios') {
                                this.catalog[mat.id] = [];
                            }
                        });
                    }
                    this.activeDbHandle = handle;
                    this.activeDbId = 'file_' + handle.name;
                    await this.writeFile();
                    await this.setActiveDb(this.activeDbId);
                    alert(`¡Nueva base de datos creada con éxito!\n\n${handle.name}`);
                    return true;
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error al crear archivo:', err);
                    alert('No se pudo crear el archivo: ' + err.message);
                }
            }
            return false;
        },

        getKey(materialId, subType) {
            if (!subType || subType.trim() === '') return materialId;
            return `${materialId}::${subType.trim()}`;
        },

        // Base genérica (interna del navegador): siempre suma, esté o no activa
        readInternal() {
            try {
                const parsed = JSON.parse(localStorage.getItem('cc_catalog_backup') || '{}');
                if (parsed && parsed.points && !Array.isArray(parsed.points)) return parsed.points;
                if (parsed && parsed.categories && !Array.isArray(parsed.categories)) return parsed.categories;
                return parsed || {};
            } catch (e) { return {}; }
        },

        // Puntos de la base genérica + los de la base personal activa, sin repetir
        getPoints(materialId, subType) {
            const key = this.getKey(materialId, subType);
            const out = [];
            const sumar = (list) => (Array.isArray(list) ? list : []).forEach(p => { if (!out.includes(p)) out.push(p); });
            if (this.activeDbId !== 'internal') sumar(this.readInternal()[key]);
            sumar(this.catalog[key]);
            return out;
        },

        isHabitual(materialId, subType, pointText) {
            if (!pointText || !pointText.trim()) return false;
            return this.getPoints(materialId, subType).includes(pointText.trim());
        },

        async addHabitual(materialId, subType, pointText) {
            const text = pointText ? pointText.trim() : '';
            if (!text) return;

            const key = this.getKey(materialId, subType);
            if (!this.catalog[key]) this.catalog[key] = [];
            if (!this.catalog[key].includes(text)) {
                this.catalog[key].push(text);
                await this.writeFile();
            }
        },

        addHabitualPoint(materialId, subType, pointText) {
            return this.addHabitual(materialId, subType, pointText);
        },

        async removeHabitual(materialId, subType, pointText) {
            const text = pointText ? pointText.trim() : '';
            if (!text) return;
            const key = this.getKey(materialId, subType);
            if (this.catalog[key]) {
                this.catalog[key] = this.catalog[key].filter(p => p !== text);
                await this.writeFile();
            }
            // Si el punto viene de la base genérica, se quita también de ella
            // (si no, seguiría apareciendo al sumar las dos bases)
            if (this.activeDbId !== 'internal') {
                const interna = this.readInternal();
                if (Array.isArray(interna[key]) && interna[key].includes(text)) {
                    interna[key] = interna[key].filter(p => p !== text);
                    localStorage.setItem('cc_catalog_backup', JSON.stringify(interna));
                }
            }
        },

        removeHabitualPoint(materialId, subType, pointText) {
            return this.removeHabitual(materialId, subType, pointText);
        },

        hashCode(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = ((hash << 5) - hash) + str.charCodeAt(i);
                hash |= 0;
            }
            return Math.abs(hash);
        },

        prepareChecks(inst, materialId, subType, baseControles) {
            if (!inst.checks) inst.checks = {};
            
            const isNewZoneCreation = !inst.uid;
            
            if (isNewZoneCreation) {
                inst.checks._dbId = this.activeDbId;
            } else if (inst.checks._dbId === undefined) {
                inst.checks._dbId = 'internal';
            }

            // Los puntos de la ficha (base genérica) se muestran siempre,
            // sea cual sea la base activa: la personal solo añade puntos.
            const isCustomZone = false;

            const items = [];
            const baseWithoutOtros = baseControles.filter(c => c !== "Otros" && c !== "Otro");

            // 0. Limpiar puntos personalizados vacíos (eliminado para mantener el historial en las zonas de control)
            let habituals = [];

            // 1. Puntos base
            baseWithoutOtros.forEach((c, idx) => {
                const cId = 'chk_' + idx;
                if (!inst.checks[cId]) {
                    if (isNewZoneCreation || !isCustomZone) {
                        inst.checks[cId] = { val: '', obs: '', date: '', name: c };
                    }
                }
                
                const chk = inst.checks[cId];
                if (chk) {
                    const hasData = chk.val !== '' || chk.obs !== '' || chk.date !== '';
                    if (!isCustomZone || hasData) {
                        items.push({ cId, name: c, isBase: true, isCustom: false });
                    }
                }
            });

            // 2. Inyectar puntos habituales (SOLO al crear una zona nueva)
            // No queremos que un punto añadido hoy a la base de datos aparezca retroactivamente en zonas completadas ayer.
            if (isNewZoneCreation) {
                habituals = this.getPoints(materialId, subType);
                habituals.forEach(hText => {
                    let foundKey = Object.keys(inst.checks).find(k => inst.checks[k] && inst.checks[k].name === hText);
                    if (!foundKey) {
                        foundKey = 'chk_cust_' + this.hashCode(hText);
                        if (!inst.checks[foundKey]) {
                            inst.checks[foundKey] = { val: '', obs: '', date: '', name: hText, isCustom: true };
                        }
                    } else {
                        inst.checks[foundKey].isCustom = true;
                    }
                    if (!items.find(it => it.cId === foundKey)) {
                        items.push({ cId: foundKey, name: hText, isBase: false, isCustom: true });
                    }
                });
            }

            // 3. Puntos personalizados existentes en esta zona
            Object.keys(inst.checks).forEach(k => {
                if (k.startsWith('chk_cust_')) {
                    const chk = inst.checks[k];
                    if (chk) {
                        chk.isCustom = true;
                        if (!items.find(it => it.cId === k)) {
                            items.push({ cId: k, name: chk.name || '', isBase: false, isCustom: true });
                        }
                    }
                } else if (k === 'chk_otros' && inst.checks[k]) {
                    const chk = inst.checks[k];
                    const name = (chk.name || '').trim();
                    if (name !== '' && name !== 'Otros' && name !== 'Otro') {
                        chk.isCustom = true;
                        if (!items.find(it => it.cId === k)) {
                            items.push({ cId: k, name: name, isBase: false, isCustom: true });
                        }
                    }
                }
            });

            return items;
        },

        renderPointCell(inst, index, item, prefix, materialId, subType) {
            const cId = item.cId;
            const chk = inst.checks[cId] || { val: '', obs: '', date: '', name: item.name };
            const cName = chk.name !== undefined ? chk.name : item.name;

            if (item.isOtros) {
                return `<input type='text' class='form-control ${prefix}-chk-name' data-idx='${index}' data-cid='${cId}' value='${cName === "Otros" ? "" : cName.replace(/'/g, '&#39;')}' placeholder='Otros (especificar)...' style='border:none; width:100%; padding:0.2rem; font-size:0.85rem; background:transparent;'>`;
            }

            if (item.isCustom) {
                const isHab = this.isHabitual(materialId, subType, cName);
                return `
                    <div style="display:flex; align-items:center; gap:0.4rem; width:100%;">
                        <input type='text' class='form-control ${prefix}-chk-name' data-idx='${index}' data-cid='${cId}' value='${cName.replace(/'/g, '&#39;')}' placeholder='Punto de control personalizado...' style='border:1px solid var(--border); border-radius:4px; padding:0.25rem 0.4rem; font-size:0.85rem; background:#fff; flex:1;'>
                        ${isHab 
                            ? `<span class="badge cc-badge-habitual print-hidden" title="Punto guardado en tu base de datos activa" style="background:#e0e7ff; color:#3730a3; font-size:0.7rem; padding:0.2rem 0.45rem; border-radius:4px; white-space:nowrap; font-weight:600;">⭐ Habitual</span>`
                            : `<button type="button" class="btn ${prefix}-btn-make-habitual print-hidden" data-idx="${index}" data-cid="${cId}" title="Guardar como habitual en la base de datos activa" style="font-size:0.75rem; padding:0.2rem 0.45rem; background:#f8fafc; border:1px solid #cbd5e1; border-radius:4px; cursor:pointer; white-space:nowrap; color:#475569; font-weight:600;">⭐ Guardar habitual</button>`
                        }
                        <button type="button" class="btn ${prefix}-btn-del-custom print-hidden" data-idx="${index}" data-cid="${cId}" title="Eliminar punto de control" style="background:transparent; border:none; color:#ef4444; cursor:pointer; font-size:1rem; padding:0.15rem; line-height:1;">🗑️</button>
                    </div>
                `;
            }

            return `<span style="font-weight:500; color:#334155;">${cName}</span>`;
        },

        renderAddPointButton(index, prefix) {
            return `<button type="button" class="btn ${prefix}-btn-add-custom-point" data-idx="${index}" style="font-size:0.8rem; padding:0.25rem 0.6rem; border:1px dashed var(--primary); background:transparent; color:var(--primary); font-weight:600; cursor:pointer; border-radius:4px;" title="Añadir un punto de control personalizado a esta zona">+ Añadir punto de control</button>`;
        },

        bindCustomEvents(wrapper, data, materialId, getSubType, renderAll, prefix) {
            wrapper.querySelectorAll(`.${prefix}-btn-add-custom-point`).forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = e.currentTarget.dataset.idx;
                    const inst = data.instances[idx];
                    if (!inst) return;
                    if (!inst.checks) inst.checks = {};
                    const newCid = 'chk_cust_' + Date.now();
                    inst.checks[newCid] = { val: '', obs: '', date: '', name: '', isCustom: true, isManual: true };
                    renderAll();
                });
            });

            wrapper.querySelectorAll(`.${prefix}-btn-make-habitual`).forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const idx = e.currentTarget.dataset.idx;
                    const cid = e.currentTarget.dataset.cid;
                    const inst = data.instances[idx];
                    if (!inst || !inst.checks[cid]) return;
                    const text = (inst.checks[cid].name || '').trim();
                    if (!text) {
                        alert('Escribe primero el texto del punto de control antes de guardarlo como habitual.');
                        return;
                    }
                    const subType = typeof getSubType === 'function' ? getSubType(inst) : (inst.tipo || '');
                    
                    await this.addHabitual(materialId, subType, text);
                    renderAll();
                });
            });

            wrapper.querySelectorAll(`.${prefix}-btn-del-custom`).forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = e.currentTarget.dataset.idx;
                    const cid = e.currentTarget.dataset.cid;
                    const inst = data.instances[idx];
                    if (!inst || !inst.checks[cid]) return;
                    const text = (inst.checks[cid].name || '').trim();
                    const subType = typeof getSubType === 'function' ? getSubType(inst) : (inst.tipo || '');
                    
                    this.promptDeletePoint(materialId, subType, text, (removeFromDatabase) => {
                        delete inst.checks[cid];
                        renderAll();
                    });
                });
            });
        },

        promptDelete(pointText, materialId, subType) {
            return new Promise((resolve) => {
                const existingModal = document.getElementById('cc-delete-modal');
                if (existingModal) existingModal.remove();

                const modalOverlay = document.createElement('div');
                modalOverlay.id = 'cc-delete-modal';
                modalOverlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.5); z-index:99999; display:flex; align-items:center; justify-content:center; padding:1rem;';

                modalOverlay.innerHTML = `
                    <div style="background:white; border-radius:8px; max-width:520px; width:100%; padding:1.5rem; box-shadow:0 10px 25px rgba(0,0,0,0.2); font-family:system-ui, -apple-system, sans-serif;">
                        <h3 style="margin-top:0; color:#dc2626; font-size:1.15rem; display:flex; align-items:center; gap:0.5rem;">
                            <span>🗑️</span> Eliminar punto de control
                        </h3>
                        <p style="font-size:0.95rem; margin-bottom:0.5rem;">Estás a punto de eliminar el siguiente punto de control:</p>
                        <div style="background:#f1f5f9; padding:0.75rem; border-radius:6px; font-weight:600; font-size:0.9rem; margin-bottom:1rem; color:#1e293b; border-left:4px solid var(--primary);">
                            ${pointText}
                        </div>
                        <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:1.5rem;">
                            Este punto está registrado en tu <strong>base de datos activa</strong>. ¿Dónde deseas eliminarlo?
                        </p>
                        <div style="display:flex; flex-direction:column; gap:0.75rem;">
                            <button id="cc-del-only-zone" class="btn" style="background:#f8fafc; border:1px solid var(--border); text-align:left; padding:0.75rem; border-radius:6px; cursor:pointer;">
                                <div style="font-weight:bold; color:#1e293b;">1. Solo en esta obra / zona</div>
                                <div style="font-size:0.8rem; color:var(--text-muted);">Se quita de esta zona actual, pero continuará apareciendo como punto habitual en futuros proyectos.</div>
                            </button>
                            <button id="cc-del-both" class="btn" style="background:#fef2f2; border:1px solid #f87171; text-align:left; padding:0.75rem; border-radius:6px; cursor:pointer;">
                                <div style="font-weight:bold; color:#dc2626;">2. También en la base de datos activa</div>
                                <div style="font-size:0.8rem; color:#b91c1c;">Se elimina de la zona y se borra de la BD activa, por lo que ya no volverá a sugerirse.</div>
                            </button>
                            <button id="cc-del-cancel" class="btn" style="background:transparent; border:none; text-align:center; padding:0.5rem; color:var(--text-muted); cursor:pointer; text-decoration:underline;">
                                Cancelar
                            </button>
                        </div>
                    </div>
                `;

                document.body.appendChild(modalOverlay);

                modalOverlay.querySelector('#cc-del-only-zone').onclick = () => { modalOverlay.remove(); resolve('zone'); };
                modalOverlay.querySelector('#cc-del-both').onclick = async () => {
                    modalOverlay.remove(); resolve('all'); 
                };
                modalOverlay.querySelector('#cc-del-cancel').onclick = () => { modalOverlay.remove(); resolve('cancel'); };
            });
        },

        async promptDeletePoint(materialId, subType, pointText, onConfirmDelete) {
            const isHab = this.isHabitual(materialId, subType, pointText);
            if (!isHab) {
                if (await window.appConfirmar(`¿Eliminar el punto de control de esta zona?\n\n"${pointText || 'Punto personalizado'}"`)) {
                    onConfirmDelete(false);
                }
                return;
            }
            const action = await this.promptDelete(pointText, materialId, subType);
            if (action === 'cancel') return;
            if (action === 'all') {
                await this.removeHabitual(materialId, subType, pointText);
                onConfirmDelete(true);
            } else if (action === 'zone') {
                onConfirmDelete(false);
            }
        },

        async openManagerModal() {
            const existing = document.getElementById('cc-manager-modal');
            if (existing) existing.remove();

            // Recarga perezosa de Drive: si el usuario tiene Drive activo pero
            // aún no cargamos el archivo (no había gesto en el arranque),
            // ahora que ha hecho clic en el botón sí lo tenemos.
            if (this.activeDbId === 'drive' && !this.driveFileHandle && window.DriveStore) {
                try {
                    await this.reloadActiveCatalog(true);
                } catch (e) {
                    console.warn('No se pudo cargar la BD de Drive:', e);
                }
            }

            const modal = document.createElement('div');
            modal.id = 'cc-manager-modal';
            modal.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.5); z-index:9999; display:flex; align-items:center; justify-content:center; padding:1rem;';

            let keysHtml = '';
            const validTemplate = typeof materialesTemplate !== 'undefined' ? materialesTemplate : [];
            
            // 1. Filtrar las keys que ya están en el catálogo, ignorando "basura" (ej. globales guardadas por error)
            let allKeys = Object.keys(this.catalog).filter(k => {
                if (validTemplate.length === 0) return true;
                const parts = k.split('::');
                return validTemplate.some(m => m.id === parts[0]);
            });
            
            // 2. Añadir todos los capítulos posibles de ejecución/recepción (y Otros de ensayos) en blanco
            validTemplate.forEach(mat => {
                if ((mat.category === 'recepcion' || mat.category === 'ejecucion' || mat.id === 'ensayos_varios') && !allKeys.includes(mat.id)) {
                    allKeys.push(mat.id);
                }
            });

            // 3. Ordenar según el orden de materialesTemplate para que Excavaciones sea siempre el primero de ejecución
            if (validTemplate.length > 0) {
                const orderMap = {};
                validTemplate.forEach((m, idx) => { orderMap[m.id] = idx; });
                allKeys.sort((a, b) => {
                    const idA = a.split('::')[0];
                    const idB = b.split('::')[0];
                    const idxA = orderMap[idA] !== undefined ? orderMap[idA] : 9999;
                    const idxB = orderMap[idB] !== undefined ? orderMap[idB] : 9999;
                    if (idxA !== idxB) return idxA - idxB;
                    return a.localeCompare(b);
                });
            }

            if (allKeys.length === 0) {
                keysHtml = '<p style="color:var(--text-muted); font-style:italic; text-align:center; padding:2rem 0;">No tienes puntos habituales guardados en esta base de datos.<br>Aparecerán aquí cuando los guardes como habituales desde cualquier zona.</p>';
            } else {
                allKeys.forEach(k => {
                    let points = this.catalog[k] || [];
                    if (!Array.isArray(points)) return;
                    
                    const parts = k.split('::');
                    let friendlyName = parts[0].replace(/^ejec_/, '').replace(/^rec_/, '').replace(/_/g, ' ').toUpperCase();
                    if (validTemplate.length > 0) {
                        const template = validTemplate.find(m => m.id === parts[0]);
                        if (template) {
                            if (template.id === 'rec_otros') {
                                friendlyName = 'OTROS (CONTROL DE RECEPCIÓN)';
                            } else if (template.id === 'ejec_otros') {
                                friendlyName = 'OTROS (CONTROL DE EJECUCIÓN)';
                            } else if (template.id === 'ensayos_varios') {
                                friendlyName = 'OTROS (ENSAYOS Y PRUEBAS DE SERVICIO)';
                            } else {
                                friendlyName = template.name.toUpperCase();
                            }
                        }
                    }

                    const capName = friendlyName;
                    const subName = parts[1] ? ` (${parts[1]})` : '';

                    let pointsHtml = '';
                    if (points.length === 0) {
                        pointsHtml = '<li style="padding:0.5rem; text-align:center; color:var(--text-muted); font-style:italic;">Capítulo vacío</li>';
                    } else {
                        pointsHtml = points.map((p, idx) => `
                            <li draggable="true" class="cc-draggable-point" data-key="${k}" data-idx="${idx}" style="display:flex; justify-content:space-between; align-items:center; padding:0.35rem 0; border-bottom:1px solid #f1f5f9; cursor:grab;">
                                <div style="display:flex; align-items:center; flex:1; gap:0.5rem; overflow-wrap: anywhere;">
                                    <span style="color:#94a3b8; cursor:grab;" title="Arrastrar para reordenar">☰</span>
                                    <span>${p}</span>
                                </div>
                                <div style="display:flex; gap:0.25rem;">
                                    <button class="btn cc-btn-remove-catalog-point" data-key="${k}" data-text="${p.replace(/"/g, '&quot;')}" style="background:transparent; border:none; color:#ef4444; cursor:pointer; font-size:0.85rem; padding:0.1rem 0.4rem;" title="Eliminar de la base de datos">✕</button>
                                </div>
                            </li>
                        `).join('');
                    }

                    keysHtml += `
                        <div style="margin-bottom:1rem; border:1px solid var(--border); border-radius:6px; overflow:hidden;">
                            <div style="background:#f1f5f9; padding:0.5rem 0.75rem; font-weight:bold; font-size:0.85rem; color:#334155; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
                                <span>${capName}${subName} (${points.length} puntos)</span>
                                <button class="btn btn-secondary cc-btn-add-point" data-key="${k}" style="font-size:0.75rem; padding:0.2rem 0.5rem; background:white;">+ Añadir punto</button>
                            </div>
                            <ul style="margin:0; padding:0.5rem 1rem; list-style:none; font-size:0.85rem;">
                                ${pointsHtml}
                            </ul>
                        </div>
                    `;
                });
            }

            // Construir lista de bases de datos
            let dbsListHtml = `
                <div class="db-option ${this.activeDbId === 'internal' ? 'active-db' : ''}" data-id="internal" style="padding:0.75rem; border:1px solid ${this.activeDbId === 'internal' ? '#3b82f6' : 'var(--border)'}; border-radius:6px; margin-bottom:0.5rem; cursor:pointer; background:${this.activeDbId === 'internal' ? '#eff6ff' : '#fff'}; display:flex; justify-content:space-between; align-items:center; gap:0.5rem;">
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight:600; color:#1e293b; overflow-wrap: anywhere;">🏠 Base Interna Original</div>
                        <div style="font-size:0.8rem; color:var(--text-muted); overflow-wrap: anywhere;">Puntos guardados en la memoria de este navegador</div>
                    </div>
                    <div style="flex-shrink: 0;">
                        ${this.activeDbId === 'internal' ? '<span style="color:#3b82f6; font-weight:bold;">✓ Activa</span>' : '<button class="btn btn-secondary cc-btn-activate-db" data-id="internal" style="font-size:0.75rem; padding:0.2rem 0.5rem;">Activar</button>'}
                    </div>
                </div>
            `;

            // Opción de Google Drive (si DriveStore está disponible)
            if (this.soportaDrive) {
                const isActive = this.activeDbId === 'drive';
                dbsListHtml += `
                    <div class="db-option ${isActive ? 'active-db' : ''}" data-id="drive" style="padding:0.75rem; border:1px solid ${isActive ? '#3b82f6' : 'var(--border)'}; border-radius:6px; margin-bottom:0.5rem; cursor:pointer; background:${isActive ? '#eff6ff' : '#fff'}; display:flex; justify-content:space-between; align-items:center; gap:0.5rem;">
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight:600; color:#1e293b; overflow-wrap: anywhere;">☁️ Google Drive</div>
                            <div style="font-size:0.8rem; color:var(--text-muted); overflow-wrap: anywhere;">Archivo <code>${DRIVE_FILENAME}</code> en tu carpeta "Control de Calidad". Se sincroniza entre tus dispositivos.</div>
                        </div>
                        <div style="flex-shrink: 0;">
                            ${isActive ? '<span style="color:#3b82f6; font-weight:bold;">✓ Activa</span>' : '<button class="btn btn-secondary cc-btn-activate-drive" style="font-size:0.75rem; padding:0.2rem 0.5rem;">Activar</button>'}
                        </div>
                    </div>
                `;
            }

            this.dbHandles.forEach(dbEntry => {
                const isActive = this.activeDbId === dbEntry.id;
                dbsListHtml += `
                    <div class="db-option ${isActive ? 'active-db' : ''}" data-id="${dbEntry.id}" style="padding:0.75rem; border:1px solid ${isActive ? '#3b82f6' : 'var(--border)'}; border-radius:6px; margin-bottom:0.5rem; cursor:pointer; background:${isActive ? '#eff6ff' : '#fff'}; display:flex; justify-content:space-between; align-items:center; gap:0.5rem;">
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight:600; color:#1e293b; overflow-wrap: anywhere;">📁 ${dbEntry.name}</div>
                            <div style="font-size:0.8rem; color:var(--text-muted); overflow-wrap: anywhere;">Archivo .json externo</div>
                        </div>
                        <div style="display:flex; gap:0.5rem; align-items:center; flex-shrink: 0;">
                            ${isActive ? '<span style="color:#3b82f6; font-weight:bold;">✓ Activa</span>' : `<button class="btn btn-secondary cc-btn-activate-db" data-id="${dbEntry.id}" style="font-size:0.75rem; padding:0.2rem 0.5rem;">Activar</button>`}
                            <button class="btn cc-btn-forget-db" data-id="${dbEntry.id}" style="background:transparent; border:none; color:#dc2626; cursor:pointer; padding:0.2rem;" title="Olvidar archivo">✕</button>
                        </div>
                    </div>
                `;
            });

            modal.innerHTML = `
                <div style="background:white; border-radius:8px; max-width:800px; width:100%; max-height:90vh; display:flex; flex-direction:column; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
                    <div style="padding:1rem 1.5rem; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
                        <h2 style="margin:0; font-size:1.25rem; color:var(--text-main); display:flex; align-items:center; gap:0.5rem;">
                            🗄️ Gestor de Bases de Datos
                        </h2>
                        <button id="cc-modal-close" class="btn" style="background:transparent; border:none; font-size:1.5rem; cursor:pointer; line-height:1;">&times;</button>
                    </div>
                    
                    <div style="display:flex; flex:1; overflow:hidden;">
                        <!-- Panel Izquierdo: Lista de Bases -->
                        <div style="width:40%; border-right:1px solid var(--border); background:#f8fafc; display:flex; flex-direction:column; padding:1.25rem; overflow-y:auto;">
                            <h4 style="margin:0 0 1rem 0; font-size:1rem; font-weight:bold; color:#334155;">Mis Bases de Datos</h4>
                            
                            <div style="flex:1;">
                                ${dbsListHtml}
                            </div>
                            
                            <div style="margin-top:1.5rem; display:flex; flex-direction:column; gap:0.5rem;">
                                <button id="cc-btn-open-file" class="btn btn-primary" style="font-size:0.85rem; padding:0.6rem; text-align:center;">
                                    ➕ Vincular archivo existente
                                </button>
                                <button id="cc-btn-create-file" class="btn" style="font-size:0.85rem; padding:0.6rem; text-align:center; background:#f0fdf4; border:1px solid #86efac; color:#166534; cursor:pointer;">
                                    📝 Crear nuevo archivo .json
                                </button>
                            </div>
                        </div>

                        <!-- Panel Derecho: Contenido de la BD Activa -->
                        <div style="width:60%; padding:1.25rem; overflow-y:auto;">
                            <h4 style="margin:0 0 0.5rem 0; font-size:1rem; font-weight:bold; color:#1e293b;">Puntos en la base activa</h4>
                            <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0; margin-bottom:1.5rem;">
                                Mostrando los puntos guardados en: <strong>${this.activeDbId === 'internal' ? 'Base Interna' : (this.activeDbId === 'drive' ? 'Google Drive' : this.dbHandles.find(h=>h.id===this.activeDbId)?.name)}</strong>
                            </p>
                            <div id="cc-catalog-list">
                                ${keysHtml}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            modal.querySelector('#cc-modal-close').onclick = () => modal.remove();

            modal.querySelector('#cc-btn-open-file').onclick = async () => {
                await this.openExistingFile();
            };

            modal.querySelector('#cc-btn-create-file').onclick = async () => {
                await this.createNewFile();
            };

            modal.querySelectorAll('.cc-btn-activate-db').forEach(btn => {
                btn.onclick = async (e) => {
                    const id = e.currentTarget.dataset.id;
                    await this.setActiveDb(id);
                };
            });

            const btnActDrive = modal.querySelector('.cc-btn-activate-drive');
            if (btnActDrive) {
                btnActDrive.onclick = async () => {
                    btnActDrive.disabled = true;
                    btnActDrive.textContent = 'Conectando…';
                    await this.activarDrive();
                };
            }
            
            modal.querySelectorAll('.cc-btn-forget-db').forEach(btn => {
                btn.onclick = async (e) => {
                    e.stopPropagation();
                    const id = e.currentTarget.dataset.id;
                    if (await window.appConfirmar("¿Seguro que quieres desvincular este archivo? No se borrará de tu disco, solo se quitará de la lista.", { titulo: 'Desvincular base de datos', aceptar: 'Desvincular' })) {
                        await this.removeHandle(id);
                        if(this.activeDbId === id) {
                            await this.setActiveDb('internal');
                        } else {
                            this.openManagerModal(); // refrescar
                        }
                    }
                };
            });

            modal.querySelectorAll('.cc-btn-remove-catalog-point').forEach(btn => {
                btn.onclick = async (e) => {
                    e.preventDefault();
                    const k = e.currentTarget.dataset.key;
                    const text = e.currentTarget.dataset.text;
                    const parts = k.split('::');
                    
                    if (await window.appConfirmar(`¿Eliminar permanentemente este punto del catálogo activo?\n\n"${text}"`)) {
                        await this.removeHabitual(parts[0], parts[1] || '', text);
                        this.openManagerModal();
                    }
                };
            });

            modal.querySelectorAll('.cc-btn-add-point').forEach(btn => {
                btn.onclick = async (e) => {
                    e.preventDefault();
                    const k = e.currentTarget.dataset.key;
                    const text = await window.appPedirTexto('Nuevo punto habitual', 'Introduce el nuevo punto de control para este capítulo:', '', 'Ej. Comprobación de...');
                    if (text && text.trim()) {
                        const parts = k.split('::');
                        await this.addHabitual(parts[0], parts[1] || '', text.trim());
                        this.openManagerModal();
                    }
                };
            });

            let draggedItem = null;
            let draggedIdx = -1;
            let draggedKey = '';

            modal.querySelectorAll('.cc-draggable-point').forEach(li => {
                li.addEventListener('dragstart', (e) => {
                    const el = e.currentTarget;
                    draggedItem = el;
                    draggedIdx = parseInt(el.dataset.idx, 10);
                    draggedKey = el.dataset.key;
                    e.dataTransfer.effectAllowed = 'move';
                    setTimeout(() => el.style.opacity = '0.5', 0);
                });

                li.addEventListener('dragend', (e) => {
                    e.currentTarget.style.opacity = '1';
                    draggedItem = null;
                });

                li.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    const el = e.currentTarget;
                    if (el.dataset.key !== draggedKey) return;
                    
                    const bounding = el.getBoundingClientRect();
                    const offset = bounding.y + (bounding.height / 2);
                    if (e.clientY - offset > 0) {
                        el.style.borderBottom = '2px solid #3b82f6';
                        el.style.borderTop = '';
                    } else {
                        el.style.borderTop = '2px solid #3b82f6';
                        el.style.borderBottom = '';
                    }
                });

                li.addEventListener('dragleave', (e) => {
                    const el = e.currentTarget;
                    el.style.borderTop = '';
                    el.style.borderBottom = '1px solid #f1f5f9';
                });

                li.addEventListener('drop', (e) => {
                    e.preventDefault();
                    const el = e.currentTarget;
                    el.style.borderTop = '';
                    el.style.borderBottom = '1px solid #f1f5f9';
                    
                    if (el.dataset.key !== draggedKey || !draggedItem || draggedItem === el) return;
                    
                    const targetIdx = parseInt(el.dataset.idx, 10);
                    
                    const arr = this.catalog[draggedKey];
                    const [movedItem] = arr.splice(draggedIdx, 1);
                    
                    const bounding = el.getBoundingClientRect();
                    const offset = bounding.y + (bounding.height / 2);
                    let insertIdx = targetIdx;
                    
                    if (e.clientY - offset > 0) {
                        insertIdx++;
                    }
                    if (draggedIdx < insertIdx) {
                        insertIdx--;
                    }
                    
                    arr.splice(insertIdx, 0, movedItem);
                    
                    this.openManagerModal();
                    this.writeFile().catch(console.error);
                });
            });
        }
    };

    window.CustomControlsManager = CustomControlsManager;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => CustomControlsManager.init());
    } else {
        CustomControlsManager.init();
    }
})();
