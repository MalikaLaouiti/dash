export function serializeMongoDoc<T>(doc: any, fields: (keyof T)[]): T {
  const result: any = {};
  
  for (const field of fields) {
    const value = doc[field];
    
    if (value === undefined || value === null) {
      result[field] = value;
    } else if (field === '_id' || field.toString().endsWith('Id')) {
      result[field] = value.toString();
    } else if (value instanceof Date) {
      result[field] = value.toISOString();
    } else {
      result[field] = value;
    }
  }
  
  return result as T;
}