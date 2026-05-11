function notFoundHandler(_req, res) {
  res.status(404).json({ message: "Route not found" });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  const status = Number(err.status || 500);
  const message =
    status === 500 ? "Internal server error" : err.message || "Request failed";

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({ message });
}

module.exports = { notFoundHandler, errorHandler };

