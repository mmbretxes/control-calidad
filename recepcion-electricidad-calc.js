// Control de recepción — configuración de la ficha (la lógica común está en suministros-engine.js)
window.renderRecepcionElectricidadCalc = function (container, materialId) {
    const documentos = [
        { id: "doc_elec_1", phase: "Pre-Suministro", name: "Marcado CE cableado", desc: "" },
        { id: "doc_elec_2", phase: "Pre-Suministro", name: "Marcado CE interruptores...", desc: "" },
        { id: "doc_elec_3", phase: "Pre-Suministro", name: "Sello calidad bases de enchufe", desc: "" },
        { id: "doc_elec_4", phase: "Pre-Suministro", name: "Sello calidad interruptores...", desc: "" },
        { id: "doc_elec_5", phase: "Pre-Suministro", name: "Clasificación reacción al fuego...", desc: "" },
        { id: "doc_elec_6", phase: "Pre-Suministro", name: "Certificado resistencia mecánica conductos...", desc: "" },
        { id: "doc_elec_7", phase: "Pre-Suministro", name: "Certificado grado proteccion IP...", desc: "" },
        { id: "doc_elec_prev_otro", phase: "Pre-Suministro", name: "Otros", desc: "", custom: true },
        { id: "doc_elec_8", phase: "Durante Suministro", name: "Hoja de suministro/Albarán", desc: "" },
        { id: "doc_elec_9", phase: "Durante Suministro", name: "Verificación marcado CE", desc: "" },
        { id: "doc_elec_dur_otro", phase: "Durante Suministro", name: "Otras", desc: "", custom: true },
        { id: "doc_elec_10", phase: "Final Suministro", name: "Certificado final de suministro", desc: "" },
        { id: "doc_elec_fin_otro", phase: "Final Suministro", name: "Otros", desc: "", custom: true }
    ];
    const caracteristicas = [
        { id: "elec_pias", name: "Magnetotérmicos (PIAs): In y Poder de corte" },
        { id: "elec_dif", name: "Interruptores Diferenciales: Sensibilidad y Clase" },
        { id: "elec_mec", name: "Mecanismos (Enchufes/Interrup): Grado de protección (IP)" },
        { id: "elec_cond", name: "Conductores: Sección y Clasificación al fuego (CPR)" },
        { id: "elec_tubo", name: "Tubos protectores (Corrugado): Resistencia a compresión" },
        { id: "elec_otras", name: "Otra característica (especificar)", custom: true }
    ];

    window.SuministrosRecepcion.render(container, materialId, {
        prefijo: 'relec',
        titulo: "Control Documental: Electricidad",
        
        textoBoton: "+ Añadir tipología",
        nombreSuministro: (data) => `Electricidad ${data.instances.length + 1}`,
        placeholderNombre: "Identificación producto (Ej. Cableado libre halógenos)",
        campos: [{"id": "ubicacion", "clase": "ubicacion", "label": "Ubicación", "placeholder": "Ej. Planta 1"}],
        documentos,
        caracteristicas,
        textoEliminar: "¿Eliminar esta tipología de electricidad y su control documental?",
        // Compatibilidad con obras guardadas antes de admitir varios suministros
        instanciaInicial: (data) => {
        const inst = {
                uid: Date.now().toString(),
                customName: data.identificacion || "Electricidad 1",
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
