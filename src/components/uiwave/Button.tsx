import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center font-display font-bold uppercase tracking-wide transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary btn-clipped ",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground",
                destructive:
                    "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
                outline:
                    "border border-secondary-container bg-transparent text-secondary-container hover:bg-secondary-container/10",
                secondary: "bg-secondary text-secondary-foreground",
                ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
                link: "underline-offset-4 hover:underline",
            },
            size: {
                default: "px-6 py-3 text-base",
                sm: "px-4 py-2 text-sm",
                lg: "px-8 py-4 text-lg",
                icon: "size-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : "button";

    return (
        <Comp
            data-slot="button"
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Button, buttonVariants };
