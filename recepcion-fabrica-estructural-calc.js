// Control de recepción — configuración de la ficha (la lógica común está en suministros-engine.js)
window.renderRecepcionFabricaEstructuralCalc = function (container, materialId) {
    const documentos = [
        { id: "e1", phase: "Pre-Suministro", name: "Bloques hormigón y ladrillos cerámicos", desc: "Declaración de prestaciones y Marcado CE." },
        { id: "e2", phase: "Pre-Suministro", name: "Ladrillos silicocalcáreos", desc: "Cumplimiento de la Norma UNE-EN 771-2." },
        { id: "e3", phase: "Pre-Suministro", name: "Ladrillos piedra natural", desc: "Cumplimiento de la Norma UNE-EN 771-5." },
        { id: "e4", phase: "Pre-Suministro", name: "Mortero de albañilería (de central)", desc: "Declaración de prestaciones y Marcado CE." },
        { id: "e5", phase: "Pre-Suministro", name: "Mortero hecho en obra", desc: "Resultados de ensayos previos de dosificación." },
        { id: "e6", phase: "Pre-Suministro", name: "Llaves de anclaje y atado", desc: "Conformes a la norma UNE-EN 845-1. Clases A2/A4." },
        { id: "e7", phase: "Pre-Suministro", name: "Armaduras de tendel", desc: "Conformes a la norma UNE-EN 845-3." },
        { id: "e8", phase: "Pre-Suministro", name: "Fichas técnicas", desc: "Fichas de todos los productos aportados por el suministrador." },
        { id: "e9", phase: "Pre-Suministro", name: "Otros", desc: "", custom: true },
        { id: "e10", phase: "Durante Suministro", name: "Hoja de suministro/Albarán", desc: "Comprobación de referencias en cada entrega." },
        { id: "e11", phase: "Durante Suministro", name: "Marcado CE piezas y mortero", desc: "Verificación física de etiquetas o empaques en obra." },
        { id: "e12", phase: "Durante Suministro", name: "Otros", desc: "", custom: true },
        { id: "e13", phase: "Final Suministro", name: "Certificado final de suministro", desc: "Garantía global del volumen total aportado a la obra." },
        { id: "e14", phase: "Final Suministro", name: "Otros", desc: "", custom: true }
    ];
    const caracteristicas = [
        { id: "fab_res_comp", name: "Resistencia a compresión" },
        { id: "fab_succion", name: "Succión de agua" },
        { id: "fab_heladicidad", name: "Heladicidad" },
        { id: "fab_mortero", name: "Mortero de juntas" },
        { id: "fab_otras", name: "Otras", custom: true }
    ];

    window.SuministrosRecepcion.render(container, materialId, {
        prefijo: 'rfe',
        titulo: "Control Documental: Fábrica Estructural / Fachadas",
        verificadoInicial: '',
        textoBoton: "+ Añadir tipología",
        nombreSuministro: (data) => `Fábrica ${data.instances.length + 1}`,
        placeholderNombre: "Tipo de fábrica (Ej. Ladrillo perforado)",
        campos: [{"id": "ubicacion", "clase": "ubicacion", "label": "Ubicación", "placeholder": "Ej. Cerramiento exterior"}],
        documentos,
        caracteristicas,
        textoEliminar: "¿Eliminar esta tipología de fábrica y su control documental?",
        // Compatibilidad con obras guardadas antes de admitir varios suministros
        instanciaInicial: (data) => {
        const inst = {
                uid: Date.now().toString(),
                customName: data.tipo_fabrica || "Fábrica 1",
                ubicacion: data.ubicacion || "",
                caract: data.checks || {}, // migrate old checks to caract just in case, though it mixed both
                checks: data.checks || {},
                observaciones: data.observaciones || ""
            };
        delete data.tipo_fabrica; delete data.ubicacion; delete data.checks; delete data.observaciones;
        return inst;
    }
    });
};
