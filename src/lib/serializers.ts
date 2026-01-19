
export function serializeMongoDoc(doc: any): any {
  if (!doc) return doc;
  
  if (Array.isArray(doc)) {
    return doc.map(serializeMongoDoc);
  }
  
  if (typeof doc === 'object') {
    const result: any = {};
    
    for (const [key, value] of Object.entries(doc)) {
      if (value === undefined || value === null) {
        result[key] = value;
      } else if (value instanceof Date) {
        result[key] = value.toISOString();
      } else if (typeof value === 'object' && (value as any)._id && typeof (value as any).toString === 'function') {
        result[key] = value.toString();
      } else if (typeof value === 'object') {
        result[key] = serializeMongoDoc(value);
      } else {
       
        result[key] = value;
      }
    }
    
    return result;
  }
  
  return doc;
}