// Control de ejecución — configuración de la ficha (la lógica común está en zonas-engine.js)
window.renderEjecCarpinteriaExtCalc = function (container, materialId) {
    const puntos = [
        "Colocación de premarcos con el numero de anclajes correcto",
        "Aplomado de marcos y premarcos",
        "Sellado perimetral de premarco y marco",
        "Pendiente vierteaguas 10% según CTE y goterón",
        "Sellado vierteaguas",
        "El acristalamiento se corresponde con los prescritos",
        "Utilización de calzos y separadores vidrio-marco",
        "Acristalamientos por debajo de 1 m o 1.10 cumplen con exigencias de rotura al impacto",
        "Balconeras practicables/correderas acristaladas cumplen exigencia rotura impacto caras expuestas",
        "Ventanas a mas de 6 m cumplen requisito de apertura para facilitar limpieza.",
        "Se han colocado las admisiones para cumplir con HS3 (no necesario en carpinterias clase 1)",
        "Ausencia de golpes, rayaduras o defectos superficiales.",
        "Revisión de funcionamiento mecanismos."
    ];

    window.ZonasControl.render(container, materialId, {
        prefijo: 'ece',
        titulo: 'Control de Ejecución: Carpintería exterior',
        descripcion: 'Añade zonas de control para registrar los puntos de inspección.',
        ubicacion: { label: "Ubicación / Nivel", placeholder: "Ej. Fachada Sur, Vivienda 2A..." },
        puntos
    });
};
