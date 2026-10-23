// Lectura y escritura segura en localStorage: puede no estar disponible (modo privado, file://).
export function leer<T>(clave: string): T | null {
  try {
    const v = localStorage.getItem(clave)
    return v ? (JSON.parse(v) as T) : null
  } catch {
    return null
  }
}

export function escribir(clave: string, valor: unknown): void {
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
  } catch {
    /* sin almacenamiento: el progreso dura hasta cerrar la pestaña */
  }
}
