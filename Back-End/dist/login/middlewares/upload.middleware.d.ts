/**
 * Single image upload — max 5MB
 */
export declare const uploadSingleImage: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Multiple images upload — max 10 files, each max 5MB
 */
export declare const uploadMultipleImages: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Single video upload — max 100MB
 */
export declare const uploadSingleVideo: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Generic file upload — max 10MB
 */
export declare const uploadGenericFile: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Multiple generic files — max 10 files, each max 10MB
 */
export declare const uploadMultipleFiles: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=upload.middleware.d.ts.map