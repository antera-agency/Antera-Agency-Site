'use client';

import { useEffect, useState } from 'react';

// ============================================================
// Detecteert of het apparaat primair via aanraking bediend wordt
// — niet via viewport-breedte (een breed tablet of een klein
// laptopscherm zouden anders verkeerd geclassificeerd worden).
// `(pointer: coarse)` is het betrouwbaarste signaal hiervoor; de
// `maxTouchPoints`-check is een aanvullend vangnet voor apparaten
// die die media query niet ondersteunen.
// ============================================================
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const hasTouchPoints = navigator.maxTouchPoints > 0;
    setIsTouch(coarse || hasTouchPoints);
  }, []);

  return isTouch;
}
