// ==========================================================================
// Documento de impresión / Word generado a partir de los datos de la obra
// --------------------------------------------------------------------------
// Las fichas de los motores comunes (zonas de control y suministros) y las
// fichas estándar de ensayos se imprimen directamente desde sus datos.
// Las fichas especiales se incluyen con su contenido de pantalla (htmlAntiguo).
// ==========================================================================
(function () {
    'use strict';

    const esc = (v) => window.escHtml(v);
    const fecha = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(v || '') ? v.split('-').reverse().join('/') : (v || ''));
    const NEG = ['no correcto', 'incorrecto', 'no cumple', 'no conforme', 'rechazado'];
    const OK = ['correcto', 'conforme', 'cumple', 'apto', 'entregado', 'aceptado', 'recibido', 'sí', 'si'];
    const NA = ['no procede', 'no aplica', 'no entregado'];
    const BLOQUES = [
        { cat: 'recepcion', n: 1, titulo: 'Control de recepción' },
        { cat: 'ejecucion', n: 2, titulo: 'Control de ejecución' },
        { cat: 'ensayos', n: 3, titulo: 'Ensayos y pruebas de servicio' }
    ];


    // Estilos del documento (impresión y Word). Llevan !important para imponerse a los estilos de impresión generales.
    const AZUL = '#1e3a5f';
    const CSS = `
        .pd-doc, .pd-doc * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        .pd-doc { font-family: Arial, Helvetica, sans-serif !important; font-size: 9pt !important; line-height: 1.35 !important; color: #1f2937 !important; }
        .pd-doc * { color: inherit !important; font-family: inherit !important; }
        .pd-pagina { break-before: page; page-break-before: always; }
        .pd-portada { padding-top: 34mm; }
        .pd-doc .pd-antetitulo { font-size: 9pt !important; letter-spacing: 0.18em; text-transform: uppercase; color: ${AZUL} !important; font-weight: bold; margin: 0 0 6mm 0; }
        .pd-doc h1.pd-obra { font-size: 21pt !important; line-height: 1.2 !important; font-weight: bold !important; margin: 0 0 9mm 0 !important; padding: 0 0 5mm 0 !important; border: none !important; border-bottom: 2.5pt solid ${AZUL} !important; color: #111827 !important; text-align: left !important; text-decoration: none !important; }
        .pd-doc table { width: 100% !important; border-collapse: collapse !important; table-layout: fixed !important; margin: 0 0 3mm 0 !important; border: none !important; }
        .pd-doc th, .pd-doc td { border: 0.6pt solid #d1d5db !important; padding: 1.4mm 2mm !important; font-size: 8.5pt !important; vertical-align: top !important; text-align: left !important; background: transparent !important; font-weight: normal !important; overflow-wrap: anywhere; }
        .pd-doc thead { display: table-header-group; }
        .pd-doc thead th { background: #f1f4f8 !important; color: #374151 !important; font-size: 7.5pt !important; font-weight: bold !important; text-transform: uppercase; letter-spacing: 0.04em; }
        .pd-doc tr { break-inside: avoid; page-break-inside: avoid; }
        .pd-doc .pd-datos th { width: 34%; background: #f1f4f8 !important; color: #374151 !important; font-weight: bold !important; }
        .pd-doc .pd-datos td, .pd-doc .pd-datos th { padding: 2.2mm 3mm !important; font-size: 9.5pt !important; }
        .pd-intro { margin-top: 9mm; text-align: justify; font-size: 9.5pt; }
        .pd-intro p { margin: 0 0 3mm 0; }
        .pd-doc h2.pd-h-indice, .pd-doc h2.pd-h-bloque { font-size: 15pt !important; font-weight: bold !important; color: ${AZUL} !important; margin: 0 0 6mm 0 !important; padding: 0 0 2mm 0 !important; border: none !important; border-bottom: 1.5pt solid ${AZUL} !important; text-decoration: none !important; width: 100%; break-after: avoid; }
        .pd-doc .pd-tabla-indice td { border: none !important; border-bottom: 0.6pt solid #e5e7eb !important; padding: 1.8mm 2mm !important; font-size: 9pt !important; }
        .pd-doc .pd-tabla-indice tr.pd-grupo td { font-weight: bold !important; color: ${AZUL} !important; background: transparent !important; padding-top: 4mm !important; border-bottom: 1pt solid ${AZUL} !important; }
        .pd-doc .pd-tabla-indice td:last-child { color: #6b7280 !important; font-size: 8pt !important; }
        .pd-doc .pd-tabla-indice td.pd-indice-nc { color: #b91c1c !important; }
        .pd-capitulo { margin: 0 0 8mm 0; }
        .pd-capitulo:last-child, .pd-doc .pd-antiguo > :last-child, .pd-doc .pd-antiguo > :last-child > :last-child { margin-bottom: 0 !important; padding-bottom: 0 !important; }
        .pd-doc h3.pd-h-capitulo { font-size: 12pt !important; font-weight: bold !important; color: #111827 !important; margin: 0 0 1mm 0 !important; padding: 0 !important; border: none !important; break-after: avoid; page-break-after: avoid; }
        .pd-doc .pd-num { color: ${AZUL} !important; margin-right: 2mm; }
        .pd-doc .pd-resumen { font-size: 8pt !important; color: #6b7280 !important; margin: 0 0 3mm 0; break-after: avoid; }
        .pd-doc .pd-resumen-nc { color: #b91c1c !important; }
        .pd-registro { margin: 0 0 4mm 0; }
        .pd-doc table.pd-cab { margin: 0 !important; break-after: avoid; page-break-after: avoid; }
        .pd-doc table.pd-cab td { background: #e8edf4 !important; border: none !important; border-left: 2.5pt solid ${AZUL} !important; padding: 1.6mm 2.5mm !important; font-size: 9pt !important; }
        .pd-doc table.pd-cab td.pd-cab-nombre { font-weight: bold !important; color: #111827 !important; }
        .pd-doc table.pd-cab td.pd-cab-der { border-left: none !important; text-align: right !important; width: 30%; color: #374151 !important; }
        .pd-doc .pd-meta { font-size: 8pt; color: #4b5563 !important; padding: 1.2mm 2.5mm; border-left: 2.5pt solid #cbd5e1; break-after: avoid; }
        .pd-doc .pd-meta { break-inside: avoid; page-break-inside: avoid; }
        .pd-doc .pd-meta span { margin-right: 6mm; }
        .pd-doc thead th { overflow-wrap: normal !important; word-break: normal !important; hyphens: manual; }
        .pd-doc .pd-meta b { color: #374151 !important; }
        .pd-doc .pd-subtitulo { font-size: 7.5pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.06em; color: ${AZUL} !important; margin: 2.5mm 0 1mm 0; break-after: avoid; }
        .pd-doc .pd-tabla { margin-top: 1.5mm !important; }
        .pd-doc tr.pd-grupo td { background: #f7f8fa !important; font-weight: bold !important; font-size: 8pt !important; color: #374151 !important; }
        .pd-doc tr.pd-fila-nc td { background: #fdecec !important; }
        .pd-doc .pd-tabla-ficha th { background: #f7f8fa !important; color: #4b5563 !important; font-weight: bold !important; font-size: 8pt !important; }
        .pd-doc .pd-ficha-nc td { background: #fdf3f3 !important; }
        .pd-doc .pd-res { font-weight: bold; white-space: nowrap; }
        .pd-doc .pd-res-ok { color: #166534 !important; }
        .pd-doc .pd-res-ko { color: #b91c1c !important; }
        .pd-doc .pd-res-na { color: #6b7280 !important; font-weight: normal; }
        .pd-doc .pd-res-pend { color: #92400e !important; font-weight: normal; }
        .pd-doc .pd-centro { text-align: center !important; }
        .pd-doc .pd-derecha { text-align: right !important; }
        .pd-doc .pd-detalle { font-size: 7.5pt !important; color: #6b7280 !important; margin-top: 0.6mm; }
        .pd-doc .pd-aviso { font-size: 7.5pt !important; color: #b91c1c !important; font-weight: bold; margin-top: 0.6mm; }
        .pd-doc tr.pd-fila-total td { background: #f1f4f8 !important; border-top: 1pt solid #9ca3af !important; }
        .pd-doc .pd-nowrap { white-space: nowrap; }
        .pd-fotos { margin-top: 1.5mm; }
        .pd-doc img.pd-foto { height: 2.3cm !important; width: auto; margin: 0 1.5mm 0 0; border: 0.6pt solid #d1d5db !important; border-radius: 0 !important; vertical-align: top; }
        .pd-doc .pd-notas { margin: 2mm 0 0 0; padding: 2mm 3mm; background: #f7f8fa !important; border-left: 2.5pt solid #cbd5e1; font-size: 8.5pt; }
        .pd-notas { break-before: avoid; page-break-before: avoid; break-inside: avoid; }
        .pd-notas p { margin: 0 0 1mm 0; }
        .pd-doc .pd-vacio { color: #9ca3af !important; font-style: italic; }
        .pd-antiguo { font-size: 8.5pt; }
        .pd-doc .material-section, .pd-doc .card { break-after: auto !important; page-break-after: auto !important; break-before: auto !important; page-break-before: auto !important; }
        .pd-doc .pd-antiguo h2 { font-size: 10.5pt !important; text-decoration: none !important; border: none !important; border-bottom: 0.6pt solid #cbd5e1 !important; margin: 4mm 0 2mm 0 !important; color: ${AZUL} !important; }
        .pd-doc .pd-antiguo h3, .pd-doc .pd-antiguo h4, .pd-doc .pd-antiguo .unified-title { font-size: 9.5pt !important; text-decoration: none !important; margin: 3mm 0 1.5mm 0 !important; }
        .pd-firma { break-inside: avoid; margin-top: 14mm; font-size: 9.5pt; }
        .pd-firma-caja { width: 70mm; margin: 22mm 0 0 auto; text-align: center; }
        .pd-firma-linea { border-top: 0.8pt solid #374151; margin-bottom: 2mm; }
    `;

    function claseResultado(v) {
        const l = (v || '').trim().toLowerCase();
        if (NEG.includes(l)) return 'pd-res-ko';
        if (OK.includes(l)) return 'pd-res-ok';
        if (NA.includes(l)) return 'pd-res-na';
        if (l === 'pendiente') return 'pd-res-pend';
        return '';
    }
    function resultado(v) {
        if (!v) return '';
        const c = claseResultado(v);
        const simbolo = c === 'pd-res-ok' ? '✓ ' : c === 'pd-res-ko' ? '✗ ' : c === 'pd-res-na' ? '— ' : c === 'pd-res-pend' ? '◷ ' : '';
        return `<span class="pd-res ${c}">${simbolo}${esc(v)}</span>`;
    }
    function fotos(lista) {
        const conMini = (Array.isArray(lista) ? lista : []).filter(f => f && f.mini);
        if (!conMini.length) return '';
        return `<div class="pd-fotos">${conMini.map(f => `<img class="foto-mini pd-foto" src="${f.mini}" data-w="${f.w || ''}" data-h="${f.h || ''}" alt="${esc(f.archivo || 'Foto')}">`).join('')}</div>`;
    }
    const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

    // Configuración registrada por los motores; si la ficha no se ha abierto aún, se dibuja fuera de pantalla
    function configDe(tpl) {
        const reg = window.__configFichas || {};
        if (!reg[tpl.id] && tpl.customRenderer && typeof window[tpl.customRenderer] === 'function') {
            try { window[tpl.customRenderer](document.createElement('div'), tpl.id); } catch (e) { console.warn(e); }
        }
        return (window.__configFichas || {})[tpl.id] || null;
    }

    // ---------------------------------------------------------------- Zonas de control (ejecución)
    function capituloZonas(tpl, data, cfg, soloDatos) {
        const campoNombre = cfg.campoNombre || 'customName';
        const genericos = ['Otros', 'Otro'];
        let html = '';
        let nZonas = 0, nPuntos = 0, nRev = 0;
        (data.instances || []).forEach(inst => {
            const checks = Object.keys(inst.checks || {})
                .filter(k => !k.startsWith('_') && inst.checks[k] && typeof inst.checks[k] === 'object')
                .map(k => inst.checks[k])
                .filter(c => !(genericos.includes((c.name || '').trim()) && !c.val && !c.obs && !c.date));
            const usado = c => c.val || c.obs || c.date || (Array.isArray(c.fotos) && c.fotos.length);
            const filas = soloDatos ? checks.filter(usado) : checks;
            if (soloDatos && !filas.length) return;
            nZonas++; nPuntos += checks.length; nRev += checks.filter(c => c.val).length;

            const meta = [];
            if (cfg.ubicacion && inst.ubicacion) meta.push([cfg.ubicacion.label, inst.ubicacion]);
            (cfg.camposExtra || []).forEach(c => { if (inst[c.id]) meta.push([c.label, inst[c.id]]); });
            if (cfg.tipos && inst.tipo) {
                const o = cfg.tipos.find(t => t.valor === inst.tipo || (t.alias || []).includes(inst.tipo));
                const etiqueta = cfg.selectorTipo ? cfg.selectorTipo.label : 'Tipo';
                meta.push([etiqueta, o ? (o.texto || o.valor) : inst.tipo]);
            }
            html += `<div class="pd-registro">
                ${cabecera(inst[campoNombre] || 'Zona', esc(fecha(inst.zonaDate)))}
                ${meta.length ? `<div class="pd-meta">${meta.map(([k, v]) => `<span><b>${esc(k.replace(/:$/, ''))}:</b> ${esc(v)}</span>`).join('')}</div>` : ''}
                <table class="pd-tabla">
                    <colgroup><col style="width:46%"><col style="width:12%"><col style="width:16%"><col style="width:26%"></colgroup>
                    <thead><tr><th>Punto de inspección</th><th>Fecha</th><th>Resultado</th><th>${esc((cfg.cabeceraObs || 'Observaciones').charAt(0) + (cfg.cabeceraObs || 'Observaciones').slice(1).toLowerCase())}</th></tr></thead>
                    <tbody>${filas.map(c => `<tr class="${claseResultado(c.val) === 'pd-res-ko' ? 'pd-fila-nc' : ''}">
                        <td>${esc(c.name || 'Punto sin descripción')}${fotos(c.fotos)}</td>
                        <td class="pd-nowrap">${esc(fecha(c.date))}</td>
                        <td>${resultado(c.val)}</td>
                        <td>${esc(c.obs || '')}</td></tr>`).join('')}</tbody>
                </table></div>`;
        });
        const notas = [];
        if (data.observaciones) notas.push(['Observaciones generales', data.observaciones]);
        if (data.laboratorios) notas.push(['Laboratorios intervinientes / entidades de control', data.laboratorios]);
        html += notasHtml(notas);
        return { html, resumen: [plural(nZonas, 'zona', 'zonas'), nPuntos ? `${nRev} de ${nPuntos} puntos revisados` : ''] };
    }

    // ---------------------------------------------------------------- Suministros (recepción)
    function capituloSuministros(tpl, data, cfg, soloDatos) {
        const SR = window.SuministrosRecepcion;
        const generica = (txt, nombre) => !txt || txt === nombre || SR.ETIQUETAS_GENERICAS.includes(txt);
        let html = '';
        let nSum = 0, nDocs = 0, nDocsOk = 0;
        (data.instances || []).forEach(inst => {
            const car = SR.caracteristicasDe(cfg, inst).map(c => {
                const d = (inst.caract || {})[c.id] || {};
                const label = c.custom ? (generica(d.label, c.name) ? '' : d.label) : c.name;
                return { label, valor: d.valor || '', verificado: !!d.verificado, custom: c.custom };
            }).filter(c => !(c.custom && !c.label && !c.valor && !c.verificado));
            const docs = SR.documentosDe(cfg, inst).map(doc => {
                const d = (inst.checks || {})[doc.id] || {};
                const label = doc.custom ? (generica(d.label, doc.name) ? '' : d.label) : doc.name;
                return { fase: doc.phase, label, estado: d.status || '', fecha: d.date || '', custom: doc.custom };
            }).filter(d => !(d.custom && !d.label && !d.estado && !d.fecha));
            const meta = [];
            (cfg.campos || []).forEach(c => { if (inst[c.id]) meta.push([c.label, inst[c.id]]); });
            if (cfg.selectorDcor) meta.push(['Distintivo de calidad', inst.dcor ? 'Con distintivo DCOR' : 'Sin distintivo']);
            if (cfg.tipos && inst.tipo) meta.push([cfg.tipos.label, inst.tipo]);
            const b = bloqueSuministro({ nombre: inst.customName || 'Suministro', meta, caracteristicas: car, docs, obs: inst.observaciones }, soloDatos);
            if (!b) return;
            nSum++; nDocs += b.nDocs; nDocsOk += b.nDocsOk;
            html += b.html;
        });
        return { html, resumen: [plural(nSum, 'suministro', 'suministros'), nDocs ? `${nDocsOk} de ${nDocs} documentos resueltos` : ''] };
    }


    // Bloque de un suministro: { nombre, meta: [[k, v]], caracteristicas: [{label, valor, verificado}], docs: [{fase, label, estado, fecha}], obs }
    // Devuelve null si no hay nada que imprimir con "solo datos".
    function bloqueSuministro(s, soloDatos) {
        const car = (s.caracteristicas || []);
        const docs = (s.docs || []);
        const carF = soloDatos ? car.filter(c => c.valor || c.verificado) : car;
        const docF = soloDatos ? docs.filter(d => d.estado || d.fecha) : docs;
        if (soloDatos && !carF.length && !docF.length && !s.obs && !(s.extra || '')) return null;
        let cuerpo = '';
        if (carF.length) {
            cuerpo += `<div class="pd-subtitulo">${esc(s.tituloCaract || 'Características exigidas')}</div>
            <table class="pd-tabla"><colgroup><col style="width:52%"><col style="width:33%"><col style="width:15%"></colgroup>
            <thead><tr><th>Característica</th><th>${esc(s.cabeceraValor || 'Valor de proyecto')}</th><th class="pd-centro">Verificado</th></tr></thead>
            <tbody>${carF.map(c => `<tr><td>${esc(c.label || 'Otra característica')}</td><td>${esc(c.valor)}</td><td class="pd-centro">${c.verificado ? '<span class="pd-res pd-res-ok">✓</span>' : '—'}</td></tr>`).join('')}</tbody></table>`;
        }
        if (docF.length) {
            let faseActual = null;
            cuerpo += `<div class="pd-subtitulo">Documentación</div>
            <table class="pd-tabla"><colgroup><col style="width:62%"><col style="width:22%"><col style="width:16%"></colgroup>
            <thead><tr><th>Documento / certificado</th><th>Estado</th><th>Fecha</th></tr></thead><tbody>`;
            docF.forEach(d => {
                if (d.fase && d.fase !== faseActual) { faseActual = d.fase; cuerpo += `<tr class="pd-grupo"><td colspan="3">${esc(d.fase)}</td></tr>`; }
                cuerpo += `<tr><td>${esc(d.label || 'Otra documentación')}</td><td>${resultado(d.estado)}</td><td class="pd-nowrap">${esc(fecha(d.fecha))}</td></tr>`;
            });
            cuerpo += `</tbody></table>`;
        }
        cuerpo += s.extra || '';
        if (s.obs) cuerpo += notasHtml([['Observaciones', s.obs]]);
        return {
            html: `<div class="pd-registro">${cabecera(s.nombre, s.derecha || '')}${metaHtml(s.meta)}${cuerpo}</div>`,
            nDocs: docs.length, nDocsOk: docs.filter(d => d.estado && d.estado !== 'Pendiente').length
        };
    }

    function metaHtml(meta) {
        const m = (meta || []).filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '');
        return m.length ? `<div class="pd-meta">${m.map(([k, v]) => `<span><b>${esc(String(k).replace(/:$/, ''))}:</b> ${esc(v)}</span>`).join('')}</div>` : '';
    }

    // Tabla genérica: columnas [{t: 'Título', w: '30%', clase}] y filas [[celdaHTML, ...]] o {celdas, clase}
    function tabla(columnas, filas, opciones = {}) {
        if (!filas.length) return '';
        return `<table class="pd-tabla ${opciones.clase || ''}"><colgroup>${columnas.map(c => `<col style="width:${c.w || 'auto'}">`).join('')}</colgroup>
            ${opciones.sinCabecera ? '' : `<thead><tr>${columnas.map(c => `<th class="${c.clase || ''}">${esc(c.t)}</th>`).join('')}</tr></thead>`}
            <tbody>${filas.map(f => {
                const celdas = Array.isArray(f) ? f : f.celdas;
                const clase = Array.isArray(f) ? '' : (f.clase || '');
                if (!Array.isArray(f) && f.grupo) return `<tr class="pd-grupo"><td colspan="${columnas.length}">${f.grupo}</td></tr>`;
                return `<tr class="${clase}">${celdas.map((c, k) => `<td class="${columnas[k] && columnas[k].clase || ''}">${c === undefined || c === null ? '' : c}</td>`).join('')}</tr>`;
            }).join('')}</tbody></table>`;
    }

    // Ficha de pares etiqueta/valor en dos columnas (como los ensayos)
    function ficha(pares, opciones = {}) {
        const p = pares.filter(([, v]) => !opciones.soloDatos || (v !== undefined && v !== null && String(v).trim() !== ''));
        if (!p.length) return '';
        let filas = '';
        for (let j = 0; j < p.length; j += 2) {
            const a = p[j], b = p[j + 1];
            filas += `<tr><th>${esc(a[0])}</th><td>${a[2] ? a[1] : esc(a[1])}</td>${b ? `<th>${esc(b[0])}</th><td>${b[2] ? b[1] : esc(b[1])}</td>` : '<td colspan="2"></td>'}</tr>`;
        }
        return `<table class="pd-tabla pd-tabla-ficha ${opciones.nc ? 'pd-ficha-nc' : ''}"><colgroup><col style="width:20%"><col style="width:30%"><col style="width:20%"><col style="width:30%"></colgroup><tbody>${filas}</tbody></table>`;
    }

    // Bloque de zona con tabla de puntos: { nombre, fecha, meta, puntos: [{name, date, val, obs, fotos}], cabeceraObs }
    function bloquePuntos(z, soloDatos) {
        const usado = c => c.val || c.obs || c.date || (Array.isArray(c.fotos) && c.fotos.length);
        const filas = soloDatos ? z.puntos.filter(usado) : z.puntos;
        if (soloDatos && !filas.length && !z.extra) return null;
        return `<div class="pd-registro">
            ${cabecera(z.nombre, esc(fecha(z.fecha || '')))}
            ${metaHtml(z.meta)}
            ${filas.length ? `<table class="pd-tabla">
                <colgroup><col style="width:46%"><col style="width:12%"><col style="width:16%"><col style="width:26%"></colgroup>
                <thead><tr><th>Punto de inspección</th><th>Fecha</th><th>Resultado</th><th>${esc(z.cabeceraObs || 'Observaciones')}</th></tr></thead>
                <tbody>${filas.map(c => `<tr class="${claseResultado(c.val) === 'pd-res-ko' ? 'pd-fila-nc' : ''}">
                    <td>${esc(c.name || 'Punto sin descripción')}${fotos(c.fotos)}</td>
                    <td class="pd-nowrap">${esc(fecha(c.date))}</td>
                    <td>${resultado(c.val)}</td>
                    <td>${esc(c.obs || '')}</td></tr>`).join('')}</tbody>
            </table>` : ''}${z.extra || ''}</div>`;
    }

    const H = { esc, fecha, resultado, claseResultado, cabecera: (n, d) => cabecera(n, d), metaHtml, notasHtml: (n) => notasHtml(n), tabla, ficha, fotos, plural,
        bloqueSuministro: (s, sd) => bloqueSuministro(s, sd), bloquePuntos, subtitulo: (t) => `<div class="pd-subtitulo">${esc(t)}</div>`,
        estadoDoc: (v) => (['Aceptado', 'Recibido'].includes(v) ? 'Entregado' : ['No Entregado', 'No aplica'].includes(v) ? 'No procede' : (v || '')),
        vacio: (v) => v === undefined || v === null || String(v).trim() === '' };

    // Registro de la impresión de una ficha especial: H.registrar(materialId, (data, soloDatos, H) => ({ html, resumen: [] }))
    window.registrarImpresionFicha = function (materialId, imprimir) {
        (window.__configFichas = window.__configFichas || {})[materialId] = { tipo: 'propio', imprimir };
    };

    // ---------------------------------------------------------------- Listas de ensayos (fichas estándar)
    function capituloLista(tpl, data, soloDatos) {
        let html = '';
        let n = 0;
        (tpl.sections || []).forEach(sec => {
            if (sec.type !== 'dynamic_list') return;
            const items = (Array.isArray(data[sec.id]) ? data[sec.id] : []).filter(it => !soloDatos || sec.fields.some(f => it[f.id]));
            items.forEach((it, i) => {
                n++;
                const campos = sec.fields.filter(f => f.id !== 'observaciones' && f.id !== 'resultado' && (!soloDatos || it[f.id]));
                const celdas = campos.map(f => [f.label, f.type === 'date' ? fecha(it[f.id]) : (it[f.id] || '')]);
                let filas = '';
                for (let j = 0; j < celdas.length; j += 2) {
                    const a = celdas[j], b = celdas[j + 1];
                    filas += `<tr><th>${esc(a[0])}</th><td>${esc(a[1])}</td>${b ? `<th>${esc(b[0])}</th><td>${esc(b[1])}</td>` : '<td colspan="2"></td>'}</tr>`;
                }
                const res = it.resultado || '';
                html += `<div class="pd-registro">
                    ${cabecera(it._title || ((sec.itemName || 'Ensayo') + ' ' + (i + 1)), res ? resultado(res) : '')}
                    <table class="pd-tabla pd-tabla-ficha ${claseResultado(res) === 'pd-res-ko' ? 'pd-ficha-nc' : ''}"><colgroup><col style="width:20%"><col style="width:30%"><col style="width:20%"><col style="width:30%"></colgroup>
                    <tbody>${filas}${it.observaciones ? `<tr><th>Observaciones</th><td colspan="3">${esc(it.observaciones)}</td></tr>` : ''}</tbody></table></div>`;
            });
        });
        return { html, resumen: [plural(n, 'ensayo', 'ensayos')] };
    }

    // Barra de cabecera de cada zona / suministro / ensayo (tabla para que Word la respete)
    function cabecera(nombre, derecha) {
        return `<table class="pd-cab"><tr><td class="pd-cab-nombre">${esc(nombre)}</td><td class="pd-cab-der">${derecha || ''}</td></tr></table>`;
    }

    function notasHtml(notas) {
        if (!notas.length) return '';
        return `<div class="pd-notas">${notas.map(([k, v]) => `<p><b>${esc(k)}:</b> ${esc(v).replace(/\n/g, '<br>')}</p>`).join('')}</div>`;
    }

    // ¿Se puede imprimir esta ficha desde sus datos?
    function tieneGenerador(tpl) {
        if (tpl.sections) return tpl.sections.every(s => s.type === 'dynamic_list');
        const c = configDe(tpl);
        return !!(c && (c.tipo === 'zonas' || c.tipo === 'suministros' || c.tipo === 'propio'));
    }

    function capitulo(tpl, soloDatos) {
        const data = (currentProject.formData || {})[tpl.id] || {};
        if (tpl.sections) return capituloLista(tpl, data, soloDatos);
        const c = configDe(tpl);
        if (c.tipo === 'zonas') return capituloZonas(tpl, data, c.cfg, soloDatos);
        if (c.tipo === 'propio') { const r = c.imprimir(data, soloDatos, H) || {}; return { html: r.html || '', resumen: r.resumen || [] }; }
        return capituloSuministros(tpl, data, c.cfg, soloDatos);
    }

    // ---------------------------------------------------------------- Documento completo
    // opciones: { capitulos: [ids en orden], soloDatos, intro, htmlAntiguo: { id: html } }
    function construir(opciones) {
        const p = currentProject;
        const hoy = new Date();
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const hoyTxt = `${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}`;
        const cssTexto = (t) => '"' + String(t || '').replace(/["\\\n\r]/g, ' ').slice(0, 90) + '"';

        // Capítulos agrupados por bloque y numerados
        const plantillas = opciones.capitulos.map(id => materialesTemplate.find(m => m.id === id)).filter(Boolean);
        const bloques = BLOQUES.map(b => ({ ...b, caps: plantillas.filter(t => t.category === b.cat) })).filter(b => b.caps.length);
        const partes = [];
        bloques.forEach(b => {
            b.caps.forEach((tpl, i) => {
                const num = `${b.n}.${i + 1}`;
                let cuerpo, resumen = [];
                if (opciones.htmlAntiguo && opciones.htmlAntiguo[tpl.id] !== undefined) {
                    cuerpo = `<div class="pd-antiguo">${opciones.htmlAntiguo[tpl.id]}</div>`;
                } else {
                    const r = capitulo(tpl, opciones.soloDatos);
                    cuerpo = r.html || '<p class="pd-vacio">Sin registros.</p>';
                    resumen = r.resumen.filter(Boolean);
                }
                const nc = contarNoConformidades(tpl.id);
                if (nc) resumen.push(plural(nc, 'no conformidad', 'no conformidades'));
                partes.push({ bloque: b, tpl, num, cuerpo, resumen, nc });
            });
        });

        let html = `<style>${CSS}
            @page { size: A4 portrait; margin: 17mm 14mm 18mm 14mm;
                @top-left { content: "Programa de Control de Calidad"; font: 7.5pt Arial, Helvetica, sans-serif; color: #6b7280; }
                @top-right { content: ${cssTexto(p.name)}; font: 7.5pt Arial, Helvetica, sans-serif; color: #6b7280; }
                @bottom-left { content: ${cssTexto(p.tech ? 'Técnico redactor: ' + p.tech : '')}; font: 7.5pt Arial, Helvetica, sans-serif; color: #6b7280; }
                @bottom-right { content: "Página " counter(page) " de " counter(pages); font: 7.5pt Arial, Helvetica, sans-serif; color: #6b7280; }
            }
            @page :first { @top-left { content: none; } @top-right { content: none; } }
        </style>`;

        // Portada
        const datos = [
            ['Emplazamiento', p.location], ['Promotor', p.promoter], ['Director de Obra', p.do],
            ['Director de Ejecución', p.de], ['Técnico redactor (autor)', p.tech],
            ['Fecha de inicio', fecha(p.dateStart)], ['Fecha final', fecha(p.dateEnd)]
        ];
        html += `<section class="pd-portada">
            <div class="pd-antetitulo">Programa de Control de Calidad</div>
            <h1 class="pd-obra">${esc(p.name || 'Obra sin nombre')}</h1>
            <table class="pd-datos"><tbody>${datos.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v || '')}</td></tr>`).join('')}</tbody></table>
            ${opciones.intro ? `<div class="pd-intro">${opciones.intro.split(/\n\s*\n/).map(par => `<p>${esc(par.trim()).replace(/\n/g, '<br>')}</p>`).join('')}</div>` : ''}
        </section>`;

        // Índice
        if (partes.length) {
            html += `<section class="pd-pagina pd-indice"><h2 class="pd-h-indice">Contenido</h2>
                <table class="pd-tabla pd-tabla-indice"><colgroup><col style="width:9%"><col style="width:43%"><col style="width:48%"></colgroup><tbody>`;
            bloques.forEach(b => {
                html += `<tr class="pd-grupo"><td>${b.n}.</td><td colspan="2">${esc(b.titulo)}</td></tr>`;
                partes.filter(x => x.bloque === b).forEach(x => {
                    html += `<tr><td>${x.num}</td><td>${esc(x.tpl.name)}</td><td class="${x.nc ? 'pd-indice-nc' : ''}">${esc(x.resumen.join(' · '))}</td></tr>`;
                });
            });
            html += `</tbody></table></section>`;
        }

        // Capítulos
        bloques.forEach(b => {
            html += `<section class="pd-pagina pd-bloque"><h2 class="pd-h-bloque"><span>${b.n}.</span> ${esc(b.titulo)}</h2>`;
            partes.filter(x => x.bloque === b).forEach(x => {
                html += `<div class="pd-capitulo" data-mat="${esc(x.tpl.id)}">
                    <h3 class="pd-h-capitulo"><span class="pd-num">${x.num}</span> ${esc(x.tpl.name)}</h3>
                    ${x.resumen.length ? `<div class="pd-resumen ${x.nc ? 'pd-resumen-nc' : ''}">${esc(x.resumen.join(' · '))}</div>` : ''}
                    ${x.cuerpo}
                </div>`;
            });
            html += `</section>`;
        });

        // Firma
        html += `<section class="pd-firma">
            <p>En __________________, a ${hoyTxt}</p>
            <div class="pd-firma-caja"><div class="pd-firma-linea"></div><div><b>El técnico redactor</b></div><div>${esc(p.tech || '')}</div></div>
        </section>`;
        return `<div class="pd-doc">${html}</div>`;
    }

    window.Impresion = { construir, tieneGenerador };
})();
