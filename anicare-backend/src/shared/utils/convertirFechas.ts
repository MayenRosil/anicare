// src/shared/utils/date.ts
/**
 * Convierte una fecha local 'YYYY-MM-DD HH:mm:ss' en un objeto Date
 * que mantiene la hora igual y al serializar (`toISOString()`)
 * devuelve "YYYY-MM-DDTHH:mm:ss.000Z".
 */
export function localStringToDatePreservingTime(localString: string): Date {
  if (!localString) return new Date();

  // Descomponemos manualmente la fecha y la creamos como UTC
  const [datePart, timePart] = localString.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);

  // 👇 Creamos un Date UTC pero con los valores locales sin ajuste
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
}


export function toMySQLDateTime(fechaStr: string): Date {
  // Entrada: "08-10-2025T19:58" (DD-MM-YYYYTHH:mm)
  const [fecha, hora] = fechaStr.split("T");
  const [dia, mes, año] = fecha.split("-").map(Number);
  const [h, m] = hora.split(":").map(Number);

  // ⚠️ Usamos new Date(...) normal → interpreta en hora local del servidor
  return new Date(año, mes - 1, dia, h, m, 0);
}
