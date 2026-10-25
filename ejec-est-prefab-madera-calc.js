// Control de ejecución — configuración de la ficha (la lógica común está en zonas-engine.js)
window.renderEjecEstPrefabMaderaCalc = function (container, materialId) {
    const puntos = [
        "Colocación de elementos de separación de la cimentacion",
        "Sistema de izado y eslingado",
        "Arriostramiento provisional",
        "Espaciado montantes (±5 mm respecto modulación planos)",
        "Tableros de arriostramiento, pautas de clavado o atornillado",
        "Desviación apoyos (±5 mm respecto al eje de replanteo.)",
        "Desviación de verticalidad pilar/panel (±H/300)",
        "Longitud mínima de entrega en vigas (No inferior al 95% de la longitud de diseño)",
        "Colocación y continuidad barreras de vapor",
        "Protección de testas hasta que la envolvente esté ejecutada",
        "CLT. Colocación juntas precomprimidas entre paneles, forjados y muros",
        "CLT: Revisión de fijaciones mecánicas",
        "CLT: Comprobacion tirafondos y clavos (100% de los orificios)",
        "CLT: Solape paneles CLT (±2 mm respecto cota teórica)",
        "Laminada: Comprobación herrajes y conectores",
        "Laminada: Par de apriete uniones atornilladas",
        "Laminada: Comprobación de contraflechas."
    ];

    window.ZonasControl.render(container, materialId, {
        prefijo: 'em',
        titulo: 'Control de Ejecución: Estructuras Prefabricadas de Madera',
        descripcion: 'Añade las diferentes zonas de la estructura de madera y verifica los puntos de control.',
        placeholderNombre: 'Identificador (Ej. Pilares Planta 1...)',
        ubicacion: { label: "Ubicación / Nivel", placeholder: "Ej. Planta 2, Ejes A-C..." },
        camposExtra: [{ id: 'elementos', clase: 'elem', label: 'Elementos', placeholder: 'Ej. Paneles CLT, Vigas laminadas...' }],
        tituloPuntos: 'Controles de Ejecución',
        puntos
    });
};
