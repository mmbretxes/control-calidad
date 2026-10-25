// Control de ejecución — configuración de la ficha (la lógica común está en zonas-engine.js)
window.renderEjecPavimentosCalc = function (container, materialId) {
    const puntosSoleras = [
        "Base del material previsto y debidamente compactada",
        "Clase de hormigón prevista",
        "Colocación barrera impermeable",
        "Encuentro impermeabilización con paramentos",
        "Colocación armadura prevista",
        "Espesor constante de la solera",
        "Curado del hormigón",
        "Juntas perimetrales, encuentros con paramentos",
        "Ejecución de las juntas de dilatación y retracción, espesor y profundidad"
    ];

    const puntosCeramica = [
        "Comprobación criterios de resbaladicidad",
        "Mortero de agarre o adhesivo compatible con la tipología de baldosa",
        "Grado de humectación de las piezas y/o soporte según tipo de adhesivo",
        "Técnica de encolado adecuada (doble encolado en grandes formatos o exterior) y macizado sin huecos",
        "Ancho de juntas según especificaciones fabricante",
        "Control de planeidad y ausencia de cejas entre piezas",
        "Juntas perimetrales, encuentros con paramentos",
        "Juntas estructurales y/o de dilatación",
        "Mortero de juntas previsto y compatible con el uso",
        "Ausencia de piezas rotas, fisuradas o desportilladas",
        "Limpieza final con productos compatibles."
    ];

    const puntosPetreos = [
        "Comprobación criterios de resbaladicidad",
        "Mortero de agarre compatible con la tipología de piedra (evitar eflorescencias o manchas)",
        "Grado de humectación de las piezas o imprimación de reverso para adherencia",
        "Espesor uniforme y macizado completo de la capa de agarre sin oquedades",
        "Ancho de juntas según especificaciones fabricante",
        "Control de planeidad y pendientes de evacuación si aplica",
        "Juntas perimetrales, encuentros con paramentos",
        "Juntas estructurales y/o de dilatación (sellado neutro compatible)",
        "Mortero de juntas previsto y compatible con el uso",
        "Ausencia de piezas rotas, con pelos o fisuras",
        "Tratamiento superficial previsto (hidrofugado, pulido o abrillantado si aplica)",
        "Limpieza final con productos compatibles (neutros, no ácidos)"
    ];

    const controlesBaldosas = puntosCeramica;

    const puntosVinilico = [
        "Condiciones ambientales de la estancia: temperatura y humedad dentro de los límites del fabricante",
        "Humedad del soporte dentro del límite admisible, incluido el caso de suelo radiante",
        "Soporte limpio, liso y consistente, sin polvo, grasas ni restos",
        "Planeidad del soporte, con pasta niveladora o regularización previa si es necesaria",
        "Imprimación del soporte, si la exige el fabricante del adhesivo",
        "Adhesivo compatible con el vinílico, el soporte y el suelo radiante",
        "Suelo radiante: puesta en marcha y secado previos realizados, y temperatura superficial controlada",
        "Replanteo y dirección de colocación (dibujo, lamas o losetas, tono y lote mezclados)",
        "Contacto completo con el soporte, sin burbujas ni zonas huecas (paso de rodillo)",
        "Juntas entre piezas, o soldadura en caliente de las juntas si se especifica, bien ejecutadas",
        "Juntas perimetrales y encuentros con paramentos y elementos pasantes",
        "Juntas estructurales respetadas y no cubiertas por el pavimento",
        "Encuentros con otros pavimentos y puertas resueltos con perfil adecuado",
        "Planeidad final y ausencia de huellas, resaltos o marcas de llana",
        "Remates en paramentos (rodapié o zócalo), con la media caña o el perfil previsto",
        "Ausencia de piezas dañadas o con defectos",
        "Protección final y limpieza con productos compatibles"
    ];

    const puntosMaderaComunes = [
        "Condiciones ambientales de la estancia: cerramientos acabados, ventanas colocadas, humedad relativa y temperatura dentro de los límites del fabricante",
        "Trabajos húmedos terminados y secos (yesos, pinturas, alicatados) antes de colocar la madera",
        "Humedad de la madera dentro del rango exigido",
        "Humedad del soporte dentro del límite admisible según el tipo de soporte y la existencia de calefacción radiante",
        "Soporte limpio, sin polvo, grasas ni restos de pintura o yeso",
        "Planeidad del soporte dentro de las tolerancias admisibles, con regularización previa si es necesaria",
        "Resistencia y consistencia del soporte (dureza superficial, ausencia de fisuras o disgregación)",
        "Barrera de vapor o lámina anti-humedad en contacto con el terreno, con solapes sellados",
        "Suelo radiante: protocolo de puesta en marcha y secado previos realizado, y temperatura superficial controlada",
        "Junta perimetral de dilatación con paramentos, pilares y elementos pasantes según especificaciones",
        "Juntas estructurales del edificio respetadas y no cubiertas por el pavimento",
        "Juntas de dilatación intermedias en grandes superficies o pasos de puertas según especificaciones",
        "Dirección de colocación y aspecto del conjunto (desfase de juntas, mezcla de piezas, ausencia de defectos)",
        "Planeidad final del pavimento y ausencia de resaltos entre piezas",
        "Encuentros con otros pavimentos y puertas resueltos con perfil o remate adecuado",
        "Rodapiés fijados al paramento y no al pavimento, permitiendo el libre movimiento",
        "Protección final del pavimento y limpieza con productos compatibles"
    ];

    const puntosParquetEncolado = [
        ...puntosMaderaComunes,
        "Adhesivo adecuado y compatible con el soporte, la madera y el suelo radiante",
        "Imprimación del soporte, si la requiere el fabricante del adhesivo",
        "Consumo y espesor de la capa de adhesivo con llana dentada adecuada",
        "Tiempo abierto del adhesivo respetado y contacto completo sin huecos entre pieza y soporte",
        "Limpieza inmediata de restos de adhesivo en cara vista y juntas",
        "Tiempo de curado del adhesivo respetado antes del tránsito o tratamientos posteriores"
    ];

    const puntosTarimaFlotante = [
        ...puntosMaderaComunes,
        "Base aislante del espesor y tipo previstos, con solapes a tope o sellados",
        "Lámina anti-humedad bajo la base, con entrega y subida perimetral adecuada",
        "Sistema de unión de las piezas (click o lengüeta) correcto, sin holguras ni juntas abiertas",
        "Pavimento totalmente flotante y libre en todo su perímetro sin fijaciones ni elementos pasantes que lo coarten",
        "Longitud y anchura máxima de paño sin junta intermedia respetadas",
        "Piezas de remate y de final de hilada con dimensiones mínimas adecuadas"
    ];

    const puntosTarimaClavada = [
        ...puntosMaderaComunes,
        "Rastreles: sección, separación, nivelación, humedad y tratamiento protector de la madera",
        "Elementos de fijación (clavos, tornillos o grapas) del tipo, longitud y separación previstos, con ángulo correcto",
        "Cámara bajo pavimento con ventilación y aislamiento previstos"
    ];

    window.ZonasControl.render(container, materialId, {
        prefijo: 'ep',
        titulo: 'Control de Ejecución: Pavimentos',
        descripcion: 'Añade zonas de control e indica la tipología de pavimento.',
        ubicacion: { label: "Ubicación / Nivel", placeholder: "Ej. Planta baja, terrazas..." },
        selectorTipo: { label: 'Tipo de pavimento', placeholder: 'Seleccione tipo...', mensajeSinTipo: 'Selecciona un tipo de pavimento para cargar los puntos de inspección.' },
        // Compatibilidad: el antiguo tipo "Pavimentos pétreos" pasa a "Piedra natural"
        migrarDatos: (data) => data.instances.forEach(i => { if (i.tipo === 'Pavimentos pétreos') i.tipo = 'Piedra natural'; }),
        tipos: [
            { valor: 'Soleras', puntos: puntosSoleras },
            { valor: 'Baldosas cerámicas', alias: ['Baldosas'], puntos: puntosCeramica },
            { valor: 'Piedra natural', puntos: puntosPetreos },
            { valor: 'Vinílico', puntos: puntosVinilico },
            { valor: 'Parquet encolado', puntos: puntosParquetEncolado },
            { valor: 'Tarima flotante', puntos: puntosTarimaFlotante },
            { valor: 'Tarima clavada o sobre rastreles', puntos: puntosTarimaClavada }
        ]
    });
};
