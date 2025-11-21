import { Request, Response, NextFunction } from 'express'에러가 발생했습니다'bigint') {
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