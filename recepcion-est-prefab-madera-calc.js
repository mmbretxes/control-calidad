// Control de recepción — configuración de la ficha (la lógica común está en suministros-engine.js)
window.renderRecepcionEstPrefabMaderaCalc = function (container, materialId) {
    const documentos = [
        { id: "e1", phase: "Pre-Suministro", name: "Madera aserrada. Declaración de prestaciones", desc: "Marcado CE obligatorio para madera estructural con sección rectangular." },
        { id: "e2", phase: "Pre-Suministro", name: "Madera laminada encolada. Declaración de prestaciones", desc: "Marcado CE obligatorio para elementos estructurales encolados." },
        { id: "e3", phase: "Pre-Suministro", name: "Madera contralaminada. Evaluación Técnica Europea", desc: "ETE correspondiente al fabricante para paneles CLT." },
        { id: "e4", phase: "Pre-Suministro", name: "Certificado de tratamiento y/o impregnación", desc: "Garantía de protección contra xilófagos y humedad según clase de uso." },
        { id: "e5", phase: "Pre-Suministro", name: "Otros", desc: "", custom: true },
        { id: "e6", phase: "Durante Suministro", name: "Hoja de suministro/Albarán", desc: "Debe identificar claramente las escuadrías, especie y clase resistente." },
        { id: "e7", phase: "Durante Suministro", name: "Marcado físico de las piezas", desc: "Identificación de la resistencia mecánica timbrada en la propia pieza." },
        { id: "e8", phase: "Durante Suministro", name: "Control de humedad", desc: "Registro de la medición de humedad en obra previa a su colocación." },
        { id: "e9", phase: "Durante Suministro", name: "Otros", desc: "", custom: true },
        { id: "e10", phase: "Final Suministro", name: "Certificado de Suministro", desc: "Dossier final de todas las remesas conformando la estructura." },
        { id: "e11", phase: "Final Suministro", name: "Dosier de trazabilidad", desc: "Registro de lotes, procedencias y tratamientos de la madera montada." },
        { id: "e12", phase: "Final Suministro", name: "Otros", desc: "", custom: true }
    ];

    window.SuministrosRecepcion.render(container, materialId, {
        prefijo: 'repm',
        titulo: "Control Documental: Estructuras Prefabricadas de Madera",
        
        textoBoton: "+ Añadir suministro",
        nombreSuministro: (data) => `Estructura Madera ${data.instances.length + 1}`,
        placeholderNombre: "Identificación producto (Ej. Madera CLT)",
        campos: [{"id": "ubicacion", "clase": "ubicacion", "label": "Ubicación", "placeholder": "Ej. Cubierta principal"}],
        documentos,
        textoEliminar: "¿Eliminar este suministro de madera y su control documental?",
        // Compatibilidad con obras guardadas antes de admitir varios suministros
        instanciaInicial: (data) => {
        const inst = {
                uid: Date.now().toString(),
                customName: data.identificacion || "Estructura Madera 1",
                ubicacion: data.ubicacion || "",
                checks: data.checks || {},
                observaciones: data.observaciones || ""
            };
        delete data.identificacion; delete data.ubicacion; delete data.checks; delete data.observaciones;
        return inst;
    }
    });
};
