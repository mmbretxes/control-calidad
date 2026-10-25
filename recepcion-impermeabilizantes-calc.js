// Control de recepción — configuración de la ficha (la lógica común está en suministros-engine.js)
window.renderRecepcionImpermeabilizantesCalc = function (container, materialId) {
    const documentos = [
        { id: "doc_previa_fichas", phase: "Pre-Suministro", name: "Fichas técnicas", desc: "Características del material impermeabilizante suministrado." },
        { id: "doc_previa_ce", phase: "Pre-Suministro", name: "Declaración prestaciones CE", desc: "Marcado CE obligatorio para láminas impermeabilizantes." },
        { id: "doc_previa_calidad", phase: "Pre-Suministro", name: "Distintivo de calidad", desc: "Acreditación voluntaria del fabricante si aplica." },
        { id: "doc_imp_prev_otro", phase: "Pre-Suministro", name: "Otros", desc: "", custom: true },
        { id: "doc_durante_albaran", phase: "Durante Suministro", name: "Hoja de suministro/albarán", desc: "Identificación en obra de los rollos o materiales." },
        { id: "doc_durante_ce", phase: "Durante Suministro", name: "Marcado CE", desc: "Comprobación del etiquetado en el propio producto." },
        { id: "doc_imp_dur_otro", phase: "Durante Suministro", name: "Otros", desc: "", custom: true },
        { id: "doc_fin_cert", phase: "Final Suministro", name: "Certificado final de suministro", desc: "Garantía de las partidas entregadas en obra." },
        { id: "doc_imp_fin_otro", phase: "Final Suministro", name: "Otros", desc: "", custom: true }
    ];
    const caracteristicas = [
        { id: "flex_bajas_temp", name: "Flexibilidad a bajas temperaturas" },
        { id: "res_carga_estatica", name: "Resistencia a carga estática" },
        { id: "res_penetracion_raices", name: "Resistencia penetración raíces" },
        { id: "res_impacto", name: "Resistencia al impacto" },
        { id: "res_juntas", name: "Resistencia de las juntas/solape" },
        { id: "otra_carac", name: "Otra", custom: true }
    ];

    window.SuministrosRecepcion.render(container, materialId, {
        prefijo: 'rimp',
        titulo: "Control Documental: Impermeabilizantes de la envolvente",
        
        textoBoton: "+ Añadir suministro",
        nombreSuministro: (data) => `Impermeabilizante ${data.instances.length + 1}`,
        placeholderNombre: "Identificación producto (Ej. Lámina asfáltica)",
        campos: [{"id": "ubicacion", "clase": "ubicacion", "label": "Ubicación", "placeholder": "Ej. Cubierta plana"}, {"id": "lamina_material", "clase": "mat", "label": "Material de lámina", "placeholder": "Ej. LBM"}, {"id": "lamina_masa", "clase": "masa", "label": "Masa (g/dm²)", "placeholder": "Ej. 40"}, {"id": "lamina_armadura", "clase": "armadura", "label": "Tipo armadura", "placeholder": "Ej. Fibra de vidrio"}],
        documentos,
        caracteristicas,
        textoEliminar: "¿Eliminar este suministro de impermeabilizante y su control documental?",
        // Compatibilidad con obras guardadas antes de admitir varios suministros
        instanciaInicial: (data) => {
        const inst = {
                uid: Date.now().toString(),
                customName: data.identificacion || "Impermeabilizante 1",
                ubicacion: data.ubicacion || "",
                lamina_material: data.lamina_material || "",
                lamina_masa: data.lamina_masa || "",
                lamina_armadura: data.lamina_armadura || "",
                caract: data.checks || {},
                checks: data.checks || {},
                observaciones: data.observaciones || ""
            };
        delete data.identificacion; delete data.ubicacion; delete data.lamina_material; delete data.lamina_masa; delete data.lamina_armadura; delete data.checks; delete data.observaciones;
        return inst;
    }
    });
};
