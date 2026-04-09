"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import * as React from "react";

import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b border-border/40", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionHeader = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Header>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Header ref={ref} className={cn(className)} {...props} />
));
AccordionHeader.displayName = "AccordionHeader";

const AccordionTrigger = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Trigger
    ref={ref}
    className={cn(
      "group flex w-full items-center justify-between gap-4 py-4 text-left font-medium transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  >
    {children}
  </AccordionPrimitive.Trigger>
));
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Panel>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Panel
    ref={ref}
    className={cn(
      "overflow-hidden text-sm text-muted-foreground data-[ending-style]:animate-out data-[starting-style]:animate-in data-[starting-style]:fade-in-0 data-[ending-style]:fade-out-0",
      className,
    )}
    {...props}
  />
));
AccordionContent.displayName = "AccordionContent";

export {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
};
