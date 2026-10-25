// Control de ejecución — configuración de la ficha (la lógica común está en zonas-engine.js)
window.renderEjecPiscinasCalc = function (container, materialId) {
    const puntos = [
        "Replanteo, distancias a linderos y profundidades.",
        "Calidad del hormigón según proyecto. Ensayos si procede",
        "Comprobación estanquidad vaso previo al revestimiento",
        "Colocación de boquillas, tomas de fondo, skimmers, según proyecto",
        "Compatibilidad del adhesivo del revestimiento y del mortero de juntas.",
        "El revestimiento cumple con la exigencia de resbaladicidad según DB SUA",
        "Se disponen de llaves de corte para desmontar equipo depuración",
        "Se dispone de válvula antirretorno en suministro de agua",
        "Zanjas adecuadas para conducciones enterradas",
        "Grapado adecuado para conducciones ancladas en muro.",
        "Prueba de estanqueidad de la instalación antes de su cubrición definitiva",
        "Revisión del cuadro electrico",
        "Tensión de funcionamiento <=12V",
        "Diferenciales de alta sensibilidad <=30mA.",
        "Luminarias compatibles con estar sumergidas."
    ];

    window.ZonasControl.render(container, materialId, {
        prefijo: 'ep',
        prefijoPuntos: 'epi',
        titulo: 'Control de Ejecución: Piscinas',
        descripcion: 'Añade lotes de inspección para auditar la ejecución de la piscina.',
        textoBoton: '+ Añadir Inspección',
        nombreZona: (data) => 'Inspección Piscina ' + (data.instances.length + 1),
        ubicacion: { label: "Zona ensayada / Ubicación", placeholder: "Ej. Vaso principal, Cuarto de máquinas..." },
        cabeceraObs: 'OBSERVACIONES / DATOS',
        textoEliminar: '¿Eliminar inspección?',
        puntos
    });
};
