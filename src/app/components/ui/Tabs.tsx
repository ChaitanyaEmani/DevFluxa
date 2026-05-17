import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  isActive: boolean;
}

export function Tabs({ defaultValue, value, onValueChange, children }: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultValue);
  const activeTab = value || internalActiveTab;
  const setActiveTab = onValueChange || setInternalActiveTab;

  return (
    <div>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  );
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, isActive, onClick }: TabsTriggerProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-background text-foreground shadow-sm"
          : "hover:bg-background/50 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, isActive }: TabsContentProps) {
  if (!isActive) return null;
  
  return (
    <div className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
      {children}
    </div>
  );
}
