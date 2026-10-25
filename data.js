// Escapa texto para insertarlo con seguridad dentro de HTML (atributos value="", áreas de texto, celdas).
// Evita que comillas, <, > o & escritos por el usuario corten o rompan los campos al redibujar o imprimir.
function escHtml(v) {
    if (v === undefined || v === null) return '';
    return String(v)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
window.escHtml = escHtml;

// Datos de los materiales (Plantillas extraídas de los Excel)
const materialesTemplate = [
    {
        id: "rec_rellenos",
        name: "Rellenos, Áridos y Geotextiles",
        category: "recepcion",
        customRenderer: "renderRecepcionRellenosCalc"
    },
    {
        id: "rec_hormigon",
        name: "Hormigón",
        category: "recepcion",
        customRenderer: "renderRecepcionHormigonCalc"
    },
    {
        id: "rec_ferralla",
        name: "Acero corrugado y Ferralla",
        category: "recepcion",
        customRenderer: "renderRecepcionFerrallaCalc"
    },
    {
        id: "rec_est_acero",
        name: "Estructuras de acero",
        category: "recepcion",
        customRenderer: "renderRecepcionEstAceroCalc"
    },
    {
        id: "rec_forjados",
        name: "Forjados prefabricados",
        category: "recepcion",
        customRenderer: "renderRecepcionForjadosCalc"
    },
    {
        id: "rec_forjados_madera",
        name: "Forjados de madera",
        category: "recepcion",
        customRenderer: "renderRecepcionForjadosMaderaCalc"
    },
    {
        id: "rec_est_prefab_hormigon",
        name: "Estructuras prefabricadas hormigón",
        category: "recepcion",
        customRenderer: "renderRecepcionEstPrefabHormigonCalc"
    },
    {
        id: "rec_est_prefab_madera",
        name: "Estructuras prefabricadas madera",
        category: "recepcion",
        customRenderer: "renderRecepcionEstPrefabMaderaCalc"
    },
    {
        id: "rec_fabrica_estructural",
        name: "Fábrica estructural / fachadas",
        category: "recepcion",
        customRenderer: "renderRecepcionFabricaEstructuralCalc"
    },
    {
        id: "aislantes",
        name: "Aislantes Térmicos",
        category: "recepcion",
        customRenderer: "renderRecepcionAislantesCalc"
    },
    {
        id: "impermeabilizantes",
        name: "Impermeabilizantes de la envolvente",
        category: "recepcion",
        customRenderer: "renderRecepcionImpermeabilizantesCalc"
    },
    {
        id: "sate_recepcion",
        name: "Revestimientos Fachada SATE",
        category: "recepcion",
        customRenderer: "renderRecepcionSateCalc"
    },
    {
        id: "aplacados_recepcion",
        name: "Revestimiento de fachadas (aplacados)",
        category: "recepcion",
        customRenderer: "renderRecepcionAplacadosCalc"
    },
    {
        id: "morteros_recepcion",
        name: "Revestimiento de fachadas (morteros)",
        category: "recepcion",
        customRenderer: "renderRecepcionMorterosCalc"
    },
    {
        id: "sistemas_ventilados_recepcion",
        name: "Revestimientos de fachada (sistemas ventilados)",
        category: "recepcion",
        customRenderer: "renderRecepcionSistemasVentiladosCalc"
    },
    {
        id: "rec_pavimentos",
        name: "Pavimentos",
        category: "recepcion",
        customRenderer: "renderRecepcionPavimentosCalc"
    },
    {
        id: "rec_carpinteria",
        name: "Carpintería exterior",
        category: "recepcion",
        customRenderer: "renderRecepcionCarpinteriaCalc"
    },
    {
        id: "rec_barandillas",
        name: "Barandillas",
        category: "recepcion",
        customRenderer: "renderRecepcionBarandillasCalc"
    },
    {
        id: "rec_fontaneria",
        name: "Fontanería y Gas",
        category: "recepcion",
        customRenderer: "renderRecepcionFontaneriaCalc"
    },
    {
        id: "rec_electricidad",
        name: "Electricidad",
        category: "recepcion",
        customRenderer: "renderRecepcionElectricidadCalc"
    },
    {
        id: "rec_otros",
        name: "Otros",
        category: "recepcion",
        customRenderer: "renderRecepcionOtrosCalc"
    },
    {
        id: "ejec_excavaciones",
        name: "Excavaciones",
        category: "ejecucion",
        customRenderer: "renderEjecExcavacionesCalc"
    },
    {
        id: "ejec_hormigon",
        name: "Estructuras de Hormigón",
        category: "ejecucion",
        customRenderer: "renderEjecHormigonCalc"
    },
    {
        id: "ejec_est_acero",
        name: "Estructuras de acero",
        category: "ejecucion",
        customRenderer: "renderEjecEstAceroCalc"
    },
    {
        id: "ejec_forjados_prefab",
        name: "Forjados prefabricados",
        category: "ejecucion",
        customRenderer: "renderEjecucionForjadosCalc"
    },
    {
        id: "ejec_forjados_madera",
        name: "Forjados de madera",
        category: "ejecucion",
        customRenderer: "renderEjecucionMaderaCalc"
    },
    {
        id: "ejec_estructuras_prefab",
        name: "Estructuras prefabricadas hormigón",
        category: "ejecucion",
        customRenderer: "renderEjecEstPrefabHormigonCalc"
    },
    {
        id: "ejec_est_prefab_madera",
        name: "Estructuras prefabricadas madera",
        category: "ejecucion",
        customRenderer: "renderEjecEstPrefabMaderaCalc"
    },
    {
        id: "ejec_fabrica_estructural",
        name: "Fábrica estructural / fachadas",
        category: "ejecucion",
        customRenderer: "renderEjecFabricaCalc"
    },
    {
        id: "ejec_cubiertas",
        name: "Cubiertas",
        category: "ejecucion",
        customRenderer: "renderEjecCubiertasCalc"
    },
    {
        id: "ejec_rev_fachada",
        name: "Revestimientos de fachada",
        category: "ejecucion",
        customRenderer: "renderEjecRevFachadaCalc"
    },
    {
        id: "ejec_tabiqueria",
        name: "Tabiquería",
        category: "ejecucion",
        customRenderer: "renderEjecTabiqueriaCalc"
    },
    {
        id: "ejec_pavimentos",
        name: "Pavimentos",
        category: "ejecucion",
        customRenderer: "renderEjecPavimentosCalc"
    },
    {
        id: "ejec_rampas_escaleras",
        name: "Rampas y Escaleras",
        category: "ejecucion",
        customRenderer: "renderEjecRampasEscalerasCalc"
    },
    {
        id: "ejec_fontaneria",
        name: "Fontanería y Gas",
        category: "ejecucion",
        customRenderer: "renderEjecFontaneriaCalc"
    },
    {
        id: "ejec_electricidad",
        name: "Electricidad",
        category: "ejecucion",
        customRenderer: "renderEjecElectricidadCalc"
    },
    {
        id: "ejec_saneamiento",
        name: "Saneamiento Ventilación",
        category: "ejecucion",
        customRenderer: "renderEjecSaneamientoCalc"
    },
    {
        id: "ejec_calefaccion",
        name: "Calefacción",
        category: "ejecucion",
        customRenderer: "renderEjecCalefaccionCalc"
    },
    {
        id: "ejec_aire_acondicionado",
        name: "Aire acondicionado",
        category: "ejecucion",
        customRenderer: "renderEjecAireAcondicionadoCalc"
    },
    {
        id: "ejec_carpinteria_ext",
        name: "Carpintería exterior",
        category: "ejecucion",
        customRenderer: "renderEjecCarpinteriaExtCalc"
    },
    {
        id: "ejec_barandillas",
        name: "Barandillas",
        category: "ejecucion",
        customRenderer: "renderEjecucionBarandillasCalc"
    },
    {
        id: "ejec_ascensores",
        name: "Ascensores",
        category: "ejecucion",
        customRenderer: "renderEjecAscensoresCalc"
    },
    {
        id: "ejec_piscinas",
        name: "Piscinas",
        category: "ejecucion",
        customRenderer: "renderEjecPiscinasCalc"
    },
    {
        id: "ejec_otros",
        name: "Otros",
        category: "ejecucion",
        customRenderer: "renderEjecOtrosCalc"
    },

    {
        id: "ensayos_geotecnicos",
        name: "Ensayos geotécnicos",
        category: "ensayos",
        sections: [
            {
                type: "dynamic_list",
                id: "lista_ensayos_geotecnicos",
                title: "Ensayos geotécnicos",
                itemName: "Ensayo",
                fields: [
                    {
                        id: "tipo_ensayo",
                        label: "Tipo de ensayo",
                        type: "select",
                        options: [
                            "",
                            "Sondeos Mecánicos con Recuperación de Testigos",
                            "Ensayos de Penetración Dinámica (DPSH / DPL)",
                            "Ensayo de Penetración Estándar (SPT)",
                            "Ensayo de Placa de Carga",
                            "Granulometría por Tamizado y Sedimentación",
                            "Límites de Atterberg (Límite Líquido y Plástico)",
                            "Ensayo de Hinchamiento Libre y Presión de Hinchamiento",
                            "Ensayo de Compresión Simple (Uniaxial)",
                            "Ensayo Triaxial (UU, CU o CD)",
                            "Ensayo edométrico",
                            "Contenido en Sulfatos (en suelo y agua subterránea)",
                            "Contenido en Cloruros",
                            "Medición del pH",
                            "Contenido en Materia Orgánica"
                        ]
                    },
                    { id: "zona", label: "Zona ensayada / Ubicación", type: "text" },
                    { id: "laboratorio_nombre", label: "Laboratorio (Nombre)", type: "text" },
                    { id: "fecha", label: "Fecha del ensayo", type: "date" },
                    { id: "resultado", label: "Resultado", type: "select", options: ["", "Correcto", "Incorrecto"] },
                    { id: "observaciones", label: "Observaciones", type: "text" }
                ]
            }
        ]
    },
    {
        id: "ensayos_hormigon",
        name: "Ensayos y lotes de hormigón",
        category: "ensayos",
        customRenderer: "renderHormigonCalc"
    },
    {
        id: "ensayos_est_acero",
        name: "Ensayos de Estructuras de Acero",
        category: "ensayos",
        customRenderer: "renderEstAceroCalc"
    },
    {
        id: "ensayos_cubiertas",
        name: "Cubiertas",
        category: "ensayos",
        sections: [
            {
                type: "dynamic_list",
                id: "lista_cubiertas",
                title: "Pruebas de servicio Cubierta plana",
                itemName: "Cubierta",
                fields: [
                    { id: "tipo_cubierta", label: "Tipo de cubierta", type: "select", options: ["", "Plana", "Inclinada"] },
                    { id: "tipo_ensayo", label: "Tipo de ensayo", type: "select", options: ["", "Inundación", "Riego"] },
                    { id: "zona", label: "Zona ensayada", type: "text" },
                    { id: "autor", label: "Autor del ensayo", type: "select", options: ["", "Contratista", "Laboratorio"] },
                    { id: "laboratorio_nombre", label: "Laboratorio (Nombre)", type: "text" },
                    { id: "fecha", label: "Fecha del ensayo", type: "date" },
                    { id: "resultado", label: "Resultado", type: "select", options: ["", "Correcto", "Incorrecto"] },
                    { id: "observaciones", label: "Observaciones", type: "text" }
                ]
            }
        ]
    },
    {
        id: "ensayos_fabrica_estructural",
        name: "Fábrica estructural",
        category: "ensayos",
        sections: [
            {
                type: "dynamic_list",
                id: "lista_ensayos_fabrica_estructural",
                title: "Ensayos de Fábrica estructural",
                itemName: "Ensayo",
                fields: [
                    { id: "tipo_ensayo", label: "Tipo de ensayo", type: "select", options: ["", "Ensayo de resistencia a compresión de piezas (ladrillos/bloques)", "Ensayo de resistencia a compresión mortero", "Ensayo de resistencia a flexión mortero", "Ensayo de resistencia a compresión de muretes de fábrica", "Ensayo de adherencia mortero-pieza", "Otros"] },
                    { id: "zona", label: "Zona ensayada / Ubicación", type: "text" },
                    { id: "laboratorio_nombre", label: "Laboratorio (Nombre)", type: "text" },
                    { id: "fecha", label: "Fecha del ensayo", type: "date" },
                    { id: "resultado", label: "Resultado", type: "select", options: ["", "Correcto", "Incorrecto"] },
                    { id: "observaciones", label: "Observaciones", type: "text" }
                ]
            }
        ]
    },
    {
        id: "ensayos_fachadas",
        name: "Fachadas",
        category: "ensayos",
        sections: [
            {
                type: "dynamic_list",
                id: "lista_ensayos_fachadas",
                title: "Ensayos de Fachadas",
                itemName: "Ensayo",
                fields: [
                    { id: "tipo_ensayo", label: "Tipo de ensayo", type: "select", options: ["", "Ensayo de resistencia a compresión ladrillo/bloque", "Ensayo de resistencia a compresión mortero", "Prueba de estanqueidad fachada", "Prueba de estanqueidad carpinteria"] },
                    { id: "zona", label: "Zona ensayada / Ubicación", type: "text" },
                    { id: "laboratorio_nombre", label: "Laboratorio (Nombre)", type: "text" },
                    { id: "fecha", label: "Fecha del ensayo", type: "date" },
                    { id: "resultado", label: "Resultado", type: "select", options: ["", "Correcto", "Incorrecto"] },
                    { id: "observaciones", label: "Observaciones", type: "text" }
                ]
            }
        ]
    },
    {
        id: "ensayos_barandillas",
        name: "Barandillas",
        category: "ensayos",
        sections: [
            {
                type: "dynamic_list",
                id: "lista_ensayos_barandillas",
                title: "Ensayos de Barandillas",
                itemName: "Ensayo",
                fields: [
                    { id: "tipo_ensayo", label: "Tipo de ensayo", type: "select", options: ["", "Ensayo de resistencia al empuje horizontal", "Ensayo dinámico de impacto de cuerpo blando"] },
                    { id: "zona", label: "Zona ensayada / Ubicación", type: "text" },
                    { id: "laboratorio_nombre", label: "Laboratorio (Nombre)", type: "text" },
                    { id: "fecha", label: "Fecha del ensayo", type: "date" },
                    { id: "resultado", label: "Resultado", type: "select", options: ["", "Correcto", "Incorrecto"] },
                    { id: "observaciones", label: "Observaciones", type: "text" }
                ]
            }
        ]
    },
    {
        id: "ensayos_fontaneria",
        name: "Fontanería y Gas",
        category: "ensayos",
        sections: [
            {
                type: "dynamic_list",
                id: "lista_ensayos_fontaneria",
                title: "Pruebas de servicio fontanería/gas",
                itemName: "Ensayo",
                fields: [
                    { id: "tipo_ensayo", label: "Tipo de ensayo", type: "select", options: ["", "Prueba resistencia mecánica y estanquidad tuberias", "Prueba de medición de caudal y temperatura en los puntos de suministro", "Prueba estanqueidad chimeneas", "Prueba de estanqueidad de gas"] },
                    { id: "zona", label: "Zona ensayada / Ubicación", type: "text" },
                    { id: "laboratorio_nombre", label: "Laboratorio (Nombre)", type: "text" },
                    { id: "fecha", label: "Fecha del ensayo", type: "date" },
                    { id: "resultado", label: "Resultado", type: "select", options: ["", "Correcto", "Incorrecto"] },
                    { id: "observaciones", label: "Observaciones", type: "text" }
                ]
            }
        ]
    },
    {
        id: "ensayos_electricidad",
        name: "Electricidad",
        category: "ensayos",
        sections: [
            {
                type: "dynamic_list",
                id: "lista_ensayos_electricidad",
                title: "Pruebas y ensayos de Electricidad",
                itemName: "Ensayo",
                fields: [
                    { id: "tipo_ensayo", label: "Tipo de ensayo", type: "select", options: ["", "Medición de la Resistencia de Puesta a Tierra", "Medición de la Resistencia de aislamiento de los conductores", "Comprobación funcionamiento de magnetotérmicos y diferenciales", "Comprobación funcionamiento luminarias emergencia y nivel de iluminancia", "Otros"] },
                    { id: "zona", label: "Zona ensayada / Ubicación", type: "text" },
                    { id: "laboratorio_nombre", label: "Laboratorio (Nombre)", type: "text" },
                    { id: "fecha", label: "Fecha del ensayo", type: "date" },
                    { id: "resultado", label: "Resultado", type: "select", options: ["", "Correcto", "Incorrecto"] },
                    { id: "observaciones", label: "Observaciones", type: "text" }
                ]
            }
        ]
    },
    {
        id: "ensayos_saneamiento",
        name: "Saneamiento",
        category: "ensayos",
        sections: [
            {
                type: "dynamic_list",
                id: "lista_ensayos_saneamiento",
                title: "Ensayos y pruebas de servicio",
                itemName: "Ensayo",
                fields: [
                    { id: "tipo_ensayo", label: "Tipo de ensayo", type: "select", options: ["", "Prueba de estanqueidad red de desagüe interior", "Prueba de estanqueidad bajantes", "Prueba de funcionamiento colectores previa a su cubrición", "Prueba estanqueidad colectores"] },
                    { id: "zona", label: "Zona ensayada / Ubicación", type: "text" },
                    { id: "laboratorio_nombre", label: "Laboratorio (Nombre)", type: "text" },
                    { id: "fecha", label: "Fecha del ensayo", type: "date" },
                    { id: "resultado", label: "Resultado", type: "select", options: ["", "Correcto", "Incorrecto"] },
                    { id: "observaciones", label: "Observaciones", type: "text" }
                ]
            }
        ]
    },
    {
        id: "ensayos_varios",
        name: "Otros",
        category: "ensayos",
        customRenderer: "renderEnsayosOtrosCalc"
    }
];

if (typeof document !== 'undefined' && !window.renderEjecExcavacionesCalc) {
    const s = document.createElement('script');
    s.src = 'ejec-excavaciones-calc.js';
    document.head.appendChild(s);
}

if (typeof document !== 'undefined' && !window.renderEjecOtrosCalc) {
    const s = document.createElement('script');
    s.src = 'ejec-otros-calc.js';
    document.head.appendChild(s);
}

if (typeof document !== 'undefined' && !window.renderEnsayosOtrosCalc) {
    const s = document.createElement('script');
    s.src = 'ensayos-otros-calc.js';
    document.head.appendChild(s);
}

if (typeof document !== 'undefined' && !window.renderRecepcionOtrosCalc) {
    const s = document.createElement('script');
    s.src = 'recepcion-otros-calc.js';
    document.head.appendChild(s);
}

if (typeof document !== 'undefined' && !window.renderRecepcionRellenosCalc) {
    const s = document.createElement('script');
    s.src = 'recepcion-rellenos-calc.js';
    document.head.appendChild(s);
}

