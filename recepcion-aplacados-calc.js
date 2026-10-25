// Control de recepción — configuración de la ficha (la lógica común está en suministros-engine.js)
window.renderRecepcionAplacadosCalc = function (container, materialId) {
    const documentos = [
        { id: "doc_aplacado_1a", phase: "Pre-Suministro", name: "Declaración de prestaciones CE aplacado", desc: "Según UNE-EN correspondiente al material pétreo o cerámico." },
        { id: "doc_aplacado_1b", phase: "Pre-Suministro", name: "Declaración de prestaciones CE mortero", desc: "Mortero cola según UNE-EN 12004." },
        { id: "doc_aplacado_2", phase: "Pre-Suministro", name: "Certificado clase anclajes", desc: "Documentación técnica de la tornillería o fijaciones mecánicas." },
        { id: "doc_aplacado_3", phase: "Pre-Suministro", name: "Fichas técnicas", desc: "Material de rejuntado y limpieza." },
        { id: "doc_aplacado_prev_otro", phase: "Pre-Suministro", name: "Otros", desc: "", custom: true },
        { id: "doc_aplacado_4", phase: "Durante Suministro", name: "Hoja de suministro/albarán", desc: "Verificar partidas en obra." },
        { id: "doc_aplacado_5", phase: "Durante Suministro", name: "Marcado CE", desc: "Presencia en el embalaje del mortero y las cajas del aplacado." },
        { id: "doc_aplacado_dur_otro", phase: "Durante Suministro", name: "Otros", desc: "", custom: true },
        { id: "doc_aplacado_6", phase: "Final Suministro", name: "Certificado final de suministro", desc: "Garantía conjunta de la partida." },
        { id: "doc_aplacado_fin_otro", phase: "Final Suministro", name: "Otros", desc: "", custom: true }
    ];
    const caracteristicas = [
        { id: "aplacado_espesor", name: "Espesor aplacado (mm)" },
        { id: "aplacado_absorcion", name: "Clasificación absorción agua" },
        { id: "aplacado_flexion", name: "Resistencia a flexión" },
        { id: "aplacado_mortero", name: "Clasificación mortero agarre" },
        { id: "aplacado_anclajes", name: "Clasificación anclajes mecánicos" },
        { id: "aplacado_otras", name: "Otra", custom: true }
    ];

    window.SuministrosRecepcion.render(container, materialId, {
        prefijo: 'rapla',
        titulo: "Control Documental: Revestimiento de fachadas (aplacados)",
        
        textoBoton: "+ Añadir tipología",
        nombreSuministro: (data) => `Aplacado ${data.instances.length + 1}`,
        placeholderNombre: "Identificación producto (Ej. Piedra natural calcárea)",
        campos: [{"id": "ubicacion", "clase": "ubicacion", "label": "Ubicación", "placeholder": "Ej. Zócalo planta baja"}],
        documentos,
        caracteristicas,
        textoEliminar: "¿Eliminar esta tipología de aplacado y su control documental?",
        // Compatibilidad con obras guardadas antes de admitir varios suministros
        instanciaInicial: (data) => {
        const inst = {
                uid: Date.now().toString(),
                customName: data.identificacion || "Aplacado 1",
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
