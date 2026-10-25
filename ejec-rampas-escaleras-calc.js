// Control de ejecución — configuración de la ficha (la lógica común está en zonas-engine.js)
window.renderEjecRampasEscalerasCalc = function (container, materialId) {
    const puntosEscaleras = [
        "Verificada clase de resbaladicidad en zonas comunes.",
        "Dimensiones mínimas en zonas comunes (ancho mínimo 28 cm sin bocel)",
        "Dimensiones mínimas en zonas restringidas (huella mín. 22, contrahuella mín. 20)",
        "Meseta en uso general longitud mínima 1 m y mismo ancho que escalera",
        "En un mismo tramo todas las huellas y contrahuellas iguales",
        "Entre dos tramos, variación contrahuella +/- 1 cm."
    ];
    const puntosRampas = [
        "Comprobación pendiente máxima en función longitud según DBSUA o normativa local.",
        "Longitud máxima tramos según DBSUA o normativa local.",
        "Anchura mínima rampa según tabla 4,1 DBSUA y criterios de evacuación DBSI3.",
        "Meseta longitud mínima 1,5 m y mismo ancho que rampa",
        "Pendiente transversal <= 2%",
        "Verificada clase de resbaladicidad del pavimento o acabado"
    ];

    window.ZonasControl.render(container, materialId, {
        prefijo: 'ere',
        titulo: 'Control de Ejecución: Rampas y Escaleras',
        descripcion: 'Añade zonas de control e indica si se trata de una Escalera o de una Rampa.',
        nombreZona: (data) => 'Zona ' + (data.instances.length + 1),
        ubicacion: { label: "Ubicación / Nivel", placeholder: "Ej. Núcleo principal PB a P1..." },
        selectorTipo: { label: 'Tipo', placeholder: 'Seleccione tipo...', mensajeSinTipo: 'Selecciona el tipo (Escalera o Rampa) para cargar los puntos de inspección correspondientes.' },
        textoOtros: 'Otro',
        tipos: [
            { valor: 'Escalera', puntos: puntosEscaleras },
            { valor: 'Rampa', puntos: puntosRampas }
        ]
    });
};
