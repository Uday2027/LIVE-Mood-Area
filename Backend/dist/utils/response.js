// server/src/utils/response.ts
// Standard response helpers — always use these in controllers, never res.json() directly.
export const success = (res, data, statusCode = 200) => {
    res.status(statusCode).json({ success: true, data });
};
export const created = (res, data) => {
    success(res, data, 201);
};
export const fail = (res, message, statusCode = 400) => {
    res.status(statusCode).json({ success: false, error: message });
};
//# sourceMappingURL=response.js.map