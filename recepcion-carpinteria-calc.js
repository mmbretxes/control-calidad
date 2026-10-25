// Control de recepción — configuración de la ficha (la lógica común está en suministros-engine.js)
window.renderRecepcionCarpinteriaCalc = function (container, materialId) {
    const documentos = [
        { id: "doc_carp_ce", phase: "Pre-Suministro", name: "Declaración de prestaciones marcado CE", desc: "Marcado CE de ventanas y puertas peatonales exteriores." },
        { id: "doc_carp_fichas", phase: "Pre-Suministro", name: "Fichas técnicas", desc: "Características técnicas de perfiles, acristalamiento y herrajes." },
        { id: "doc_carp_prev_otros", phase: "Pre-Suministro", name: "Otros", desc: "", custom: true },
        { id: "doc_carp_albaran", phase: "Durante Suministro", name: "Hoja de suministro/albarán", desc: "Comprobación del material suministrado con el pedido." },
        { id: "doc_carp_ce_durante", phase: "Durante Suministro", name: "Marcado CE", desc: "Comprobación visual de las etiquetas en los productos." },
        { id: "doc_carp_dur_otros", phase: "Durante Suministro", name: "Otros", desc: "", custom: true },
        { id: "doc_carp_cert_final", phase: "Final Suministro", name: "Certificado final de suministro", desc: "Acreditación del fabricante o suministrador." },
        { id: "doc_carp_fin_otros", phase: "Final Suministro", name: "Otros", desc: "", custom: true }
    ];
    const caracteristicas = [
        { id: "carp_t_conjunto", name: "Transmitancia térmica conjunto" },
        { id: "carp_t_marco", name: "Transmitancia térmica marco" },
        { id: "carp_t_vidrio", name: "Transmitancia térmica vidrio" },
        { id: "carp_perm_aire", name: "Permeabilidad al aire" },
        { id: "carp_acustica", name: "Indice global de reducción acústica" },
        { id: "carp_viento", name: "Resistencia a carga de viento" },
        { id: "carp_solar", name: "Factor solar vidrio" },
        { id: "carp_otras", name: "Otra", custom: true }
    ];

    window.SuministrosRecepcion.render(container, materialId, {
        prefijo: 'rcarp',
        titulo: "Control Documental de Recepción: Carpintería Exterior",
        
        textoBoton: "+ Añadir tipología",
        nombreSuministro: (data) => `Carpintería ${data.instances.length + 1}`,
        placeholderNombre: "Identificador (Ej. Ventana Tipo 1...)",
        campos: [{"id": "tipologia", "clase": "tipologia", "label": "Tipología carpintería", "placeholder": "Ej. Aluminio RPT, PVC..."}, {"id": "vidrio", "clase": "vidrio", "label": "Tipología vidrio", "placeholder": "Ej. Doble acristalamiento 4/16/4..."}, {"id": "ubicacion", "clase": "ubicacion", "label": "Ubicación", "placeholder": "Ej. Fachada Norte, Planta Baja..."}],
        documentos,
        caracteristicas,
        textoEliminar: "¿Eliminar esta tipología de carpintería y su control documental?",
        // Compatibilidad con obras guardadas antes de admitir varios suministros
        instanciaInicial: (data) => {
        const inst = {
                uid: Date.now().toString(),
                customName: "Carpintería 1",
                tipologia: "",
                vidrio: "",
                ubicacion: "",
                caract: {},
                checks: {},
                observaciones: ""
            };
        
        return inst;
    }
    });
};
