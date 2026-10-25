// Control de recepción — configuración de la ficha (la lógica común está en suministros-engine.js)
window.renderRecepcionSistemasVentiladosCalc = function (container, materialId) {
    const documentos = [
        { id: "doc_sis_1", phase: "Pre-Suministro", name: "Declaración de prestaciones CE", desc: "" },
        { id: "doc_sis_2", phase: "Pre-Suministro", name: "Distintivo de Calidad", desc: "" },
        { id: "doc_sis_3", phase: "Pre-Suministro", name: "Certificado calidad aluminio/acero inox.", desc: "" },
        { id: "doc_sis_4", phase: "Pre-Suministro", name: "Homologación tacos anclaje", desc: "" },
        { id: "doc_sis_5", phase: "Pre-Suministro", name: "Certificado Resistencia al fuego sistemas de sectorización", desc: "" },
        { id: "doc_sis_6", phase: "Pre-Suministro", name: "Fichas técnicas", desc: "" },
        { id: "doc_sis_prev_otro", phase: "Pre-Suministro", name: "Otros", desc: "", custom: true },
        { id: "doc_sis_7", phase: "Durante Suministro", name: "Hoja de suministro/albarán", desc: "" },
        { id: "doc_sis_8", phase: "Durante Suministro", name: "Marcado CE", desc: "" },
        { id: "doc_sis_dur_otro", phase: "Durante Suministro", name: "Otros", desc: "", custom: true },
        { id: "doc_sis_9", phase: "Final Suministro", name: "Certificado final de suministro", desc: "" },
        { id: "doc_sis_fin_otro", phase: "Final Suministro", name: "Otros", desc: "", custom: true }
    ];
    const caracteristicas = [
        { id: "sis_reaccion", name: "Reacción al fuego componentes de la cámara" },
        { id: "sis_alum", name: "Calidad aluminio estructura" },
        { id: "sis_acero", name: "Calidad acero inoxidable estructura" },
        { id: "sis_resistencia", name: "Resistencia al fuego sistemas de sectorización" },
        { id: "sis_otras", name: "Otras (especificar)", custom: true }
    ];

    window.SuministrosRecepcion.render(container, materialId, {
        prefijo: 'rsis',
        titulo: "Control Documental: Revestimientos de fachada (sistemas ventilados)",
        
        textoBoton: "+ Añadir tipología",
        nombreSuministro: (data) => `Sistema Ventilado ${data.instances.length + 1}`,
        placeholderNombre: "Identificación producto (Ej. Sistema Ventilado)",
        campos: [{"id": "ubicacion", "clase": "ubicacion", "label": "Ubicación", "placeholder": "Ej. Fachada Principal"}],
        documentos,
        caracteristicas,
        textoEliminar: "¿Eliminar esta tipología y su control documental?",
        // Compatibilidad con obras guardadas antes de admitir varios suministros
        instanciaInicial: (data) => {
        const inst = {
                uid: Date.now().toString(),
                customName: data.identificacion || "Sistema Ventilado 1",
                ubicacion: data.ubicacion || "",
                caract: data.checks || {},
                checks: data.checks || {},
                observaciones: data.observaciones || ""
            };
        delete data.identificacion; delete data.ubicacion; delete data.checks; delete data.observaciones;
        return inst;
    }
    });
};
