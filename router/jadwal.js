import express from "express";
import { authorize } from "../middleware/authorize.js";
import { client } from "../config/config.js";

const router = express.Router();

router.get("/get", authorize("admin", "user"), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search;

    const offset = (page - 1) * limit;

    let schedules = [];
    let totalPages;

    if (search) {
      const totalData = await client.query(
        `SELECT COUNT(*) FROM jadwal
        WHERE LOWER(kegiatan) LIKE LOWER($1)`,
        ["%" + search + "%"]
      );
      const totalCount = parseInt(totalData.rows[0].count, 10);
      totalPages = Math.ceil(totalCount / limit);

      const data = await client.query(
        `SELECT * FROM jadwal WHERE LOWER(kegiatan)
        LIKE LOWER($1) ORDER BY id ASC LIMIT $2 OFFSET $3`,
        ["%" + search + "%", limit, offset]
      );

      schedules = data.rows;
    } else {
      const totalData = await client.query(`SELECT COUNT(*) FROM jadwal`);
      const totalCount = parseInt(totalData.rows[0].count, 10);
      totalPages = Math.ceil(totalCount / limit);

      const data = await client.query(
        `SELECT * FROM jadwal ORDER BY id ASC LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      schedules = data.rows;
    }

    res.status(200).json({ schedules, totalPages });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

router.post("/add", authorize("admin"), async (req, res) => {
  try {
    const { id, time, type, name, mode, quota } = req.body;

    const data = await client.query(`SELECT * FROM jadwal WHERE id = $1`, [id]);

    if (data.rowCount > 0) {
      await client.query(
        `UPDATE jadwal SET waktu = $1, jenis = $2,
            kegiatan = $3, mode = $4, kuota = $5 WHERE id = $6`,
        [time, type, name, mode, quota, id]
      );

      res.status(200).json({ message: "Jadwal berhasil diperbarui" });
    } else {
      await client.query(
        `INSERT INTO jadwal(waktu, jenis, kegiatan, mode, kuota)
            VALUES ($1, $2, $3, $4, $5)`,
        [time, type, name, mode, quota]
      );

      res.status(200).json({ message: "Jadwal berhasil disimpan" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/:id", authorize("admin", "user"), async (req, res) => {
  try {
    const data = await client.query(`SELECT * FROM jadwal WHERE id = $1`, [
      req.params.id,
    ]);

    if (data.rowCount > 0) {
      const jadwal = data.rows[0];

      res.status(200).json(jadwal);
    } else {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/delete/:id", authorize("admin"), async (req, res) => {
  try {
    await client.query(`DELETE FROM jadwal WHERE id = $1`, [req.params.id]);

    res.status(200).json({ message: "Jadwal Berhasil Dihapus" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// User
router.post("/add-user-schedule", authorize("user"), async (req, res) => {
  try {
    const { user_id, schedule_id, activity, time, mode, type } = req.body;

    // Cek apakah user sudah memilih jadwal dengan jenis yang sama
    const existingSchedule = await client.query(
      `SELECT * FROM jadwal_user WHERE user_id = $1 AND jenis = $2`,
      [user_id, type]
    );

    if (existingSchedule.rowCount > 0) {
      return res.status(500).json({ message: "Anda sudah memilih jadwal" });
    }

    // Cek kuota pada jadwal yang dipilih
    const jadwal = await client.query(
      `SELECT kuota FROM jadwal WHERE id = $1`,
      [schedule_id]
    );

    if (jadwal.rowCount === 0) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }

    const kuotaTersisa = jadwal.rows[0].kuota;

    if (kuotaTersisa <= 0) {
      return res
        .status(400)
        .json({ message: "Kuota sudah penuh, silahkan pilih jadwal lain" });
    }

    // Simpan data jadwal_user
    await client.query(
      `INSERT INTO jadwal_user(user_id, jadwal_id, kegiatan, waktu, mode, jenis)
       VALUES($1, $2, $3, $4, $5, $6)`,
      [user_id, schedule_id, activity, time, mode, type]
    );

    // Kurangi kuota jadwal setelah jadwal_user berhasil
    await client.query(`UPDATE jadwal SET kuota = kuota - 1 WHERE id = $1`, [
      schedule_id,
    ]);

    res.status(200).json({ message: "Data berhasil disimpan" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get(
  "/get-user-schedule/:user_id",
  authorize("user", "admin"),
  async (req, res) => {
    try {
      const data = await client.query(
        `SELECT * FROM jadwal_user WHERE user_id = $1`,
        [req.params.user_id]
      );

      const schedules = data.rows;

      res.status(200).json(schedules);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

router.delete(
  "/delete-user-schedule",
  authorize("user", "admin"),
  async (req, res) => {
    try {
      const { user_id, jadwal_id } = req.body;

      // Hapus data jadwal_user
      const result = await client.query(
        `DELETE FROM jadwal_user WHERE user_id = $1 AND jadwal_id = $2 RETURNING *`,
        [user_id, jadwal_id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "jadwal tidak ditemukan" });
      }

      // Tambahkan kembali kuota pada jadwal yang dihapus
      await client.query(`UPDATE jadwal SET kuota = kuota + 1 WHERE id = $1`, [
        jadwal_id,
      ]);

      res.status(200).json({
        message: "Berhasil dihapus",
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

export default router;
