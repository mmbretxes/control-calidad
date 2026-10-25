// Control de ejecución — configuración de la ficha (la lógica común está en zonas-engine.js)
window.renderEjecEstAceroCalc = function (container, materialId) {
    const puntos = [
        "Placas anclaje. Dimensiones placa y espárragos",
        "Pilares. Replanteo ejes y caras y plomos",
        "Pilares. Geometría y sección según proyecto",
        "Vigas. Geometría y sección",
        "Cartelas y/o rigidizadores vigas y pilares. Colocación y dimensiones",
        "Preparación de bordes para soldadura según proyecto",
        "Homologación soldadores (obra y taller)",
        "Verificación procedimiento soldeo. Espesor, material, tipo soldeo, etc",
        "Inspección visual de las soldaduras",
        "Tensión de apriete tornillos. Se dispone de llave dinamométrica",
        "Anclajes químicos según previsión proyecto",
        "Protección antioxidación. Tipo y capas",
        "Protección ignífuga. Tipo y espesor"
    ];
    // Compatibilidad con obras antiguas (puntos p1..p13 y custom_0)
    const migrarZona = (inst) => {
        for (let i = 1; i <= 13; i++) {
            const oldId = 'p' + i;
            const newId = 'chk_' + (i - 1);
            if (inst.checks[oldId] && !inst.checks[newId]) {
                inst.checks[newId] = inst.checks[oldId];
                if (inst.checks[newId].name === undefined) inst.checks[newId].name = puntos[i - 1];
            }
        }
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
        prefijo: 'ea',
        titulo: 'Control de Ejecución de Estructuras de Acero',
        descripcion: 'Registra los puntos de control clave de la estructura de acero por cada zona o elemento.',
        campoNombre: 'zonaName',
        placeholderNombre: 'Identificación de la zona (Ej. Estructura Planta Baja)',
        ubicacion: null,
        obsGenerales: false,
        tituloPuntos: 'Puntos de inspección in situ',
        textoEliminar: '¿Eliminar esta zona de control?',
        migrarZona,
        puntos
    });
};
