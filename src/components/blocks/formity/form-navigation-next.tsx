import type { ReactNode } from "react";

import Button from "./form-navigation-button";

interface ButtonProps {
  children: ReactNode;
}

export default function Next({ children }: ButtonProps) {
  return <Button cy="next">{children}</Button>;
}
