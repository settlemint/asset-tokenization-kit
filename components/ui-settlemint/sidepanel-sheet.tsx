"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import React, { createContext, type ReactNode, useContext, useRef } from "react";

interface SidePanelProps {
  title: string;
  description: string;
  trigger: React.ReactNode;
  children: ReactNode;
}

interface SidePanelContextType {
  closeRef: React.RefObject<HTMLButtonElement>;
}

const SidePanelContext = createContext<SidePanelContextType>({
  closeRef: React.createRef<HTMLButtonElement>(),
});

export const useSidePanelContext = () => useContext(SidePanelContext);

export function SidePanel({ children, title, description, trigger }: SidePanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="SidePanel">
      <Sheet>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent className="w-[33%] lg:max-w-[33%]">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <div className="-ml-8 -mr-8">
            <SidePanelContext.Provider value={{ closeRef }}>{children}</SidePanelContext.Provider>
          </div>
          <SheetFooter>
            <SheetClose ref={closeRef} />
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
