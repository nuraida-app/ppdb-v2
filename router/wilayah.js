import express from "express";
import { client } from "../config/config.js";

const router = express.Router();

router.get("/provinsi", async (req, res) => {
  try {
    const data = await client.query(`
        SELECT * FROM a1_provinsi ORDER BY nama ASC`);

    const trimed = data.rows.map((row) => ({
      id: row.id.trim(),
      nama: row.nama.trim(),
    }));

    res.json(trimed);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:provinsiId/kota", async (req, res) => {
  try {
    const id = req.params.provinsiId;
    const data = await client.query(
      `SELECT * FROM a2_kota WHERE provinsi_id = $1 ORDER BY nama ASC`,
      [id]
    );

    const trimed = data.rows.map((row) => ({
      id: row.id.trim(),
      nama: row.nama.trim(),
    }));

    res.json(trimed);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:kotaId/kecamatan", async (req, res) => {
  try {
    const id = req.params.kotaId;
    const data = await client.query(
      `
        SELECT * FROM a3_kecamatan WHERE regional_id = $1
         ORDER BY nama ASC`,
      [id]
    );

    const trimed = data.rows.map((row) => ({
      id: row.id.trim(),
      nama: row.nama.trim(),
    }));

    res.json(trimed);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:kecamatanId/desa", async (req, res) => {
  try {
    const id = req.params.kecamatanId;

    const data = await client.query(
      `
        SELECT * FROM a4_desa WHERE kecamatan_id = $1
         ORDER BY nama ASC`,
      [id]
    );

    const trimed = data.rows.map((row) => ({
      id: row.id.trim(),
      nama: row.nama.trim(),
    }));

    res.json(trimed);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
