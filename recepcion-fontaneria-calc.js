// Control de recepción — configuración de la ficha (la lógica común está en suministros-engine.js)
window.renderRecepcionFontaneriaCalc = function (container, materialId) {
    const documentos = [
        { id: "doc_font_1", phase: "Pre-Suministro", name: "Tuberías plásticas: marca de calidad...", desc: "Si aplica" },
        { id: "doc_font_2", phase: "Pre-Suministro", name: "Cobre: Declaración de prestaciones...", desc: "Si aplica" },
        { id: "doc_font_3", phase: "Pre-Suministro", name: "Cobre: Certificado espesor...", desc: "Si aplica" },
        { id: "doc_font_4", phase: "Pre-Suministro", name: "Certificado de idoneidad para contacto con agua...", desc: "Para agua potable" },
        { id: "doc_font_prev_otro", phase: "Pre-Suministro", name: "Otros", desc: "", custom: true },
        { id: "doc_font_5", phase: "Durante Suministro", name: "Comprobacion marcado CE...", desc: "" },
        { id: "doc_font_6", phase: "Durante Suministro", name: "Comprobación diámetros...", desc: "" },
        { id: "doc_font_dur_otro", phase: "Durante Suministro", name: "Otros", desc: "", custom: true },
        { id: "doc_font_7", phase: "Final Suministro", name: "Certificado final de suministro", desc: "Acreditación del fabricante del material total." },
        { id: "doc_font_fin_otro", phase: "Final Suministro", name: "Otros", desc: "", custom: true }
    ];
    const caracteristicas = [
        { id: "font_material", name: "Material y tipo de tubería" },
        { id: "font_diametro", name: "Diámetro y espesor nominal (DN / e)" },
        { id: "font_presion", name: "Presión Nominal (PN)" },
        { id: "font_idoneidad", name: "Idoneidad para agua de consumo humano" },
        { id: "font_aislamiento", name: "Espesor del aislamiento térmico (coquillas)" },
        { id: "font_otras", name: "Otra característica (especificar)", custom: true }
    ];

    window.SuministrosRecepcion.render(container, materialId, {
        prefijo: 'rfont',
        titulo: "Control Documental: Fontanería y Gas",
        
        textoBoton: "+ Añadir tipología",
        nombreSuministro: (data) => `Fontanería ${data.instances.length + 1}`,
        placeholderNombre: "Identificación producto (Ej. Tuberías cobre)",
        campos: [{"id": "ubicacion", "clase": "ubicacion", "label": "Ubicación", "placeholder": "Ej. Aseos planta baja"}],
        documentos,
        caracteristicas,
        textoEliminar: "¿Eliminar esta tipología y su control documental?",
        // Compatibilidad con obras guardadas antes de admitir varios suministros
        instanciaInicial: (data) => {
        const inst = {
                uid: Date.now().toString(),
                customName: data.identificacion || "Fontanería 1",
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
