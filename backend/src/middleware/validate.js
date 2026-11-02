export function validate({ body, params, query }) {
  return function validateRequest(request, _response, next) {
    for (const [part, schema] of Object.entries({ body, params, query })) {
      if (!schema) continue;

      const result = schema.safeParse(request[part]);
      if (!result.success) {
        return next({
          status: 400,
          message: 'Invalid request data',
          details: result.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }

      request.validated ??= {};
      request.validated[part] = result.data;
    }

    next();
  };
}
