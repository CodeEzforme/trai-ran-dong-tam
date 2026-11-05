'use client';
import { useEffect } from 'react';
import { siteUrl } from '../lib/paths.mjs';
export default function LegacyScripts() {
  useEffect(() => {
    if (window.__dongTamContentLoaded) return;
    window.__dongTamContentLoaded = true;
    for (const file of ['legacy-content.js','garden.js','contact.js']) {
      const script = document.createElement('script'); script.src=siteUrl('/assets/'+file+'?v=structure2'); script.async=false; document.body.append(script);
    }
  }, []);
  return null;
}
