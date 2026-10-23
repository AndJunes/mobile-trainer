// Tipos del contenido que vive en src/data/*.json

export type Prioridad = 'alta' | 'media' | 'complementaria'
export type EstadoAplicacion = 'implementado' | 'parcial' | 'no-implementado' | 'a-verificar'

export interface Unidad {
  id: string
  titulo: string
  descripcion?: string
  temas: string[]
}

export interface ItemConRef {
  texto: string
  ref?: string
}

export interface Definicion {
  termino: string
  definicion: string
  ref?: string
}

export interface Tema {
  id: string
  unidad: string
  titulo: string
  prioridad: Prioridad
  enfasisClase: number
  fuenteTipo: 'clase' | 'pdf' | 'mixto'
  resumen: string
  explicacion: string[]
  pasos?: string[]
  definiciones?: Definicion[]
  comparacion?: { titulo?: string; columnas: string[]; filas: string[][] }
  erroresComunes?: ItemConRef[]
  codigoClase?: { lenguaje: string; fragmento: string; ref: string; nota?: string }
  citasProfe?: { texto: string; ref: string }[]
  aclaraciones?: string[]
  referencias: string[]
  aplicacionTP: {
    estado: EstadoAplicacion
    texto: string
    archivos: { ruta: string; lineas?: string; nota?: string }[]
  }
  desafio: string[]
  preguntasRelacionadas: string[]
  preguntasRapidas: string[]
}

/** Campos de una pregunta de la guía. Cada bloque usa un subconjunto. */
export interface CamposPregunta {
  respuestaModelo: string
  respuestaBreve?: string
  repregunta?: string
  respuestaRepregunta?: string
  fundamento?: string
  aplicacion?: string
  origen?: string
  prioridadTexto?: string
  preguntaOriginal?: string
  tema?: string
  clasificacion?: string
  clave?: string[]
  fuente?: string
}

export interface Pregunta {
  id: string
  bloque: string
  grupo: string | null
  pregunta: string
  campos: CamposPregunta
  prioridad: Prioridad | null
  /** Contenido de la guía que no es un campo rotulado (tablas o párrafos sueltos). */
  extras?: string
  /** Otras versiones de la misma pregunta en la guía (por ejemplo, la teórica y la textual del profe). */
  variantes?: string[]
}

export interface Bloque {
  id: string
  titulo: string
  intro: string
  grupos: { id: string; titulo: string; intro: string }[]
}

export interface BancoPreguntas {
  bloques: Bloque[]
  preguntas: Pregunta[]
}

export interface EntradaGlosario {
  termino: string
  definicion: string
  /** false = aparece en el glosario pero no se subraya en el texto (palabra demasiado común). */
  resaltar?: boolean
  /** true = solo se reconoce con las mismas mayúsculas (p. ej. "API"). */
  distinguirMayusculas?: boolean
}

/** Presentación del proyecto (pantallas de inicio y "Acerca de"). */
export interface Proyecto {
  nombre: string
  bajada: string
  /** Una oración que se entiende sola, para el inicio. */
  resumen: string
  problema: string
  solucion: string
  metodo: { titulo: string; texto: string }[]
  stack: { nombre: string; detalle: string }[]
  comoSeHizo: string[]
  terminos: { termino: string; definicion: string }[]
  cifras: { unidades: number; temas: number; preguntas: number; terminos: number }
  autora: { nombre: string; links: { etiqueta: string; url: string }[] }
  repo: string
}
