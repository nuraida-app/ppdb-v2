import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { client } from "../config/config.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign({ id: user.id, peran: user.peran }, process.env.JWT, {
    expiresIn: 43200000,
  });
};

router.post("/sign-in", async (req, res) => {
  try {
    const { email, password } = req.body;

    const data = await client.query(
      `SELECT * FROM user_info WHERE email = $1`,
      [email]
    );

    if (data.rowCount === 0) {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }

    const user = data.rows[0];

    // Verifikasi password
    const result = await bcrypt.compare(password, user.password);

    if (!result) {
      return res.status(401).json({ message: "Password salah" });
    }

    const token = generateToken(user);

    // Menyimpan token ke cookie
    return res
      .status(200)
      .cookie("token", token, { httpOnly: true, maxAge: 43200000 })
      .json({ message: "Berhasil masuk", user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/sign-up", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const data = await client.query(
      `SELECT * FROM user_info WHERE email = $1`,
      [email]
    );

    if (data.rowCount > 0) {
      return res.status(500).json({ message: "Email sudah digunakan" });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    const role = "user";
    const user = await client.query(
      `INSERT INTO user_info (nama, email, password, tlp, peran)
       VALUES($1, $2, $3, $4, $5) RETURNING *`,
      [name, email, hash, phone, role]
    );

    const token = generateToken(user.rows[0]);

    // Menyimpan token ke cookie
    return res
      .status(200)
      .cookie("token", token, { httpOnly: true, maxAge: 43200000 }) // 12 jam
      .json({ message: "Pendaftaran Berhasil" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/load", authorize("user", "admin"), async (req, res) => {
  try {
    // Extract token from cookies
    const token = req.cookies.token;

    if (!token) {
      return null;
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT);
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Token kaladuarsa, login kembali" });
    }

    const user = await client.query(`SELECT * FROM user_info WHERE id = $1`, [
      decoded.id,
    ]);

    res.status(200).json(user.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/recovery", async (req, res) => {
  try {
    const { email, password } = req.body;

    const data = await client.query(
      `SELECT * FROM user_info WHERE email = $1`,
      [email]
    );

    if (data.rowCount === 0) {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }

    const user = data.rows[0];
    const hash = await bcrypt.hash(password, 10);

    const update = await client.query(
      `UPDATE user_info SET password = $1 WHERE id = $2`,
      [hash, user.id]
    );

    res.status(200).json({ message: "Password berhasil diubah" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/sign-out", (req, res) => {
  res
    .cookie("token", "", { httpOnly: true, expiresIn: new Date(0) }) // Kadaluarsa segera
    .status(200)
    .json({ message: "Berhasil keluar" });
});

export default router;
