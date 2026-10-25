// Control de ejecución — configuración de la ficha (la lógica común está en zonas-engine.js)
window.renderEjecOtrosCalc = function (container, materialId) {
    // Capítulo en blanco por defecto: los puntos provienen de los añadidos por el usuario o de su base de datos activa
    const puntos = [];

    window.ZonasControl.render(container, materialId, {
        prefijo: 'eo',
        titulo: 'Control de Ejecución: Otros',
        descripcion: 'Añade zonas de control y define tus propios puntos de inspección personalizados (puedes guardarlos con ⭐ en tu base de datos particular).',
        textoBoton: '+ Añadir Zona de Control',
        nombreZona: (data) => 'Zona de Control ' + (data.instances.length + 1),
        ubicacion: { label: "Zona controlada / Ubicación", placeholder: "Ej. Planta 1, Sector A, Unidad de obra..." },
        fechaZonaInicial: true,
        filaVaciaSiNoHayPuntos: true,
        puntos
    });
};
