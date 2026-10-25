// Control de ejecución — configuración de la ficha (la lógica común está en zonas-engine.js)
window.renderEjecSaneamientoCalc = function (container, materialId) {
    const puntosVentilacion = [
        "Se han colocado las aberturas de admisión que garanticen el flujo de aire",
        "Las aberturas de extracción están conectadas a los tubos de extracción",
        "Las transiciones de conductos entre sectores de incendios cumple apartado3 SI1",
        "Los conductos son estancos",
        "Revisión de anclaje y/o apoyo sobre forjados de conductos",
        "Se ha dispuesto la ventilación en los vestíbulos de independencia de los garajes",
        "Verificación altura de salida en cubierta",
        "Aspiradores híbridos o mecánicos según proyecto"
    ];
    const puntosTratamientoAire = [
        "Replanteo instalación",
        "Toma aire exterior separación horizontal ≥ 3 m de la de expulsión o chimeneas y salidas de humos",
        "Rejillas exteriores anti pájaros/insectos",
        "Montaje unidad interior con registro accesible",
        "Suspensión antivibratoria unidad interior",
        "Anclaje de conductos",
        "Bandeja de condensados conectada a tubería evacuación, provista de sifón",
        "Conexión a la red de saneamiento mediante embudo o rotura de carga según DB-HS 5",
        "Los conductos toma aire exterior y expulsión que discurran por el interior de la vivienda cuentan con aislamiento térmico y barrera de vapor estanca continua",
        "Red de conductos independientes zonas secas y húmedas",
        "Bocas de impulsión regulables",
        "Sellado de juntas entre conductos mediante juntas EPDM o cinta homologada",
        "Comprobación funcionamiento bypass (automático/motorizado o manual)",
        "Equilibrado y medición de caudales por estancia",
        "Equilibrio general de presiones en la vivienda"
    ];
    const puntosBajantes = [
        "Número de sumideros según proyecto",
        "Replanteo sumideros y pendientes",
        "Sumideros de pluviales tipo sifónicos.",
        "Diámetro bajantes",
        "Diámetro mínimo bajantes residuales 120 mm",
        "Abrazaderas en zona embocadura y cada 150 cm",
        "Distancias mínimas en paralelo a otras instalaciones (electricidad 30 cm, gas 3 cm)",
        "Conexión desagües a bajantes ≥45º",
        "Distancia bote sifónico a bajante <2 m",
        "Altura de prolongación bajante residuales según proyecto",
        "Distancias de ventilación primaria a sistemas de ventilación y/o aperturas",
        "Las transiciones de conductos entre sectores de incendios cumple apartado3 SI1"
    ];
    const puntosColectores = [
        "Diámetro colectores según proyecto",
        "Pendiente mínima colectores 1%",
        "Abrazaderas colectores colgados cada 1,5 m, con forro interior elástico",
        "En colectores colgados: registros en encuentros y/o acoplamientos y cada 15 m.",
        "Distancias mínimas en paralelo a otras instalaciones (electricidad 30 cm, gas 3 cm)",
        "Las transiciones de conductos entre sectores de incendios cumple apartado3 SI1",
        "Registro cada 15 m en colectores enterrados",
        "Comprobación de acabado interior y estanquidad de arquetas",
        "El ángulo de conexión de colectores a arquetas en dirección de la pendiente.",
        "Disposición de arqueta separadora de grasas en garajes",
        "Las tapas de arqueta tienen la resistencia requerida para la zona de paso"
    ];
    const puntosDrenaje = [
        "Replanteo de la instalación, cotas y pendientes.",
        "Disposición de capa de apoyo adecuada para asiento tubo",
        "Tubo drenante según proyecto (diámetro, ranuras, material)",
        "Si el ranurado es parcial, las ranuras se orientan hacia el lateral-superior",
        "Comprobación de pendiente real del tubo colocado",
        "Conexiones entre tubos con piezas propias del modelo.",
        "Colocación de geotextil filtrante según proyecto.",
        "Comprobación de árido drenante. Granulometría y espesor de capas.",
        "Colocación de geotextil entre capas de tierra y gravas.",
        "Relleno con tierras seleccionadas. Prohibido escombros y restos de obra",
        "Disposición de arquetas de registro",
        "Conexión de red de drenaje con red de evacuación.",
        "Pozo de conexión decantador según proyecto."
    ];

    window.ZonasControl.render(container, materialId, {
        prefijo: 'es',
        titulo: 'Control de Ejecución: Saneamiento Ventilación',
        descripcion: 'Añade zonas de control e indica si se trata de Ventilación estática, Sistema tratamiento de aire, Bajantes, Colectores o Drenaje.',
        nombreZona: (data) => 'Zona ' + (data.instances.length + 1),
        ubicacion: { label: "Ubicación / Nivel", placeholder: "Ej. Patinillo 2, Sótano -1..." },
        selectorTipo: { label: 'Fase', placeholder: 'Seleccione tipo...', mensajeSinTipo: 'Selecciona una fase para cargar los puntos de inspección.' },
        tipos: [
            { valor: 'Ventilación estática', alias: ['Red de ventilación'], puntos: puntosVentilacion },
            { valor: 'Sistema tratamiento de aire', puntos: puntosTratamientoAire },
            { valor: 'Bajantes', puntos: puntosBajantes },
            { valor: 'Colectores', puntos: puntosColectores },
            { valor: 'Drenaje', puntos: puntosDrenaje }
        ]
    });
};
