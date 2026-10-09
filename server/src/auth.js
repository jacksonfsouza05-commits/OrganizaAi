import "dotenv/config";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error("Falta o JWT_SECRET no .env");
  process.exit(1);
}

export const gerarToken = (id) => jwt.sign({ id }, secret, { expiresIn: "7d" });

export function exigirLogin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ erro: "Faça login para continuar" });
  try {
    req.estudanteId = jwt.verify(token, secret).id;
    next();
  } catch {
    res.status(401).json({ erro: "Sessão expirada, entre de novo" });
  }
}
