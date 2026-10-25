// Control de recepción — configuración de la ficha (la lógica común está en suministros-engine.js)
window.renderRecepcionPavimentosCalc = function (container, materialId) {
    const tiposPavimento = ["Cerámico", "Vinílico", "Madera", "Piedra natural"];

    const requiredDocsAll = [
        { id: "doc_pavimento_1", phase: "Pre-Suministro", name: "Declaración de prestaciones CE", desc: "Marcado CE según norma aplicable." },
        { id: "doc_pavimento_2", phase: "Pre-Suministro", name: "Fichas técnicas", desc: "Características del material." },
        { id: "doc_pavimento_muestra", phase: "Pre-Suministro", name: "Muestra o prototipo aprobado", desc: "Aprobado por la dirección facultativa (tono, calibre, acabado)." },
        { id: "doc_pavimento_compl", phase: "Pre-Suministro", name: "Materiales de agarre y complementarios", desc: "Fichas y declaración de prestaciones de adhesivos, morteros, juntas, láminas y bases." },
        { id: "doc_pavimento_petro", phase: "Pre-Suministro", name: "Informe de ensayos / ficha petrográfica", desc: "Caracterización de la piedra y origen de cantera.", tipos: ["Piedra natural"] },
        { id: "doc_pavimento_forestal", phase: "Pre-Suministro", name: "Certificado de procedencia de la madera", desc: "Gestión forestal sostenible, si lo exige el proyecto.", tipos: ["Madera"] },
        { id: "doc_pavimento_prev_otro", phase: "Pre-Suministro", name: "Otros", desc: "", custom: true },
        { id: "doc_pavimento_3", phase: "Durante Suministro", name: "Hoja de suministro/albarán", desc: "Trazabilidad de cada entrega en obra." },
        { id: "doc_pavimento_4", phase: "Durante Suministro", name: "Marcado CE", desc: "Comprobación visual de los embalajes." },
        { id: "doc_pavimento_lote", phase: "Durante Suministro", name: "Lote, tono y calibre", desc: "Coherentes con la muestra aprobada (comprobar en albarán y embalajes)." },
        { id: "doc_pavimento_dur_otro", phase: "Durante Suministro", name: "Otros", desc: "", custom: true },
        { id: "doc_pavimento_5", phase: "Final Suministro", name: "Certificado final de suministro", desc: "Acreditación del fabricante del material total." },
        { id: "doc_pavimento_fin_otro", phase: "Final Suministro", name: "Otros", desc: "", custom: true }
    ];

    // Los ids antiguos (pavimento_deslizamiento, _climatica, _flexion, _abrasion, _rotura, _fuego, _otras) se conservan para no perder datos guardados.
    const caractPorTipo = {
        "Cerámico": [
            { id: "pavimento_absorcion", name: "Absorción de agua" },
            { id: "pavimento_flexion", name: "Resistencia a flexión" },
            { id: "pavimento_rotura", name: "Carga de rotura" },
            { id: "pavimento_abrasion", name: "Resistencia al desgaste por abrasión" },
            { id: "pavimento_climatica", name: "Resistencia a heladas (exterior)" },
            { id: "pavimento_quimica", name: "Resistencia química y a manchas" },
            { id: "pavimento_dimensiones", name: "Dimensiones, planeidad y calibre" },
            { id: "pavimento_deslizamiento", name: "Resistencia al deslizamiento" },
            { id: "pavimento_fuego", name: "Reacción al fuego" }
        ],
        "Vinílico": [
            { id: "pavimento_espesor", name: "Espesor total y de la capa de uso" },
            { id: "pavimento_desgaste", name: "Resistencia al desgaste (clase de uso)" },
            { id: "pavimento_huella", name: "Resistencia a la huella (indentación)" },
            { id: "pavimento_estabilidad", name: "Estabilidad dimensional" },
            { id: "pavimento_ruedas", name: "Resistencia a ruedas de sillas" },
            { id: "pavimento_cov", name: "Emisiones de compuestos orgánicos volátiles" },
            { id: "pavimento_radiante", name: "Compatibilidad con suelo radiante" },
            { id: "pavimento_deslizamiento", name: "Resistencia al deslizamiento" },
            { id: "pavimento_fuego", name: "Reacción al fuego" }
        ],
        "Madera": [
            { id: "pavimento_especie", name: "Especie y clase de calidad o aspecto" },
            { id: "pavimento_espesor", name: "Espesor de la capa noble y dimensiones" },
            { id: "pavimento_humedad", name: "Humedad de la madera en suministro" },
            { id: "pavimento_dureza", name: "Dureza" },
            { id: "pavimento_estabilidad", name: "Estabilidad dimensional" },
            { id: "pavimento_formaldehido", name: "Emisión de formaldehído" },
            { id: "pavimento_radiante", name: "Compatibilidad con suelo radiante" },
            { id: "pavimento_durabilidad", name: "Durabilidad biológica (exterior o zona húmeda)" },
            { id: "pavimento_fuego", name: "Reacción al fuego" }
        ],
        "Piedra natural": [
            { id: "pavimento_petrografia", name: "Denominación petrográfica y origen" },
            { id: "pavimento_absorcion", name: "Absorción de agua y porosidad" },
            { id: "pavimento_flexion", name: "Resistencia a flexión" },
            { id: "pavimento_abrasion", name: "Resistencia al desgaste por abrasión" },
            { id: "pavimento_climatica", name: "Resistencia a heladas y cristalización de sales" },
            { id: "pavimento_dimensiones", name: "Dimensiones, espesor y tolerancias" },
            { id: "pavimento_acabado", name: "Acabado superficial" },
            { id: "pavimento_deslizamiento", name: "Resistencia al deslizamiento" },
            { id: "pavimento_fuego", name: "Reacción al fuego" }
        ]
    };

    const getCaract = (tipo) => (caractPorTipo[tipo] || []).concat([{ id: "pavimento_otras", name: "Otra", custom: true }]);
    const getDocs = (tipo) => requiredDocsAll.filter(d => !d.tipos || d.tipos.includes(tipo));

    window.SuministrosRecepcion.render(container, materialId, {
        prefijo: 'rpav',
        titulo: "Control Documental: Pavimentos",
        
        textoBoton: "+ Añadir tipología",
        nombreSuministro: (data) => `Pavimento ${data.instances.length + 1}`,
        placeholderNombre: "Identificación producto (Ej. Pavimento continuo, Alicatado...)",
        campos: [{"id": "ubicacion", "clase": "ubicacion", "label": "Ubicación", "placeholder": "Ej. Zonas comunes, Baños..."}],
        tipos: { label: 'Tipo de pavimento', placeholder: 'Seleccione tipo...', opciones: tiposPavimento, porDefecto: 'Cerámico',
                 mensajeSinTipo: 'Selecciona un tipo de pavimento para cargar las características y la documentación exigibles.' },
        caracteristicas: (inst) => getCaract(inst.tipo),
        documentos: (inst) => getDocs(inst.tipo),
        textoEliminar: "¿Eliminar esta tipología de pavimento y su control documental?",
        // Compatibilidad con obras guardadas antes de admitir varios suministros
        instanciaInicial: (data) => {
        const inst = {
                uid: Date.now().toString(),
                customName: data.identificacion || "Pavimento 1",
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
