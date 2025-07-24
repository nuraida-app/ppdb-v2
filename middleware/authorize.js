import jwt from "jsonwebtoken";
import { client } from "../config/config.js";

export const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
      return null;
    }

    try {
      // Verifikasi token
      const decode = jwt.verify(token, process.env.JWT);
      const { id, peran } = decode;

      // Query berdasarkan role
      let data;
      data = await client.query(
        `SELECT * FROM user_info WHERE id = $1 AND peran = $2`,
        [id, peran]
      );

      // Cek jika pengguna ditemukan
      if (data.rowCount === 0) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      // Menyimpan data pengguna ke req.user
      req.user = data.rows[0];

      // Memeriksa apakah role pengguna cocok
      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.peran)) {
        return res
          .status(403)
          .json({ message: "Akses ditolak, tidak ada otoritas" });
      }

      // Melanjutkan ke route berikutnya
      next();
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Token tidak valid atau telah kadaluarsa" });
    }
  };
};
