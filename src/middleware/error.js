export default function errorHandler(err, req, res, next) {
  console.log(`ERROR ${err.message}`);
  res.status(500).json({ success: false, message: "INTERNAL ERROR" });
}
