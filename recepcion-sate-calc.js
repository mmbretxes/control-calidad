// Control de recepción — configuración de la ficha (la lógica común está en suministros-engine.js)
window.renderRecepcionSateCalc = function (container, materialId) {
    const documentos = [
        { id: "doc_sate_1", phase: "Pre-Suministro", name: "Declaración de prestaciones CE", desc: "Del kit completo o de todos los componentes por separado." },
        { id: "doc_sate_2", phase: "Pre-Suministro", name: "Evaluación Técnica Europea (ETE / DIT)", desc: "Certificado de idoneidad del sistema completo." },
        { id: "doc_sate_3", phase: "Pre-Suministro", name: "Distintivo de Calidad (Kit)", desc: "Marca de calidad reconocida si la tuviera." },
        { id: "doc_sate_4", phase: "Pre-Suministro", name: "Fichas técnicas", desc: "Aislante, perfiles, mallas, morteros y acabados." },
        { id: "doc_sate_compat", phase: "Pre-Suministro", name: "Certificado compatibilidad", desc: "Solo si se monta por componentes de distintos fabricantes." },
        { id: "doc_sate_prev_otro", phase: "Pre-Suministro", name: "Otros", desc: "", custom: true },
        { id: "doc_sate_5", phase: "Durante Suministro", name: "Hoja de suministro/albarán", desc: "Identificación de remesas en obra." },
        { id: "doc_sate_6", phase: "Durante Suministro", name: "Marcado CE", desc: "Verificación de etiquetas en los sacos y palets." },
        { id: "doc_sate_dur_otro", phase: "Durante Suministro", name: "Otros", desc: "", custom: true },
        { id: "doc_sate_7", phase: "Final Suministro", name: "Certificado final de suministro", desc: "Garantía conjunta de la partida." },
        { id: "doc_sate_fin_otro", phase: "Final Suministro", name: "Otros", desc: "", custom: true }
    ];
    const caracteristicas = [
        { id: "sate_res_termica", name: "Resistencia térmica (m²K/W)" },
        { id: "sate_espesor", name: "Espesor (m)" },
        { id: "sate_cond_termica", name: "Conductividad térmica (W/mK)" },
        { id: "sate_reaccion_fuego", name: "Reacción al fuego" },
        { id: "sate_otra_carac", name: "Otra", custom: true }
    ];

    window.SuministrosRecepcion.render(container, materialId, {
        prefijo: 'rsate',
        titulo: "Control Documental: Revestimientos Fachada SATE",
        
        textoBoton: "+ Añadir tipología SATE",
        nombreSuministro: (data) => `SATE ${data.instances.length + 1}`,
        placeholderNombre: "Identificación producto (Ej. Sistema SATE EPS)",
        campos: [{"id": "ubicacion", "clase": "ubicacion", "label": "Ubicación", "placeholder": "Ej. Fachada Norte"}],
        documentos,
        caracteristicas,
        textoEliminar: "¿Eliminar esta tipología de SATE y su control documental?",
        // Compatibilidad con obras guardadas antes de admitir varios suministros
        instanciaInicial: (data) => {
        const inst = {
                uid: Date.now().toString(),
                customName: data.identificacion || "SATE 1",
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
