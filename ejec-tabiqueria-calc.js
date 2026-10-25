// Control de ejecución — configuración de la ficha (la lógica común está en zonas-engine.js)
window.renderEjecTabiqueriaCalc = function (container, materialId) {
    const puntosBloque = [
        "Comprobacion de replanteo, ejes y caras",
        "Dimensiones ladrillos.",
        "Trabazón, planeidad aplomado y espesor de juntas",
        "Grado de humectación de las piezas",
        "Tipo de mortero exigido según proyecto",
        "Encuentro elástico entre tabiques y forjados",
        "Aislamiento acústico en rozas y cajeado entre usuarios distintos",
        "Premarcos: aplomado, número de anclajes y pasta de agarre compatible"
    ];
    const puntosYeso = [
        "Comprobacion de replanteo, ejes y caras",
        "Tipología de placas prevista (estándar, absorción reducida, cortafuegos)",
        "Espesor de las placas/tabique",
        "Nivel de acabado solicitado (Q1 a Q4)",
        "Modulación y tipología de perfiles",
        "Colocación bandas elásticas acústicas",
        "Tipo y grosor aislante",
        "Soportes ocultos para instalaciones colgadas",
        "Elementos de acabado: cinta de juntas, guardavivos, refuerzos"
    ];

    window.ZonasControl.render(container, materialId, {
        prefijo: 'et',
        titulo: 'Control de Ejecución: Tabiquería',
        descripcion: 'Añade zonas de control e indica si se trata de tabiquería de bloque/ladrillo o yeso laminado.',
        ubicacion: { label: "Ubicación / Nivel", placeholder: "Ej. Planta baja, separación de viviendas..." },
        selectorTipo: { label: 'Tipo de tabiquería', placeholder: 'Seleccione tipo...', mensajeSinTipo: 'Selecciona un tipo de tabiquería para cargar los puntos de inspección.' },
        tipos: [
            { valor: 'Bloque', texto: 'Bloque / Ladrillo', puntos: puntosBloque },
            { valor: 'Yeso', texto: 'Yeso laminado', puntos: puntosYeso }
        ]
    });
};
