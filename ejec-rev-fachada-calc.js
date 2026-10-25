// Control de ejecución — configuración de la ficha (la lógica común está en zonas-engine.js)
window.renderEjecRevFachadaCalc = function (container, materialId) {
    const puntosEnfoscados = [
        "Regularización del soporte para conseguir espesor uniforme",
        "Ejecución de maestras si procede y guardavivos",
        "Se colocan mallas de refuerzo en discontinuidades de material y puntos singulares",
        "Comprobación de las condiciones ambientales para su colocación",
        "Resistencia a compresión prevista (clasificación CS)",
        "Requisito de absorción de agua",
        "Requisito de transpirabilidad",
        "Ejecución de juntas según proyecto.",
        "Comprobación grado de planeidad exigido",
        "Control de acabado superficial, posibles fisuraciones."
    ];
    const puntosSATE = [
        "Revisión tipo soporte. Fábrica directa / enfoscado",
        "Estado del soporte. Planeidad uniforme",
        "Cota de arranque y colocación perfil de arranque",
        "Separadores y empalmes de perfiles de arranque",
        "Método de adhesión de los paneles según DIT o especificaciones de proyecto",
        "Colocación paneles a rompejuntas",
        "Encuentros en esquinas mediante traba dentada",
        "Ausencia de adhesivo entre juntas.",
        "Encuentro entre paneles < 2 mm",
        "Numero de anclajes mecánicos por m2 y por placa según DIT o especificaciones de proyecto",
        "El plato de la espiga queda correctamente enrasado con el panel",
        "Instalación de franjas cortafuegos si procede según proyecto",
        "Instalación de mallas y cantoneras en esquinas y encuentros especiales",
        "Colocación de mallas de refuerzo de alto impacto en zonas expuestas",
        "Comprobación de capas: capa base, imprimación y revestimiento de acabado",
        "Sellado con cinta expansiva o perfiles de conexión en carpinterías y alféizares",
        "Colocación de anclajes para elementos pesados con rotura de puente térmico"
    ];
    const puntosVentiladas = [
        "Si es un Kit comercial completo, comprobación de todos sus componentes según marcado CE o ETE",
        "Replanteo de montantes y travesaños. Aplomado y alineación",
        "Espesor constante de la cámara",
        "Aberturas de ventilación en arranque y coronacion fachada",
        "Colocación de barreras cortafuegos en interior cámara (cada 3 plantas o 10m)",
        "Reacción al fuego de los componentes, especialmente los aislamientos",
        "Materiales metálicos resistentes a la corrosión galvánica",
        "Separadores plásticos entre mensulas y muro portante.",
        "Revisión piezas de acabado. Fisuras, roturas, etc.",
        "Alineamiento y espesor constante de juntas entre placas"
    ];
    const puntosAplacados = [
        "Estado del soporte. Planeidad uniforme",
        "Curado y humedad del soporte adecuada",
        "Aplicación de mortero impermeable si lo requiere el grado de impermeabilidad del muro",
        "Doble encolado. Aplicación con llana dentada. Mortero en el 100% de la superficie de la pieza",
        "Macizado mediante maceteado.",
        "Grosor capa adhesivo según especificaciones fabricante y tipo de pieza a encolar.",
        "Instalación de anclajes mecánicos según UNE 138002/CTE DBHS1",
        "Número de anclajes por pieza según tamaño y riesgo",
        "Anclajes y tornillería acero inoxidable A2 o A4 si ambiente marino",
        "Mecanizado de piezas, para anclajes ocultos, realizado en taller",
        "Junta mínima entre piezas según tamaño. Mínimo 3 mm",
        "Utilización de crucetas para garntizar alineacion de piezas",
        "Respeto de jutnas de dilatación edificio",
        "Disposición, separación y material de sellado de juntas de movimiento, según proyecto",
        "Mortero de juntas compatible con las piezas y el ambiente.",
        "Limpieza final con producto compatible con las piezas y el mortero de juntas."
    ];

    window.ZonasControl.render(container, materialId, {
        prefijo: 'erf',
        titulo: 'Control de Ejecución: Revestimientos de Fachada',
        descripcion: 'Añade zonas de control e indica el tipo de revestimiento de fachada.',
        ubicacion: { label: "Ubicación / Nivel", placeholder: "Ej. Fachada Sur..." },
        selectorTipo: { label: 'Tipo', placeholder: 'Seleccione tipo...', mensajeSinTipo: 'Selecciona el tipo de revestimiento para cargar los puntos de inspección correspondientes.' },
        textoOtros: 'Otro',
        tipos: [
            { valor: 'Enfoscados/Monocapas', puntos: puntosEnfoscados },
            { valor: 'SATE', puntos: puntosSATE },
            { valor: 'Fachadas ventiladas', puntos: puntosVentiladas },
            { valor: 'Aplacados', puntos: puntosAplacados }
        ]
    });
};
