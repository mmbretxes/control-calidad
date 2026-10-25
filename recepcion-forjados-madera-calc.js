// Control de recepción — configuración de la ficha (la lógica común está en suministros-engine.js)
window.renderRecepcionForjadosMaderaCalc = function (container, materialId) {
    const documentos = [
        { id: "e1", phase: "Pre-Suministro", name: "Declaración de prestaciones CE", desc: "Declaración de prestaciones y Marcado CE de la madera estructural empleada." },
        { id: "e2", phase: "Pre-Suministro", name: "Certificado de procedencia", desc: "Acreditación del origen geográfico de la madera." },
        { id: "e3", phase: "Pre-Suministro", name: "Certificado explotación sostenible", desc: "Certificación FSC, PEFC o equivalente que garantice la gestión forestal." },
        { id: "e4", phase: "Pre-Suministro", name: "Otros", desc: "", custom: true },
        { id: "e5", phase: "Durante Suministro", name: "Hoja de suministro/albarán", desc: "Identificación de los elementos, dimensiones y clase resistente." },
        { id: "e6", phase: "Durante Suministro", name: "Marcado CE", desc: "Comprobación del marcado CE físico en las piezas o paquetes suministrados." },
        { id: "e7", phase: "Durante Suministro", name: "Otros", desc: "", custom: true },
        { id: "e8", phase: "Final Suministro", name: "Certificado final de suministro", desc: "Certificación final que ampare todas las remesas servidas." },
        { id: "e9", phase: "Final Suministro", name: "Otros", desc: "", custom: true }
    ];

    window.SuministrosRecepcion.render(container, materialId, {
        prefijo: 'rfm',
        titulo: "Control Documental: Forjados de Madera",
        
        textoBoton: "+ Añadir suministro",
        nombreSuministro: (data) => `Forjado Madera ${data.instances.length + 1}`,
        placeholderNombre: "Identificación producto (Ej. Forjado C14)",
        campos: [{"id": "ubicacion", "clase": "ubicacion", "label": "Ubicación", "placeholder": "Ej. Cubierta"}],
        documentos,
        textoEliminar: "¿Eliminar este forjado y su control documental?",
        // Compatibilidad con obras guardadas antes de admitir varios suministros
        instanciaInicial: (data) => {
        const inst = {
                uid: Date.now().toString(),
                customName: data.identificacion || "Forjado de Madera 1",
                ubicacion: data.ubicacion || "",
                checks: data.checks || {},
                observaciones: data.observaciones || ""
            };
        delete data.identificacion; delete data.ubicacion; delete data.checks; delete data.observaciones;
        return inst;
    }
    });
};
