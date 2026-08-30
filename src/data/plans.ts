export const PLANS = [
    {
        name: "Inicial",
        price: 149,
        description:
            "Perfecto para principiantes que buscan estructura y acompañamiento.",
        features: [
            "Plan de entrenamiento personalizado",
            "2 sesiones al mes",
            "Videos para revisar la técnica",
            "Seguimiento mediante la app",
        ],
        button: "Comenzar",
        featured: false,
    },

    {
        name: "Rendimiento",
        price: 299,
        description:
            "Nuestro plan más popular para quienes buscan mejorar su fuerza y composición corporal.",
        features: [
            "Todo lo incluido en Inicial",
            "4 sesiones al mes",
            "Orientación nutricional",
            "Seguimiento semanal",
            "Horarios con prioridad",
        ],
        button: "Comenzar Rendimiento",
        featured: true,
        badge: "Más Popular",
    },

    {
        name: "Élite",
        price: 499,
        description:
            "Máximo acompañamiento para atletas y personas de alto rendimiento.",
        features: [
            "Todo lo incluido en Rendimiento",
            "8 sesiones al mes",
            "Protocolos de recuperación",
            "Preparación para competencias",
            "Acceso directo por mensajería",
        ],
        button: "Elegir Élite",
        featured: false,
    },
];
