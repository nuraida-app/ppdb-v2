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

    let query = "SELECT * FROM info";
    let countQuery = "SELECT COUNT(*) FROM info";
    let queryParams = [];

    let infos = [];
    let results = [];

    if (search) {
      query += " WHERE judul ILIKE $1";
      countQuery += " WHERE judul ILIKE $1";
      queryParams.push(`%${search}%`);

      results = await client.query(
        query + " ORDER BY id ASC LIMIT $2 OFFSET $3",
        [queryParams[0], limit, offset]
      );
      results = results.rows;
    } else {
      infos = await client.query(
        query + " ORDER BY id ASC LIMIT $1 OFFSET $2",
        [limit, offset]
      );
      infos = infos.rows;

      const totalData = await client.query(countQuery);
      const totalCount = parseInt(totalData.rows[0].count, 10);
      const totalPages = Math.ceil(totalCount / limit);

      return res.status(200).json({ infos, results: [], totalPages });
    }

    res.status(200).json({ infos: [], results, totalPages: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

router.post("/add", authorize("admin"), async (req, res) => {
  try {
    const { value, category, id, title } = req.body;

    const data = await client.query(`SELECT * FROM info WHERE id = $1`, [id]);

    if (data.rowCount > 0) {
      await client.query(
        `UPDATE info SET teks = $1, judul = $2 WHERE id = $3`,
        [value, title, id]
      );

      res.status(200).json({ message: "Berhasil diperbarui" });
    } else {
      await client.query(
        `INSERT INTO info(judul, teks, kategori) VALUES($1, $2, $3)
        RETURNING *`,
        [title, value, category]
      );

      res.status(200).json({ message: "Berhasil ditambahkan" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/:id", authorize("admin"), async (req, res) => {
  try {
    const data = await client.query(`SELECT * FROM info WHERE id = $1`, [
      req.params.id,
    ]);

    const post = data.rows[0];

    res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/delete/:id", authorize("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    await client.query(`DELETE FROM info WHERE id = $1`, [id]);

    res.status(200).json({ message: "Berhasil dihapus" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
