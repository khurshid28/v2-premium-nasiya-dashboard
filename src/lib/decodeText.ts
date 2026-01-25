/**
 * MyID dan kelgan ma'lumotlardagi kodlash muammosini tuzatish
 * Kirill harflari noto'g'ri kodlangan bo'lsa, to'g'rilaydi
 */
export function decodeText(text: string | null | undefined): string {
  if (!text) return '';
  
  try {
    // Agar noto'g'ri kodlangan belgiler bor bo'lsa
    if (/[╨╤╥╨Ш╨Ю╨а╨Р╨Х╨в╨б╨г╨Ч╨С╨Ъ╨Ш╨Ы]/.test(text)) {
      // Latin-1 (ISO-8859-1) dan UTF-8 ga o'girish
      const encoded = new TextEncoder().encode(
        [...text].map(char => 
          String.fromCharCode(char.charCodeAt(0) & 0xFF)
        ).join('')
      );
      return new TextDecoder('utf-8').decode(encoded);
    }
    return text;
  } catch (error) {
    console.error('Decode error:', error);
    return text;
  }
}

/**
 * Obyekt ichidagi barcha string qiymatlarni dekodlash
 */
export function decodeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return decodeText(obj) as any;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => decodeObject(item)) as any;
  }

  if (typeof obj === 'object') {
    const decoded: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        decoded[key] = decodeObject((obj as any)[key]);
      }
    }
    return decoded;
  }

  return obj;
}
