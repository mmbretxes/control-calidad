// Control de ejecución — configuración de la ficha (la lógica común está en zonas-engine.js)
window.renderEjecAireAcondicionadoCalc = function (container, materialId) {
    const puntos = [
        "Características de los equipos exteriores e interiores según proyecto.",
        "Replanteo de la instalación. Compatibilidad con otras instalaciones",
        "Distancia de seguridad entre instalaciones.",
        "Comprobación de dimensiones de los conductos de impulsión y retorno",
        "Anclaje correcto de conductos al forjado (número y tipo de anclajes)",
        "Comprobación de cortafuegos si los conductos atraviesan sectores de incendio",
        "Comprobación de sellado de juntas de los conductos",
        "Comprobación de emboquillado con las rejillas de impulsión y retorno",
        "Dimensiones y ubicación de rejillas de impulsión y retorno según proyecto",
        "Comprobación de aislamiento líneas frigoríficas.",
        "Prueba de estanquidad de líneas frigoríficas según RITE",
        "Revisión de bancada y aisladores para equipo exterior",
        "Desagües de la máquina exterior/interior conectados a bote sifónico o sifón individual a red de saneamiento",
        "Comprobación pendiente red de desagües",
        "Ubicación y dimensiones adecuadas de registros en falsos techos para mantenimiento.",
        "Disposición de un circuito eléctrico independiente para el A/A. Sensibilidad diferencial según proyecto.",
        "Ubicación y funcionamiento dispositivos de control, termostatos, domótica, etc"
    ];

    window.ZonasControl.render(container, materialId, {
        prefijo: 'eaa',
        titulo: 'Control de Ejecución: Aire Acondicionado',
        descripcion: 'Añade zonas de control para auditar los distintos elementos de la instalación de aire acondicionado.',
        ubicacion: { label: "Zona ensayada / Ubicación", placeholder: "Ej. Planta baja, Vivienda A, Cubierta..." },
        puntos
    });
};
