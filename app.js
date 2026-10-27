// Estado global de la aplicación
let currentProject = {
    name: "",
    selectedMaterials: [],
    formData: {}
};
let currentActiveCategory = null;
let projectDirHandle = null;
let projectFileHandle = null;
let projectDirty = false;   // hay cambios sin guardar
let dirtySeq = 0;           // contador de cambios (para no perder los hechos durante un guardado)

// Gestor de IndexedDB para obras recientes
const DB = {
    name: 'GestorObrasDB',
    version: 1,
    store: 'recent_projects',
    
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.name, this.version);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.store)) {
                    const objectStore = db.createObjectStore(this.store, { keyPath: 'id' });
                    objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    },

    async saveProject(id, name, dirHandle, fileHandle) {
        try {
            const db = await this.init();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this.store, 'readwrite');
                const store = tx.objectStore(this.store);
                const project = {
                    id: id,
                    name: name || 'Obra sin nombre',
                    dirHandle: dirHandle,
                    fileHandle: fileHandle,
                    timestamp: Date.now()
                };
                const request = store.put(project);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch(e) { console.error("Error saving to DB", e); }
    },

    async getRecentProjects() {
        try {
            const db = await this.init();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this.store, 'readonly');
                const store = tx.objectStore(this.store);
                const index = store.index('timestamp');
                
                const request = index.openCursor(null, 'prev');
                const results = [];
                
                request.onsuccess = (e) => {
                    const cursor = e.target.result;
                    if (cursor && results.length < 10) {
                        results.push(cursor.value);
                        cursor.continue();
                    } else {
                        resolve(results);
                    }
                };
                request.onerror = () => reject(request.error);
            });
        } catch(e) { console.error("Error loading from DB", e); return []; }
    },
    
    async deleteProject(id) {
        try {
            const db = await this.init();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this.store, 'readwrite');
                const store = tx.objectStore(this.store);
                const request = store.delete(id);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch(e) { console.error("Error deleting from DB", e); }
    }
};

// Referencias a elementos del DOM
const screens = {
    home: document.getElementById('screen-home'),
    setup: document.getElementById('screen-setup'),
    control: document.getElementById('screen-control'),
    print: document.getElementById('screen-print')
};

const btns = {
    new: document.getElementById('btn-new-project'),
    home: document.getElementById('btn-home'),
    backSetup: document.getElementById('btn-back-setup'),
    save: document.getElementById('btn-save'),
    print: document.getElementById('btn-print'),
    customControls: document.getElementById('btn-custom-controls')
};

const inputs = {
    projectName: document.getElementById('project-name'),
    location: document.getElementById('project-location'),
    promoter: document.getElementById('project-promoter'),
    do: document.getElementById('project-do'),
    de: document.getElementById('project-de'),
    tech: document.getElementById('project-tech'),
    dateStart: document.getElementById('project-date-start'),
    dateEnd: document.getElementById('project-date-end')
};

btns.load = document.getElementById('btn-load-project');

if (btns.customControls) {
    btns.customControls.addEventListener('click', () => {
        if (window.CustomControlsManager) window.CustomControlsManager.openManagerModal();
    });
}
const btnCustomControlsHome = document.getElementById('btn-custom-controls-home');
if (btnCustomControlsHome) {
    btnCustomControlsHome.addEventListener('click', () => {
        if (window.CustomControlsManager) window.CustomControlsManager.openManagerModal();
    });
}

if (inputs.de && inputs.tech) {
    inputs.de.addEventListener('input', function() {
        if (!inputs.tech.dataset.manual) {
            inputs.tech.value = this.value;
        }
    });
    inputs.tech.addEventListener('input', function() {
        if (this.value !== inputs.de.value) {
            this.dataset.manual = 'true';
        }
    });
}

const containers = {
    gridRecepcion: document.getElementById('grid-recepcion'),
    gridEjecucion: document.getElementById('grid-ejecucion'),
    gridEnsayos: document.getElementById('grid-ensayos'),
    tabs: document.getElementById('materials-tabs'),
    content: document.getElementById('materials-content')
};

// ---------------------------------------------------------------------------
// Ventanas propias de la aplicación (sustituyen a alert, confirm y prompt del navegador)
// ---------------------------------------------------------------------------
// Ventana genérica. Devuelve una promesa con el valor del botón pulsado, o null si se cierra
// (Escape o clic fuera). buttons: [{ label, value, primary?, danger? }]
// opciones.campo: { valor, placeholder } añade un campo de texto (su valor se devuelve con el botón principal)
window.appChoice = function(title, message, buttons, opciones = {}) {
    return new Promise(resolve => {
        const anterior = document.activeElement;
        const overlay = document.createElement('div');
        overlay.className = 'app-modal-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999999;padding:1rem;';
        const modal = document.createElement('div');
        modal.className = 'app-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.style.cssText = 'background:#fff;padding:1.75rem;border-radius:8px;border:1px solid #cbd5e1;box-shadow:0 10px 25px rgba(0,0,0,0.15);max-width:480px;width:100%;text-align:center;max-height:90vh;overflow:auto;';
        const h = document.createElement('h3');
        h.textContent = title;
        h.style.cssText = 'margin:0 0 1rem 0;color:#1e293b;font-size:1.2rem;';
        const p = document.createElement('p');
        p.textContent = message;
        p.style.cssText = 'margin-bottom:1.5rem;line-height:1.5;color:#475569;white-space:pre-line;text-align:' + (message.length > 160 ? 'left' : 'center') + ';';
        let input = null;
        if (opciones.campo) {
            input = document.createElement('input');
            input.type = 'text';
            input.className = 'form-control';
            input.value = opciones.campo.valor || '';
            input.placeholder = opciones.campo.placeholder || '';
            input.style.cssText = 'width:100%;margin:-0.5rem 0 1.5rem 0;border:1px solid #cbd5e1;border-radius:6px;padding:0.6rem 0.75rem;';
        }
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;justify-content:center;gap:0.75rem;flex-wrap:wrap;';
        const cerrar = (v) => {
            document.removeEventListener('keydown', teclas, true);
            overlay.remove();
            if (anterior && anterior.focus) { try { anterior.focus(); } catch (e) {} }
            resolve(v);
        };
        let principal = null;
        buttons.forEach(b => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn ' + (b.primary ? 'btn-primary' : 'btn-secondary');
            btn.textContent = b.label;
            if (b.danger) { btn.style.background = '#fee2e2'; btn.style.borderColor = '#fca5a5'; btn.style.color = '#991b1b'; }
            btn.addEventListener('click', () => cerrar(input && (b.primary || b.danger) ? { boton: b.value, texto: input.value } : b.value));
            row.appendChild(btn);
            if (b.primary || (b.danger && !principal)) principal = btn;
        });
        function teclas(e) {
            if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cerrar(null); }
            else if (e.key === 'Enter' && principal && (e.target === input || !e.target.closest || !e.target.closest('button'))) { e.preventDefault(); principal.click(); }
        }
        document.addEventListener('keydown', teclas, true);
        overlay.addEventListener('click', e => { if (e.target === overlay) cerrar(null); });
        modal.append(h, p);
        if (input) modal.append(input);
        modal.append(row);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        setTimeout(() => { const f = input || principal; if (f) f.focus(); if (input) input.select(); }, 0);
    });
};

// Aviso informativo (no detiene la aplicación)
window.appAlert = function(mensaje, titulo = 'Aviso') {
    return window.appChoice(titulo, String(mensaje), [{ label: 'Aceptar', value: true, primary: true }]);
};
// Todos los avisos de las fichas usan la ventana de la aplicación
window.alert = function(mensaje) { window.appAlert(mensaje); };

// Confirmación. Devuelve una promesa con true/false.
// opciones: { titulo, aceptar (texto del botón), peligro (true: botón rojo, para borrar) }
window.appConfirmar = function(mensaje, opciones = {}) {
    const peligro = opciones.peligro !== false;
    return window.appChoice(opciones.titulo || (peligro ? 'Confirmar eliminación' : 'Confirmar'), String(mensaje), [
        { label: 'Cancelar', value: false },
        { label: opciones.aceptar || (peligro ? 'Eliminar' : 'Aceptar'), value: true, primary: !peligro, danger: peligro }
    ]).then(v => v === true);
};

// Compatibilidad con el uso existente: appConfirm(mensaje, alAceptar)
window.appConfirm = function(mensaje, onConfirm, opciones) {
    window.appConfirmar(mensaje, opciones).then(ok => { if (ok && onConfirm) onConfirm(); });
};

// Petición de texto. Devuelve una promesa con el texto, o null si se cancela.
window.appPedirTexto = function(titulo, mensaje, valorInicial = '', placeholder = '') {
    return window.appChoice(titulo, String(mensaje), [
        { label: 'Cancelar', value: false },
        { label: 'Aceptar', value: true, primary: true }
    ], { campo: { valor: valorInicial, placeholder } }).then(r => (r && r.boton === true) ? r.texto : null);
};

// ---------------------------------------------------------------------------
// "Todo Correcto hoy": si en la zona hay puntos negativos (No Correcto / Incorrecto...),
// preguntar antes si se quieren cambiar también. Si no, se respetan su resultado y su fecha.
// ---------------------------------------------------------------------------
const VALORES_NEGATIVOS = ['no correcto', 'incorrecto', 'no cumple', 'no conforme', 'rechazado'];

function selectorDeCampo(el) {
    let sel = el.tagName.toLowerCase();
    // Solo clases y atributos estables (no los que cambian según el valor seleccionado)
    const inestables = ['empty-select', 'status-ok', 'status-ko', 'status-na', 'unused-row'];
    el.classList.forEach(c => { if (!inestables.includes(c)) sel += '.' + CSS.escape(c); });
    Array.from(el.attributes).forEach(a => {
        if (a.name.startsWith('data-') && a.name !== 'data-status') sel += `[${a.name}="${CSS.escape(a.value)}"]`;
    });
    return sel;
}

document.addEventListener('click', async function(e) {
    const btn = e.target && e.target.closest ? e.target.closest('button') : null;
    if (!btn || !/-btn-fill-all\b/.test(btn.className)) return;
    if (btn.dataset.state === 'undo' || btn._fillBypass) return;

    // Zona = primer contenedor ascendente que incluye desplegables de resultado
    let zona = btn.parentElement;
    while (zona && !zona.querySelector('select')) zona = zona.parentElement;
    if (!zona) return;

    const negativos = Array.from(zona.querySelectorAll('select')).filter(s =>
        VALORES_NEGATIVOS.includes((s.value || '').trim().toLowerCase()));
    if (negativos.length === 0) return; // nada que preguntar: comportamiento normal

    e.stopImmediatePropagation();
    e.preventDefault();

    const n = negativos.length;
    const etiqueta = negativos[0].value;
    const opcion = await window.appChoice(
        'Puntos no correctos',
        `En esta zona hay ${n} punto${n > 1 ? 's' : ''} marcado${n > 1 ? 's' : ''} como «${etiqueta}».\n¿Quieres cambiar${n > 1 ? 'los' : 'lo'} también a «Correcto»?`,
        [
            { label: 'Cancelar', value: null },
            { label: `No, mantener${n > 1 ? 'los' : 'lo'}`, value: 'keep' },
            { label: 'Sí, cambiar todos', value: 'all', primary: true }
        ]
    );
    if (!opcion) return;

    // Guardar el estado de los puntos negativos (resultado y fecha de su fila)
    const guardados = negativos.map(s => {
        const tr = s.closest('tr');
        const fecha = tr ? tr.querySelector('input[type="date"]') : null;
        return {
            selSel: selectorDeCampo(s), valor: s.value,
            fechaSel: fecha ? selectorDeCampo(fecha) : null, fecha: fecha ? fecha.value : null
        };
    });
    // Buscar solo dentro de la ficha actual (varios módulos comparten prefijos de clase)
    const ambito = btn.closest('.material-section') || document.getElementById('materials-content') || document;

    btn._fillBypass = true;
    try { btn.click(); } finally { btn._fillBypass = false; }

    if (opcion === 'keep') {
        // El módulo puede haber redibujado la zona: buscar de nuevo cada campo y restaurarlo
        // disparando su evento "change" para que el propio módulo actualice sus datos.
        guardados.forEach(g => {
            const s = ambito.querySelector(g.selSel);
            if (s) {
                s.value = g.valor;
                s.dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (g.fechaSel) {
                const f = ambito.querySelector(g.fechaSel);
                if (f) {
                    f.value = g.fecha;
                    f.setAttribute('value', g.fecha);
                    f.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        });
    }
}, true);

// Global click interceptor to enforce zonaDate rules on new instances
document.body.addEventListener('click', function(e) {
    if (e.target && e.target.tagName === 'BUTTON' && e.target.id && e.target.id.endsWith('-btn-add')) {
        const currentTab = document.querySelector('.tab.active');
        if (currentTab) {
            const currentMatId = currentTab.dataset.target;
            const template = materialesTemplate.find(m => m.id === currentMatId);
            if (template && template.category === 'ejecucion') {
                const emptyDates = Array.from(document.querySelectorAll('#section-' + currentMatId + ' input[type="date"][class*="-zonadate"]')).filter(input => !input.value);
                if (emptyDates.length > 0) {
                    alert("Por favor, rellene la fecha en todas las zonas de control existentes antes de añadir una nueva.");
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }
                
                // Inject the default date for the NEW instance that is about to be created
                setTimeout(() => {
                    const currentData = currentProject.formData[currentMatId];
                    if (currentData && currentData.instances && currentData.instances.length > 0) {
                        const newInst = currentData.instances[currentData.instances.length - 1];
                        if (!newInst.zonaDate) {
                            newInst.zonaDate = localToday();
                            if (template.customRenderer && typeof window[template.customRenderer] === 'function') {
                                const section = document.getElementById('section-' + currentMatId);
                                window[template.customRenderer](section, currentMatId);
                            }
                        }
                    }
                }, 10);
            }
        }
    }
}, true);

// Navegación
function showScreen(screenId) {
    if (screens['control'].classList.contains('active') && screenId !== 'control') {
        const currentTab = document.querySelector('.tab.active');
        if (currentTab) {
            const currentMatId = currentTab.dataset.target;
            const template = materialesTemplate.find(m => m.id === currentMatId);
            if (template && template.category === 'ejecucion') {
                const emptyDates = Array.from(document.querySelectorAll('#section-' + currentMatId + ' input[type="date"][class*="-zonadate"]')).filter(input => !input.value);
                if (emptyDates.length > 0) {
                    alert("Por favor, rellene la fecha en todas las zonas de control antes de salir.");
                    return;
                }
            }
        }
    }

    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenId].classList.add('active');
    
    // Configurar botones del header según la pantalla
    btns.home.style.display = screenId === 'home' ? 'none' : 'inline-flex';
    btns.backSetup.style.display = (screenId === 'control' || screenId === 'print') ? 'inline-flex' : 'none';
    btns.save.style.display = (screenId === 'setup' || screenId === 'control' || screenId === 'print') ? 'inline-flex' : 'none';
    btns.print.style.display = (screenId === 'setup' || screenId === 'control') ? 'inline-flex' : 'none';
    if (btns.customControls) btns.customControls.style.display = (screenId === 'setup' || screenId === 'control') ? 'inline-flex' : 'none';
    const btnNoConf = document.getElementById('btn-noconf');
    if (btnNoConf) btnNoConf.style.display = (screenId === 'setup' || screenId === 'control' || screenId === 'print') ? 'inline-flex' : 'none';
    if (screenId !== 'home' && typeof actualizarIndicadores === 'function') actualizarIndicadores();
    
    document.getElementById('project-subtitle').textContent = 
        currentProject.name ? currentProject.name : 'Gestor de Obras';
        
    const controlNameEl = document.getElementById('control-project-name');
    if (controlNameEl) {
        controlNameEl.textContent = currentProject.name ? currentProject.name : '---';
    }
        
    if (screenId === 'home') {
        renderRecentProjects();
    }
    
    // Mover las acciones del header al contenedor correspondiente de la pantalla
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
        let targetContainer = document.getElementById('header-actions-container-' + screenId);
        if (targetContainer) {
            targetContainer.appendChild(headerActions);
        } else if (screenId === 'home') {
            // Si estamos en home y no hay contenedor, lo volvemos a poner en el header original temporalmente
            // o simplemente lo dejamos oculto (sus botones ya se ocultan).
            const mainHeader = document.querySelector('header');
            if (mainHeader) mainHeader.appendChild(headerActions);
        }
    }
}

// Inicialización de la pantalla de setup
function initSetup() {
    inputs.projectName.value = currentProject.name || '';
    inputs.location.value = currentProject.location || '';
    if (inputs.promoter) inputs.promoter.value = currentProject.promoter || '';
    if (inputs.do) inputs.do.value = currentProject.do || '';
    if (inputs.de) inputs.de.value = currentProject.de || '';
    inputs.tech.value = currentProject.tech || '';
    if (inputs.dateStart) inputs.dateStart.value = currentProject.dateStart || '';
    if (inputs.dateEnd) inputs.dateEnd.value = currentProject.dateEnd || '';
    containers.gridRecepcion.innerHTML = '';
    containers.gridEjecucion.innerHTML = '';
    containers.gridEnsayos.innerHTML = '';
    
    const detailsObra = document.getElementById('details-datos-obra');
    if (detailsObra) {
        detailsObra.setAttribute('open', '');
    }
    
    // Ensure the other accordions are closed
    const otherAccordions = document.querySelectorAll('.category-accordion:not(#details-datos-obra)');
    otherAccordions.forEach(acc => acc.removeAttribute('open'));
    
    materialesTemplate.forEach(mat => {
        const isChecked = currentProject.selectedMaterials.includes(mat.id);
        
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="checkbox" class="material-checkbox" value="${escHtml(mat.id)}" ${isChecked ? 'checked' : ''}>
            <div class="material-card">
                <span class="material-name">${mat.name}</span>
                <div style="display:flex; gap:0.25rem; flex-shrink: 0;">
                    <button class="btn-explore" title="Explorar documentos de este capítulo">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="#60A5FA" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                            <circle cx="12" cy="13" r="3" fill="#fff"></circle>
                        </svg>
                    </button>
                    <button class="btn-import" title="Importar documentos a este capítulo">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="#FDE047" stroke="#CA8A04" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                            <line x1="12" y1="11" x2="12" y2="17"></line>
                            <line x1="9" y1="14" x2="15" y2="14"></line>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        // Añadir eventos de Drag and Drop e Importación
        const cardElement = label.querySelector('.material-card');
        cardElement.addEventListener('dragover', handleDragOver);
        cardElement.addEventListener('dragleave', handleDragLeave);
        cardElement.addEventListener('drop', (e) => handleDrop(e, mat));
        
        const importBtn = label.querySelector('.btn-import');
        importBtn.addEventListener('click', (e) => handleImportClick(e, mat));

        const exploreBtn = label.querySelector('.btn-explore');
        exploreBtn.addEventListener('click', (e) => handleExploreClick(e, mat));

        if (mat.category === 'recepcion') containers.gridRecepcion.appendChild(label);
        else if (mat.category === 'ejecucion') containers.gridEjecucion.appendChild(label);
        else if (mat.category === 'ensayos') containers.gridEnsayos.appendChild(label);
    });
}

// Funciones de Drag and Drop
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
}

async function handleDrop(e, mat) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    await saveFilesToChapter(Array.from(e.dataTransfer.files), mat);
}

async function handleImportClick(e, mat) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.showOpenFilePicker) {
        alert("Tu navegador no soporta esta función nativa de selección de archivos. Prueba arrastrando y soltando.");
        return;
    }
    
    try {
        // Asegurar que tenemos la carpeta principal
        if (!projectDirHandle) {
            try {
                projectDirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
            } catch (err) {
                return;
            }
        }
        
        let catFolderName = "";
        if (mat.category === 'recepcion') catFolderName = 'Control de recepción';
        else if (mat.category === 'ejecucion') catFolderName = 'Control de ejecución';
        else if (mat.category === 'ensayos') catFolderName = 'Ensayos y pruebas de servicio';
        
        const catHandle = await projectDirHandle.getDirectoryHandle(catFolderName, { create: true });
        const safeName = mat.name.replace(/[\\/:*?"<>|]/g, '-');
        const chapterHandle = await catHandle.getDirectoryHandle(safeName, { create: true });

        const fileHandles = await window.showOpenFilePicker({
            multiple: true,
            startIn: chapterHandle
        });
        
        const files = [];
        for (const handle of fileHandles) {
            const file = await handle.getFile();
            files.push(file);
        }
        
        await saveFilesToChapter(files, mat);
        
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error(err);
            alert("Error al abrir los archivos: " + err.message);
        }
    }
}

async function saveFilesToChapter(files, mat) {
    if (files.length === 0) return;
    
    // Verificar si tenemos acceso a la carpeta de la obra
    if (!projectDirHandle) {
        try {
            projectDirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
        } catch (err) {
            return; // Usuario canceló
        }
    }
    
    // Confirmación
    let confirmMsg = "";
    if (files.length === 1) {
        confirmMsg = `¿Estás seguro de que quieres guardar el archivo "${files[0].name}" en el capítulo "${mat.name}"?`;
    } else {
        confirmMsg = `¿Estás seguro de que quieres guardar ${files.length} archivos en el capítulo "${mat.name}"?`;
    }
    
    if (!(await window.appConfirmar(confirmMsg, { titulo: 'Guardar documentos', aceptar: 'Guardar', peligro: false }))) return;
    
    try {
        // Mapear categoría al nombre de carpeta
        let catFolderName = "";
        if (mat.category === 'recepcion') catFolderName = 'Control de recepción';
        else if (mat.category === 'ejecucion') catFolderName = 'Control de ejecución';
        else if (mat.category === 'ensayos') catFolderName = 'Ensayos y pruebas de servicio';
        
        const catHandle = await projectDirHandle.getDirectoryHandle(catFolderName, { create: true });
        
        const safeName = mat.name.replace(/[\\/:*?"<>|]/g, '-');
        const chapterHandle = await catHandle.getDirectoryHandle(safeName, { create: true });
        
        for (const file of files) {
            const fileHandle = await chapterHandle.getFileHandle(file.name, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(file);
            await writable.close();
        }
        
        alert(`¡Guardado exitosamente en ${catFolderName} > ${safeName}!`);
        
    } catch (err) {
        console.error("Error al guardar archivo:", err);
        alert("Error al guardar: " + err.message);
    }
}



// Generador de Formularios
function renderControlForms() {
    try {
        const controlNameEl = document.getElementById('control-project-name');
        if (controlNameEl) {
            controlNameEl.textContent = currentProject.name ? currentProject.name : '---';
        }

        containers.tabs.innerHTML = '';
        containers.content.innerHTML = '';
        
        if (currentProject.selectedMaterials.length === 0) return;

        // Filtrar por categoría activa manteniendo el orden de materialesTemplate
        const materialsToRender = materialesTemplate
            .filter(m => m.category === currentActiveCategory && currentProject.selectedMaterials.includes(m.id))
            .map(m => m.id);

        if (materialsToRender.length === 0) {
            containers.tabs.innerHTML = '<div style="padding: 2rem;">No hay fichas seleccionadas en esta sección. Vuelve a "Ajustar Fichas" y marca alguna.</div>';
            return;
        }

    materialsToRender.forEach((matId, index) => {
        const template = materialesTemplate.find(m => m.id === matId);
        if (!template) return;
        
        // Inicializar datos si no existen
        if (!currentProject.formData[matId]) {
            currentProject.formData[matId] = {};
        }
        const data = currentProject.formData[matId];

        // Crear pestaña
        const tab = document.createElement('button');
        tab.className = `tab ${index === 0 ? 'active' : ''}`;
        tab.textContent = template.name;
        tab.onclick = () => activateTab(matId);
        tab.dataset.target = matId;
        containers.tabs.appendChild(tab);

        // Crear sección (ficha)
        const section = document.createElement('div');
        section.className = `material-section ${index === 0 ? 'active' : ''}`;
        section.id = `section-${matId}`;
        section.style.display = index === 0 ? 'block' : 'none';

        if (template.customRenderer && typeof window[template.customRenderer] === 'function') {
            window[template.customRenderer](section, matId);
        } else if (template.sections) {
            renderMaterial(section, matId, template);
        }
        
        containers.content.appendChild(section);
    });
    if (typeof updateSelectStatusAttribute === 'function') {
        setTimeout(() => {
            document.querySelectorAll('select').forEach(updateSelectStatusAttribute);
        }, 60);
    }
    actualizarIndicadores();
    } catch (err) {
        alert("Error en la renderización: " + err.message + "\nStack: " + err.stack);
        console.error(err);
    }
}

function activateTab(matId) {
    const currentTab = document.querySelector('.tab.active');
    if (currentTab && currentTab.dataset.target !== matId) {
        const currentMatId = currentTab.dataset.target;
        const template = materialesTemplate.find(m => m.id === currentMatId);
        if (template && template.category === 'ejecucion') {
            const emptyDates = Array.from(document.querySelectorAll('#section-' + currentMatId + ' input[type="date"][class*="-zonadate"]')).filter(input => !input.value);
            if (emptyDates.length > 0) {
                alert("Por favor, rellene la fecha en todas las zonas de control antes de cambiar de ficha.");
                return;
            }
        }
    }

    // Actualizar tabs
    document.querySelectorAll('.tab').forEach(t => {
        t.classList.toggle('active', t.dataset.target === matId);
    });
    
    // Actualizar secciones
    document.querySelectorAll('.material-section').forEach(s => {
        s.style.display = s.id === `section-${matId}` ? 'block' : 'none';
    });

    if (typeof updateSelectStatusAttribute === 'function') {
        setTimeout(() => {
            document.querySelectorAll('#section-' + matId + ' select').forEach(updateSelectStatusAttribute);
        }, 30);
    }
}

// Funciones de Obras Recientes
async function renderRecentProjects() {
    const container = document.getElementById('recent-projects-container');
    const list = document.getElementById('recent-projects-list');
    
    if (!container || !list) return;

    if (window.Almacen && Almacen.modo === 'drive') { await renderObrasDrive(container, list); return; }

    const projects = await DB.getRecentProjects();
    
    if (projects.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    list.innerHTML = '';
    
    projects.forEach((p, idx) => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #cbd5e1';
        tr.style.backgroundColor = idx % 2 === 0 ? '#f8fafc' : '#f1f5f9';
        tr.style.transition = 'background 0.2s';
        
        tr.onmouseover = () => tr.style.backgroundColor = '#e2e8f0';
        tr.onmouseout = () => tr.style.backgroundColor = idx % 2 === 0 ? '#f8fafc' : '#f1f5f9';
        
        const dateStr = new Date(p.timestamp).toLocaleString();
        
        const nameTd = document.createElement('td');
        nameTd.style.padding = '0.75rem 1rem';
        nameTd.style.color = '#334155';
        nameTd.style.fontWeight = '500';
        nameTd.textContent = p.name || 'Sin título';
        
        const dateTd = document.createElement('td');
        dateTd.style.padding = '0.75rem 1rem';
        dateTd.style.color = '#64748b';
        dateTd.style.fontSize = '0.9rem';
        dateTd.textContent = dateStr;
        
        const actionTd = document.createElement('td');
        actionTd.style.padding = '0.75rem 1rem';
        actionTd.style.textAlign = 'center';
        actionTd.style.display = 'flex';
        actionTd.style.gap = '0.5rem';
        actionTd.style.justifyContent = 'center';
        
        const btnView = document.createElement('button');
        btnView.innerHTML = '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>';
        btnView.style.background = 'none';
        btnView.style.border = 'none';
        btnView.style.cursor = 'pointer';
        btnView.style.color = '#475569';
        btnView.title = 'Abrir Obra';
        btnView.onclick = () => loadRecentProject(p);
        
        const btnEdit = document.createElement('button');
        btnEdit.innerHTML = '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>';
        btnEdit.style.background = 'none';
        btnEdit.style.border = 'none';
        btnEdit.style.cursor = 'pointer';
        btnEdit.style.color = '#475569';
        btnEdit.title = 'Renombrar en historial';
        btnEdit.onclick = async (e) => {
            e.stopPropagation();
            const newName = await window.appPedirTexto('Renombrar obra', 'Nuevo nombre para el historial de obras recientes:', p.name);
            if (newName && newName.trim() !== '') {
                await DB.saveProject(p.id, newName.trim(), p.dirHandle, p.fileHandle);
                renderRecentProjects();
            }
        };
        
        const btnDelete = document.createElement('button');
        btnDelete.innerHTML = '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>';
        btnDelete.style.background = 'none';
        btnDelete.style.border = 'none';
        btnDelete.style.cursor = 'pointer';
        btnDelete.style.color = '#475569';
        btnDelete.title = 'Eliminar del historial';
        btnDelete.onclick = async (e) => {
            e.stopPropagation();
            if (await window.appConfirmar(`¿Quitar '${p.name}' del historial reciente? (No se borrarán los archivos)`, { titulo: 'Quitar del historial', aceptar: 'Quitar' })) {
                await DB.deleteProject(p.id);
                renderRecentProjects();
            }
        };
        
        actionTd.appendChild(btnView);
        actionTd.appendChild(btnEdit);
        actionTd.appendChild(btnDelete);
        
        tr.appendChild(nameTd);
        tr.appendChild(dateTd);
        tr.appendChild(actionTd);
        
        list.appendChild(tr);
    });
}

async function verifyPermission(fileHandle, readWrite) {
    const options = {};
    if (readWrite) {
        options.mode = 'readwrite';
    }
    if ((await fileHandle.queryPermission(options)) === 'granted') {
        return true;
    }
    if ((await fileHandle.requestPermission(options)) === 'granted') {
        return true;
    }
    return false;
}

async function loadRecentProject(p) {
    try {
        if (!p.fileHandle && !p.dirHandle) {
            alert("No se encontró el archivo de la obra.");
            return;
        }

        let canReadDir = false;
        if (p.dirHandle) {
            canReadDir = await verifyPermission(p.dirHandle, true);
        }

        let fileHandle = p.fileHandle;
        if (canReadDir) {
            try {
                // Al obtener el archivo desde el directorio, hereda los permisos ya concedidos
                fileHandle = await p.dirHandle.getFileHandle('datos_obra.json');
            } catch(e) {
                console.error("datos_obra.json no encontrado en el dirHandle", e);
            }
        }

        if (!fileHandle) {
            alert("No se pudo localizar el archivo de configuración de la obra.");
            return;
        }

        const canRead = await verifyPermission(fileHandle, true);
        if (!canRead) {
            alert("Es necesario otorgar permisos para leer el archivo guardado.");
            return;
        }

        const file = await fileHandle.getFile();
        const text = await file.text();
        const data = JSON.parse(text);

        if (data.name !== undefined && data.selectedMaterials) {
            currentProject = data;
            projectFileHandle = p.fileHandle;
            if (canReadDir) {
                projectDirHandle = p.dirHandle;
            } else {
                projectDirHandle = null;
            }
            
            // Actualizar la fecha en DB para que sea la más reciente
            await DB.saveProject(p.id, currentProject.name, projectDirHandle, projectFileHandle);
            projectDirty = false;
            
            initSetup();
            showScreen('setup');
        } else {
            alert("El archivo parece corrupto o inválido.");
        }
    } catch(err) {
        console.error(err);
        alert("Hubo un error al intentar abrir la obra reciente: " + err.message);
    }
}

// ===========================================================================
// Selección de almacén: carpeta del ordenador (como hasta ahora) o Google Drive
// ===========================================================================
window.Almacen = { modo: 'local' };
const soportaLocal = ('showDirectoryPicker' in window);
const soportaDrive = (location.protocol !== 'file:'); // Drive necesita una dirección web (no file://)

function pintarSelectorAlmacen() {
    if (document.getElementById('almacen-selector')) return;
    const refBtn = document.getElementById('btn-new-project');
    if (!refBtn) return;
    const grupo = refBtn.parentElement;
    const barra = document.createElement('div');
    barra.id = 'almacen-selector';
    barra.style.cssText = 'display:flex; align-items:center; justify-content:center; flex-wrap:wrap; gap:0.5rem; margin:0 auto 1.25rem auto; position:relative; z-index:10; font-size:0.95rem; color:#334155;';
    barra.innerHTML =
        '<span style="font-weight:600;">Guardar mis obras en:</span>' +
        '<button id="almacen-local" type="button" class="btn">💻 Este ordenador</button>' +
        '<button id="almacen-drive" type="button" class="btn">☁️ Google Drive</button>' +
        '<span id="almacen-estado" style="font-size:0.85rem; color:#64748b; width:100%; text-align:center;"></span>';
    grupo.parentElement.insertBefore(barra, grupo);

    const bl = barra.querySelector('#almacen-local');
    const bd = barra.querySelector('#almacen-drive');
    const est = barra.querySelector('#almacen-estado');
    const marcar = () => {
        [bl, bd].forEach(b => { b.style.borderRadius = '6px'; b.style.padding = '0.45rem 1rem'; b.style.fontWeight = '600'; });
        const act = (b, on) => { b.style.background = on ? '#dbeafe' : '#f8fafc'; b.style.color = on ? '#1e40af' : '#334155'; b.style.border = on ? '2px solid #2563eb' : '1px solid #cbd5e1'; };
        act(bl, Almacen.modo === 'local'); act(bd, Almacen.modo === 'drive');
    };
    if (!soportaLocal) { bl.style.opacity = '0.5'; bl.title = 'Este navegador no permite elegir una carpeta del ordenador'; }
    bl.onclick = () => {
        if (!soportaLocal) { window.appAlert('Este navegador no permite guardar en una carpeta del ordenador. Usa Google Drive, o abre la aplicación en Chrome o Edge en un ordenador.'); return; }
        Almacen.modo = 'local'; est.textContent = ''; marcar(); renderRecentProjects();
    };
    bd.onclick = async () => {
        if (!soportaDrive) { window.appAlert('Para usar Google Drive, abre la aplicación desde su dirección web (https://…), no como archivo local en el ordenador.', 'Google Drive'); return; }
        if (!window.DriveStore) { window.appAlert('No se pudo cargar el módulo de Google Drive.', 'Google Drive'); return; }
        if (!DriveStore.estaConectado()) {
            est.textContent = 'Conectando con Google…';
            try { await DriveStore.conectar(); }
            catch (e) { est.textContent = ''; window.appAlert('No se pudo conectar con Google Drive: ' + (e && e.message ? e.message : e) + '\n\nComprueba que has permitido el acceso en la ventana de Google.', 'Google Drive'); return; }
        }
        Almacen.modo = 'drive';
        est.textContent = '✓ Conectado a Google Drive · tus obras se guardan en tu Drive, en la carpeta «Control de Calidad».';
        marcar(); renderRecentProjects();
    };
    if (!soportaLocal && soportaDrive) { Almacen.modo = 'drive'; est.textContent = 'En este dispositivo las obras se guardan en Google Drive. Pulsa «Google Drive» para conectar.'; }
    marcar();
}

// --- Obras en Google Drive ---
async function nuevaObraDrive() {
    let nombre = await window.appPedirTexto('Nueva obra en Google Drive', 'Escribe el nombre de la obra. Se creará una carpeta con ese nombre en tu Drive.', '', 'Ej: Edificio Residencial Los Pinos');
    if (nombre == null) return;
    nombre = nombre.trim(); if (!nombre) return;
    const safe = nombre.replace(/[\\/:*?"<>|]/g, '-');
    try {
        const raiz = DriveStore.raiz();
        let dir = null, existente = null;
        try { existente = await raiz.getDirectoryHandle(safe, { create: false }); } catch (e) {}
        if (existente) {
            let tieneDatos = null; try { tieneDatos = await existente.getFileHandle('datos_obra.json'); } catch (e) {}
            if (tieneDatos) {
                const op = await window.appChoice('Ya existe una obra con ese nombre',
                    `En tu Google Drive ya hay una obra llamada «${nombre}». Para no perder sus datos no se creará otra.`,
                    [{ label: 'Cancelar', value: null }, { label: 'Abrir esa obra', value: 'open', primary: true }]);
                if (op === 'open') await loadProjectFromDirHandle(existente);
                return;
            }
            dir = existente;
        } else {
            dir = await raiz.getDirectoryHandle(safe, { create: true });
        }
        projectDirHandle = dir;
        await dir.getDirectoryHandle('Control de recepción', { create: true });
        await dir.getDirectoryHandle('Control de ejecución', { create: true });
        await dir.getDirectoryHandle('Ensayos y pruebas de servicio', { create: true });
        projectFileHandle = await dir.getFileHandle('datos_obra.json', { create: true });
        currentProject = { name: nombre, location: '', tech: '', date: '', selectedMaterials: [], formData: {} };
        const w = await projectFileHandle.createWritable(); await w.write(JSON.stringify(currentProject, null, 2)); await w.close();
        projectDirty = false; initSetup(); showScreen('setup');
    } catch (err) {
        console.error(err);
        window.appAlert('No se pudo crear la obra en Google Drive: ' + (err && err.message ? err.message : err), 'Google Drive');
    }
}

async function listarObrasDrive() {
    const raiz = DriveStore.raiz();
    const obras = [];
    for await (const e of raiz.values()) {
        if (e.kind !== 'directory') continue;
        let fh = null; try { fh = await e.getFileHandle('datos_obra.json'); } catch (_) { continue; }
        let nombre = e.name;
        try { const d = JSON.parse(await (await fh.getFile()).text()); if (d && d.name) nombre = d.name; } catch (_) {}
        obras.push({ dir: e, nombre, modif: e.modifiedTime || '' });
    }
    obras.sort((a, b) => (b.modif || '').localeCompare(a.modif || ''));
    return obras;
}

async function renderObrasDrive(container, list) {
    list.innerHTML = '';
    let obras = [];
    try { obras = await listarObrasDrive(); } catch (e) { container.style.display = 'none'; return; }
    if (!obras.length) { container.style.display = 'none'; return; }
    container.style.display = 'block';
    obras.forEach((o, idx) => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #cbd5e1';
        tr.style.backgroundColor = idx % 2 === 0 ? '#f8fafc' : '#f1f5f9';
        const nameTd = document.createElement('td');
        nameTd.style.cssText = 'padding:0.75rem 1rem; color:#334155; font-weight:500;';
        nameTd.textContent = o.nombre || 'Sin título';
        const dateTd = document.createElement('td');
        dateTd.style.cssText = 'padding:0.75rem 1rem; color:#64748b; font-size:0.9rem;';
        dateTd.textContent = o.modif ? new Date(o.modif).toLocaleString() : '';
        const actionTd = document.createElement('td');
        actionTd.style.cssText = 'padding:0.75rem 1rem; text-align:center;';
        const btnView = document.createElement('button');
        btnView.className = 'btn btn-secondary';
        btnView.style.cssText = 'padding:0.35rem 0.9rem; font-size:0.85rem;';
        btnView.textContent = 'Abrir';
        btnView.onclick = () => loadProjectFromDirHandle(o.dir);
        actionTd.appendChild(btnView);
        tr.append(nameTd, dateTd, actionTd);
        list.appendChild(tr);
    });
}

async function abrirObraDrive() {
    let obras = [];
    try { obras = await listarObrasDrive(); }
    catch (e) { window.appAlert('No se pudieron leer las obras de tu Drive: ' + (e && e.message ? e.message : e), 'Google Drive'); return; }
    if (!obras.length) { window.appAlert('Todavía no hay obras en tu Google Drive. Crea una con «Nueva Obra».', 'Google Drive'); return; }
    const botones = obras.slice(0, 20).map((o, i) => ({ label: o.nombre, value: i }));
    botones.push({ label: 'Cancelar', value: null });
    const op = await window.appChoice('Abrir obra de Google Drive', 'Elige la obra que quieres abrir:', botones);
    if (op != null && obras[op]) await loadProjectFromDirHandle(obras[op].dir);
}

// Event Listeners principales
btns.new.addEventListener('click', () => {
    if (window.Almacen && Almacen.modo === 'drive') { nuevaObraDrive(); return; }
    if (!window.showDirectoryPicker) {
        alert("Tu navegador no soporta la creación de carpetas locales. Usa Chrome, Edge u Opera.");
        return;
    }

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';
    
    const modal = document.createElement('div');
    modal.style.backgroundColor = '#fff';
    modal.style.padding = '2rem';
    modal.style.borderRadius = '0';
    modal.style.border = '1px solid #000';
    modal.style.maxWidth = '500px';
    modal.style.textAlign = 'center';
    
    const title = document.createElement('h3');
    title.textContent = "Carpeta de la Obra";
    title.style.marginTop = '0';
    
    const msg = document.createElement('p');
    msg.textContent = "Seleccione la carpeta donde se guardarán los datos de esta obra. Si todavía no ha creado la carpeta, primero créela y luego selecciónela. Es recomendable que sea una carpeta exclusiva para cada obra.";
    msg.style.marginBottom = '1.5rem';
    msg.style.lineHeight = '1.5';
    
    const btnDiv = document.createElement('div');
    btnDiv.style.display = 'flex';
    btnDiv.style.justifyContent = 'center';
    btnDiv.style.gap = '1rem';
    
    const continueBtn = document.createElement('button');
    continueBtn.className = 'btn btn-primary';
    continueBtn.textContent = 'Seleccionar Carpeta';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.textContent = 'Cancelar';
    
    btnDiv.appendChild(cancelBtn);
    btnDiv.appendChild(continueBtn);
    
    modal.appendChild(title);
    modal.appendChild(msg);
    modal.appendChild(btnDiv);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    continueBtn.addEventListener('click', async () => {
        document.body.removeChild(overlay);
        try {
            // 1. Pedir carpeta
            const dirElegida = await window.showDirectoryPicker({ mode: 'readwrite' });

            // 1b. Si la carpeta ya contiene una obra, no sobrescribirla
            let existente = null;
            try { existente = await dirElegida.getFileHandle('datos_obra.json'); } catch (e) { existente = null; }
            if (existente) {
                let nombreExistente = '';
                try {
                    const j = JSON.parse(await (await existente.getFile()).text());
                    nombreExistente = j && j.name ? j.name : '';
                } catch (e) { /* archivo ilegible: se trata igual, sin sobrescribir */ }
                const op = await window.appChoice(
                    'Esta carpeta ya contiene una obra',
                    (nombreExistente ? `La carpeta seleccionada ya tiene los datos de la obra «${nombreExistente}».` : 'La carpeta seleccionada ya tiene un archivo datos_obra.json.') +
                    '\nPara no perder esos datos, no se creará una obra nueva en ella.',
                    [
                        { label: 'Cancelar', value: null },
                        { label: 'Abrir esa obra', value: 'open', primary: true }
                    ]
                );
                if (op === 'open') await loadProjectFromDirHandle(dirElegida);
                return;
            }
            projectDirHandle = dirElegida;

            // 2. Crear carpetas principales
            const dirRecepcion = await projectDirHandle.getDirectoryHandle('Control de recepción', { create: true });
            const dirEjecucion = await projectDirHandle.getDirectoryHandle('Control de ejecución', { create: true });
            const dirEnsayos = await projectDirHandle.getDirectoryHandle('Ensayos y pruebas de servicio', { create: true });

            // 3. Las carpetas de cada capítulo se crean a medida que se seleccionan
            //    (ver asegurarCarpetasCapitulos); al desmarcar un capítulo su carpeta se conserva.

            // 4. Crear archivo JSON inicial
            projectFileHandle = await projectDirHandle.getFileHandle('datos_obra.json', { create: true });
            currentProject = { name: "", location: "", tech: "", date: "", selectedMaterials: [], formData: {} };
            
            const writable = await projectFileHandle.createWritable();
            await writable.write(JSON.stringify(currentProject, null, 2));
            await writable.close();

            // 5. Ir a la pantalla de configuración
            projectDirty = false;
            initSetup();
            showScreen('setup');
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error(err);
                alert("Error al crear la estructura de carpetas: " + err.message);
            }
        }
    });
});

btns.home.addEventListener('click', async () => {
    const isSetupActive = screens.setup.classList.contains('active');
    const hasName = currentProject.name || inputs.projectName.value.trim();
    
    if (screens.control.classList.contains('active') || (isSetupActive && hasName)) {
        // Crear modal personalizado en lugar de confirm() nativo
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '99999';
        
        const modal = document.createElement('div');
        modal.style.backgroundColor = '#fff';
        modal.style.padding = '2rem';
        modal.style.borderRadius = '8px';
        modal.style.border = '1px solid #cbd5e1';
        modal.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
        modal.style.maxWidth = '450px';
        modal.style.textAlign = 'center';
        
        const title = document.createElement('h3');
        title.textContent = "Volver al inicio";
        title.style.marginTop = '0';
        title.style.color = '#1e293b';
        title.style.fontSize = '1.25rem';
        
        const msg = document.createElement('p');
        msg.textContent = "Vas a volver al menú de inicio. ¿Deseas guardar la obra primero para no perder tu trabajo?";
        msg.style.marginBottom = '2rem';
        msg.style.lineHeight = '1.5';
        msg.style.color = '#475569';
        
        const btnDiv = document.createElement('div');
        btnDiv.style.display = 'flex';
        btnDiv.style.justifyContent = 'center';
        btnDiv.style.gap = '0.75rem';
        btnDiv.style.flexWrap = 'wrap';
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn-primary';
        saveBtn.textContent = 'Guardar y salir';
        
        const dontSaveBtn = document.createElement('button');
        dontSaveBtn.className = 'btn btn-secondary';
        dontSaveBtn.textContent = 'Salir sin guardar';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-secondary';
        cancelBtn.textContent = 'Cancelar';
        
        btnDiv.appendChild(cancelBtn);
        btnDiv.appendChild(dontSaveBtn);
        btnDiv.appendChild(saveBtn);
        
        modal.appendChild(title);
        modal.appendChild(msg);
        modal.appendChild(btnDiv);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
        
        dontSaveBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            showScreen('home');
            if (screens.home.classList.contains('active')) projectDirty = false;
        });
        
        saveBtn.addEventListener('click', async () => {
            saveBtn.textContent = 'Guardando...';
            saveBtn.disabled = true;
            try {
                if (isSetupActive) {
                    currentProject.name = inputs.projectName.value.trim();
                    currentProject.location = inputs.location.value.trim();
                    if (inputs.promoter) currentProject.promoter = inputs.promoter.value.trim();
                    if (inputs.do) currentProject.do = inputs.do.value.trim();
                    if (inputs.de) currentProject.de = inputs.de.value.trim();
                    currentProject.tech = inputs.tech.value.trim();
                    if (inputs.dateStart) currentProject.dateStart = inputs.dateStart.value;
                    if (inputs.dateEnd) currentProject.dateEnd = inputs.dateEnd.value;
                    const checkboxes = document.querySelectorAll('.material-checkbox:checked');
                    currentProject.selectedMaterials = Array.from(checkboxes).map(c => c.value);
                }
                const res = await performSave();
                if (res !== true) {
                    // Guardado cancelado o fallido: no salir para no perder el trabajo
                    saveBtn.textContent = 'Guardar y salir';
                    saveBtn.disabled = false;
                    if (res === false) alert("No se pudo guardar la obra. Prueba de nuevo con el botón Guardar.");
                    return;
                }
                document.body.removeChild(overlay);
                showScreen('home');
            } catch (err) {
                console.error(err);
                saveBtn.textContent = 'Guardar y salir';
                saveBtn.disabled = false;
                alert("Error al guardar: " + err.message);
            }
        });
    } else {
        showScreen('home');
    }
});

btns.backSetup.addEventListener('click', () => {
    initSetup();
    showScreen('setup');
});

// Listener para los nuevos botones de categoría
document.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('btn-start-category')) {
        const name = inputs.projectName.value.trim();
        if (!name) {
            alert("Por favor, introduce un nombre para la obra (en la parte superior).");
            return;
        }
        
        currentProject.name = name;
        currentProject.location = inputs.location.value.trim();
        if (inputs.promoter) currentProject.promoter = inputs.promoter.value.trim();
        if (inputs.do) currentProject.do = inputs.do.value.trim();
        if (inputs.de) currentProject.de = inputs.de.value.trim();
        currentProject.tech = inputs.tech.value.trim();
        if (inputs.dateStart) currentProject.dateStart = inputs.dateStart.value;
        if (inputs.dateEnd) currentProject.dateEnd = inputs.dateEnd.value;
        
        // Guardar todos los checkboxes marcados globalmente
        const checkboxes = document.querySelectorAll('.material-checkbox:checked');
        currentProject.selectedMaterials = Array.from(checkboxes).map(c => c.value);
        
        currentActiveCategory = e.target.getAttribute('data-category');
        asegurarCarpetasCapitulos();
        
        const materialsToRender = currentProject.selectedMaterials.filter(matId => {
            const t = materialesTemplate.find(m => m.id === matId);
            return t && t.category === currentActiveCategory;
        });

        if (materialsToRender.length === 0) {
            alert("Selecciona al menos una ficha para esta sección antes de comenzar.");
            return;
        }
        
        renderControlForms();
        showScreen('control');
    }
});

async function performSave(opts = {}) {
    // Forzar blur de inputs para asegurar que guardan en onchange
    // (no en el autoguardado, para no sacar al usuario del campo que está escribiendo)
    if (!opts.silent && document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
    }
    updateProjectDataFromInputs();
    const seqAlGuardar = dirtySeq;
    
    if (!currentProject.id) {
        currentProject.id = 'proj_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    const dataStr = JSON.stringify(currentProject, null, 2);

    try {
        if (projectFileHandle) {
            // Guardado silencioso automático
            const writable = await projectFileHandle.createWritable();
            await writable.write(dataStr);
            await writable.close();
            
            if (!window.Almacen || Almacen.modo === 'local') await DB.saveProject(currentProject.id, currentProject.name, projectDirHandle, projectFileHandle);
            if (dirtySeq === seqAlGuardar) projectDirty = false;
            asegurarCarpetasCapitulos();
            
            // Pequeño feedback visual
            if (!btns.save._originalHtml) btns.save._originalHtml = btns.save.innerHTML;
            btns.save.innerHTML = '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> ' + (opts.silent ? 'Autoguardado' : 'Guardado');
            clearTimeout(btns.save._fbTimer);
            btns.save._fbTimer = setTimeout(() => { btns.save.innerHTML = btns.save._originalHtml; }, 2000);
            return true;
        }

        // Si no hay handle, pedir que guarde como nuevo archivo
        const suggestedName = `Control_Calidad_${currentProject.name.replace(/\s+/g, '_') || 'Obra'}.json`;
        if ('showSaveFilePicker' in window) {
            projectFileHandle = await window.showSaveFilePicker({
                suggestedName: suggestedName,
                types: [{
                    description: 'JSON File',
                    accept: {'application/json': ['.json']}
                }]
            });
            const writable = await projectFileHandle.createWritable();
            await writable.write(dataStr);
            await writable.close();
            
            if (!window.Almacen || Almacen.modo === 'local') await DB.saveProject(currentProject.id, currentProject.name, projectDirHandle, projectFileHandle);
            if (dirtySeq === seqAlGuardar) projectDirty = false;
            return true;
        }
    } catch (err) {
        // El usuario cerró el diálogo "Guardar como" sin elegir archivo: no es un error
        if (err.name === 'AbortError') return 'cancelled';
        console.error(err);
        return false;
    }
    return false;
}

// Guardar archivo (Descargar JSON)
btns.save.addEventListener('click', async () => {
    const success = await performSave();
    if (success === 'cancelled') return; // cancelado por el usuario: no descargar nada
    if (!success) {
        // Fallback clásico
        const dataStr = JSON.stringify(currentProject, null, 2);
        const suggestedName = `Control_Calidad_${currentProject.name.replace(/\s+/g, '_') || 'Obra'}.json`;
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = suggestedName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        projectDirty = false;
    }
});

// ---------------------------------------------------------------------------
// Cambios sin guardar: seguimiento, aviso al cerrar y autoguardado
// ---------------------------------------------------------------------------
function obraAbierta() {
    return screens.setup.classList.contains('active') || screens.control.classList.contains('active') || screens.print.classList.contains('active');
}
function markDirty() {
    if (!obraAbierta()) return;
    projectDirty = true;
    dirtySeq++;
}
['input', 'change'].forEach(tipo => document.addEventListener(tipo, (e) => {
    const t = e.target;
    if (!t || !t.closest) return;
    // Ignorar las opciones de la pantalla de impresión salvo el texto introductorio
    if (t.closest('#screen-print') && t.id !== 'print-intro-text') return;
    if (t.closest('.app-container') || t.closest('#materials-content')) markDirty();
}, true));
document.addEventListener('click', (e) => {
    const b = e.target && e.target.closest ? e.target.closest('button') : null;
    if (!b || b.classList.contains('tab')) return;
    // Botones dentro de las fichas (añadir/eliminar zonas, rellenar, puntos personalizados...)
    if (b.closest('#materials-content')) markDirty();
}, true);

window.addEventListener('beforeunload', (e) => {
    if (projectDirty) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// Autoguardado cada 60 s en el archivo de la obra (solo si ya está vinculado a un archivo)
let autoguardando = false;
setInterval(async () => {
    if (!projectDirty || !projectFileHandle || autoguardando || !obraAbierta()) return;
    autoguardando = true;
    try { await performSave({ silent: true }); } catch (e) { /* se reintentará */ }
    finally { autoguardando = false; }
}, 60000);

// ---------------------------------------------------------------------------
// Carpetas de capítulos: se crean al seleccionar el capítulo y nunca se borran
// ---------------------------------------------------------------------------
function nombreCarpetaCategoria(cat) {
    if (cat === 'recepcion') return 'Control de recepción';
    if (cat === 'ejecucion') return 'Control de ejecución';
    if (cat === 'ensayos') return 'Ensayos y pruebas de servicio';
    return 'Otros';
}
async function carpetaCapitulo(mat) {
    const catHandle = await projectDirHandle.getDirectoryHandle(nombreCarpetaCategoria(mat.category), { create: true });
    const safeName = mat.name.replace(/[\\/:*?"<>|]/g, '-');
    return catHandle.getDirectoryHandle(safeName, { create: true });
}
async function asegurarCarpetasCapitulos() {
    if (!projectDirHandle || !currentProject || !Array.isArray(currentProject.selectedMaterials)) return;
    for (const id of currentProject.selectedMaterials) {
        const mat = materialesTemplate.find(m => m.id === id);
        if (!mat) continue;
        try { await carpetaCapitulo(mat); } catch (e) { console.warn('No se pudo crear la carpeta del capítulo', mat.name, e); }
    }
}

// ---------------------------------------------------------------------------
// Fotos de los puntos de inspección
// El original se guarda en la carpeta del capítulo; en los datos solo se guarda una
// miniatura ligera (para verla en pantalla, en la impresión y en Word).
// ---------------------------------------------------------------------------
window.AppFotos = {
    LADO_MINI: 360,

    async miniatura(file) {
        const bmp = await createImageBitmap(file);
        const escala = Math.min(1, this.LADO_MINI / Math.max(bmp.width, bmp.height));
        const w = Math.max(1, Math.round(bmp.width * escala)), h = Math.max(1, Math.round(bmp.height * escala));
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(bmp, 0, 0, w, h);
        if (bmp.close) bmp.close();
        return { mini: canvas.toDataURL('image/jpeg', 0.75), w, h };
    },

    async asegurarCarpeta() {
        if (projectDirHandle) return true;
        const ok = await window.appConfirmar('Para guardar fotos hay que indicar la carpeta de la obra, donde se guardará el original de cada foto (en la carpeta del capítulo).', { titulo: 'Carpeta de la obra', aceptar: 'Seleccionar carpeta', peligro: false });
        if (!ok) return false;
        try { projectDirHandle = await window.showDirectoryPicker({ mode: 'readwrite' }); return true; }
        catch (e) { return false; }
    },

    nombreArchivo(descripcion, file, n) {
        const d = new Date();
        const sello = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + '-' +
            String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0') + String(d.getSeconds()).padStart(2, '0');
        const ext = ((file.name || '').match(/\.([a-z0-9]{2,5})$/i) || [, 'jpg'])[1].toLowerCase();
        const base = ('Foto ' + (descripcion || '')).replace(/[\\/:*?"<>|\n\r\t]/g, '-').replace(/\s+/g, ' ').trim().slice(0, 80);
        return `${base} ${sello}${(n !== null && n !== undefined) ? '-' + (n + 1) : ''}.${ext}`;
    },

    // Guarda los archivos y devuelve [{ archivo, mini, w, h, fecha }]
    async adjuntar(matId, files, descripcion) {
        const mat = materialesTemplate.find(m => m.id === matId);
        if (!mat || !files || !files.length) return [];
        if (!(await this.asegurarCarpeta())) return [];
        const resultado = [];
        try {
            const dir = await carpetaCapitulo(mat);
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const archivo = this.nombreArchivo(descripcion, file, files.length > 1 ? i : null);
                const fh = await dir.getFileHandle(archivo, { create: true });
                const w = await fh.createWritable();
                await w.write(file);
                await w.close();
                let m = { mini: null, w: 0, h: 0 };
                try { m = await this.miniatura(file); } catch (e) { /* formato no visualizable (p. ej. HEIC): se guarda sin miniatura */ }
                resultado.push({ archivo, mini: m.mini, w: m.w, h: m.h, fecha: localToday() });
            }
        } catch (err) {
            console.error(err);
            window.appAlert('No se pudo guardar la foto en la carpeta del capítulo: ' + err.message, 'Error al guardar la foto');
        }
        return resultado;
    },

    // Muestra la foto: primero la miniatura y, si se puede leer, el original de la carpeta
    async ver(matId, foto) {
        const overlay = document.createElement('div');
        overlay.className = 'app-modal-overlay foto-visor';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:999999;padding:1rem;gap:0.75rem;';
        const img = document.createElement('img');
        img.alt = foto.archivo || 'Foto';
        img.style.cssText = 'max-width:100%;max-height:80vh;border-radius:6px;background:#fff;';
        if (foto.mini) img.src = foto.mini;
        const pie = document.createElement('div');
        pie.style.cssText = 'color:#e2e8f0;font-size:0.85rem;text-align:center;';
        pie.textContent = (foto.archivo || '') + (foto.fecha ? ' · ' + foto.fecha.split('-').reverse().join('/') : '');
        const cerrarBtn = document.createElement('button');
        cerrarBtn.type = 'button';
        cerrarBtn.className = 'btn btn-secondary';
        cerrarBtn.textContent = 'Cerrar';
        overlay.append(img, pie, cerrarBtn);
        document.body.appendChild(overlay);
        let url = null;
        const cerrar = () => { overlay.remove(); if (url) URL.revokeObjectURL(url); document.removeEventListener('keydown', tecla, true); };
        function tecla(e) { if (e.key === 'Escape') { e.preventDefault(); cerrar(); } }
        document.addEventListener('keydown', tecla, true);
        overlay.addEventListener('click', e => { if (e.target === overlay || e.target === cerrarBtn) cerrar(); });
        try {
            const mat = materialesTemplate.find(m => m.id === matId);
            if (projectDirHandle && mat && foto.archivo) {
                const dir = await carpetaCapitulo(mat);
                const file = await (await dir.getFileHandle(foto.archivo)).getFile();
                url = URL.createObjectURL(file);
                img.src = url;
            }
        } catch (e) {
            if (!foto.mini) pie.textContent += ' · No se encuentra el archivo original en la carpeta del capítulo.';
        }
    }
};

// Abrir la obra contenida en una carpeta (datos_obra.json)
async function loadProjectFromDirHandle(dirHandle) {
    let fileHandle;
    try {
        fileHandle = await dirHandle.getFileHandle('datos_obra.json');
    } catch(e) {
        alert("No se encontró el archivo 'datos_obra.json' en la carpeta seleccionada. Asegúrate de elegir la carpeta raíz de la obra.");
        return false;
    }
    const file = await fileHandle.getFile();
    const data = JSON.parse(await file.text());
    if (data.name !== undefined && data.selectedMaterials) {
        if (!data.id) {
            data.id = 'proj_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
        }
        projectDirHandle = dirHandle;
        projectFileHandle = fileHandle;
        currentProject = data;
        if (!window.Almacen || Almacen.modo === 'local') await DB.saveProject(currentProject.id, currentProject.name, projectDirHandle, projectFileHandle);
        projectDirty = false;
        initSetup();
        showScreen('setup');
        return true;
    }
    alert("Formato de archivo inválido.");
    return false;
}

// Cargar archivo JSON
btns.load.addEventListener('click', async () => {
    if (window.Almacen && Almacen.modo === 'drive') { abrirObraDrive(); return; }
    try {
        if ('showDirectoryPicker' in window) {
            const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
            await loadProjectFromDirHandle(dirHandle);
            return;
        }
    } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
        return;
    }

    // Fallback clásico usando un input invisible
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.name !== undefined && data.selectedMaterials) {
                    currentProject = data;
                    projectDirty = false;
                    initSetup();
                    showScreen('setup');
                } else {
                    alert("Formato de archivo inválido.");
                }
            } catch (err) {
                alert("Error leyendo el archivo.");
            }
        };
        reader.readAsText(file);
    };
    input.click();
});

// Lógica de Impresión
function hasDataToPrint(matId, template) {
    const data = currentProject.formData ? currentProject.formData[matId] : null;
    if (!data) return false;
    
    // 1. Si usa instancias (fichas de ejecución, recepción de hormigón, forjados, etc.)
    if (data.instances && Array.isArray(data.instances)) {
        const hasFilledInstance = data.instances.some(inst => {
            if (!inst) return false;
            if (inst.zonaDate && inst.zonaDate.trim() !== '') return true;
            if (inst.checks && typeof inst.checks === 'object') {
                for (let chkKey in inst.checks) {
                    const chk = inst.checks[chkKey];
                    if (!chk) continue;
                    if (chk === true) return true;
                    if (typeof chk === 'object') {
                        if (chk.checked === true) return true;
                        if (chk.date && chk.date.trim() !== '') return true;
                        if (chk.status && chk.status.trim() !== '') return true;
                        if (chk.val && chk.val.trim() !== '') return true;
                        if (chk.obs && chk.obs.trim() !== '') return true;
                        if (Array.isArray(chk.fotos) && chk.fotos.length) return true;
                        if (chk.isCustom && chk.name && chk.name.trim() !== '') return true;
                        if (chk.check1 && chk.check1.trim() !== '') return true;
                        if (chk.check2 === true) return true;
                        if (chk.label && chk.label.trim() !== '' && chk.label !== 'Otros' && chk.label !== 'Otro') {
                            if (chk.checked || chk.date || chk.status || chk.check1 || chk.check2) return true;
                        }
                    }
                }
            }
            if (inst.caract && typeof inst.caract === 'object') {
                for (let carKey in inst.caract) {
                    const car = inst.caract[carKey];
                    if (!car) continue;
                    if (car.verificado === true) return true;
                    if (car.valor && car.valor.trim() !== '') return true;
                    if (car.isCustom && car.label && car.label.trim() !== '') return true;
                }
            }
            if (inst.bovColab_chk || inst.reacEps_chk || inst.expHum_chk || inst.otra_chk) return true;
            if (inst.canto && inst.canto.trim() !== '') return true;
            if (inst.forjadoType && inst.forjadoType.trim() !== '') return true;
            if (inst.observaciones && inst.observaciones.trim() !== '') return true;
            return false;
        });
        if (hasFilledInstance) return true;
    }
    
    // 2. Si es ejec_hormigon
    if (matId === 'ejec_hormigon') {
        const paramKeys = ['cim_elements', 'cim_area', 'cim_volume', 'vert_floors', 'vert_elements', 'vert_volume', 'horiz_floors', 'horiz_area', 'horiz_volume'];
        const hasParam = paramKeys.some(k => (parseFloat(data[k]) || 0) > 0);
        if (hasParam) return true;
        
        if (data.checks && typeof data.checks === 'object') {
            for (let k in data.checks) {
                const val = data.checks[k];
                if (!val) continue;
                if (typeof val === 'object') {
                    if (val.status && val.status.trim() !== '') return true;
                    if (val.date && val.date.trim() !== '') return true;
                } else if (typeof val === 'string' && val.trim() !== '') {
                    if (k.endsWith('_date') || k.endsWith('_name') || k.endsWith('_lote')) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    // 3. Si es ensayos_est_acero
    if (matId === 'ensayos_est_acero') {
        if (data.ensayosEnd && Array.isArray(data.ensayosEnd) && data.ensayosEnd.length > 0) return true;
        if (data.calcParams) {
            const tons = parseFloat(data.calcParams.tons) || 0;
            const welds = parseFloat(data.calcParams.weldMeters) || 0;
            if (tons > 0 || welds > 0) return true;
        }
        return false;
    }
    
    // 4. Si es ensayos_hormigon
    if (matId === 'ensayos_hormigon') {
        const categories = ['cimentaciones', 'compresion', 'forjados', 'losaspav'];
        const hasArrayVol = categories.some(cat => Array.isArray(data[cat]) && data[cat].some(item => (parseFloat(item.volumen) || 0) > 0));
        if (hasArrayVol) return true;
        const volKeys = ['volumenCimentacion', 'volumenCompresion', 'volumenForjados', 'volumenLosasPav'];
        const hasVol = volKeys.some(k => (parseFloat(data[k]) || 0) > 0);
        if (hasVol) return true;
        if (data.lotesRotura && data.lotesRotura.length > 0) return true;
        if (data.lotesAcero && data.lotesAcero.length > 0) return true;
        return false;
    }
    
    // 5. Si tiene checks directamente (e.g. rec_ferralla u otros)
    if (data.checks && typeof data.checks === 'object') {
        for (let chkKey in data.checks) {
            const chk = data.checks[chkKey];
            if (!chk) continue;
            if (chk === true) return true;
            if (typeof chk === 'object') {
                if (chk.checked === true) return true;
                if (chk.date && chk.date.trim() !== '') return true;
                if (chk.status && chk.status.trim() !== '') return true;
                if (chk.check1 && chk.check1.trim() !== '') return true;
                if (chk.check2 === true) return true;
                if (chk.file && chk.file.trim() !== '') return true;
                if (chk.label && chk.label.trim() !== '' && chk.label !== 'Otros' && chk.label !== 'Otro') {
                    if (chk.checked || chk.date || chk.status || chk.check1 || chk.check2) return true;
                }
            }
        }
    }
    
    // 6. Si tiene points
    if (data.points && typeof data.points === 'object') {
        for (let ptKey in data.points) {
            const pt = data.points[ptKey];
            if (pt === true || (pt && (pt.checked === true || (pt.date && pt.date.trim() !== '')))) return true;
        }
    }
    
    // 7. Dynamic lists o campos estándar
    for (let key in data) {
        if (['instances', 'checks', 'points', 'uisCreated', 'activeTab', 'calcParams', 'ensayos'].includes(key)) continue;
        const val = data[key];
        if (Array.isArray(val)) {
            const hasItemWithData = val.some(item => {
                if (!item || typeof item !== 'object') return false;
                return Object.entries(item).some(([k, v]) => {
                    if (k === '_title') return false;
                    return v !== undefined && v !== null && v !== '' && v !== false;
                });
            });
            if (hasItemWithData) return true;
        } else if (typeof val === 'string' && val.trim() !== '' && val !== 'Otros' && val !== 'Otro') {
            return true;
        } else if (typeof val === 'number' && !isNaN(val) && val > 0) {
            return true;
        } else if (typeof val === 'boolean' && val === true) {
            return true;
        }
    }
    
    return false;
}

// ---------------------------------------------------------------------------
// No conformidades y progreso por capítulo
// ---------------------------------------------------------------------------
const NEGATIVOS_NC = ['no correcto', 'incorrecto', 'no cumple', 'no conforme', 'rechazado'];
const CAMPOS_NOMBRE_ZONA = ['customName', 'zonaName', '_title', 'nombre', 'referencia', 'identificacion'];

// Lista detallada de no conformidades de un capítulo: puntos con resultado negativo
// (No Correcto, Incorrecto, No cumple, No conforme, Rechazado) y lotes de ensayo no conformes.
function listarNoConformidades(matId) {
    const data = currentProject.formData ? currentProject.formData[matId] : null;
    const lista = [];
    if (!data) return lista;
    const visitados = new Set();
    (function recorrer(v, clave, ctx) {
        if (v === null || typeof v !== 'object' || visitados.has(v)) return;
        visitados.add(v);
        if (Array.isArray(v)) {
            v.forEach((item, i) => recorrer(item, String(i), (clave === 'instances') ? Object.assign({}, ctx, { idx: i }) : ctx));
            return;
        }
        // Nombre de la zona / suministro / lote que contiene los puntos
        const nombre = CAMPOS_NOMBRE_ZONA.map(k => v[k]).find(x => typeof x === 'string' && x.trim());
        const c = nombre ? Object.assign({}, ctx, { zona: nombre.trim() }) : ctx;
        let registrado = false;
        Object.keys(v).forEach(k => {
            const val = v[k];
            if (!registrado && typeof val === 'string' && NEGATIVOS_NC.includes(val.trim().toLowerCase())) {
                registrado = true;
                lista.push({
                    matId, zona: c.zona || '', idx: c.idx, cid: clave,
                    punto: (v.name || v.label || v.tipo_ensayo || v.punto || '').toString(),
                    resultado: val.trim(),
                    fecha: v.date || v.fecha || '',
                    obs: v.obs || v.observaciones || ''
                });
            }
        });
        if (v.aprobado === false && v.fest !== undefined) {
            lista.push({ matId, zona: c.zona || 'Lote de ensayo', idx: c.idx, cid: clave, punto: 'Resistencia estimada inferior a fck', resultado: 'No conforme', fecha: '', obs: '' });
        }
        // Ensayos de estructuras de acero: casilla "¿Resultado correcto?" sin marcar en un ensayo ya realizado
        if (v.correcto === false && 'referencia' in v && 'tipo' in v && (v.tipo || v.fecha)) {
            lista.push({ matId, zona: (v.referencia || '').toString(), idx: c.idx, cid: clave, punto: (v.tipo || 'Ensayo').toString(), resultado: 'No correcto', fecha: v.fecha || '', obs: v.observaciones || '' });
        }
        Object.keys(v).forEach(k => { if (k !== '_backup') recorrer(v[k], k, c); });
    })(data, '', {});
    return lista;
}

function contarNoConformidades(matId) {
    return listarNoConformidades(matId).length;
}

// Progreso de un capítulo: puntos de inspección con resultado (ejecución) o documentos
// resueltos (recepción). total = null cuando la ficha no tiene un recuento sencillo.
function progresoCapitulo(matId) {
    const data = currentProject.formData ? currentProject.formData[matId] : null;
    const res = { hechos: 0, total: null, nc: contarNoConformidades(matId) };
    if (!data || !Array.isArray(data.instances)) return res;
    let total = 0, hechos = 0;
    data.instances.forEach(inst => {
        Object.keys(inst.checks || {}).forEach(k => {
            const c = inst.checks[k];
            if (k.startsWith('_') || !c || typeof c !== 'object') return;
            if ('val' in c) { total++; if (c.val) hechos++; }
            else if ('status' in c) { total++; if (c.status && c.status !== 'Pendiente') hechos++; }
        });
    });
    if (total > 0) { res.total = total; res.hechos = hechos; }
    return res;
}

function textoProgreso(pr) {
    const partes = [];
    if (pr.total) partes.push(`${pr.hechos}/${pr.total}`);
    if (pr.nc) partes.push(`⚠ ${pr.nc}`);
    return partes.join(' · ');
}

// Actualiza las insignias de las pestañas, las tarjetas de capítulos y el botón de no conformidades
let indicadoresPendiente = false;
function actualizarIndicadores() {
    if (indicadoresPendiente) return;
    indicadoresPendiente = true;
    setTimeout(() => {
        indicadoresPendiente = false;
        if (!currentProject || !currentProject.formData) return;
        document.querySelectorAll('#materials-tabs .tab[data-target]').forEach(tab => {
            const pr = progresoCapitulo(tab.dataset.target);
            let badge = tab.querySelector('.tab-badge');
            const txt = textoProgreso(pr);
            if (!txt) { if (badge) badge.remove(); return; }
            if (!badge) { badge = document.createElement('span'); badge.className = 'tab-badge'; tab.appendChild(badge); }
            badge.textContent = txt;
            badge.classList.toggle('tab-badge-nc', pr.nc > 0);
            badge.classList.toggle('tab-badge-completo', !pr.nc && pr.total && pr.hechos === pr.total);
            badge.title = (pr.total ? `${pr.hechos} de ${pr.total} ${pr.total === 1 ? 'elemento revisado' : 'elementos revisados'}` : '') + (pr.nc ? `${pr.total ? ' · ' : ''}${pr.nc} no conformidad${pr.nc > 1 ? 'es' : ''}` : '');
        });
        document.querySelectorAll('.materials-grid .material-checkbox').forEach(chk => {
            const card = chk.nextElementSibling;
            if (!card) return;
            const pr = progresoCapitulo(chk.value);
            let badge = card.querySelector('.card-badge');
            const txt = textoProgreso(pr);
            if (!txt) { if (badge) badge.remove(); return; }
            if (!badge) { badge = document.createElement('span'); badge.className = 'card-badge'; card.querySelector('.material-name').appendChild(badge); }
            badge.textContent = txt;
            badge.classList.toggle('tab-badge-nc', pr.nc > 0);
        });
        const total = (currentProject.selectedMaterials || []).reduce((n, id) => n + contarNoConformidades(id), 0);
        const cnt = document.getElementById('noconf-count');
        if (cnt) cnt.textContent = total;
        const btn = document.getElementById('btn-noconf');
        if (btn) btn.classList.toggle('btn-noconf-activo', total > 0);
    }, 150);
}
['change', 'input'].forEach(t => document.addEventListener(t, e => { if (e.target.closest && e.target.closest('#materials-content')) actualizarIndicadores(); }));
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('#materials-content button, .app-modal button')) actualizarIndicadores(); });

// Ventana con todas las no conformidades abiertas de la obra
function abrirNoConformidades() {
    const ids = materialesTemplate.filter(m => (currentProject.selectedMaterials || []).includes(m.id)).map(m => m.id);
    const grupos = ids.map(id => ({ tpl: materialesTemplate.find(m => m.id === id), lista: listarNoConformidades(id) })).filter(g => g.lista.length);
    const total = grupos.reduce((n, g) => n + g.lista.length, 0);
    const bloques = { recepcion: '1. Control de recepción', ejecucion: '2. Control de ejecución', ensayos: '3. Ensayos y pruebas de servicio' };

    const overlay = document.createElement('div');
    overlay.className = 'app-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:1rem;';
    const modal = document.createElement('div');
    modal.className = 'app-modal nc-modal';
    modal.setAttribute('role', 'dialog');
    modal.style.cssText = 'background:#fff;border-radius:8px;max-width:820px;width:100%;max-height:88vh;display:flex;flex-direction:column;box-shadow:0 10px 25px rgba(0,0,0,0.2);';
    let html = `<div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:1rem 1.25rem;border-bottom:1px solid #e2e8f0;">
            <h3 style="margin:0;font-size:1.15rem;color:#1e293b;">No conformidades abiertas <span style="color:${total ? '#b91c1c' : '#15803d'};">(${total})</span></h3>
            <button type="button" class="btn btn-secondary nc-cerrar" aria-label="Cerrar">✕</button>
        </div><div style="overflow:auto;padding:1rem 1.25rem;">`;
    if (!total) {
        html += `<p style="color:#475569;">No hay puntos con resultado negativo en los capítulos seleccionados.</p>`;
    } else {
        html += `<p style="color:#64748b;font-size:0.85rem;margin-bottom:1rem;">Puntos marcados como No Correcto, Incorrecto, No cumple, No conforme o Rechazado, y lotes de ensayo no conformes. Desaparecen de la lista al corregir el resultado.</p>`;
        grupos.forEach(g => {
            html += `<h4 style="margin:1rem 0 0.5rem 0;color:#1e293b;font-size:0.95rem;">${escHtml(bloques[g.tpl.category] || '')} · ${escHtml(g.tpl.name)}</h4>
                <div class="table-container" style="margin-bottom:0.5rem;"><table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
                <thead><tr><th style="text-align:left;">Zona / suministro</th><th style="text-align:left;">Punto</th><th>Resultado</th><th>Fecha</th><th style="text-align:left;">Observaciones</th><th></th></tr></thead><tbody>`;
            g.lista.forEach((nc, i) => {
                const fecha = nc.fecha && /^\d{4}-\d{2}-\d{2}$/.test(nc.fecha) ? nc.fecha.split('-').reverse().join('/') : (nc.fecha || '');
                html += `<tr>
                    <td>${escHtml(nc.zona)}</td><td>${escHtml(nc.punto)}</td>
                    <td style="color:#b91c1c;font-weight:600;white-space:nowrap;">${escHtml(nc.resultado)}</td>
                    <td style="white-space:nowrap;">${escHtml(fecha)}</td><td>${escHtml(nc.obs)}</td>
                    <td><button type="button" class="btn btn-secondary nc-ir" data-mat="${escHtml(g.tpl.id)}" data-i="${i}" style="padding:0.2rem 0.6rem;font-size:0.8rem;">Ir</button></td>
                </tr>`;
            });
            html += `</tbody></table></div>`;
        });
    }
    html += `</div>`;
    modal.innerHTML = html;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    const cerrar = () => { overlay.remove(); document.removeEventListener('keydown', esc, true); };
    function esc(e) { if (e.key === 'Escape') { e.preventDefault(); cerrar(); } }
    document.addEventListener('keydown', esc, true);
    overlay.addEventListener('click', e => { if (e.target === overlay) cerrar(); });
    modal.querySelector('.nc-cerrar').addEventListener('click', cerrar);
    modal.querySelectorAll('.nc-ir').forEach(b => b.addEventListener('click', () => {
        const g = grupos.find(x => x.tpl.id === b.dataset.mat);
        const nc = g.lista[Number(b.dataset.i)];
        cerrar();
        irANoConformidad(g.tpl, nc);
    }));
}

// Lleva a la ficha y resalta el punto no conforme
function irANoConformidad(tpl, nc) {
    if (currentActiveCategory !== tpl.category || !screens.control.classList.contains('active')) {
        updateProjectDataFromInputs();
        currentActiveCategory = tpl.category;
        renderControlForms();
        showScreen('control');
    }
    activateTab(tpl.id);
    setTimeout(() => {
        const sec = document.getElementById('section-' + tpl.id);
        if (!sec) return;
        let el = null;
        if (nc.idx !== undefined && nc.cid) {
            el = sec.querySelector(`select[data-idx="${nc.idx}"][data-cid="${CSS.escape(nc.cid)}"]`);
        }
        if (!el && nc.cid) el = sec.querySelector(`[data-cid="${CSS.escape(nc.cid)}"], [data-id="${CSS.escape(nc.cid)}"]`);
        if (!el) el = Array.from(sec.querySelectorAll('select')).find(s => NEGATIVOS_NC.includes((s.value || '').toLowerCase()));
        const fila = el ? (el.closest('tr') || el) : null;
        if (fila) {
            fila.scrollIntoView({ behavior: 'smooth', block: 'center' });
            fila.classList.add('nc-resaltado');
            setTimeout(() => fila.classList.remove('nc-resaltado'), 2500);
        }
    }, 100);
}

function renderPrintConfig() {
    const container = document.getElementById('print-selection-container');
    container.innerHTML = '';
    
    // Set default intro text if empty
    const introText = document.getElementById('print-intro-text');
    if (!currentProject.introText) {
        introText.value = `El presente programa de control de calidad se instrumenta en cumplimiento de las obligaciones establecidas en la Ley 38/1999 de 5 de noviembre de Ordenación de la Edificación y en el Real Decreto 314/2006 de 17 de marzo por el que se aprueba el Código Técnico de la Edificación, estructurándose en las fases de recepción, ejecución, ensayos y obra terminada.\n\nEl control de recepción de productos, equipos y sistemas se fundamenta en las determinaciones del artículo 7 de la Parte I del Código Técnico de la Edificación y del Real Decreto 470/2021 por el que se aprueba el Código Estructural. Su aplicación comprende la verificación de la documentación de origen, los distintivos de calidad y el marcado CE preceptivo, así como la realización de los ensayos de recepción necesarios para comprobar que las características técnicas de los suministros se ajustan a las especificaciones del proyecto y a la normativa de obligado cumplimiento.\n\nEl control de ejecución se desarrolla de acuerdo con el artículo 8 de la Parte I del Código Técnico de la Edificación, abarcando la verificación de los soportes previos, la supervisión de los procedimientos constructivos durante el proceso de edificación y el control geométrico y dimensional de las unidades ejecutadas. Esta fase garantiza que la ejecución material se realiza conforme a las previsiones del proyecto y a las instrucciones de la dirección facultativa.\n\nEl control mediante ensayos y pruebas de servicio comprende la comprobación experimental de las prestaciones de los elementos constructivos e instalaciones, de conformidad con lo previsto en el artículo 8 y el Anejo II del Código Técnico de la Edificación, así como en la reglamentación específica aplicable a cada instalación, asegurando la verificación objetiva de los requisitos básicos de funcionalidad, seguridad y habitabilidad.\n\nEl control de la obra terminada se efectúa en aplicación del artículo 9 de la Parte I del Código Técnico de la Edificación, e incluye la comprobación final del edificio, la recopilación de la documentación de control de calidad integrada en la documentación final de obra y las verificaciones finales previas a la recepción de la misma por parte de la propiedad.`;
    } else {
        introText.value = currentProject.introText;
    }
    
    const blocks = {
        recepcion: { title: '1. Control de recepción', materials: [] },
        ejecucion: { title: '2. Control de ejecución', materials: [] },
        ensayos: { title: '3. Ensayos y pruebas de servicio', materials: [] }
    };
    
    materialesTemplate.forEach(template => {
        if (currentProject.selectedMaterials.includes(template.id) && blocks[template.category]) {
            blocks[template.category].materials.push(template);
        }
    });

    for (const [catKey, blockData] of Object.entries(blocks)) {
        if (blockData.materials.length === 0) continue;
        
        const blockDiv = document.createElement('div');
        blockDiv.style.border = '1px solid var(--border)';
        blockDiv.style.padding = '1rem';
        blockDiv.style.background = 'white';
        
        const blockHeader = document.createElement('div');
        blockHeader.style.display = 'flex';
        blockHeader.style.alignItems = 'center';
        blockHeader.style.marginBottom = '1rem';
        blockHeader.style.fontWeight = 'bold';
        blockHeader.style.fontSize = '1.1em';
        
        const blockCheck = document.createElement('input');
        blockCheck.type = 'checkbox';
        blockCheck.id = `print-block-${catKey}`;
        blockCheck.checked = true;
        blockCheck.style.marginRight = '0.5rem';
        blockCheck.style.width = '1.2rem';
        blockCheck.style.height = '1.2rem';
        blockCheck.style.cursor = 'pointer';
        
        const blockLabel = document.createElement('label');
        blockLabel.htmlFor = blockCheck.id;
        blockLabel.textContent = blockData.title;
        blockLabel.style.cursor = 'pointer';
        
        blockHeader.appendChild(blockCheck);
        blockHeader.appendChild(blockLabel);
        blockDiv.appendChild(blockHeader);
        
        const chaptersDiv = document.createElement('div');
        chaptersDiv.style.paddingLeft = '2rem';
        chaptersDiv.style.display = 'flex';
        chaptersDiv.style.flexDirection = 'column';
        chaptersDiv.style.gap = '0.5rem';
        
        if (!currentProject.summaryCorrecto) {
            currentProject.summaryCorrecto = {};
        }

        blockData.materials.forEach(mat => {
            const hasData = hasDataToPrint(mat.id, mat);
            const nNoConf = contarNoConformidades(mat.id);
            const chapDiv = document.createElement('div');
            chapDiv.style.display = 'flex';
            chapDiv.style.alignItems = 'center';
            chapDiv.style.justifyContent = 'space-between';
            chapDiv.style.maxWidth = '540px';
            chapDiv.style.padding = '0.2rem 0.5rem';
            chapDiv.style.borderBottom = '1px solid #f1f5f9';
            if (!hasData) {
                chapDiv.style.opacity = '0.65';
            }
            
            const leftDiv = document.createElement('div');
            leftDiv.style.display = 'flex';
            leftDiv.style.alignItems = 'center';

            const chapCheck = document.createElement('input');
            chapCheck.type = 'checkbox';
            chapCheck.className = `print-chap-${catKey}`;
            chapCheck.dataset.id = mat.id;
            chapCheck.checked = hasData;
            chapCheck.style.marginRight = '0.5rem';
            chapCheck.style.cursor = 'pointer';
            
            const chapLabel = document.createElement('label');
            chapLabel.textContent = mat.name + (hasData ? '' : ' (Sin datos / No rellenado)');
            chapLabel.style.cursor = 'pointer';
            if (!hasData) {
                chapLabel.style.color = 'var(--text-muted)';
            }

            const correctoLabel = document.createElement('label');
            correctoLabel.style.display = 'inline-flex';
            correctoLabel.style.alignItems = 'center';
            correctoLabel.style.gap = '0.35rem';
            correctoLabel.style.cursor = 'pointer';
            correctoLabel.style.fontSize = '0.9em';
            correctoLabel.style.fontWeight = '600';
            correctoLabel.style.color = '#15803d';
            correctoLabel.style.marginLeft = '1rem';
            correctoLabel.style.flexShrink = '0';

            const correctoCheck = document.createElement('input');
            correctoCheck.type = 'checkbox';
            correctoCheck.className = `print-correcto-${catKey}`;
            correctoCheck.dataset.id = mat.id;
            correctoCheck.style.cursor = 'pointer';
            correctoCheck.style.accentColor = '#16a34a';

            // Con no conformidades registradas, "Correcto" nunca se marca de forma automática
            // (el técnico puede marcarlo a mano si las considera resueltas).
            if (nNoConf > 0) {
                correctoCheck.checked = false;
                currentProject.summaryCorrecto[mat.id] = false;
            } else if (currentProject.summaryCorrecto[mat.id] !== undefined) {
                correctoCheck.checked = hasData ? Boolean(currentProject.summaryCorrecto[mat.id]) : false;
            } else {
                correctoCheck.checked = hasData;
                currentProject.summaryCorrecto[mat.id] = hasData;
            }

            const correctoText = document.createElement('span');
            correctoText.textContent = 'Correcto';

            correctoLabel.appendChild(correctoCheck);
            correctoLabel.appendChild(correctoText);

            if (nNoConf > 0) {
                const aviso = document.createElement('span');
                aviso.className = 'print-noconf-warning';
                aviso.textContent = `⚠ ${nNoConf} no conformidad${nNoConf > 1 ? 'es' : ''}`;
                aviso.title = 'Este capítulo tiene puntos No Correcto / Incorrecto o lotes no conformes. Revísalos antes de marcarlo como Correcto en el certificado.';
                aviso.style.cssText = 'color:#b91c1c; font-weight:600; font-size:0.85em; margin-left:0.5rem; white-space:nowrap;';
                correctoLabel.appendChild(aviso);
            }

            const syncFromChapCheck = () => {
                if (chapCheck.checked) {
                    correctoCheck.checked = nNoConf === 0;
                    currentProject.summaryCorrecto[mat.id] = nNoConf === 0;
                    chapDiv.style.opacity = '1';
                } else {
                    correctoCheck.checked = false;
                    currentProject.summaryCorrecto[mat.id] = false;
                    if (!hasData) chapDiv.style.opacity = '0.65';
                }
            };

            chapCheck.addEventListener('change', syncFromChapCheck);
            
            chapLabel.addEventListener('click', () => {
                chapCheck.checked = !chapCheck.checked;
                syncFromChapCheck();
            });

            correctoCheck.addEventListener('change', () => {
                currentProject.summaryCorrecto[mat.id] = correctoCheck.checked;
                if (correctoCheck.checked && !chapCheck.checked) {
                    chapCheck.checked = true;
                    chapDiv.style.opacity = '1';
                }
            });
            
            leftDiv.appendChild(chapCheck);
            leftDiv.appendChild(chapLabel);
            chapDiv.appendChild(leftDiv);
            chapDiv.appendChild(correctoLabel);
            chaptersDiv.appendChild(chapDiv);
        });
        
        blockCheck.addEventListener('change', (e) => {
            const chapChecks = chaptersDiv.querySelectorAll(`.print-chap-${catKey}`);
            chapChecks.forEach(c => {
                c.checked = e.target.checked;
                const matId = c.dataset.id;
                const corr = chaptersDiv.querySelector(`.print-correcto-${catKey}[data-id="${matId}"]`);
                if (corr) {
                    corr.checked = e.target.checked && contarNoConformidades(matId) === 0;
                    currentProject.summaryCorrecto[matId] = corr.checked;
                }
            });
        });
        
        blockDiv.appendChild(chaptersDiv);
        container.appendChild(blockDiv);
    }
}

function updateProjectDataFromInputs() {
    if (inputs.projectName && inputs.projectName.value.trim()) {
        currentProject.name = inputs.projectName.value.trim();
    }
    if (inputs.location) currentProject.location = inputs.location.value.trim();
    if (inputs.promoter) currentProject.promoter = inputs.promoter.value.trim();
    if (inputs.do) currentProject.do = inputs.do.value.trim();
    if (inputs.de) currentProject.de = inputs.de.value.trim();
    if (inputs.tech) currentProject.tech = inputs.tech.value.trim();
    if (inputs.dateStart) currentProject.dateStart = inputs.dateStart.value;
    if (inputs.dateEnd) currentProject.dateEnd = inputs.dateEnd.value;
    if (screens.setup.classList.contains('active')) {
        const checkboxes = document.querySelectorAll('.material-checkbox:checked');
        currentProject.selectedMaterials = Array.from(checkboxes).map(c => c.value);
    }
}

// action: 'print' (generar e imprimir), 'word' (exportar) o 'prepare' (solo generar, p. ej. para Ctrl+P)
function generatePrintDocument(action = 'print') {
    // Si no estamos en la pantalla de impresión (p. ej. Ctrl+P desde las fichas),
    // preparar la selección de capítulos con los datos actuales.
    if (!screens.print.classList.contains('active') || !document.querySelector('[id^="print-block-"]')) {
        renderPrintConfig();
    }
    updateProjectDataFromInputs();
    currentProject.introText = document.getElementById('print-intro-text').value;
    const printOnlyWithDataNode = document.getElementById('print-only-with-data');
    const printOnlyWithData = printOnlyWithDataNode ? printOnlyWithDataNode.checked : true;
    
    const printArea = document.getElementById('print-area');
    printArea.innerHTML = '';
    
    const techName = currentProject.tech || '';
    
    let html = `
        <div class="material-section">
            <h1 style="text-align:center; font-size: 18pt; margin-top: 20px; margin-bottom: 50px;">PROGRAMA DE CONTROL DE CALIDAD</h1>
            
            <table class="print-header-table" style="width:100%; border:1px solid #000; margin-bottom: 30px; font-size: 10pt;">
                <tr><td style="background:#e5e5e5; font-weight:bold; width: 30%;">Nombre de la Obra / Referencia</td><td>${escHtml(currentProject.name || '')}</td></tr>
                <tr><td style="background:#e5e5e5; font-weight:bold;">Emplazamiento</td><td>${escHtml(currentProject.location || '')}</td></tr>
                <tr><td style="background:#e5e5e5; font-weight:bold;">Promotor</td><td>${escHtml(currentProject.promoter || '')}</td></tr>
                <tr><td style="background:#e5e5e5; font-weight:bold;">Director de Obra</td><td>${escHtml(currentProject.do || '')}</td></tr>
                <tr><td style="background:#e5e5e5; font-weight:bold;">Director de Ejecución</td><td>${escHtml(currentProject.de || '')}</td></tr>
                <tr><td style="background:#e5e5e5; font-weight:bold;">Técnico redactor (Autor)</td><td>${escHtml(techName)}</td></tr>
                <tr><td style="background:#e5e5e5; font-weight:bold;">Fecha inicio</td><td>${currentProject.dateStart ? new Date(currentProject.dateStart).toLocaleDateString('es-ES') : ''}</td></tr>
                <tr><td style="background:#e5e5e5; font-weight:bold;">Fecha final</td><td>${currentProject.dateEnd ? new Date(currentProject.dateEnd).toLocaleDateString('es-ES') : ''}</td></tr>
            </table>

            <div style="font-size: 10pt; line-height: 1.6; text-align: justify; margin-bottom: 50px; white-space: pre-wrap;">${escHtml(currentProject.introText)}</div>
        </div>
    `;
    printArea.innerHTML = html;

    // Las fichas con generador propio se imprimen desde sus datos (impresion.js);
    // el resto pasa por la limpieza de pantalla de siempre y se integra en el documento.
    const docNuevo = !!window.Impresion;
    const ordenCapitulos = [];
    const cats = ['recepcion', 'ejecucion', 'ensayos'];
    cats.forEach(cat => {
        const blockCheck = document.getElementById(`print-block-${cat}`);
        if (!blockCheck || !blockCheck.checked) return;
        
        const chapChecks = document.querySelectorAll(`.print-chap-${cat}:checked`);
        if (chapChecks.length === 0) return;
        
        chapChecks.forEach(chap => {
            const matId = chap.dataset.id;
            const template = materialesTemplate.find(m => m.id === matId);
            if (!template) return;
            
            if (printOnlyWithData && !hasDataToPrint(matId, template)) return; 
            ordenCapitulos.push(matId);
            if (docNuevo && Impresion.tieneGenerador(template)) return;
            
            const chapContainer = document.createElement('div');
            chapContainer.className = 'material-section';
            chapContainer.dataset.mat = matId;
            if (!docNuevo) chapContainer.style.pageBreakBefore = 'always';
            
            if (template.customRenderer && typeof window[template.customRenderer] === 'function') {
                window[template.customRenderer](chapContainer, matId);
            } else {
                // Ensure renderMaterial is available here
                renderMaterial(chapContainer, matId, template);
            }
            
            printArea.appendChild(chapContainer);
        });
    });

    // Forzar visibilidad de todas las pestañas de las calculadoras complejas (ej: hormigón)
    // para que la rutina de limpieza no crea que están vacías al estar ocultas por el sistema de pestañas.
    printArea.querySelectorAll('.tab-content').forEach(tc => {
        tc.style.display = 'block';
        tc.classList.add('active');
    });

    const today = new Date();
    const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const todayStr = `${today.getDate()} de ${months[today.getMonth()]} de ${today.getFullYear()}`;

    const signatureHtml = `
        <div class="material-section" style="margin-top: 50px; border-top: 1px solid #000; padding-top: 20px; page-break-inside: avoid; page-break-before: always;">
            <div style="text-align: right; font-size: 10pt; margin-bottom: 40px;">
                <p style="margin-bottom: 10px;">El Técnico Autor: <strong>${escHtml(techName) || '___________________'}</strong></p>
                <p>En ___________ a ${todayStr}</p>
            </div>
            <div style="display: flex; justify-content: flex-end; text-align: center; font-size: 10pt; padding-right: 50px;">
                <div>
                    <p>Firma</p>
                    <p style="margin-top: 60px;">___________________</p>
                </div>
            </div>
        </div>
    `;
    printArea.insertAdjacentHTML('beforeend', signatureHtml);
    
    // Transformación para layout más compacto (eliminando recuadros y fondos)
    const divsToCompact = printArea.querySelectorAll('div');
    divsToCompact.forEach(div => {
        if ((div.style.border && div.style.border !== '' && div.style.border !== 'none') || 
            (div.style.borderBottom && div.style.borderBottom !== '' && div.style.borderBottom !== 'none')) {
            div.style.border = 'none';
            div.style.borderBottom = 'none';
            div.style.padding = '0';
            div.style.marginBottom = '0';
            div.style.borderRadius = '0';
            div.style.boxShadow = 'none';
            div.style.background = 'transparent';
        }
        if (div.style.background || div.style.backgroundColor) {
            div.style.background = 'transparent';
            div.style.color = '#000';
            const childTitles = div.querySelectorAll('h1, h2, h3, h4');
            childTitles.forEach(el => el.style.color = '#000');
        }
    });

    printArea.querySelectorAll('.instance-box, .card').forEach(box => {
        box.style.border = 'none';
        box.style.borderBottom = 'none';
        box.style.padding = '0';
        box.style.marginBottom = '0';
        box.style.background = 'transparent';
        box.style.boxShadow = 'none';
    });
    
    // Ocultar textos de ayuda y subtítulos redundantes
    printArea.querySelectorAll('p').forEach(p => {
        const txt = p.textContent.toLowerCase();
        if (txt.includes('añade zonas de control') || 
            txt.includes('crea manualmente cada unidad') ||
            txt.includes('registra los puntos de control') ||
            txt.includes('selecciona el tipo') ||
            p.style.color === 'var(--text-muted)' || 
            p.className.includes('text-muted')) {
            p.style.display = 'none';
        }
    });
    
    printArea.querySelectorAll('h4, .unified-title').forEach(h => {
        const txt = h.textContent.toLowerCase();
        if (txt.includes('puntos de inspección')) {
            h.style.display = 'none';
        } else if (txt.includes('observaciones generales') || txt.includes('laboratorios intervinientes')) {
            if (!h.textContent.trim().endsWith(':')) {
                h.textContent = h.textContent.trim() + ':';
            }
        }
    });

    function isElementVisible(el) {
        if (!el) return false;
        if (el.style && el.style.display === 'none') return false;
        if (el.classList && (el.classList.contains('empty-zone-block') || el.classList.contains('empty-card-hidden') || el.classList.contains('eh-no-data') || el.classList.contains('empty-chapter-hidden'))) return false;
        if (el.closest && el.closest('.empty-zone-block, .empty-card-hidden, .eh-no-data, .empty-chapter-hidden, [style*="display: none"], [style*="display:none"]')) return false;
        return true;
    }

    if (!printOnlyWithData) {
        printArea.querySelectorAll('.unused-row').forEach(el => {
            el.classList.remove('unused-row');
            el.style.display = '';
        });
    }

    if (printOnlyWithData) {
        // Ocultar filas de tablas no usadas y tablas completamente vacías
        printArea.querySelectorAll('table').forEach(table => {
            if (table.classList.contains('eh-summary-table') || table.classList.contains('print-header-table') || table.classList.contains('summary-table')) return;

            const rows = table.querySelectorAll('tbody tr');
            let hasDataRow = false;
            let hasUsedRow = false;
            rows.forEach(r => {
                if (!r.classList.contains('group-row')) {
                    hasDataRow = true;
                    let rowIsUsed = false;
                    const chk = r.querySelector('input[type="checkbox"]');
                    if (chk && chk.checked) rowIsUsed = true;
                    
                    const selects = r.querySelectorAll('select');
                    selects.forEach(s => {
                        if (s.value && s.value.trim() !== '' && s.value !== 'Seleccionar...') rowIsUsed = true;
                    });
                    
                    if (r.querySelector('img.foto-mini')) rowIsUsed = true;
                    const inputs = r.querySelectorAll('input[type="text"], input[type="date"], textarea');
                    inputs.forEach(inp => {
                        if (inp.value && inp.value.trim() !== '' && inp.value !== 'Otros' && inp.value !== 'Otro') rowIsUsed = true;
                    });
                    
                    if (rowIsUsed) {
                        hasUsedRow = true;
                        r.classList.remove('unused-row');
                        r.style.display = '';
                    } else {
                        r.classList.add('unused-row');
                        r.style.display = 'none';
                    }
                }
            });

            if (hasDataRow && !hasUsedRow) {
                table.style.display = 'none';
                // Ocultar contenedor de la zona / instancia
                const zone = table.closest('.eh-uicard') || 
                             table.closest('.instance-box') || 
                             table.closest('div[style*="border"]') || 
                             table.closest('.card');
                if (zone && !zone.classList.contains('material-section')) {
                    zone.style.display = 'none';
                    zone.classList.add('empty-zone-block');
                }
            }
        });

        // Limpieza específica de ejec_hormigon
        // a) Ocultar secciones de UI en ejec_hormigon si no tienen UIs con datos
        printArea.querySelectorAll('.eh-uisection').forEach(sec => {
            const visibleUis = Array.from(sec.querySelectorAll('.eh-uicard')).filter(isElementVisible);
            if (visibleUis.length === 0 || sec.dataset.hasData === 'false') {
                sec.style.display = 'none';
                sec.classList.add('eh-no-data');
                sec.remove();
            }
        });

        // b) Ocultar bloques de parámetros vacíos en ejec_hormigon
        printArea.querySelectorAll('.eh-param-block').forEach(pb => {
            const nums = pb.querySelectorAll('input[type="number"]');
            let hasNum = false;
            nums.forEach(n => {
                if ((parseFloat(n.value) || 0) > 0) hasNum = true;
            });
            if (!hasNum) {
                pb.style.display = 'none';
                pb.remove();
            }
        });

        // Si todos los bloques de parámetros se ocultaron en la tarjeta de parámetros, ocultarla
        printArea.querySelectorAll('.material-section').forEach(mSec => {
            const pCard = mSec.querySelector('#eh-btn-calcular') ? mSec.querySelector('#eh-btn-calcular').closest('.card') : null;
            if (pCard) {
                const visiblePBlocks = pCard.querySelectorAll('.eh-param-block');
                if (visiblePBlocks.length === 0) {
                    pCard.style.display = 'none';
                    pCard.remove();
                }
            }
        });

        // c) Filas de la tabla resumen en ejec_hormigon
        printArea.querySelectorAll('.eh-summary-table tbody tr[data-summary-type]').forEach(tr => {
            const vals = tr.querySelectorAll('.eh-num-val');
            let allZero = true;
            vals.forEach(v => {
                if ((parseFloat(v.textContent) || 0) > 0) allZero = false;
            });
            if (allZero) {
                tr.style.display = 'none';
                tr.remove();
            }
        });

        // Si la tabla resumen no tiene filas útiles, ocultar la tabla y su título
        printArea.querySelectorAll('.eh-summary-table').forEach(sumTable => {
            const remainingTypeRows = sumTable.querySelectorAll('tbody tr[data-summary-type]');
            if (remainingTypeRows.length === 0) {
                const sumCard = sumTable.closest('.card');
                if (sumCard) {
                    sumCard.querySelectorAll('h2').forEach(h => {
                        if (h.textContent.includes('Resultados Teóricos')) h.style.display = 'none';
                    });
                    sumTable.style.display = 'none';
                    sumTable.remove();
                }
            }
        });

        // d) Si en ejec_hormigon no quedan UIs, ocultar el título "Registro de Inspecciones en Obra"
        printArea.querySelectorAll('#eh-ui-container').forEach(uic => {
            const visibleSecs = Array.from(uic.querySelectorAll('.eh-uisection')).filter(isElementVisible);
            if (visibleSecs.length === 0) {
                const cardParent = uic.closest('.card');
                if (cardParent) {
                    cardParent.querySelectorAll('h2, p').forEach(el => {
                        if (el.textContent.includes('Registro de Inspecciones') || el.textContent.includes('Crea manualmente')) {
                            el.style.display = 'none';
                            el.remove();
                        }
                    });
                }
            }
        });

        // Ocultar bloques de instancias que no tengan tablas con datos usados
        printArea.querySelectorAll('[id$="-instances-container"]').forEach(cont => {
            Array.from(cont.children).forEach(block => {
                const visT = Array.from(block.querySelectorAll('table')).filter(isElementVisible);
                if (visT.length === 0) {
                    block.style.display = 'none';
                    block.classList.add('empty-zone-block');
                    block.remove();
                }
            });
        });

        // Ocultar tarjetas (.card) que hayan quedado vacías (sin tablas visibles ni inputs rellenos)
        printArea.querySelectorAll('.card').forEach(card => {
            if (!isElementVisible(card)) return;
            const visTables = Array.from(card.querySelectorAll('table')).filter(isElementVisible);
            const visInputs = Array.from(card.querySelectorAll('input, select, textarea')).filter(inp => {
                if (!isElementVisible(inp)) return false;
                if (inp.type === 'checkbox') return inp.checked;
                if (inp.type === 'button' || inp.type === 'submit') return false;
                if (/\b[a-z]{1,4}-(name|zonadate|ubic|tipo)\b/.test(inp.className)) return false;
                if (inp.classList.contains('ea-name') || inp.classList.contains('ef-name') || inp.classList.contains('em-name')) return false;
                return inp.value && inp.value.trim() !== '' && inp.value !== 'Otros' && inp.value !== 'Otro';
            });
            const visSubSecs = Array.from(card.querySelectorAll('.eh-uisection, .instance-box, .dynamic-list-item')).filter(isElementVisible);

            if (visTables.length === 0 && visInputs.length === 0 && visSubSecs.length === 0) {
                card.style.display = 'none';
                card.classList.add('empty-card-hidden');
            }
        });

        // Ocultar y remover capítulos (.material-section) que no tengan ningún contenido real
        printArea.querySelectorAll('.material-section').forEach(sec => {
            // No tocar la portada / texto introductorio ni la firma
            if (sec.querySelector('h1') && sec.querySelector('h1').textContent.includes('PROGRAMA DE CONTROL')) return;
            if (sec.querySelector('p') && sec.querySelector('p').textContent.includes('El Técnico Autor')) return;

            const visCards = Array.from(sec.querySelectorAll('.card')).filter(isElementVisible);
            const visTables = Array.from(sec.querySelectorAll('table')).filter(isElementVisible);
            const visInputs = Array.from(sec.querySelectorAll('input, select, textarea')).filter(inp => {
                if (!isElementVisible(inp)) return false;
                if (inp.type === 'checkbox') return inp.checked;
                if (inp.type === 'button' || inp.type === 'submit') return false;
                if (/\b[a-z]{1,4}-(name|zonadate|ubic|tipo)\b/.test(inp.className)) return false;
                if (inp.classList.contains('ea-name') || inp.classList.contains('ef-name') || inp.classList.contains('em-name')) return false;
                return inp.value && inp.value.trim() !== '' && inp.value !== 'Otros' && inp.value !== 'Otro';
            });

            const visSubSecs = Array.from(sec.querySelectorAll('.eh-uisection, .instance-box, .dynamic-list-item, .lote-card, .summary-table')).filter(isElementVisible);

            if (visCards.length === 0 && visTables.length === 0 && visInputs.length === 0 && visSubSecs.length === 0) {
                sec.style.display = 'none';
                sec.classList.add('empty-chapter-hidden');
                sec.remove();
            }
        });
    }

    // Sustituir checkboxes
    printArea.querySelectorAll('input[type="checkbox"]').forEach(chk => {
        const textNode = document.createElement('span');
        if (chk.checked) {
            textNode.style.fontWeight = 'bold';
            textNode.textContent = 'Verificado';
        } else {
            textNode.textContent = '☐';
            textNode.style.fontSize = '1.3em';
            textNode.style.color = '#94a3b8';
        }
        chk.parentNode.replaceChild(textNode, chk);
    });

    // Formatear fechas para impresión y Word
    printArea.querySelectorAll('input[type="date"]').forEach(dateInput => {
        const val = dateInput.value;
        let displayDate = val;
        if (val) {
            const parts = val.split('-');
            if (parts.length === 3) displayDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        
        // Tanto en impresión como en Word, la fecha se muestra como texto dd/mm/aaaa
        const span = document.createElement('span');
        span.className = dateInput.className;
        span.textContent = displayDate || '';
        dateInput.parentNode.replaceChild(span, dateInput);
    });

    // Ocultar aclaraciones de documentos para compactar listas en impresión y Word
    printArea.querySelectorAll('span').forEach(span => {
        if (span.style.color === 'var(--text-muted)' || span.style.fontSize === '0.8rem') {
            let prev = span.previousSibling;
            while (prev && prev.nodeType === Node.TEXT_NODE && prev.textContent.trim() === '') {
                let toRemove = prev;
                prev = prev.previousSibling;
                toRemove.remove();
            }
            if (prev && prev.tagName === 'BR') {
                prev.remove();
            }
            span.remove();
        }
    });

    // ----------------- UNIFIED CLEANUP FOR BOTH PRINT AND WORD -----------------

    // Eliminar botones y elementos ocultos
    printArea.querySelectorAll('button').forEach(btn => btn.remove());
    printArea.querySelectorAll('.btn-remove-instance, .btn-add-instance, .btn-remove-material, .btn-upload-file, .print-hidden, datalist').forEach(btn => btn.remove());
    printArea.querySelectorAll('*').forEach(el => {
        if (el.style && el.style.display === 'none') el.remove();
        if (el.onclick) el.onclick = null;
    });

    // Convertir dynamic-list-container a tabla de 2 columnas para impresión
    printArea.querySelectorAll('.dynamic-list-container').forEach(container => {
        const items = container.querySelectorAll('.dynamic-list-item');
        if (items.length === 0) {
            container.remove();
            return;
        }

        items.forEach(item => {
            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.tableLayout = 'fixed';
            table.style.borderCollapse = 'collapse';
            table.style.marginBottom = '20px';
            table.style.fontSize = '9pt';
            table.style.border = '1px solid #d1d5db';
            
            const colgroup = document.createElement('colgroup');
            const col1 = document.createElement('col');
            col1.style.width = '30%';
            const col2 = document.createElement('col');
            col2.style.width = '70%';
            colgroup.appendChild(col1);
            colgroup.appendChild(col2);
            table.appendChild(colgroup);
            
            const titleInput = item.querySelector('.dynamic-list-title');
            if (titleInput && titleInput.value.trim()) {
                const thead = document.createElement('thead');
                const trTitle = document.createElement('tr');
                const thTitle = document.createElement('th');
                thTitle.colSpan = 2;
                thTitle.textContent = titleInput.value.trim();
                thTitle.style.padding = '4px 6px';
                thTitle.style.backgroundColor = '#f1f5f9';
                thTitle.style.borderBottom = '1px solid #d1d5db';
                thTitle.style.textAlign = 'center';
                thTitle.style.fontSize = '10pt';
                thTitle.style.fontWeight = 'bold';
                trTitle.appendChild(thTitle);
                thead.appendChild(trTitle);
                table.appendChild(thead);
                titleInput.remove();
            }

            const tbody = document.createElement('tbody');
            const itemLabels = Array.from(item.querySelectorAll('label'));
            
            itemLabels.forEach(l => {
                const group = l.parentNode;
                const inp = group.querySelector('input, select, textarea');
                
                const tr = document.createElement('tr');
                
                const tdLabel = document.createElement('td');
                tdLabel.textContent = l.textContent.trim();
                tdLabel.style.padding = '4px 6px';
                tdLabel.style.border = '1px solid #d1d5db';
                tdLabel.style.backgroundColor = '#f8fafc';
                tdLabel.style.fontWeight = 'bold';
                tdLabel.style.verticalAlign = 'middle';
                tr.appendChild(tdLabel);
                
                const tdVal = document.createElement('td');
                tdVal.style.padding = '4px 6px';
                tdVal.style.border = '1px solid #d1d5db';
                tdVal.style.verticalAlign = 'middle';
                if (inp) tdVal.appendChild(inp);
                tr.appendChild(tdVal);
                
                tbody.appendChild(tr);
            });
            
            table.appendChild(tbody);
            container.parentNode.insertBefore(table, container);
        });
        
        container.remove();
    });

    // Deshabilitar checkboxes
    printArea.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(chk => {
        chk.setAttribute('disabled', 'true');
    });

    // Inputs a spans manteniendo sus clases (como unified-title)
    printArea.querySelectorAll('input[type="text"], input[type="date"], input[type="number"]').forEach(input => {
        const val = input.value;
        const span = document.createElement('span');
        span.className = input.className; 
        if (!span.classList.contains('form-control')) span.classList.add('form-control');
        span.style.padding = '0';
        span.style.margin = '0';
        span.style.minHeight = '0';
        span.style.display = 'inline-block';
        span.textContent = val || ' ';
        input.replaceWith(span);
    });

    // Textareas
    printArea.querySelectorAll('textarea').forEach(input => {
        const val = input.value;
        const span = document.createElement('span');
        span.className = input.className;
        if (!span.classList.contains('form-control')) span.classList.add('form-control');
        span.style.padding = '0';
        span.style.margin = '0';
        span.style.minHeight = '0';
        span.style.display = 'inline-block';
        span.innerHTML = (val || ' ').replace(/\n/g, '<br>');
        input.replaceWith(span);
    });

    // Neutralizar por completo colores en estados conforme/no-conforme, badges y selects para versión impresa y Word
    printArea.querySelectorAll('.badge-conforme, .badge-cumple, .badge-no-conforme, .badge-no-cumple, .badge-pendiente, .badge, [data-status], .status-ok, .status-ko, .status-na').forEach(el => {
        el.style.setProperty('background', 'transparent', 'important');
        el.style.setProperty('background-color', 'transparent', 'important');
        el.style.setProperty('color', '#000', 'important');
        el.style.setProperty('border', 'none', 'important');
        el.style.setProperty('box-shadow', 'none', 'important');
        el.style.setProperty('padding', '0', 'important');
        el.removeAttribute('data-status');
        el.classList.remove('badge-conforme', 'badge-cumple', 'badge-no-conforme', 'badge-no-cumple', 'badge-pendiente', 'status-ok', 'status-ko', 'status-na');
    });

    // Selects a spans limpios sin color
    printArea.querySelectorAll('select').forEach(input => {
        const val = input.options[input.selectedIndex]?.text || '';
        const span = document.createElement('span');
        span.className = input.className;
        span.classList.remove('status-ok', 'status-ko', 'status-na', 'form-control');
        span.removeAttribute('data-status');
        span.style.padding = '0';
        span.style.margin = '0';
        span.style.minHeight = '0';
        span.style.display = 'inline-block';
        span.style.background = 'transparent';
        span.style.backgroundColor = 'transparent';
        span.style.color = '#000';
        span.style.border = 'none';
        span.textContent = val === 'Seleccionar...' ? ' ' : (val || ' ');
        input.replaceWith(span);
    });

    // Forzar colores blanco y negro en tablas e interior de printArea (tanto para Print como para Word)
    printArea.querySelectorAll('*').forEach(el => {
        if (el.style.color && el.style.color !== '#000' && el.style.color !== 'rgb(0, 0, 0)' && el.style.color !== 'black') {
            el.style.color = '#000';
        }
        const bg = (el.style.backgroundColor || el.style.background || '').toLowerCase();
        if (bg && !['#f1f5f9', 'rgb(241, 245, 249)', '#e5e5e5', 'rgb(229, 229, 229)', '#f8fafc', 'rgb(248, 250, 252)', '#f9f9f9', 'rgb(249, 249, 249)', '#ffffff', 'rgb(255, 255, 255)', 'white', 'transparent', ''].includes(bg)) {
            el.style.background = 'transparent';
            el.style.backgroundColor = 'transparent';
        }
    });

    // Convertir Grid a Tabla (útil para imprimir y para Word, garantizando aspecto de tabla)
    printArea.querySelectorAll('.dynamic-grid').forEach(grid => {
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.tableLayout = 'fixed';
        table.style.borderCollapse = 'collapse';
        table.style.marginBottom = '12px';
        
        const colgroup = document.createElement('colgroup');
        const col1 = document.createElement('col');
        col1.style.width = '30%';
        const col2 = document.createElement('col');
        col2.style.width = '70%';
        colgroup.appendChild(col1);
        colgroup.appendChild(col2);
        table.appendChild(colgroup);

        Array.from(grid.children).forEach(rowDiv => {
            const tr = document.createElement('tr');
            Array.from(rowDiv.children).forEach((cell, i) => {
                const td = document.createElement('td');
                td.style.border = '1px solid #d1d5db';
                td.style.padding = '4px 6px';
                td.style.verticalAlign = 'middle';
                td.style.fontSize = '9pt';
                if (i === 0) { // form-label
                    td.style.backgroundColor = '#f8fafc';
                    td.style.fontWeight = 'bold';
                }
                td.appendChild(cell);
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });
        grid.parentNode.replaceChild(table, grid);
    });

    if (action === 'word') {
        // Adaptar contenedores flex (space-between) a tablas para que Word alinee títulos y fechas a los extremos
        printArea.querySelectorAll('div').forEach(div => {
            const styleStr = div.getAttribute('style') || '';
            if (div.style.justifyContent === 'space-between' || styleStr.includes('space-between')) {
                const table = document.createElement('table');
                table.style.width = '100%';
                table.style.border = 'none';
                table.style.marginBottom = div.style.marginBottom || '10px';
                const tr = document.createElement('tr');
                Array.from(div.children).forEach((child, i) => {
                    const td = document.createElement('td');
                    td.style.border = 'none';
                    td.style.padding = '0';
                    td.style.verticalAlign = 'middle';
                    if (div.children.length > 1 && i === div.children.length - 1) {
                        td.style.textAlign = 'right';
                    }
                    td.appendChild(child);
                    tr.appendChild(td);
                });
                table.appendChild(tr);
                div.parentNode.replaceChild(table, div);
            }
        });

        // Eliminar por completo elementos ocultos (como la estrella de Habitual) para Word
        printArea.querySelectorAll('.print-hidden').forEach(el => el.remove());
    }

        // Asegurarnos de que los checkbox y radios esten deshabilitados
        printArea.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(chk => {
            chk.setAttribute('disabled', 'true');
        });

        // Quitar overflow-x: auto que recorta tablas por la derecha en impresión
        printArea.querySelectorAll('div').forEach(div => {
            if (div.style.overflowX === 'auto') {
                div.style.overflowX = 'visible';
            }
        });

        // Y que los labels tengan algo de estilo y añadan ":" en vez de bordes
        printArea.querySelectorAll('label, .form-label').forEach(lbl => {
            const input = lbl.querySelector('input');
            if (input) return; // Si es un checkbox label, saltar
            
            let text = lbl.textContent.replace(/:$/, '').trim();
            if (!text) return;

            const strong = document.createElement('strong');
            strong.textContent = text + ':';
            
            lbl.innerHTML = '';
            lbl.appendChild(strong);
            lbl.style.display = 'flex';
            lbl.style.alignItems = 'center';
            lbl.style.borderRight = 'none';
            lbl.style.border = 'none';
            lbl.style.paddingRight = '5px';
        });
    
    if (docNuevo) {
        // Contenido ya limpio de las fichas especiales, sin su título (lo pone el documento)
        const htmlAntiguo = {};
        printArea.querySelectorAll('.material-section[data-mat]').forEach(sec => {
            const t = sec.querySelector('h1, h2');
            if (t) t.remove();
            // Quitar bloques de observaciones vacíos (título + campo en blanco)
            sec.querySelectorAll('span.form-control').forEach(sp => {
                if (sp.textContent.trim() || sp.querySelector('img')) return;
                const padre = sp.parentElement;
                const hermanos = padre ? Array.from(padre.children).filter(x => x !== sp) : [];
                if (padre && padre !== sec && hermanos.length <= 1 && hermanos.every(h => /^(H\d|LABEL|STRONG)$/.test(h.tagName) && /observaci/i.test(h.textContent))) padre.remove();
            });
            htmlAntiguo[sec.dataset.mat] = sec.innerHTML;
        });
        const capitulos = ordenCapitulos.filter(id => {
            const tpl = materialesTemplate.find(m => m.id === id);
            return Impresion.tieneGenerador(tpl) || htmlAntiguo[id] !== undefined;
        });
        printArea.innerHTML = Impresion.construir({
            capitulos, soloDatos: printOnlyWithData, intro: currentProject.introText || '', htmlAntiguo
        });
    }

    if (action === 'print') {
        imprimirDesdeApp();
    } else if (action === 'word') {
        // Insertar saltos de página específicos de Word usando el DOM
        const sections = printArea.querySelectorAll(docNuevo ? '.pd-pagina' : '.material-section');
        sections.forEach((sec, idx) => {
            if (idx > 0 || docNuevo) {
                const br = document.createElement('br');
                br.setAttribute('clear', 'all');
                br.style.pageBreakBefore = 'always';
                sec.parentNode.insertBefore(br, sec);
            }
        });

        // Word necesita el tamaño de las imágenes en atributos
        printArea.querySelectorAll('img.foto-mini').forEach(img => {
            const w = Number(img.dataset.w) || img.naturalWidth || 360, h = Number(img.dataset.h) || img.naturalHeight || 270;
            const alto = 90;
            img.setAttribute('height', String(alto));
            img.setAttribute('width', String(Math.round(w * alto / h)));
            img.style.marginRight = '4px';
        });
        let bodyHtml = printArea.innerHTML;

        const htmlStr = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>${escHtml(currentProject.name || 'Documento')}</title>
                <style>
                    body { font-family: 'Arial', sans-serif; font-size: 10pt; color: #000; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                    th, td { border: 1px solid #000; padding: 4px; font-size: 9pt; vertical-align: top; }
                    th { background-color: #e5e5e5; font-weight: bold; text-align: center; }
                    .group-row { background-color: #f5f5f5; font-weight: bold; }
                    h1 { color: #000; margin-bottom: 10px; font-size: 18pt; }
                    h2 { color: #000; margin-bottom: 24px; font-size: 16pt; font-weight: bold; text-decoration: underline; border: none; }
                    h3, h4 { color: #000; margin-bottom: 10px; }
                    .unified-title { font-size: 11pt; font-weight: bold; text-decoration: underline; margin-bottom: 6px; margin-top: 24px; display: block; }
                    .form-group, .dynamic-grid { margin-bottom: 5px; }
                    .print-hidden { display: none !important; }
                    .badge-conforme, .badge-cumple, .badge-no-conforme, .badge-no-cumple, .badge-pendiente, .badge, [data-status], .status-ok, .status-ko, .status-na {
                        color: #000 !important;
                        font-weight: bold !important;
                        background: transparent !important;
                        background-color: transparent !important;
                        border: none !important;
                        padding: 0 !important;
                    }
                </style>
            </head>
            <body>
                ${bodyHtml}
            </body>
            </html>
        `;
        try {
            const converted = htmlDocx.asBlob(htmlStr, {orientation: 'portrait'});
            saveAs(converted, `${(currentProject.name || 'Control_Calidad').replace(/\s+/g, '_')}.docx`);
        } catch (e) {
            alert('Error al generar el documento Word. Asegúrate de tener conexión a internet para descargar la librería la primera vez.');
            console.error(e);
        }
    }
}

function isChapterUsedForSummary(mat) {
    const printOnlyWithDataNode = document.getElementById('print-only-with-data');
    const printOnlyWithData = printOnlyWithDataNode ? printOnlyWithDataNode.checked : true;

    const chapCheck = document.querySelector(`.print-chap-${mat.category}[data-id="${mat.id}"]`);
    const blockCheck = document.getElementById(`print-block-${mat.category}`);
    if (chapCheck) {
        if (blockCheck && !blockCheck.checked) return false;
        return chapCheck.checked;
    }

    const isSelected = Array.isArray(currentProject.selectedMaterials) && currentProject.selectedMaterials.includes(mat.id);
    if (!isSelected) return false;
    return printOnlyWithData ? hasDataToPrint(mat.id, mat) : true;
}

function isChapterCorrectoForSummary(mat) {
    if (!isChapterUsedForSummary(mat)) return false;
    const corrCheck = document.querySelector(`.print-correcto-${mat.category}[data-id="${mat.id}"]`);
    if (corrCheck) {
        return corrCheck.checked;
    }
    if (contarNoConformidades(mat.id) > 0) return false;
    if (currentProject.summaryCorrecto && currentProject.summaryCorrecto[mat.id] !== undefined) {
        return Boolean(currentProject.summaryCorrecto[mat.id]);
    }
    return true;
}

function generatePrintSummaryDocument() {
    updateProjectDataFromInputs();
    const printArea = document.getElementById('print-area');
    if (!printArea) return;
    printArea.innerHTML = '';

    const techName = currentProject.tech || '';
    const today = new Date();
    const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const todayStr = `${today.getDate()} de ${months[today.getMonth()]} de ${today.getFullYear()}`;

    const categories = [
        { key: 'recepcion', title: 'Control de recepción' },
        { key: 'ejecucion', title: 'Control de ejecución' },
        { key: 'ensayos', title: 'Ensayos' }
    ];

    const columnsHtml = categories.map(cat => {
        const items = materialesTemplate.filter(m => m.category === cat.key);
        const rowsHtml = items.map(mat => {
            const used = isChapterUsedForSummary(mat);
            const correcto = isChapterCorrectoForSummary(mat);
            return `
                <tr>
                    <td style="padding: 3px 5px; border: 1px solid #000; font-size: 7.8pt; line-height: 1.15;">${mat.name}</td>
                    <td class="mark-cell" style="padding: 2px 0; border: 1px solid #000; text-align: center; font-weight: bold; font-size: 8.5pt;">${used ? 'X' : ''}</td>
                    <td class="mark-cell" style="padding: 2px 0; border: 1px solid #000; border-right: 1.5px solid #000; text-align: center; font-weight: bold; font-size: 8.5pt;">${correcto ? 'X' : ''}</td>
                </tr>
            `;
        }).join('');

        return `
            <div style="padding-right: 2px; overflow: visible;">
                <table class="control-summary-col-table" style="width: calc(100% - 3px); margin-left: 1px; border-collapse: collapse; border: 1px solid #000; border-right: 1.5px solid #000; table-layout: fixed;">
                    <colgroup>
                        <col style="width: 52%;">
                        <col style="width: 22%;">
                        <col style="width: 26%;">
                    </colgroup>
                    <thead>
                        <tr>
                            <th colspan="3" style="background: #e5e5e5; font-weight: bold; text-align: center; padding: 4px 4px; border: 1px solid #000; border-right: 1.5px solid #000; font-size: 8.5pt; text-transform: uppercase;">${cat.title}</th>
                        </tr>
                        <tr>
                            <th class="sub-th" style="width: 52%; background: #f8fafc; font-weight: bold; text-align: left; padding: 3px 4px; border: 1px solid #000; font-size: 6pt; letter-spacing: -0.2px; text-transform: none; white-space: nowrap;">Capítulo</th>
                            <th class="sub-th" style="width: 22%; background: #f8fafc; font-weight: bold; text-align: center; padding: 3px 1px; border: 1px solid #000; font-size: 6pt; letter-spacing: -0.2px; text-transform: none; white-space: nowrap;">Control</th>
                            <th class="sub-th" style="width: 26%; background: #f8fafc; font-weight: bold; text-align: center; padding: 3px 1px; border: 1px solid #000; border-right: 1.5px solid #000; font-size: 6pt; letter-spacing: -0.2px; text-transform: none; white-space: nowrap;">Correcto</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
        `;
    }).join('');

    const html = `
        <style>
            @media print {
                .control-summary-doc {
                    width: calc(100% - 10px) !important;
                    margin: 0 auto !important;
                    padding: 2px 6px 2px 2px !important;
                    box-sizing: border-box !important;
                    overflow: visible !important;
                }
                .control-summary-header-table,
                .control-summary-obra-table {
                    width: calc(100% - 4px) !important;
                    margin-left: 1px !important;
                    border-collapse: collapse !important;
                    border: 1px solid #000 !important;
                    border-right: 1.5px solid #000 !important;
                }
                .control-summary-header-table td:last-child,
                .control-summary-obra-table td:last-child,
                .control-summary-col-table th:last-child,
                .control-summary-col-table td:last-child {
                    border-right: 1.5px solid #000 !important;
                }
                .control-summary-grid {
                    display: grid !important;
                    grid-template-columns: 1fr 1fr 1fr !important;
                    gap: 8px !important;
                    width: calc(100% - 4px) !important;
                    margin-left: 1px !important;
                    align-items: start !important;
                }
                .control-summary-col-table {
                    width: calc(100% - 3px) !important;
                    margin-left: 1px !important;
                    border-collapse: collapse !important;
                    border: 1px solid #000 !important;
                    border-right: 1.5px solid #000 !important;
                }
                .control-summary-col-table th.sub-th {
                    font-size: 6pt !important;
                    padding: 3px 1px !important;
                    letter-spacing: -0.2px !important;
                    text-transform: none !important;
                    white-space: nowrap !important;
                    word-wrap: normal !important;
                    overflow-wrap: normal !important;
                }
            }
        </style>
        <div class="control-summary-doc">
            <table class="control-summary-header-table" style="width: calc(100% - 4px); margin-left: 1px; border-collapse: collapse; border: 1px solid #000; border-right: 1.5px solid #000; margin-bottom: 10px; table-layout: fixed;">
                <tr>
                    <td style="width: 65%; border: 1px solid #000; padding: 12px 16px; vertical-align: middle;">
                        <div style="font-size: 12.5pt; line-height: 1.25; color: #000;">
                            <div>CERTIFICADO DE CUMPLIMIENTO</div>
                            <div>DEL PROGRAMA DE CONTROL DE CALIDAD:</div>
                            <div style="font-size: 11.5pt;">Relación de los controles de obra y resultados</div>
                            <div style="font-size: 10.5pt;">(anexo al certificado final de obra)</div>
                        </div>
                    </td>
                    <td style="width: 35%; border: 1px solid #000; border-right: 1.5px solid #000; padding: 4px 8px; vertical-align: top; height: 90px;">
                        <div style="font-size: 8pt; color: #000; text-align: left;">Nº de visado</div>
                        <div style="height: 70px;"></div>
                    </td>
                </tr>
            </table>

            <table class="control-summary-obra-table" style="width: calc(100% - 4px); margin-left: 1px; border-collapse: collapse; border: 1px solid #000; border-right: 1.5px solid #000; margin-bottom: 12px; font-size: 8.5pt; table-layout: fixed;">
                <tr>
                    <td style="width: 28%; background: #e5e5e5; font-weight: bold; padding: 4px 8px; border: 1px solid #000;">Nombre de la Obra / Referencia</td>
                    <td style="width: 72%; padding: 4px 8px; border: 1px solid #000; border-right: 1.5px solid #000;">${escHtml(currentProject.name || '')}</td>
                </tr>
                <tr>
                    <td style="width: 28%; background: #e5e5e5; font-weight: bold; padding: 4px 8px; border: 1px solid #000;">Emplazamiento</td>
                    <td style="width: 72%; padding: 4px 8px; border: 1px solid #000; border-right: 1.5px solid #000;">${escHtml(currentProject.location || '')}</td>
                </tr>
                <tr>
                    <td style="width: 28%; background: #e5e5e5; font-weight: bold; padding: 4px 8px; border: 1px solid #000;">Autor del programa</td>
                    <td style="width: 72%; padding: 4px 8px; border: 1px solid #000; border-right: 1.5px solid #000;">${escHtml(techName)}</td>
                </tr>
            </table>

            <div class="control-summary-grid" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; align-items: start; width: calc(100% - 4px); margin-left: 1px; margin-bottom: 14px;">
                ${columnsHtml}
            </div>

            <div class="control-summary-footer" style="width: calc(100% - 4px); margin-left: 1px; margin-top: 16px; border-top: 1px solid #000; padding-top: 10px; page-break-inside: avoid; display: flex; justify-content: space-between; align-items: flex-start; font-size: 9pt;">
                <div>
                    <p style="margin: 0 0 6px 0;">Fecha: <strong>${todayStr}</strong></p>
                    <p style="margin: 0;">El Autor del Programa: <strong>${escHtml(techName) || '___________________'}</strong></p>
                </div>
                <div style="text-align: center; min-width: 200px; padding-right: 30px;">
                    <p style="margin: 0;">Firma</p>
                    <p style="margin: 45px 0 0 0;">___________________</p>
                </div>
            </div>
        </div>
    `;

    printArea.innerHTML = html;
    imprimirDesdeApp();
}

// Lanza la impresión indicando que el contenido ya lo ha preparado la aplicación
let impresionDesdeApp = false;
function imprimirDesdeApp() {
    impresionDesdeApp = true;
    try { window.print(); } finally { impresionDesdeApp = false; }
}

const printOnlyCheckbox = document.getElementById('print-only-with-data');
if (printOnlyCheckbox) {
    printOnlyCheckbox.addEventListener('change', (e) => {
        const onlyWithData = e.target.checked;
        if (!currentProject.summaryCorrecto) currentProject.summaryCorrecto = {};
        document.querySelectorAll('[class^="print-chap-"]').forEach(chk => {
            const matId = chk.dataset.id;
            const template = materialesTemplate.find(m => m.id === matId);
            if (!onlyWithData) {
                chk.checked = true;
            } else if (template) {
                chk.checked = hasDataToPrint(matId, template);
            }
            const corr = document.querySelector(`[class^="print-correcto-"][data-id="${matId}"]`);
            if (corr) {
                corr.checked = chk.checked && contarNoConformidades(matId) === 0;
                currentProject.summaryCorrecto[matId] = corr.checked;
            }
        });
    });
}

btns.print.addEventListener('click', () => {
    renderPrintConfig();
    showScreen('print');
});

const btnNoConformidades = document.getElementById('btn-noconf');
if (btnNoConformidades) btnNoConformidades.addEventListener('click', () => { updateProjectDataFromInputs(); abrirNoConformidades(); });

const btnPrintSummary = document.getElementById('btn-print-summary');
if (btnPrintSummary) {
    btnPrintSummary.addEventListener('click', () => {
        generatePrintSummaryDocument();
    });
}

document.getElementById('btn-generate-print').addEventListener('click', () => {
    generatePrintDocument('print');
});

const btnWord = document.getElementById('btn-generate-word');
if (btnWord) {
    btnWord.addEventListener('click', () => {
        generatePrintDocument('word');
    });
}

// CSS adicional para mostrar los títulos de las fichas solo al imprimir
const style = document.createElement('style');
style.textContent = `
    @media print {
        .print-only-title {
            display: block !important;
            margin-bottom: 20px;
            color: #000;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }
    }
`;
document.head.appendChild(style);

// ExpertoInformes: Soporte nativo para Ctrl+P desde cualquier vista
// Ctrl+P (o imprimir desde el menú del navegador): generar siempre el documento completo
// con los datos actuales, salvo que la impresión la haya lanzado la propia aplicación
// (documento completo o resumen ya preparados).
window.addEventListener('beforeprint', () => {
    if (impresionDesdeApp) return;
    generatePrintDocument('prepare');
});

async function handleExploreClick(e, mat) {
    e.preventDefault();
    e.stopPropagation();

    if (!projectDirHandle) {
        const confirmDir = await window.appConfirmar("No tenemos acceso a la carpeta raíz de la obra. ¿Deseas seleccionarla ahora para poder explorar los documentos?", { titulo: 'Carpeta de la obra', aceptar: 'Seleccionar carpeta', peligro: false });
        if (confirmDir) {
            try {
                projectDirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
                if (currentProject.id && projectFileHandle) {
                    if (!window.Almacen || Almacen.modo === 'local') await DB.saveProject(currentProject.id, currentProject.name, projectDirHandle, projectFileHandle);
                }
            } catch (err) {
                return;
            }
        } else {
            return;
        }
    }

    try {
        let catFolderName = "";
        if (mat.category === 'recepcion') catFolderName = 'Control de recepción';
        else if (mat.category === 'ejecucion') catFolderName = 'Control de ejecución';
        else if (mat.category === 'ensayos') catFolderName = 'Ensayos y pruebas de servicio';
        
        // Si la carpeta del capítulo aún no existe, se crea (vacía)
        const chapterHandle = await carpetaCapitulo(mat);
        const safeName = mat.name.replace(/[\\/:*?"<>|]/g, '-');

        const files = [];
        for await (const entry of chapterHandle.values()) {
            if (entry.kind === 'file') {
                files.push(entry);
            }
        }

        showFilesModal(mat.name, files);
    } catch (err) {
        alert("No se pudo acceder a la carpeta. Es posible que aún no se haya creado o no tengas permisos.");
        console.error(err);
    }
}

function showFilesModal(chapterName, fileHandles) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '9999';

    const modal = document.createElement('div');
    modal.style.background = 'white';
    modal.style.padding = '2rem';
    modal.style.borderRadius = '8px';
    modal.style.width = '500px';
    modal.style.maxWidth = '90%';
    modal.style.maxHeight = '80%';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '1rem';
    header.style.borderBottom = '1px solid #ccc';
    header.style.paddingBottom = '0.5rem';

    const title = document.createElement('h3');
    title.textContent = 'Documentos: ' + chapterName;
    title.style.margin = '0';
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.fontSize = '1.5rem';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => document.body.removeChild(overlay);

    header.appendChild(title);
    header.appendChild(closeBtn);
    modal.appendChild(header);

    const list = document.createElement('ul');
    list.style.listStyle = 'none';
    list.style.padding = '0';
    list.style.overflowY = 'auto';
    list.style.flex = '1';

    if (fileHandles.length === 0) {
        list.innerHTML = '<li style="padding: 1rem; text-align: center; color: #666;">No hay documentos en esta carpeta.</li>';
    } else {
        fileHandles.forEach(handle => {
            const li = document.createElement('li');
            li.style.padding = '0.5rem';
            li.style.borderBottom = '1px solid #eee';
            li.style.display = 'flex';
            li.style.alignItems = 'center';
            li.style.gap = '0.5rem';

            const icon = document.createElement('span');
            icon.innerHTML = '📄';

            const link = document.createElement('a');
            link.textContent = handle.name;
            link.href = '#';
            link.style.textDecoration = 'none';
            link.style.color = 'var(--primary)';
            link.onclick = async (e) => {
                e.preventDefault();
                try {
                    const file = await handle.getFile();
                    const url = URL.createObjectURL(file);
                    window.open(url, '_blank');
                } catch(err) {
                    alert('No se pudo abrir el archivo.');
                }
            };

            li.appendChild(icon);
            li.appendChild(link);
            list.appendChild(li);
        });
    }

    modal.appendChild(list);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.onclick = (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    };
}

// Iniciar aplicación
showScreen('home');

// Recalcular el color de todos los resultados de las fichas. Hace falta porque algunos
// cambios no los hace el usuario a mano (p. ej. "Todo Correcto hoy", deshacer o redibujar
// una zona) y el navegador no avisa de esos cambios.
let refrescoColoresPendiente = false;
function refrescarColoresResultados() {
    if (refrescoColoresPendiente) return;
    refrescoColoresPendiente = true;
    requestAnimationFrame(() => {
        refrescoColoresPendiente = false;
        const cont = document.getElementById('materials-content');
        if (cont) cont.querySelectorAll('select').forEach(updateSelectStatusAttribute);
    });
}
// Tras cualquier botón pulsado en las fichas (se ejecuta después de las acciones de cada ficha)
document.addEventListener('click', (e) => {
    if (e.target && e.target.closest && e.target.closest('#materials-content button')) refrescarColoresResultados();
});
// Cuando una ficha redibuja sus zonas o suministros
(function () {
    const cont = document.getElementById('materials-content');
    if (cont && window.MutationObserver) {
        new MutationObserver(refrescarColoresResultados).observe(cont, { childList: true, subtree: true });
    }
})();

// ProgramadorJS: Reactividad y semántica visual inmediata para todos los programas
function updateSelectStatusAttribute(selectEl) {
    if (!selectEl) return;
    const val = (selectEl.value || '').trim();
    const okValues = ['correcto', 'aceptado', 'entregado', 'cumple', 'conforme', 'sí', 'si', 'apto'];
    const koValues = ['no correcto', 'no cumple', 'no conforme', 'rechazado', 'no', 'incorrecto'];
    const naValues = ['no procede', 'n/a', '-'];
    
    const lower = val.toLowerCase();
    if (okValues.includes(lower)) {
        selectEl.setAttribute('data-status', 'ok');
    } else if (koValues.includes(lower)) {
        selectEl.setAttribute('data-status', 'ko');
    } else if (naValues.includes(lower)) {
        selectEl.setAttribute('data-status', 'na');
    } else {
        selectEl.removeAttribute('data-status');
    }
}

// Actualizar dinámicamente la clase unused-row y el estado visual si el usuario rellena un campo
document.addEventListener('change', function(e) {
    if (e.target.tagName === 'SELECT') {
        updateSelectStatusAttribute(e.target);
    }
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        const tr = e.target.closest('tr');
        if (tr && tr.classList.contains('unused-row')) {
            if (e.target.type === 'checkbox' && e.target.checked) {
                tr.classList.remove('unused-row');
            } else if (e.target.value && e.target.value.trim() !== '') {
                // Verificar que no es el input que solo dice "Otros" por defecto
                if (e.target.value !== 'Otros' && e.target.value !== 'Otro') {
                    tr.classList.remove('unused-row');
                }
            }
        }
    }
});

// ProgramadorJS: Reactividad inmediata en tiempo real al teclear
document.addEventListener('input', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        const tr = e.target.closest('tr');
        if (tr && tr.classList.contains('unused-row')) {
            if (e.target.value && e.target.value.trim() !== '' && e.target.value !== 'Otros' && e.target.value !== 'Otro') {
                tr.classList.remove('unused-row');
            }
        }
    }
});

function renderMaterial(section, matId, template) {
    if (!currentProject.formData[matId]) {
        currentProject.formData[matId] = {};
    }
    const data = currentProject.formData[matId];

    if (template.sections) {
        template.sections.forEach((sec, secIdx) => {
            const card = document.createElement('div');
            card.className = 'card';
            
            if (secIdx === 0) {
                const mainTitle = document.createElement('h2');
                let prefix = "Control de Recepción: ";
                if (template.category === 'ejecucion') prefix = "Control de Ejecución: ";
                else if (template.category === 'ensayos') prefix = "Control de Ensayos: ";
                mainTitle.textContent = prefix + template.name;
                card.appendChild(mainTitle);
            }

            if (sec.title) {
                const isRedundant = secIdx === 0 && (
                    template.category === 'ensayos' ||
                    sec.title.toLowerCase().trim() === template.name.toLowerCase().trim()
                );
                if (!isRedundant) {
                    const title = document.createElement('h2');
                    title.textContent = sec.title;
                    card.appendChild(title);
                }
            }

            if (sec.type === 'header' || sec.type === 'footer') {
                const grid = document.createElement('div');
                grid.className = sec.type === 'header' ? 'dynamic-grid' : '';
                
                sec.fields.forEach(f => {
                    const group = document.createElement('div');
                    group.className = 'form-group';
                    group.innerHTML = `<label class="form-label">${f.label}</label>`;
                    
                    if (f.type === 'textarea') {
                        const input = document.createElement('textarea');
                        input.className = 'form-control';
                        input.value = data[f.id] || '';
                        input.onchange = (e) => data[f.id] = e.target.value;
                        group.appendChild(input);
                    } else {
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.className = 'form-control';
                        input.value = data[f.id] || '';
                        input.onchange = (e) => data[f.id] = e.target.value;
                        group.appendChild(input);
                    }
                    grid.appendChild(group);
                });
                card.appendChild(grid);
            } 
            else if (sec.type === 'grid') {
                 const grid = document.createElement('div');
                 grid.className = 'dynamic-grid';
                 sec.fields.forEach(f => {
                    const group = document.createElement('div');
                    group.className = 'form-group';
                    group.innerHTML = `<label class="form-label">${f.label}</label>`;
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'form-control';
                    input.value = data[f.id] || '';
                    input.onchange = (e) => data[f.id] = e.target.value;
                    group.appendChild(input);
                    grid.appendChild(group);
                 });
                 card.appendChild(grid);
            }
            else if (sec.type === 'table') {
                const tableCont = document.createElement('div');
                tableCont.className = 'table-container';
                const table = document.createElement('table');
                
                const thead = document.createElement('thead');
                thead.innerHTML = `<tr>${sec.columns.map(c => `<th>${c}</th>`).join('')}</tr>`;
                table.appendChild(thead);
                
                const tbody = document.createElement('tbody');
                let currentGroup = "";

                sec.rows.forEach(r => {
                    if (r.group && r.group !== currentGroup) {
                        currentGroup = r.group;
                        const trGroup = document.createElement('tr');
                        trGroup.className = "group-row";
                        trGroup.innerHTML = `<td colspan="${sec.columns.length}">${currentGroup}</td>`;
                        tbody.appendChild(trGroup);
                    }

                    const tr = document.createElement('tr');
                    
                    const td1 = document.createElement('td');
                    if (r.customLabel) {
                        const labelInput = document.createElement('input');
                        labelInput.type = 'text';
                        labelInput.placeholder = 'Especificar...';
                        labelInput.value = data[r.id + '_label'] || '';
                        labelInput.onchange = (e) => data[r.id + '_label'] = e.target.value;
                        td1.appendChild(labelInput);
                    } else {
                        td1.textContent = r.label;
                    }
                    tr.appendChild(td1);

                    for (let i = 1; i < sec.columns.length; i++) {
                        const colName = sec.columns[i];
                        const td = document.createElement('td');
                        
                        if (colName === "Exigida" || colName === "Proyecto") {
                            const select = document.createElement('select');
                            const currentVal = data[r.id + '_' + i] || '';
                            select.className = 'form-control' + (currentVal === '' ? ' empty-select' : '');
                            const opciones = ["", "Sí", "No", "No procede"];
                            opciones.forEach(op => {
                                const opt = document.createElement('option');
                                opt.value = op;
                                opt.textContent = op === "" ? "Seleccionar..." : op;
                                select.appendChild(opt);
                            });
                            select.value = currentVal;
                            select.onchange = (e) => {
                                data[r.id + '_' + i] = e.target.value;
                                if (e.target.value === '') e.target.classList.add('empty-select');
                                else e.target.classList.remove('empty-select');
                            };
                            td.appendChild(select);
                        } else if (colName === "Verificado" || colName === "Entregado") {
                            const chk = document.createElement('input');
                            chk.type = 'checkbox';
                            chk.className = 'form-checkbox';
                            chk.checked = data[r.id + '_' + i] === true;
                            chk.onchange = (e) => data[r.id + '_' + i] = e.target.checked;
                            
                            const div = document.createElement('div');
                            div.style.textAlign = 'center';
                            div.appendChild(chk);
                            td.appendChild(div);
                        } else {
                            if (r.inputType === 'select') {
                                const select = document.createElement('select');
                                const currentVal = data[r.id + '_' + i] || '';
                                select.className = 'form-control' + (currentVal === '' ? ' empty-select' : '');
                                const opciones = r.options || ["", "Sí", "No"];
                                opciones.forEach(op => {
                                    const opt = document.createElement('option');
                                    opt.value = op;
                                    opt.textContent = op === "" ? "Seleccionar..." : op;
                                    select.appendChild(opt);
                                });
                                select.value = currentVal;
                                select.onchange = (e) => {
                                    data[r.id + '_' + i] = e.target.value;
                                    if (e.target.value === '') e.target.classList.add('empty-select');
                                    else e.target.classList.remove('empty-select');
                                };
                                td.appendChild(select);
                            } else {
                                const txt = document.createElement('input');
                                txt.type = 'text';
                                txt.value = data[r.id + '_' + i] || '';
                                txt.onchange = (e) => data[r.id + '_' + i] = e.target.value;
                                td.appendChild(txt);
                            }
                        }
                        tr.appendChild(td);
                    }
                    tbody.appendChild(tr);
                });
                table.appendChild(tbody);
                tableCont.appendChild(table);
                card.appendChild(tableCont);
            }
            else if (sec.type === 'dynamic_list') {
                const listCont = document.createElement('div');
                listCont.className = 'dynamic-list-container';
                const addBtn = document.createElement('button');
                addBtn.className = 'btn btn-secondary';
                addBtn.style.marginTop = '10px';
                addBtn.textContent = '+ Añadir ' + (sec.itemName || 'elemento');
                
                if (!Array.isArray(data[sec.id])) data[sec.id] = [];
                
                const renderItem = (itemData) => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'dynamic-list-item';
                    itemDiv.style.border = '1px solid var(--border)';
                    itemDiv.style.padding = '15px';
                    itemDiv.style.marginBottom = '15px';
                    itemDiv.style.position = 'relative';
                    itemDiv.style.backgroundColor = '#fff';
                    
                    const titleContainer = document.createElement('div');
                    titleContainer.style.display = 'flex';
                    titleContainer.style.alignItems = 'center';
                    titleContainer.style.borderBottom = '1px solid #ccc';
                    titleContainer.style.marginBottom = '15px';
                    titleContainer.style.paddingBottom = '5px';
                    
                    const itemTitleInput = document.createElement('input');
                    itemTitleInput.type = 'text';
                    itemTitleInput.className = 'dynamic-list-title';
                    itemTitleInput.value = itemData['_title'] || (sec.itemName || 'Elemento') + ' ' + (Array.from(listCont.children).length);
                    itemTitleInput.onchange = (e) => itemData['_title'] = e.target.value;
                    itemTitleInput.style.fontSize = '1.17em';
                    itemTitleInput.style.fontWeight = 'bold';
                    itemTitleInput.style.border = 'none';
                    itemTitleInput.style.outline = 'none';
                    itemTitleInput.style.flex = '1';
                    itemTitleInput.style.background = 'transparent';
                    
                    titleContainer.appendChild(itemTitleInput);
                    itemDiv.appendChild(titleContainer);
                    
                    const grid = document.createElement('div');
                    grid.style.display = 'grid';
                    grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
                    grid.style.gap = '15px';
                    
                    const fullWidthContainer = document.createElement('div');
                    fullWidthContainer.style.marginTop = '15px';
                    
                    sec.fields.forEach(f => {
                        const group = document.createElement('div');
                        group.style.display = 'flex';
                        group.style.flexDirection = 'column';
                        group.innerHTML = `<label style="font-weight: 600; margin-bottom: 5px;">${f.label}</label>`;
                        
                        let input;
                        if (f.type === 'select') {
                            input = document.createElement('select');
                            input.className = 'form-control';
                            (f.options || []).forEach(opt => {
                                const option = document.createElement('option');
                                option.value = opt; option.textContent = opt === "" ? "Seleccionar..." : opt;
                                input.appendChild(option);
                            });
                        } else if (f.type === 'textarea') {
                            input = document.createElement('textarea');
                            input.className = 'form-control';
                            input.style.resize = 'vertical';
                            input.style.minHeight = '60px';
                        } else {
                            input = document.createElement('input');
                            input.type = f.type || 'text';
                            input.className = 'form-control';
                        }
                        
                        input.value = itemData[f.id] || '';
                        input.onchange = (e) => itemData[f.id] = e.target.value;
                        
                        group.appendChild(input);
                        
                        if (f.type === 'textarea') {
                            fullWidthContainer.appendChild(group);
                        } else {
                            grid.appendChild(group);
                        }
                    });
                    
                    itemDiv.appendChild(grid);
                    if (fullWidthContainer.hasChildNodes()) {
                        itemDiv.appendChild(fullWidthContainer);
                    }
                    
                    const delBtn = document.createElement('button');
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
                    
                    delBtn.onclick = async () => {
                        if (await window.appConfirmar('¿Eliminar ' + (sec.itemName || 'elemento') + '?')) {
                            data[sec.id].splice(data[sec.id].indexOf(itemData), 1);
                            itemDiv.remove();
                            let idx = 1;
                            Array.from(listCont.children).forEach(child => {
                                if (child.classList.contains('dynamic-list-item')) {
                                    const inputTitle = child.querySelector('.dynamic-list-title');
                                    if (inputTitle && inputTitle.value.startsWith((sec.itemName || 'Elemento') + ' ')) {
                                        inputTitle.value = (sec.itemName || 'Elemento') + ' ' + idx;
                                    }
                                    idx++;
                                }
                            });
                        }
                    };
                    
                    itemDiv.appendChild(delBtn);
                    listCont.insertBefore(itemDiv, addBtn);
                };
                
                listCont.appendChild(addBtn);
                
                data[sec.id].forEach(item => renderItem(item));
                
                addBtn.onclick = () => {
                    const newItem = {};
                    data[sec.id].push(newItem);
                    renderItem(newItem);
                };
                
                card.appendChild(listCont);
            }
            
            section.appendChild(card);
        });
    }
}

// ---------------------------------------------------------------------------
// Arranque: selector de almacén (local / Drive) y lista de obras
// ---------------------------------------------------------------------------
try { pintarSelectorAlmacen(); } catch (e) { console.warn('selector almacén', e); }
try { if (screens.home && screens.home.classList.contains('active')) renderRecentProjects(); } catch (e) {}
