// Control de ejecución — configuración de la ficha (la lógica común está en zonas-engine.js)
window.renderEjecCalefaccionCalc = function (container, materialId) {
    const puntosEmisores = [
        "Replanteo de la instalación. Compatibilidad con otras instalaciones",
        "Distancia de seguridad entre instalaciones",
        "Las instalaciones de agua irán por debajo de las eléctricas",
        "Pasatubos adecuados. Verificar si requiere resistencia al fuego",
        "Ejecución de regatas sin afectar elementos estructurales",
        "Las tuberías metálicas se protegen de la agresión de morteros",
        "Se evitará el empalme de tuberías de diferentes metales",
        "Control de fijaciones (distancia y tipo) de las tuberías",
        "Prueba de estanquidad y dilatación de tuberías",
        "Prueba de estanquidad de chimeneas",
        "Tipo de emisores según proyecto, disposición y número de elementos de cada radiador",
        "Todos los radiadores disponen de llave termostática, excepto los exentos por normativa",
        "La caldera/acumulador son los previstos en el proyecto (modelo y potencia)",
        "Si hay sistema domótico, comprobación de su funcionamiento",
        "Puesta en marcha de la caldera y equilibrado hidráulico de la instalación"
    ];
    const puntosRadiante = [
        "Replanteo de la instalación. Compatibilidad con otras instalaciones",
        "Distancia de seguridad entre instalaciones",
        "Pasatubos adecuados. Verificar si requiere resistencia al fuego",
        "Limpieza y nivelación de la base",
        "Base aislante. Material, grosor y paso de tubería según proyecto",
        "Colocación banda perimetral",
        "Replanteo de cajas de conexiones",
        "Prueba de presión previa al vertido del mortero autonivelante",
        "Comprobación de las características del mortero (conductividad y resistencia a compresión)",
        "Control grosor capa de mortero",
        "Control del tiempo de secado previo a la colocación pavimento, en función del tipo de mortero",
        "La caldera/acumulador son los previstos en el proyecto (modelo y potencia)",
        "Si hay sistema domótico, comprobación de su funcionamiento",
        "Puesta en marcha de la caldera y equilibrado hidráulico de la instalación"
    ];

    window.ZonasControl.render(container, materialId, {
        prefijo: 'eca',
        titulo: 'Control de Ejecución: Calefacción',
        descripcion: 'Añade zonas de control e indica si se trata de Calefacción por emisores o Calefacción por suelo radiante.',
        ubicacion: { label: "Ubicación / Nivel", placeholder: "Ej. Planta baja, Vivienda A..." },
        selectorTipo: { label: 'Tipo de calefacción', placeholder: 'Seleccione tipo...', mensajeSinTipo: 'Selecciona un tipo de calefacción para cargar los puntos de inspección.' },
        tipos: [
            { valor: 'Calefacción por emisores', puntos: puntosEmisores },
            { valor: 'Calefacción por suelo radiante', puntos: puntosRadiante }
        ]
    });
};
