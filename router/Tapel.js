import express from "express";
import { client } from "../config/config.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.get("/get", async (req, res) => {
  try {
    const data = await client.query(`SELECT * FROM tapel ORDER BY id ASC`);

    const tapel = data.rows;

    res.status(200).json(tapel);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/add", authorize("admin"), async (req, res) => {
  try {
    const { name, id } = req.body;

    const data = await client.query(`SELECT * FROM tapel WHERE id = $1`, [id]);

    if (data.rowCount > 0) {
      await client.query(`UPDATE tapel SET tapel = $1 WHERE id = $2`, [
        name,
        id,
      ]);

      return res.status(200).json({ message: "Berhasil diperbarui" });
    } else {
      await client.query(`INSERT INTO tapel(tapel) VALUES($1)`, [name]);

      res.status(200).json({ message: "Berhasil ditambahkan" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/:id", authorize("admin"), async (req, res) => {
  try {
    const data = await client.query(`SELECT * FROM tapel WHERE id = $1`, [
      req.params.id,
    ]);

    const education = data.rows[0];

    res.status(200).json(education);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", authorize("admin"), async (req, res) => {
  try {
    await client.query(`DELETE FROM tapel WHERE id = $1`, [req.params.id]);

    res.status(200).json({ message: "Berhasil dihapus" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
