import express from "express";
import { client } from "../config/config.js";
import { authorize } from "../middleware/authorize.js";
import multer from "multer";
import path from "path";

const router = express.Router();

const imgStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./assets/pembayaran");
  },
  filename: (req, file, cb) => {
    const username = req.user.nama.replace(/\s+/g, "_").toLowerCase();
    cb(null, `${username}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const uploadImg = multer({ storage: imgStorage });

router.get("/semua-pembayaran", authorize("admin"), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search;

    const offset = (page - 1) * limit;

    let payments = [];
    let totalPages;

    if (search) {
      const count = await client.query(
        `SELECT COUNT(*) FROM pembayaran
    INNER JOIN user_info ON user_info.id = pembayaran.user_id
    WHERE LOWER(pembayaran.nama) LIKE LOWER($1)
    OR LOWER(user_info.nama) LIKE LOWER($1)`,
        ["%" + search + "%"]
      );

      const total = parseInt(count.rows[0].count, 10);

      totalPages = Math.ceil(total / limit);

      const data = await client.query(
        `SELECT pembayaran.id, pembayaran.nama,
    pembayaran.nominal, pembayaran.berkas, user_info.tlp, pembayaran.user_id,
    pembayaran.ket
    FROM pembayaran
    INNER JOIN user_info ON user_info.id = pembayaran.user_id
    WHERE LOWER(pembayaran.nama) LIKE LOWER($1)
    OR LOWER(user_info.nama) LIKE LOWER($1)
    ORDER BY pembayaran.tgl_bayar DESC
    LIMIT $2 OFFSET $3`,
        ["%" + search + "%", limit, offset]
      );

      payments = data.rows;

      res.status(200).json({ payments, totalPages });
    } else {
      const count = await client.query(`SELECT COUNT(*) FROM pembayaran`);

      const total = parseInt(count.rows[0].count, 10);

      totalPages = Math.ceil(total / limit);

      const data = await client.query(
        `SELECT pembayaran.id, pembayaran.nama,
    pembayaran.nominal, pembayaran.berkas, user_info.tlp, pembayaran.user_id,
    pembayaran.ket
    FROM pembayaran
    INNER JOIN user_info ON user_info.id = pembayaran.user_id
    ORDER BY pembayaran.tgl_bayar DESC
    LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      payments = data.rows;

      res.status(200).json({ payments, totalPages });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

router.get("/data-pembayaran", authorize("admin"), async (req, res) => {
  try {
    const data = await client.query(`SELECT * FROM pembayaran`);

    const jml = data.rowCount;
    const total = data.rows.reduce(
      (total, pembayaran) => total + Number(pembayaran.nominal),
      0
    );

    return res.status(200).json({ jml, total });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

router.get("/:id", authorize("user"), async (req, res) => {
  try {
    const data = await client.query(
      `SELECT * FROM pembayaran 
            INNER JOIN user_info on user_info.id = pembayaran.user_id
             WHERE user_id=$1`,
      [req.params.id]
    );

    if (!data) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    const payment = data.rows[0];

    res.status(200).json(payment);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

router.post(
  "/upload-berkas",
  authorize("user"),
  uploadImg.single("file"),
  async (req, res) => {
    const { nama, nominal, media } = req.body;

    const imgLink = "/assets/pembayaran/" + req.file.filename;

    await client.query(
      `INSERT INTO pembayaran(nama, nominal, berkas, user_id, media)
        VALUES($1, $2, $3, $4, $5) RETURNING *`,
      [nama, nominal, imgLink, req.user.id, media]
    );

    res.status(200).json({ message: "Berkas diterima" });

    try {
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  }
);

router.put(
  "/konfirmasi-pembayaran/:userId",
  authorize("admin"),
  async (req, res) => {
    try {
      const isPaid = true;
      const status = "Diproses";

      const data = await client.query(
        `SELECT * FROM pembayaran WHERE user_id = $1`,
        [req.params.userId]
      );

      if (data.rowCount === 0) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }

      // Konfirmasi pembayaran
      await client.query(`UPDATE pembayaran SET ket = $1 WHERE user_id = $2`, [
        isPaid,
        req.params.userId,
      ]);

      // Mendapatkan jumlah pendaftar yang sudah terkonfirmasi

      const { rows } = await client.query(`SELECT COUNT(*) FROM pendaftar`);

      const totalConfirmed = parseInt(rows[0].count, 10) + 1;

      // Membuat kode pendaftar dinamis
      const kodeDaftar = `PPDB-${String(totalConfirmed).padStart(4, "0")}`;

      // Update kode_pembayaran untuk pendaftar
      await client.query(
        `INSERT INTO pendaftar(userid, kode_pendaftaran, status_pendaftaran) VALUES($1, $2, $3) RETURNING *`,
        [req.params.userId, kodeDaftar, status]
      );

      res.status(200).json({ message: "Pembayaran diterima" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  }
);

export default router;
