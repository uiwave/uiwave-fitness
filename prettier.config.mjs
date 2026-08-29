/** @type {import("prettier").Config} */
export default {
    plugins: ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],

    // Indentación
    tabWidth: 4,
    useTabs: false,

    // Punto y coma
    semi: true,

    // Comillas
    singleQuote: false,
    jsxSingleQuote: false,

    // Ancho máximo
    printWidth: 80,

    // Trailing commas
    trailingComma: "all",

    // Espacios
    bracketSpacing: true,

    // Funciones
    arrowParens: "always",

    // Final de línea
    endOfLine: "lf",

    // Astro
    astroAllowShorthand: true,
};
