import express from "express";
import { client } from "../config/config.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.get("/get", authorize("admin", "user"), async (req, res) => {
  try {
    const role = req.user.peran;

    if (role === "admin") {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const search = req.query.search;

      const offset = (page - 1) * limit;

      let questions = [];
      let totalPages;

      if (search) {
        const count = await client.query(
          `SELECT COUNT(*) FROM kuis WHERE LOWER(soal) LIKE LOWER($1)`,
          ["%" + search + "%"]
        );

        totalPages = Math.ceil(count.rows[0].count / limit);

        const data = await client.query(
          `SELECT * FROM kuis WHERE LOWER(soal) LIKE LOWER($1) ORDER BY id DESC LIMIT $2 OFFSET $3`,
          ["%" + search + "%", limit, offset]
        );

        questions = data.rows;

        res.status(200).json({ questions, totalPages });
      } else {
        const count = await client.query(`SELECT COUNT(*) FROM kuis`);
        totalPages = Math.ceil(count.rows[0].count / limit);

        const data = await client.query(
          `SELECT * FROM kuis ORDER BY id DESC LIMIT $1 OFFSET $2`,
          [limit, offset]
        );

        questions = data.rows;

        res.status(200).json({ questions, totalPages });
      }
    } else {
      const data = await client.query(`SELECT * FROM kuis ORDER BY id ASC`);

      res.status(200).json(data.rows);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/add", authorize("admin"), async (req, res) => {
  try {
    const { id, type, question, input } = req.body;

    const data = await client.query(`SELECT * FROM kuis WHERE id = $1`, [id]);

    if (data.rowCount > 0) {
      await client.query(
        `UPDATE kuis SET jenis = $1, soal = $2, pengisi = $3 WHERE id = $4`,
        [type, question, input, id]
      );

      res.status(200).json({ message: "Berhasil diperbarui" });
    } else {
      await client.query(
        `INSERT INTO kuis(jenis, soal, pengisi) VALUES ($1, $2, $3)`,
        [type, question, input]
      );

      res.status(200).json({ message: "Berhasil disimpan" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/:id", authorize("admin", "user"), async (req, res) => {
  try {
    const data = await client.query(`SELECT * FROM kuis WHERE id = $1`, [
      req.params.id,
    ]);

    res.status(200).json(data.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/delete/:id", authorize("admin"), async (req, res) => {
  try {
    await client.query(`DELETE FROM kuis WHERE id = $1`, [req.params.id]);

    res.status(200).json({ message: "Pertanyaan Berhasil Dihapus" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Jawaban
router.post("/add-answer", authorize("user"), async (req, res) => {
  try {
    const { userId, quizId, answer } = req.body;

    const data = await client.query(
      `SELECT * FROM jawaban WHERE 
     user_id =$1 AND soal_id = $2`,
      [userId, quizId]
    );

    if (data.rowCount > 0) {
      await client.query(
        `UPDATE jawaban SET jawaban = $1
          WHERE user_id =$2 AND soal_id = $3`,
        [answer, userId, quizId]
      );

      res.status(200).json({ message: "Berhasil disimpan" });
    } else {
      await client.query(
        `INSERT INTO jawaban(user_id, soal_id, jawaban)
        VALUES($1, $2, $3)`,
        [userId, quizId, answer]
      );

      res.status(200).json({ message: "Berhasil disimpan" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

router.get("/answer/:userId", authorize("user", "admin"), async (req, res) => {
  try {
    const data = await client.query(
      `SELECT k.id as soal_id, k.soal, j.jawaban
       FROM kuis k
       LEFT JOIN jawaban j ON j.soal_id = k.id AND j.user_id = $1
       ORDER BY k.id ASC`,
      [req.params.userId]
    );

    res.status(200).json(data.rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
