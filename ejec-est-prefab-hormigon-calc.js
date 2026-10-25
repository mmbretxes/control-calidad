// Control de ejecución — configuración de la ficha (la lógica común está en zonas-engine.js)
window.renderEjecEstPrefabHormigonCalc = function (container, materialId) {
    const puntos = [
        "Replanteo de pernos de anclaje o esperas",
        "Cotas de nivelación de apoyos",
        "Limpieza de vainas y conectores",
        "Verificación fisuras por transporte",
        "Inspección zonas apoyo, ménsulas y neoprenos",
        "Sistemas de izado y elementos de anclaje para izados",
        "Apuntalamiento provisional",
        "Plomos y alineaciones",
        "Desviación ejes (±10 mm respecto al eje de replanteo.)",
        "Desviación de verticalidad pilar individual (±H/500, max ±15 mm por planta)",
        "Cota de nivel superior de vigas de apoyo (±10 mm respecto al plano horizontal de proyecto)",
        "Longitud de apoyo,entrega, de vigas (No inferior al 90% de la longitud de diseño)",
        "Anchura de juntas entre paneles verticales (±5 mm sobre el ancho nominal especificado)",
        "Inyección de morteros en uniones húmedas",
        "Par de apriete en uniones atornilladas",
        "Desapuntalado autorizado"
    ];

    window.ZonasControl.render(container, materialId, {
        prefijo: 'ep',
        titulo: 'Control de Ejecución: Estructuras Prefabricadas de Hormigón',
        descripcion: 'Añade las diferentes zonas de la estructura y verifica los puntos de control.',
        placeholderNombre: 'Identificador (Ej. Pilares Planta 1...)',
        ubicacion: { label: "Ubicación / Nivel", placeholder: "Ej. Forjado 2, Ejes A-C..." },
        camposExtra: [{ id: 'elementos', clase: 'elem', label: 'Elementos', placeholder: 'Ej. Pilares, Vigas, Placas alveolares...' }],
        tituloPuntos: 'Controles de Ejecución',
        puntos
    });
};
