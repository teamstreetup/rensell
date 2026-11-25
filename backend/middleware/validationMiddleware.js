function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: result.error.errors[0]?.message || 'Validation error',
        details: result.error.errors,
      });
    }
    req.validatedBody = result.data;
    next();
  };
}

module.exports = { validateBody };
