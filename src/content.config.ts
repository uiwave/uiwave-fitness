import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const programs = defineCollection({
    loader: glob({
        pattern: "**/*.{md,mdx}",
        base: "./src/content/programs",
    }),

    schema: z.object({
        image: z.string(),
        alt: z.string(),
        level: z.string(),
        duration: z.string(),
        title: z.string(),
        description: z.string(),
        price: z.string(),
    }),
});

export const collections = {
    programs,
};
