// Control de recepción — configuración de la ficha (la lógica común está en suministros-engine.js)
window.renderRecepcionEstAceroCalc = function (container, materialId) {
    const documentos = [
        // PRE-SUMINISTRO
        { id: "e1", phase: "Pre-Suministro", name: "Programa de Fabricación y Montaje", desc: "Documento del taller que define la secuencia y lotes previstos." },
        { id: "e2", phase: "Pre-Suministro", name: "Declaración de Prestaciones y Marcado CE del Taller (EN 1090-1)", desc: "Obligatorio según la clase de ejecución (EXC2, EXC3 o EXC4)." },
        { id: "e3", phase: "Pre-Suministro", name: "Certificados del Acero Base (Inspección 3.1)", desc: "Certificados de calidad de los perfiles, tubos y chapas originales (EN 10204)." },
        { id: "e4", phase: "Pre-Suministro", name: "Certificados de Consumibles", desc: "Declaración de prestaciones, Marcado CE y compatibilidad de electrodos/hilos de soldadura." },
        { id: "e5", phase: "Pre-Suministro", name: "Certificados de Tornillería y Anclajes", desc: "Declaración de prestaciones y Marcado CE de tornillería (ordinaria/pretesada) y tacos mecánicos/químicos." },
        { id: "e6", phase: "Pre-Suministro", name: "Certificados de Pinturas e Imprimaciones", desc: "Certificado de compatibilidad del sistema anticorrosivo según Categoría Ambiental (C1 a C5)." },
        { id: "e7", phase: "Pre-Suministro", name: "Homologación de Soldadores", desc: "Certificados vigentes de cualificación del personal de taller que realizará las uniones." },
        { id: "e8", phase: "Pre-Suministro", name: "Especificación de Procedimientos de Soldeo (WPS/WPQR)", desc: "Procedimientos de soldadura homologados que se van a emplear." },
        { id: "e9", phase: "Pre-Suministro", name: "Otros", desc: "", custom: true },

        // DURANTE
        { id: "e10", phase: "Durante Suministro", name: "Albaranes de Suministro a Obra", desc: "Identificación de piezas, marcas de despiece y trazabilidad de las coladas de acero." },
        { id: "e11", phase: "Durante Suministro", name: "Certificados de Ensayos No Destructivos (END) de Taller", desc: "Resultados de inspecciones (líquidos penetrantes, ultrasonidos) de las piezas servidas." },
        { id: "e12", phase: "Durante Suministro", name: "Otros", desc: "", custom: true },

        // FINAL
        { id: "e13", phase: "Final Suministro", name: "Certificado de Control de Producción y Suministro Final", desc: "Dossier de calidad y garantía global emitida por el taller estructurista." },
        { id: "e14", phase: "Final Suministro", name: "Otros", desc: "", custom: true }
    ];

    window.SuministrosRecepcion.render(container, materialId, {
        prefijo: 'rest',
        titulo: "Control Documental de Recepción de Estructuras de Acero",
        descripcion: 'Configura cada taller o suministro de estructura metálica a la obra para generar sus requisitos documentales (Código Estructural).',
        textoBoton: "+ Añadir nuevo suministro",
        nombreSuministro: (data) => `Estructura Metálica ${data.instances.length + 1}`,
        placeholderNombre: "Identificación producto / taller (Ej. Taller Metálicas S.L.)",
        campos: [{"id": "ubicacion", "clase": "ubicacion", "label": "Ubicación", "placeholder": "Ej. Cubierta Nave A"}],
        documentos,
        textoEliminar: "¿Eliminar este suministro y todo su control documental?",
        // Compatibilidad con obras guardadas antes de admitir varios suministros
        instanciaInicial: (data) => {
        const inst = {
                uid: Date.now().toString(),
                customName: data.identificacion || "Estructura 1",
                ubicacion: data.ubicacion || "",
                checks: data.checks || {},
                observaciones: data.observaciones || ""
            };
        delete data.identificacion; delete data.ubicacion; delete data.checks; delete data.observaciones;
        return inst;
    }
    });
};
