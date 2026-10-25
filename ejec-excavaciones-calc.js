// Control de ejecución — configuración de la ficha (la lógica común está en zonas-engine.js)
window.renderEjecExcavacionesCalc = function (container, materialId) {
    const puntosExcavaciones = [
        "Replanteo. Comprobación perímetro excavación, distancias a linderos y cota fondo excavación",
        "Comprobación coincidencia terreno con previsiones estudio geotécnico",
        "Verificación de posibles servicios afectados. En caso afirmativo, señalización, desvío, etc.",
        "Estabilidad de taludes. Ángulo de talud según estudio geotécnico",
        "Ausencia de cargas sobre bordes de taludes",
        "Revisión edificios colindantes",
        "Sistemas de drenaje en presencia de agua.",
        "Gestión de tierras según plan de residuos"
    ];
    const puntosRellenos = [
        "Comprobación de material de relleno. Tipo y granulometría",
        "Espesor de las tongadas y sistema de compactación",
        "Ausencia de restos de obra, orgánicos, plásticos, etc."
    ];

    window.ZonasControl.render(container, materialId, {
        prefijo: 'ex',
        titulo: 'Control de Ejecución: Excavaciones',
        descripcion: 'Añade zonas de control e indica si se trata de la fase de Excavaciones o de Rellenos.',
        ubicacion: { label: "Ubicación / Nivel", placeholder: "Ej. Vaciado sótano, Trasdós muros..." },
        selectorTipo: { label: 'Fase', placeholder: 'Seleccione fase...', mensajeSinTipo: 'Selecciona una fase (Excavaciones o Rellenos) para cargar los puntos de inspección.' },
        fechaAutoAlResultado: true,
        tipos: [
            { valor: 'Excavaciones', alias: ['Fase excavación'], puntos: puntosExcavaciones },
            { valor: 'Rellenos', alias: ['Fase rellenos'], puntos: puntosRellenos }
        ]
    });
};
