// Control de recepción — configuración de la ficha (la lógica común está en suministros-engine.js)
window.renderRecepcionEstPrefabHormigonCalc = function (container, materialId) {
    const documentos = [
        { id: "e1", phase: "Pre-Suministro", name: "Declaración de prestaciones Marcado CE", desc: "Declaración de prestaciones obligatoria según norma aplicable." },
        { id: "e2", phase: "Pre-Suministro", name: "Certificado del Control de Producción en Fábrica", desc: "Acreditación del sistema de gestión y control del fabricante." },
        { id: "e3", phase: "Pre-Suministro", name: "Planos de Despiece y Ficha Técnica de Cálculo", desc: "Documentación técnica detallando dimensiones, armaduras y justificación de cálculo." },
        { id: "e4", phase: "Pre-Suministro", name: "Otros", desc: "", custom: true },
        { id: "e5", phase: "Durante Suministro", name: "Hoja de suministro/Albarán", desc: "Documento de acompañamiento identificando cada pieza servida." },
        { id: "e6", phase: "Durante Suministro", name: "Marcado físico de las piezas", desc: "Comprobación del marcado indeleble sobre la pieza (fecha, identificación, CE)." },
        { id: "e7", phase: "Durante Suministro", name: "Otros", desc: "", custom: true },
        { id: "e8", phase: "Final Suministro", name: "Certificado de Suministro", desc: "Documento final que agrupa y garantiza todo el volumen suministrado a la obra." },
        { id: "e9", phase: "Final Suministro", name: "Dosier de trazabilidad", desc: "Registro completo de los materiales empleados en la fabricación de cada pieza." },
        { id: "e10", phase: "Final Suministro", name: "Otros", desc: "", custom: true }
    ];

    window.SuministrosRecepcion.render(container, materialId, {
        prefijo: 'reph',
        titulo: "Control Documental: Estructuras Prefabricadas de Hormigón",
        selectorDcor: true,
        textoBoton: "+ Añadir suministro",
        nombreSuministro: (data) => `Prefabricado ${data.instances.length + 1}`,
        placeholderNombre: "Identificación producto (Ej. Vigas pretensadas)",
        campos: [{"id": "ubicacion", "clase": "ubicacion", "label": "Ubicación", "placeholder": "Ej. Forjado techo P1"}],
        documentos,
        textoEliminar: "¿Eliminar este prefabricado y su control documental?",
        // Compatibilidad con obras guardadas antes de admitir varios suministros
        instanciaInicial: (data) => {
        const inst = {
                uid: Date.now().toString(),
                customName: data.identificacion || "Prefabricado 1",
                ubicacion: data.ubicacion || "",
                dcor: false,
                checks: data.checks || {},
                observaciones: data.observaciones || ""
            };
        delete data.identificacion; delete data.ubicacion; delete data.checks; delete data.observaciones;
        return inst;
    }
    });
};
