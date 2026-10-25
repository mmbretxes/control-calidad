// Control de ejecución — configuración de la ficha (la lógica común está en zonas-engine.js)
window.renderEjecFontaneriaCalc = function (container, materialId) {
    const puntos = [
        "Tipología y diámetros de la instalación según proyecto",
        "Replanteo instalación compatible con el resto de instalaciones (distancias mínimas)",
        "Sellado RF según proyecto en pasos entre sectores de incendio",
        "Soportes y fijaciones compatibles y separaciones a distancias previstas",
        "Control de ejecución de uniones (termofusión, soldadura, etc)",
        "Ubicación de llaves de corte general y en cada dependencia húmeda",
        "Protecciones antirretorno donde proceda",
        "El suministro a puntos de consumo se realiza de forma que se impidan los retornos",
        "Aislamiento de tuberias: tipo y grosor, incluidos codos y uniones",
        "Replanteo y dimensiones de los armarios de contadores",
        "Disposición desagüe en armario contadores"
    ];

    window.ZonasControl.render(container, materialId, {
        prefijo: 'ef',
        titulo: 'Control de Ejecución: Fontanería y Gas',
        descripcion: 'Añade zonas de control para auditar los distintos elementos de la instalación.',
        ubicacion: { label: "Ubicación / Trazado", placeholder: "Ej. Patinillos, viviendas P1..." },
        puntos
    });
};
