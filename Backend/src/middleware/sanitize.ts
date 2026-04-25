import { Request, Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';

const sanitizeObject = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    return sanitizeHtml(obj, { allowedTags: [], allowedAttributes: {} });
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (typeof obj === 'object') {
    const sanitizedObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitizedObj[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitizedObj;
  }
  return obj;
};

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);
  next();
};
