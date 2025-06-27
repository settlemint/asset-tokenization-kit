"use client";

import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

interface SecretItemProps {
  value: ReactNode;
}

export function SecretItem({ value }: SecretItemProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {isVisible ? (
        value
      ) : (
        <span className="font-mono tracking-widest">********</span>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsVisible(!isVisible)}
        aria-label={isVisible ? "Hide value" : "Show value"}
        className="size-auto p-0 h-auto hover:bg-transparent"
      >
        {isVisible ? (
          <EyeOff className="size-4 text-muted-foreground" />
        ) : (
          <Eye className="size-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}
