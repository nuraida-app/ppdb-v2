import express from "express";
import { client } from "../config/config.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.get("/get", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search;

    const offset = (page - 1) * limit;

    if (!page || !limit) {
      const data = await client.query(`SELECT * FROM sekolah`);

      return res.status(200).json(data.rows);
    }

    let schools = [];
    let totalPages;

    if (search) {
      const countResult = await client.query(
        `SELECT COUNT(*) FROM sekolah
        WHERE LOWER(nama) LIKE LOWER($1)`,
        ["%" + search + "%"]
      );
      const totalCount = parseInt(countResult.rows[0].count, 10);
      totalPages = Math.ceil(totalCount / limit);

      const data = await client.query(
        `SELECT * FROM sekolah
        WHERE LOWER(nama) LIKE LOWER($1)
        LIMIT $2 OFFSET $3`,
        ["%" + search + "%", limit, offset]
      );
      schools = data.rows;
    } else {
      const countResult = await client.query(`SELECT COUNT(*) FROM sekolah`);

      const totalCount = parseInt(countResult.rows[0].count, 10);
      totalPages = Math.ceil(totalCount / limit);

      const data = await client.query(
        `SELECT * FROM sekolah LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      schools = data.rows;
    }

    res.status(200).json({ schools, totalPages });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/add", authorize("admin"), async (req, res) => {
  try {
    const { name, id } = req.body;

    const data = await client.query(`SELECT * FROM sekolah WHERE id = $1`, [
      id,
    ]);

    if (data.rowCount > 0) {
      await client.query(`UPDATE sekolah SET nama = $1 WHERE id = $2`, [
        name,
        id,
      ]);

      return res.status(200).json({ message: "Berhasil diperbarui" });
    } else {
      await client.query(`INSERT INTO sekolah(nama) VALUES($1)`, [name]);

      res.status(200).json({ message: "Berhasil ditambahkan" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/:id", authorize("admin"), async (req, res) => {
  try {
    const data = await client.query(`SELECT * FROM sekolah WHERE id = $1`, [
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
    await client.query(`DELETE FROM sekolah WHERE id = $1`, [req.params.id]);

    res.status(200).json({ message: "Berhasil dihapus" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/clear-data", authorize("admin"), async (req, res) => {
  try {
    await client.query(`DELETE FROM sekolah`);

    res.status(200).json({ message: "Database berhasil dihapus" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

export default router;
