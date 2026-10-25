// Control de ejecución — configuración de la ficha (la lógica común está en zonas-engine.js)
window.renderEjecucionBarandillasCalc = function (container, materialId) {
    const puntos = [
        "Control de geometría, especialmente altura total",
        "Limitación aberturas (entre paneles, barrotes, etc)",
        "No escalable según CTE",
        "Control de anclajes",
        "Encuentro de vidrio con marcos",
        "Barandillas autoportantes. Se utilizan todos los elementos de la ETE."
    ];

    window.ZonasControl.render(container, materialId, {
        prefijo: 'eb',
        titulo: 'Control de Ejecución: Barandillas',
        descripcion: 'Añade las diferentes inspecciones de barandillas y verifica los puntos de control.',
        textoBoton: '+ Añadir inspección',
        nombreZona: (data) => `Inspección ${data.instances.length + 1}`,
        ubicacion: { label: "Ubicación / Zona", placeholder: "Ej. Escalera principal, Terrazas..." },
        camposExtra: [{ id: 'elementos', clase: 'elem', label: 'Tipología / Elementos', placeholder: 'Ej. Vidrio autoportante, Acero Inoxidable...' }],
        textoEliminar: '¿Eliminar inspección?',
        puntos
    });
};
