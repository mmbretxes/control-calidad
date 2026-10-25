// Control de recepción — configuración de la ficha (la lógica común está en suministros-engine.js)
window.renderRecepcionBarandillasCalc = function (container, materialId) {
    const documentos = [
        { id: "ant_1", phase: "Pre-Suministro", name: "Barandilla de taller. Marcado CE materiales base", desc: "" },
        { id: "ant_2", phase: "Pre-Suministro", name: "Barandilla de taller. Ficha técnica y calculo estructural", desc: "" },
        { id: "ant_3", phase: "Pre-Suministro", name: "Barandilla vidrio autoportante. Evaluación Técnica Europea y marcado CE", desc: "" },
        { id: "ant_4", phase: "Pre-Suministro", name: "Vidrio estructural laminado. Marcado CE", desc: "" },
        { id: "ant_5", phase: "Pre-Suministro", name: "Vidrio estructural laminado. Certificado clasificacion impacto", desc: "" },
        { id: "ant_6", phase: "Pre-Suministro", name: "Certificado espesor galvanizado", desc: "" },
        { id: "ant_7", phase: "Pre-Suministro", name: "Certificado lacado aluminio (sello Qualicoat)", desc: "" },
        { id: "ant_8", phase: "Pre-Suministro", name: "Certificado anodizado aluminio (sello Qualanod)", desc: "" },
        { id: "ant_otros", phase: "Pre-Suministro", name: "Otros", desc: "", custom: true },
        { id: "dur_1", phase: "Durante Suministro", name: "Hoja de suministro/Albarán", desc: "Trazabilidad de cada entrega en obra." },
        { id: "dur_2", phase: "Durante Suministro", name: "Marcado físico de las piezas", desc: "" },
        { id: "dur_otros", phase: "Durante Suministro", name: "Otros", desc: "", custom: true },
        { id: "fin_1", phase: "Final Suministro", name: "Certificado final de suministro", desc: "Acreditación del fabricante del material total." },
        { id: "fin_otros", phase: "Final Suministro", name: "Otros", desc: "", custom: true }
    ];
    const caracteristicas = [
        { id: "bar_tipo", name: "Tipo de barandilla" },
        { id: "bar_vidrio", name: "Tipo de vidrio" },
        { id: "bar_otras", name: "Otra", custom: true }
    ];

    window.SuministrosRecepcion.render(container, materialId, {
        prefijo: 'rbar',
        titulo: "Control Documental: Barandillas",
        
        textoBoton: "+ Añadir tipología",
        nombreSuministro: (data) => `Barandilla ${data.instances.length + 1}`,
        placeholderNombre: "Identificación producto (Ej. Barandilla balcón)",
        campos: [{"id": "ubicacion", "clase": "ubicacion", "label": "Ubicación", "placeholder": "Ej. Balcones fachada sur"}],
        documentos,
        caracteristicas,
        textoEliminar: "¿Eliminar esta tipología de barandilla y su control documental?",
        // Compatibilidad con obras guardadas antes de admitir varios suministros
        instanciaInicial: (data) => {
        const inst = {
                uid: Date.now().toString(),
                customName: data.identificacion || "Barandilla 1",
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
