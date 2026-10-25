// Control de ejecución — configuración de la ficha (la lógica común está en zonas-engine.js)
window.renderEjecucionForjadosCalc = function (container, materialId) {
    const puntos = [
        "Canto total a hormigonar",
        "Replanteo de viguetas",
        "Correspondencia vigas y bovedillas con el marcado CE",
        "Armaduras de refuerzo y negativos",
        "Colocación de malla de reparto (diámetro y separación)",
        "Estado general de viguetas (fisuras, roturas, etc)",
        "Disposición de zonas macizadas",
        "Colocación de sopandas"
    ];
    // Compatibilidad con obras antiguas (identificadores de puntos anteriores)
    const migrarZona = (inst) => {
        const oldIdMap = { 'p1': 0, 'p1b': 1, 'p2': 2, 'p3': 3, 'p3b': 4, 'p4': 5, 'p5': 6, 'p6': 7 };
        Object.keys(oldIdMap).forEach(oldId => {
            const newId = 'chk_' + oldIdMap[oldId];
            if (inst.checks[oldId] && !inst.checks[newId]) {
                inst.checks[newId] = inst.checks[oldId];
                if (inst.checks[newId].name === undefined) inst.checks[newId].name = puntos[oldIdMap[oldId]];
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
    };

    window.ZonasControl.render(container, materialId, {
        prefijo: 'ef',
        titulo: 'Control de Ejecución de Forjados Prefabricados',
        descripcion: 'Registra los puntos de control clave previos al hormigonado in situ de la capa de compresión por cada planta o zona.',
        textoBoton: '+ Añadir zona de forjado',
        nombreZona: (data) => `Forjado Planta ${data.instances.length + 1}`,
        campoNombre: 'zonaName',
        claseNombre: 'unified-title',
        placeholderNombre: 'Identificación de la zona (Ej. Techo Planta Baja)',
        ubicacion: null,
        obsGenerales: false,
        tituloPuntos: 'Puntos de inspección in situ',
        textoEliminar: '¿Eliminar esta zona de forjado?',
        migrarZona,
        puntos
    });
};
