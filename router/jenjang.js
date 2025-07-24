import express from "express";
import { client } from "../config/config.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.get("/get", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    const search = req.query.search;

    const offset = (page - 1) * limit;

    if (!page || !limit) {
      const data = await client.query(`SELECT * FROM jenjang`);
      return res.status(200).json(data.rows);
    }

    let levels = [];
    let totalPages;

    if (search) {
      const totalData = await client.query(
        `SELECT COUNT(*) FROM jenjang
      WHERE LOWER(nama) LIKE LOWER($1)`,
        ["%" + search + "%"]
      );
      const totalCount = parseInt(totalData.rows[0].count, 10);
      totalPages = Math.ceil(totalCount / limit);

      const data = await client.query(
        `SELECT * FROM jenjang
      WHERE LOWER(nama) LIKE LOWER($1) LIMIT $2 OFFSET $3`,
        ["%" + search + "%", limit, offset]
      );

      levels = data.rows;
    } else {
      const totalData = await client.query(`SELECT COUNT(*) FROM jenjang`);
      const totalCount = parseInt(totalData.rows[0].count, 10);
      totalPages = Math.ceil(totalCount / limit);

      const data = await client.query(
        `SELECT * FROM jenjang LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      levels = data.rows;
    }

    res.status(200).json({ levels, totalPages });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/add", authorize("admin"), async (req, res) => {
  try {
    const { name, id } = req.body;

    const data = await client.query(`SELECT * FROM jenjang WHERE id = $1`, [
      id,
    ]);

    if (data.rowCount > 0) {
      await client.query(`UPDATE jenjang SET nama = $1 WHERE id = $2`, [
        name,
        id,
      ]);

      return res.status(200).json({ message: "Berhasil diperbarui" });
    } else {
      await client.query(`INSERT INTO jenjang(nama) VALUES($1)`, [name]);

      res.status(200).json({ message: "Berhasil ditambahkan" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/:id", authorize("admin"), async (req, res) => {
  try {
    const data = await client.query(`SELECT * FROM jenjang WHERE id = $1`, [
      req.params.id,
    ]);

    const education = data.rows[0];

    res.status(200).json(education);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/delete/:id", authorize("admin"), async (req, res) => {
  try {
    await client.query(`DELETE FROM jenjang WHERE id = $1`, [req.params.id]);

    res.status(200).json({ message: "Berhasil dihapus" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
