import React, {
  useState,
  useId,
  Children,
  cloneElement,
  isValidElement,
} from "react";

// API: Tabs, TabsList, TabsTrigger, TabsContent
// Uso: <Tabs value={...} onValueChange={...}><TabsList>...</TabsList><TabsContent value="...">...</TabsContent></Tabs>

interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (val: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  children,
  className,
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const controlled = value !== undefined;
  const current = controlled ? value : internalValue;

  const setValue = (val: string) => {
    if (!controlled) setInternalValue(val);
    onValueChange?.(val);
  };

  // Propaga props a los hijos
  return (
    <div className={className}>
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return child;
        // TabsList recibe value y setValue
        if ((child as any).type.displayName === "TabsList") {
          return cloneElement(child, { value: current, setValue });
        }
        // TabsContent recibe value actual
        if ((child as any).type.displayName === "TabsContent") {
          return cloneElement(child, { activeValue: current });
        }
        return child;
      })}
    </div>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  value?: string;
  setValue?: (val: string) => void;
  className?: string;
}

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ children, value, setValue, className }, ref) => (
    <div
      ref={ref}
      className={
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground " +
        (className || "")
      }
    >
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return child;
        // TabsTrigger recibe value actual y setValue
        return cloneElement(child, { activeValue: value, setValue });
      })}
    </div>
  )
);
TabsList.displayName = "TabsList";

interface TabsTriggerProps {
  value: string;
  activeValue?: string;
  setValue?: (val: string) => void;
  className?: string;
  children: React.ReactNode;
}

export const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  TabsTriggerProps
>(({ value, activeValue, setValue, className, children, ...props }, ref) => {
  const selected = value === activeValue;
  return (
    <button
      ref={ref}
      type="button"
      className={
        `inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
          selected
            ? "bg-background text-foreground shadow"
            : "text-muted-foreground"
        } ` + (className || "")
      }
      aria-selected={selected}
      onClick={() => setValue?.(value)}
      {...props}
    >
      {children}
    </button>
  );
});
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps {
  value: string;
  activeValue?: string;
  className?: string;
  children: React.ReactNode;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, activeValue, className, children, ...props }, ref) => {
    if (value !== activeValue) return null;
    return (
      <div
        ref={ref}
        className={"mt-2 rounded bg-card p-2 " + (className || "")}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsContent.displayName = "TabsContent";

// Exporta solo la implementación propia
