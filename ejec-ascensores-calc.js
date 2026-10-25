// Control de ejecución — configuración de la ficha (la lógica común está en zonas-engine.js)
window.renderEjecAscensoresCalc = function (container, materialId) {
    const puntosEstructura = [
        "Dimensiones libres interiores de los huecos conforme a planos de instalación",
        "Aplomado huecos entre plantas",
        "Profundidad del foso (cota bajo nivel de parada inferior)",
        "Ejecución de impermeabilización exterior/interior. Ausencia de filtraciones de agua.",
        "Distancia libre desde la cota de última parada hasta el forjado superior de cierre"
    ];
    const puntosCerramientos = [
        "Paredes del hueco construidas con la resistencia al fuego exigida",
        "Paredes desolidarizadas o con masa/aislamiento suficiente respecto a recintos protegidos colindantes",
        "Paramentos interiores lisos y enfoscados (o panelados), sin salientes> 5 mm",
        "Disposición de rejilla o abertura de ventilación en la parte superior del hueco",
        "Dinteles, jambas frontales ejecutados tras el montaje del chasis de puertas, asegurando sellado acústico y la resistencia al fuego"
    ];
    const puntosMontaje = [
        "Anclaje, alineación y calibrado de guías",
        "Cuadro eléctrico específico para el ascensor",
        "Instalación permanente de alumbrado en el hueco",
        "Ausencia de instalaciones ajenas al ascensor dentro del hueco",
        "Cabina con dimensiones mínimas según proyecto",
        "Verificación de cumplimiento accesibilidad (paso libre, botoneras, señalización)",
        "Conexión telefónica bidireccional permanente en cabina para emergencias",
        "Amortiguadores antivibratorios en la bancada del motor",
        "Nivelación de paradas. Precisión de parada de la cabina en planta",
        "Ensayos de acuñamiento, limitador de velocidad, amortiguadores y prueba de carga"
    ];

    window.ZonasControl.render(container, materialId, {
        prefijo: 'ea',
        titulo: 'Control de Ejecución: Ascensores',
        descripcion: 'Añade zonas de control e indica si se trata de Fase estructura, Fase cerramientos o Fase montaje.',
        nombreZona: (data) => 'Zona ' + (data.instances.length + 1),
        ubicacion: { label: "Ubicación / Nivel", placeholder: "Ej. Patinillo 2, Sótano -1..." },
        selectorTipo: { label: 'Fase', placeholder: 'Seleccione tipo...', mensajeSinTipo: 'Seleccione una fase para ver los puntos de inspección.' },
        textoEliminar: '¿Eliminar zona?',
        fechaAutoAlResultado: true,
        tipos: [
            { valor: 'Fase estructura', puntos: puntosEstructura },
            { valor: 'Fase cerramientos', puntos: puntosCerramientos },
            { valor: 'Fase montaje', puntos: puntosMontaje }
        ]
    });
};
