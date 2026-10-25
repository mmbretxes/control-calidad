// Control de recepción — configuración de la ficha (la lógica común está en suministros-engine.js)
window.renderRecepcionMorterosCalc = function (container, materialId) {
    const documentos = [
        { id: "doc_mortero_1", phase: "Pre-Suministro", name: "Declaración de prestaciones CE", desc: "Marcado CE según norma de morteros para revoco/enlucido." },
        { id: "doc_mortero_2", phase: "Pre-Suministro", name: "Distintivo de Calidad", desc: "Acreditación voluntaria, si se exige en proyecto." },
        { id: "doc_mortero_3", phase: "Pre-Suministro", name: "Fichas técnicas", desc: "Detalle de los componentes (mallas, perfiles, etc.) si aplican." },
        { id: "doc_mortero_prev_otro", phase: "Pre-Suministro", name: "Otros", desc: "", custom: true },
        { id: "doc_mortero_4", phase: "Durante Suministro", name: "Hoja de suministro/albarán", desc: "Trazabilidad de cada entrega en obra." },
        { id: "doc_mortero_5", phase: "Durante Suministro", name: "Marcado CE", desc: "Comprobación visual de los sacos o embalajes." },
        { id: "doc_mortero_dur_otro", phase: "Durante Suministro", name: "Otros", desc: "", custom: true },
        { id: "doc_mortero_6", phase: "Final Suministro", name: "Certificado final de suministro", desc: "Acreditación del fabricante del material total." },
        { id: "doc_mortero_fin_otro", phase: "Final Suministro", name: "Otros", desc: "", custom: true }
    ];
    const caracteristicas = [
        { id: "mortero_absorcion", name: "Clasificación absorción agua" },
        { id: "mortero_compresion", name: "Resistencia a compresión (categoría C)" },
        { id: "mortero_difusion", name: "Resistencia difusión vapor agua" },
        { id: "mortero_cal", name: "Morteros de cal: contenido cal libre" },
        { id: "mortero_otras", name: "Otra", custom: true }
    ];

    window.SuministrosRecepcion.render(container, materialId, {
        prefijo: 'rmort',
        titulo: "Control Documental: Revestimiento de fachadas (morteros)",
        
        textoBoton: "+ Añadir tipología",
        nombreSuministro: (data) => `Mortero ${data.instances.length + 1}`,
        placeholderNombre: "Identificación producto (Ej. Mortero monocapa)",
        campos: [{"id": "ubicacion", "clase": "ubicacion", "label": "Ubicación", "placeholder": "Ej. Fachadas patio interior"}],
        documentos,
        caracteristicas,
        textoEliminar: "¿Eliminar esta tipología de mortero y su control documental?",
        // Compatibilidad con obras guardadas antes de admitir varios suministros
        instanciaInicial: (data) => {
        const inst = {
                uid: Date.now().toString(),
                customName: data.identificacion || "Mortero 1",
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
