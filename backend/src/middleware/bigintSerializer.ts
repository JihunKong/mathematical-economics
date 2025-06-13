import { Request, Response, NextFunction } from 'express';

// Middleware to handle BigInt serialization
export const bigintSerializer = (_req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  
  res.json = function(data: any) {
    const stringified = JSON.stringify(data, (_key, value) => {
      if (typeof value === 'bigint') {
        return value.toString();
      }
      return value;
    });
    
    res.set('Content-Type', 'application/json');
    return originalJson.call(this, JSON.parse(stringified));
  };
  
  next();
};

// Alternative: Patch global JSON
export const patchBigIntJSON = () => {
  (BigInt.prototype as any).toJSON = function() {
    return this.toString();
  };
};