// Control de ejecución — configuración de la ficha (la lógica común está en zonas-engine.js)
window.renderEjecucionMaderaCalc = function (container, materialId) {
    const puntos = [
        "Replanteo de viguetas",
        "Estado general de las vigas (alabeos, fendas, roturas, encolados)",
        "Correspondencia vigas con documentacion de suministro",
        "Colocación y distribucion de conectores",
        "Protección de zonas en contacto con hormigón",
        "Colocacion de malla de reparto (diámetro y separación)"
    ];
    // Compatibilidad con obras antiguas (identificadores de puntos anteriores)
    const migrarZona = (inst) => {
        const oldIdMap = { 'm1': 0, 'm2': 1, 'm3': 2, 'm4': 3, 'm5': 4, 'm6': 5 };
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
        prefijo: 'em',
        titulo: 'Control de Ejecución de Forjados de Madera',
        descripcion: 'Registra los puntos de control clave previos al hormigonado in situ de la capa de compresión o cierre del forjado de madera.',
        textoBoton: '+ Añadir zona de forjado',
        nombreZona: (data) => `Forjado Madera Planta ${data.instances.length + 1}`,
        campoNombre: 'zonaName',
        claseNombre: 'unified-title',
        placeholderNombre: 'Identificación de la zona (Ej. Cubierta de Madera)',
        ubicacion: null,
        obsGenerales: false,
        tituloPuntos: 'Puntos de inspección in situ',
        textoEliminar: '¿Eliminar esta zona de forjado de madera?',
        migrarZona,
        puntos
    });
};
