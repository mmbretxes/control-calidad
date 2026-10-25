// Control de ejecución — configuración de la ficha (la lógica común está en zonas-engine.js)
window.renderEjecCubiertasCalc = function (container, materialId) {
    const puntosPlana = [
        "Replanteo pendientes, bajantes y pasos de instalaciones",
        "Pendientes máximas y mínimas",
        "Disposición de capas previstas en proyecto",
        "Ajuste de planchas de aislamiento (sin discontinuidades)",
        "Material de aislamiento, grosor y conductividad termica según proyecto",
        "Resolución y encuentros de puntos singulares",
        "Juntas de dilatación, disposición, material y profundidad",
        "Tipo de impermeabilización según proyecto",
        "Capas previstas en impermeabilizaciones líquidas",
        "Solapes de la impermeabilización en dirección pendiente y ancho solape",
        "Encuentros con paramentos verticales de la impermeabilización",
        "Radio curvatura impermeabilización o chaflán mínimo 5 cm",
        "Roza en paramento vertical para encuentro impermeabilización",
        "Encuentros con bordes libres de la impermeabilización",
        "Encuentros con sumideros: rebaje del soporte para evitar contrapendientes.",
        "Sumidero con sistema de retención de sólidos",
        "Colocación de rebosaderos",
        "Cubiertas de grava: disposición del geotextil",
        "Cubiertas de grava: espesor y tamaño de la grava",
        "Antepechos y albardillas: vierteaguas impermeable o provisto de barrera impermeable con goterón",
        "Altura libre de pretiles según proyecto"
    ];
    const puntosInclinada = [
        "Replanteo tabiquillos y pendientes",
        "Replanteo viguetas y encuentros con apoyos",
        "Fábrica según especificaciones de proyecto",
        "Bovedillas planas previstas según control de recepcion",
        "Colocación de impermeabilización si procede",
        "Solapes de la impermeabilización en dirección pendiente y ancho solape",
        "Encuentros con paramentos verticales de la impermeabilización",
        "Roza en paramento vertical para encuentro impermeabilización",
        "Disposición de aperturas de ventilación de camara de aire",
        "Disposición de aislamiento cuando proceda.",
        "Tejas: grado de humectación de las piezas",
        "Tejas: solape, amorterado, encuentro con paramentos verticales",
        "Tejas: bandas completamente amorteradas",
        "Tejas: vuelo del alero",
        "Piezas especiales en cumbreras, limatesas y limahoyas"
    ];
    // Compatibilidad: en zonas antiguas de cubierta plana faltaba el punto "Tipo de impermeabilización"
    const migrarZona = (inst) => {
        if (inst.tipo === 'Plana' && inst.checks) {
            if (inst.checks['chk_6'] && inst.checks['chk_6'].name && inst.checks['chk_6'].name.toLowerCase().includes("capas previstas en impermeabilizaciones")) {
                const keys = Object.keys(inst.checks)
                    .filter(k => k.startsWith('chk_'))
                    .map(k => parseInt(k.replace('chk_', ''), 10))
                    .filter(num => !isNaN(num) && num >= 6)
                    .sort((a, b) => b - a);
                keys.forEach(num => { inst.checks['chk_' + (num + 1)] = inst.checks['chk_' + num]; });
                inst.checks['chk_6'] = { val: '', obs: '', date: '', name: "Tipo de impermeabilización según proyecto" };
            }
        }
    };

    window.ZonasControl.render(container, materialId, {
        prefijo: 'ec',
        titulo: 'Control de Ejecución: Cubiertas',
        descripcion: 'Añade zonas de control e indica si se trata de una cubierta plana o inclinada.',
        ubicacion: { label: "Ubicación / Nivel", placeholder: "Ej. Cubierta principal..." },
        selectorTipo: { label: 'Tipo de cubierta', placeholder: 'Seleccione tipo...', mensajeSinTipo: 'Selecciona un tipo de cubierta para cargar los puntos de inspección.' },
        tipos: [
            { valor: 'Plana', texto: 'Cubierta Plana / Pretil', puntos: puntosPlana },
            { valor: 'Inclinada', texto: 'Cubierta Inclinada', puntos: puntosInclinada }
        ],
        migrarZona
    });
};
