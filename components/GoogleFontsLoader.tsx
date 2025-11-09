"use client";

import { useEffect } from "react";

export default function GoogleFontsLoader() {
  useEffect(() => {
    // Check if fonts are already loaded
    if (document.querySelector('link[href*="fonts.googleapis.com/css2"]')) {
      return;
    }

    // Create preconnect links
    const preconnect1 = document.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect1);

    const preconnect2 = document.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect2);

    // Create stylesheet link
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Open+Sans:wght@300;400;500;600;700&family=Lato:wght@300;400;700&family=Montserrat:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Raleway:wght@300;400;500;600;700&family=Ubuntu:wght@300;400;500;700&family=Playfair+Display:wght@400;500;600;700&family=Merriweather:wght@300;400;700&family=Oswald:wght@300;400;500;600;700&family=Source+Sans+Pro:wght@300;400;600;700&family=Lora:wght@400;500;600;700&family=Nunito:wght@300;400;500;600;700&family=PT+Sans:wght@400;700&family=Dancing+Script:wght@400;500;600;700&family=Pacifico&family=Comfortaa:wght@300;400;500;600;700&family=Crimson+Text:wght@400;600;700&family=Libre+Baskerville:wght@400;700&display=swap';
    fontLink.onload = () => {
      console.log('[GoogleFontsLoader] Fonts CSS loaded');
      // Force document fonts to load
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          console.log('[GoogleFontsLoader] Fonts are ready');
        });
      }
    };
    document.head.appendChild(fontLink);

    console.log('[GoogleFontsLoader] Fonts link added');
  }, []);

  return null;
}

