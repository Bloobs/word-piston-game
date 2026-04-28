"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Esto fuerza al navegador a volver al principio cada vez que cambia la ruta
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // Este componente no renderiza nada
}

