'use client';

import { useEffect, useState } from 'react';

export function SafeAreaMonitor() {
  const [safeAreaBottom, setSafeAreaBottom] = useState('0px');
  const [mounted, setMounted] = useState(false);

  const checkSafeArea = () => {
    const testEl = document.createElement('div');
    testEl.style.paddingBottom = 'env(safe-area-inset-bottom)';
    testEl.style.position = 'fixed';
    testEl.style.visibility = 'hidden';
    document.body.appendChild(testEl);
    const directValue = getComputedStyle(testEl).paddingBottom;
    document.body.removeChild(testEl);
    setSafeAreaBottom(directValue);
    console.log('Safe area check:', directValue);
    return directValue;
  };

  useEffect(() => {
    
    // Initial check
    setTimeout(checkSafeArea, 100);
    
    // Regular monitoring
    const interval = setInterval(checkSafeArea, 500);
    
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return <p>Safe area: Loading...</p>;
  }

  return <p>Safe area: {safeAreaBottom}</p>;
}