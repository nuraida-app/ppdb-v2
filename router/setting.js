import express from "express";
import { client } from "../config/config.js";
import { authorize } from "../middleware/authorize.js";
import multer from "multer";
import path from "path";

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./server/assets/cbt/images");
  },

  filename: function (req, file, cb) {
    cb(
      null,
      path.parse(file.originalname).name +
        "-" +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});

const uploadImage = multer({ storage: imageStorage });

const router = express.Router();

router.put(
  "/update-setting",
  authorize("admin"),
  uploadImage.single("logo"),
  async (req, res) => {
    try {
      const { nama, deskripsi } = req.body;

      if (req.file) {
        logo = `/assets/web/${req.file.filename}`;

        await client.query(
          `UPDATE setting SET nama = $1, deskripsi = $2, logo = $3 WHERE id = 1`,
          [nama, deskripsi, logo]
        );

        res.status(200).json({ message: "Berhasil diperbarui" });
      } else {
        await client.query(
          `UPDATE setting SET nama = $1, deskripsi = $2 WHERE id = 1`,
          [nama, deskripsi]
        );

        res.status(200).json({ message: "Berhasil diperbarui" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }
);

router.get("/get-setting", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM setting");

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
