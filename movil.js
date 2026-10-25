// ==========================================================================
// Adaptación a móvil y tableta
// --------------------------------------------------------------------------
// - Botones de acción en una barra inferior fija (móvil vertical y horizontal).
// - Pestañas de fichas como desplegable en pantallas estrechas.
// - Tablas de puntos / documentos como tarjetas: cada celda lleva la etiqueta
//   de su columna (data-label) para mostrarla en vertical.
// Todo el aspecto está en styles.css (bloque "Móvil y tableta").
// ==========================================================================
(function () {
    'use strict';

    const MQ_BARRA = '(max-width: 760px), (max-height: 500px) and (max-width: 1100px)';
    const MQ_ESTRECHO = '(max-width: 760px)';
    const mqBarra = window.matchMedia(MQ_BARRA);
    const mqEstrecho = window.matchMedia(MQ_ESTRECHO);

    // ---------------------------------------------------------------- Barra de acciones
    const CORTOS = {
        'btn-home': 'Inicio', 'btn-back-setup': 'Fichas', 'btn-save': 'Guardar',
        'btn-custom-controls': 'Puntos', 'btn-noconf': 'No conf.', 'btn-print': 'Imprimir'
    };
    function prepararBotones() {
        Object.keys(CORTOS).forEach(id => {
            const b = document.getElementById(id);
            if (!b || b.dataset.corto) return;
            b.dataset.corto = CORTOS[id];
            // Envolver el texto suelto para poder ocultarlo en la barra
            Array.from(b.childNodes).forEach(n => {
                if (n.nodeType === Node.TEXT_NODE && n.textContent.trim()) {
                    const s = document.createElement('span');
                    s.className = 'btn-texto';
                    s.textContent = n.textContent.trim();
                    b.replaceChild(s, n);
                }
            });
            const st = document.getElementById('custom-controls-status-text');
            if (st && b.contains(st)) st.classList.add('btn-texto');
            const corto = document.createElement('span');
            corto.className = 'btn-corto';
            corto.textContent = CORTOS[id];
            b.appendChild(corto);
        });
    }

    function pantallaActiva() {
        const s = document.querySelector('.screen.active');
        return s ? s.id.replace('screen-', '') : 'home';
    }

    function colocarAcciones() {
        const acciones = document.querySelector('.header-actions');
        const header = document.querySelector('header');
        if (!acciones || !header) return;
        if (mqBarra.matches) {
            if (acciones.parentElement !== header) header.appendChild(acciones);
            document.documentElement.classList.add('con-barra');
        } else {
            document.documentElement.classList.remove('con-barra');
            const destino = document.getElementById('header-actions-container-' + pantallaActiva());
            if (destino && acciones.parentElement !== destino) destino.appendChild(acciones);
            else if (!destino && acciones.parentElement !== header) header.appendChild(acciones);
        }
        const visibles = Array.from(acciones.querySelectorAll(':scope > .btn')).filter(b => b.style.display !== 'none');
        document.documentElement.classList.toggle('barra-vacia', visibles.length === 0);
    }

    // ---------------------------------------------------------------- Pestañas como desplegable
    function selectorFichas() {
        let sel = document.getElementById('materials-tabs-select');
        const tabs = document.getElementById('materials-tabs');
        if (!tabs) return null;
        if (!sel) {
            sel = document.createElement('select');
            sel.id = 'materials-tabs-select';
            sel.className = 'form-control selector-fichas';
            sel.setAttribute('aria-label', 'Ficha');
            sel.addEventListener('change', () => {
                if (typeof activateTab === 'function') activateTab(sel.value);
                sincronizarSelector();
                window.scrollTo({ top: 0 });
            });
            tabs.parentElement.insertBefore(sel, tabs);
        }
        return sel;
    }
    function sincronizarSelector() {
        const sel = selectorFichas();
        if (!sel) return;
        const tabs = Array.from(document.querySelectorAll('#materials-tabs .tab[data-target]'));
        const textos = tabs.map(t => {
            const nombre = Array.from(t.childNodes).filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.textContent).join('').trim();
            const badge = t.querySelector('.tab-badge');
            return nombre + (badge && badge.textContent ? '  (' + badge.textContent + ')' : '');
        });
        const actual = Array.from(sel.options).map(o => o.value + '|' + o.textContent).join('§');
        const nuevo = tabs.map((t, i) => t.dataset.target + '|' + textos[i]).join('§');
        if (actual !== nuevo) {
            sel.innerHTML = '';
            tabs.forEach((t, i) => {
                const o = document.createElement('option');
                o.value = t.dataset.target;
                o.textContent = textos[i];
                sel.appendChild(o);
            });
        }
        const activa = tabs.find(t => t.classList.contains('active'));
        if (activa) sel.value = activa.dataset.target;
        sel.style.display = tabs.length ? '' : 'none';
    }

    // ---------------------------------------------------------------- Tablas como tarjetas
    function cabeceras(tabla) {
        const filas = tabla.tHead ? tabla.tHead.rows : null;
        if (!filas || !filas.length) return null;
        const fila = filas[filas.length - 1];
        const cols = [];
        Array.from(fila.cells).forEach(th => {
            const n = th.colSpan || 1;
            const txt = th.textContent.replace(/\s+/g, ' ').trim();
            for (let i = 0; i < n; i++) cols.push(txt);
        });
        return cols;
    }
    function etiquetarTabla(tabla) {
        if (tabla.closest('#print-area') || tabla.classList.contains('sin-tarjetas')) return;
        const cols = cabeceras(tabla);
        if (!cols || cols.length < 3) return;
        const conCampos = !!tabla.querySelector('tbody input, tbody select, tbody textarea');
        if (!conCampos && cols.length < 4) return;
        tabla.classList.add('tabla-tarjetas');
        Array.from(tabla.tBodies).forEach(tb => Array.from(tb.rows).forEach(tr => {
            let c = 0;
            const celdas = Array.from(tr.cells);
            if (celdas.length === 1 && (celdas[0].colSpan || 1) >= cols.length - 1) { tr.classList.add('fila-grupo-tarjeta'); return; }
            celdas.forEach(td => {
                const etiqueta = cols[c] || '';
                if (td.tagName === 'TD' && !td.hasAttribute('data-label')) {
                    td.setAttribute('data-label', etiqueta);
                    // Agrupar el contenido para que la tarjeta lo muestre en un solo bloque junto a la etiqueta
                    const nodos = Array.from(td.childNodes).filter(n => n.nodeType === Node.ELEMENT_NODE || n.textContent.trim());
                    if (nodos.length > 1 && !td.querySelector(':scope > .td-valor')) {
                        const w = document.createElement('div');
                        w.className = 'td-valor';
                        while (td.firstChild) w.appendChild(td.firstChild);
                        td.appendChild(w);
                    }
                }
                c += td.colSpan || 1;
            });
        }));
    }
    function etiquetarTablas(raiz) {
        (raiz || document).querySelectorAll('table').forEach(etiquetarTabla);
    }

    // ---------------------------------------------------------------- Enganches
    let pendiente = false;
    function refrescar() {
        if (pendiente) return;
        pendiente = true;
        requestAnimationFrame(() => {
            pendiente = false;
            etiquetarTablas(document.querySelector('.app-container'));
            document.querySelectorAll('.app-modal').forEach(m => etiquetarTablas(m));
            sincronizarSelector();
        });
    }

    function envolver(nombre, despues) {
        const original = window[nombre];
        if (typeof original !== 'function' || original.__movil) return;
        const f = function () {
            const r = original.apply(this, arguments);
            try { despues.apply(this, arguments); } catch (e) { console.warn(e); }
            return r;
        };
        f.__movil = true;
        window[nombre] = f;
    }

    function iniciar() {
        prepararBotones();
        envolver('showScreen', () => { colocarAcciones(); refrescar(); });
        envolver('renderControlForms', () => refrescar());
        envolver('activateTab', () => sincronizarSelector());
        const cambio = () => { colocarAcciones(); refrescar(); };
        if (mqBarra.addEventListener) { mqBarra.addEventListener('change', cambio); mqEstrecho.addEventListener('change', cambio); }
        else { mqBarra.addListener(cambio); mqEstrecho.addListener(cambio); }
        new MutationObserver(refrescar).observe(document.body, { childList: true, subtree: true, characterData: true });
        // Los botones de la barra cambian de visibilidad con cada pantalla
        new MutationObserver(colocarAcciones).observe(document.querySelector('.header-actions'), { attributes: true, subtree: true, attributeFilter: ['style'] });
        colocarAcciones();
        refrescar();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
    else iniciar();

    window.Movil = { etiquetarTablas, colocarAcciones, sincronizarSelector };
})();
