// Control de ejecución — configuración de la ficha (la lógica común está en zonas-engine.js)
window.renderEjecFabricaCalc = function (container, materialId) {
    const puntos = [
        "Temperatura ambiente (entre 5ºC y 40ºC)",
        "Humectacion previa de las piezas",
        "Inspeccion visual de las piezas (ausencia grietas, fisuras, caliches)",
        "Impermeabilización en arranque sobre muro de contencion",
        "Replanteo de caras y ejes",
        "Verticalidad y planeidad de muros",
        "Aparejo según proyecto, solape piezas.",
        "Control de llagas y tendeles. Espesor. Juntas llenas",
        "Uso de piezas especiales",
        "Anclajes y armaduras según proyecto",
        "Dimensiones y tipología de dinteles.",
        "Junta de desolidarización con forjados",
        "Refuerzos de malla en encuentros con estructura"
    ];

    window.ZonasControl.render(container, materialId, {
        prefijo: 'ef',
        titulo: 'Control de Ejecución: Fábrica estructural / fachadas',
        descripcion: 'Añade las diferentes zonas de ejecución de la fábrica y verifica los puntos de control.',
        ubicacion: { label: "Ubicación / Nivel", placeholder: "Ej. Fachada Norte, Planta 1..." },
        camposExtra: [{ id: 'elementos', clase: 'elem', label: 'Elementos', placeholder: 'Ej. Ladrillo cara vista, bloques de hormigón...' }],
        puntos
    });
};
