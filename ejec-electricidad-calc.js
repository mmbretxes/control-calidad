// Control de ejecución — configuración de la ficha (la lógica común está en zonas-engine.js)
window.renderEjecElectricidadCalc = function (container, materialId) {
    const puntosGeneral = [
        "Control del sistema de tierra: picas, cableado, arquetas",
        "Dimensiones cuarto contadores conforme a empresa suministradora",
        "Replanteo de la instalación comunitaria",
        "Cada derivacion individual dispone de canalización independiente",
        "Replanteo instalación interior",
        "Altura cajas, mecanismos y bases de enchufe",
        "Numero de circuitos según proyecto y REBT",
        "Número de puntos de luz y tomas de corriente según proyecto",
        "Se respeta el codigo de colores del cableado",
        "Se respeta el volúmen de prohibición en baños y aseos",
        "Ubicación y características luminarias de emergencia"
    ];
    const puntosFotovoltaica = [
        "Comprobación de modelo y potencia de los paneles",
        "Inspección de paneles: roturas del cristal, golpes en el marco, caja conexiones",
        "Comprobación estructura soporte, sistema de anclado, contrapesos y vientos",
        "Si se perforan elementos de cubierta, comprobar solución de estanqueidad",
        "Comprobación puesta tierra instalación",
        "Marca y modelo inversor",
        "Comprobación elementos del cuadro electrico"
    ];

    window.ZonasControl.render(container, materialId, {
        prefijo: 'ee',
        titulo: 'Control de Ejecución: Electricidad',
        descripcion: 'Añade zonas de control para auditar los distintos elementos de la instalación general o fotovoltaica.',
        botones: [
            { id: 'ee-btn-add-gen', texto: '+ Añadir Inspección General', tipo: 'general',
               nombre: (data) => `Inspección General ${data.instances.filter(i => i.tipo === 'general').length + 1}` },
            { id: 'ee-btn-add-foto', texto: '+ Añadir Insp. Fotovoltaica', tipo: 'fotovoltaica', secundario: true,
               nombre: (data) => `Inspección Fotovoltaica ${data.instances.filter(i => i.tipo === 'fotovoltaica').length + 1}` }
        ],
        ubicacion: { label: "Zona ensayada / Ubicación", placeholder: "Ej. Cuarto contadores, Vivienda 1A, Cubierta..." },
        tipos: [
            { valor: 'general', puntos: puntosGeneral },
            { valor: 'fotovoltaica', puntos: puntosFotovoltaica }
        ],
        tituloPuntos: (inst) => `Puntos de Inspección (${inst.tipo === 'general' ? 'General' : 'Fotovoltaica'})`,
        cabeceraObs: 'OBSERVACIONES / DATOS',
        placeholderObs: 'Observaciones / Datos...',
        textoEliminar: '¿Eliminar inspección?'
    });
};
