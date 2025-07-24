import express from "express";
import { client } from "../config/config.js";
import { authorize } from "../middleware/authorize.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import xlsx from "xlsx";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ganti spasi dengan _
    const sanitizedUserName = req.user.nama.replace(/\s+/g, "_");
    const userFolder = `./assets/berkas/${sanitizedUserName}`;

    // Buat folder jika belum ada
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }

    cb(null, userFolder);
  },
  filename: (req, file, cb) => {
    const sanitizedUserName = req.user.nama.replace(/\s+/g, "_");
    const sanitizedFileName = file.fieldname.replace(/\s+/g, "_");
    const fileExtension = path.extname(file.originalname);
    cb(null, `${sanitizedUserName}_${sanitizedFileName}${fileExtension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Maksimum ukuran file 10MB
  },
  fileFilter: (req, file, cb) => {
    const fileTypes = /pdf|png|jpe?g/; // PDF, PNG, JPG, JPEG
    const extName = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = fileTypes.test(file.mimetype);

    if (extName && mimeType) {
      return cb(null, true);
    } else {
      cb(new Error("Hanya file PDF, PNG, JPG, atau JPEG yang diizinkan"));
    }
  },
});

// Status pendaftaran
router.get("/proses", authorize("admin"), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search
      ? `%${req.query.search.toLowerCase()}%`
      : null;
    const status = req.query.status;
    const level = req.query.level;

    const offset = (page - 1) * limit;

    let users = [];
    let totalPages;

    let baseQuery = `
      SELECT p.id, p.userid, p.kode_pendaftaran, p.status_pendaftaran, p.nisn, p.nama,
      u.nama AS nama_user, u.tlp AS tlp_user
      FROM pendaftar p
      INNER JOIN user_info u ON p.userid = u.id
    `;
    let countQuery = `SELECT COUNT(*) FROM pendaftar p INNER JOIN user_info u ON p.userid = u.id`;
    let whereClause = [];
    let queryParams = [];
    let paramCount = 1;

    if (status) {
      whereClause.push(`p.status_pendaftaran = $${paramCount}`);
      queryParams.push(status);
      paramCount++;
    }

    if (level) {
      whereClause.push(`p.jenjang_id = $${paramCount}`);
      queryParams.push(level);
      paramCount++;
    }

    if (search) {
      whereClause.push(`(
        LOWER(p.kode_pendaftaran) LIKE $${paramCount} OR
        LOWER(p.nama) LIKE $${paramCount} OR
        CAST(p.nisn AS TEXT) LIKE $${paramCount} OR
        LOWER(u.email) LIKE $${paramCount} OR
        LOWER(u.username) LIKE $${paramCount}
      )`);
      queryParams.push(search);
      paramCount++;
    }

    if (whereClause.length > 0) {
      const whereString = whereClause.join(" AND ");
      baseQuery += ` WHERE ${whereString}`;
      countQuery += ` WHERE ${whereString}`;
    }

    baseQuery += ` ORDER BY p.kode_pendaftaran DESC LIMIT $${paramCount} OFFSET $${
      paramCount + 1
    }`;
    queryParams.push(limit, offset);

    // Get total count
    const count = await client.query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(count.rows[0].count, 10);
    totalPages = Math.ceil(total / limit);

    // Get data
    const data = await client.query(baseQuery, queryParams);
    users = data.rows;

    res.status(200).json({ users, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Detail pendaftaran
router.get("/:userid", authorize("admin", "user"), async (req, res) => {
  try {
    const id = req.params.userid;

    const data1 = await client.query(
      `SELECT jenjang.nama AS jenjang, 
        jenjang.id AS jenjang_id, 
        sekolah.nama AS sekolah, 
        sekolah.id AS sekolah_id,
        tapel.id AS tapel_id, 
        tapel.tapel,
      pendaftar.kode_pendaftaran, pendaftar.status_pendaftaran,
      pendaftar.nisn, pendaftar.no_kk, pendaftar.nik, pendaftar.no_akta,
      pendaftar.nama, pendaftar.tempat_lahir, pendaftar.tanggal_lahir,
      pendaftar.kelamin, pendaftar.agama, pendaftar.anak_ke, pendaftar.jml_saudara,
      pendaftar.tinggi, pendaftar.berat, pendaftar.kepala,
      pendaftar.ayah_nik, pendaftar.ayah_nama, pendaftar.ayah_tempat_lahir, pendaftar.ayah_tanggal_lahir,
      pendaftar.ayah_pendidikan, pendaftar.ayah_pekerjaan, pendaftar.ayah_no_tlp,
      pendaftar.ibu_nik, pendaftar.ibu_nama, pendaftar.ibu_tempat_lahir, pendaftar.ibu_tanggal_lahir,
      pendaftar.ibu_pendidikan, pendaftar.ibu_pekerjaan, pendaftar.ibu_no_tlp, 
      pendaftar.createdat, pendaftar.userid
      FROM pendaftar 
       INNER JOIN jenjang ON jenjang.id = pendaftar.jenjang_id
         INNER JOIN tapel ON tapel.id = pendaftar.tapel_id
         INNER JOIN sekolah ON sekolah.id = pendaftar.sekolah_id
          WHERE userid = $1`,
      [id]
    );

    const data2 = await client.query(
      `SELECT * FROM keluarga WHERE user_id = $1`,
      [id]
    );
    const data3 = await client.query(`SELECT * FROM alamat WHERE userid = $1`, [
      id,
    ]);
    const data4 = await client.query(
      `SELECT * FROM asal_sekolah WHERE userid = $1`,
      [id]
    );
    const data5 = await client.query(
      `SELECT * FROM berkas WHERE user_id = $1`,
      [id]
    );

    if (data1.rowCount > 0) {
      const formulir = data1.rows[0];
      const families = data2.rows;
      const address = data3.rows[0];
      const school = data4.rows[0];
      const documents = data5.rows;

      res.status(200).json({ formulir, families, address, school, documents });
    } else {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Isi Formulir
// Biodata
router.post("/data-diri", authorize("user"), async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      tapel,
      jenjang,
      sekolah,
      nisn,
      no_kk,
      nik,
      no_akta,
      nama_lengkap,
      tempat_lahir,
      tanggal_lahir,
      kelamin,
      agama,
      anak_ke,
      jml_saudara,
      tb,
      bb,
      lingkar_kepala,
    } = req.body;

    const data = await client.query(
      `SELECT * FROM pendaftar WHERE userid = $1`,
      [userId]
    );

    if (data.rowCount > 0) {
      await client.query(
        `UPDATE pendaftar SET jenjang_id = $1, tapel_id = $2, sekolah_id = $3, nisn = $4,
                no_kk = $5, nik = $6, no_akta = $7, nama = $8, tempat_lahir = $9, tanggal_lahir = $10,
                kelamin = $11, agama = $12, anak_ke = $13, jml_saudara = $14, tinggi = $15,
                berat = $16, kepala = $17 WHERE userid = $18`,
        [
          jenjang,
          tapel,
          sekolah,
          nisn,
          no_kk,
          nik,
          no_akta,
          nama_lengkap,
          tempat_lahir,
          tanggal_lahir,
          kelamin,
          agama,
          anak_ke,
          jml_saudara,
          tb,
          bb,
          lingkar_kepala,
          userId,
        ]
      );

      res.status(200).json({ message: "Data berhasil diperbarui" });
    } else {
      res.status(404).json({ message: "Lakukan Pembayaran Terlebih Dahulu" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Orang Tua
router.post("/orangtua", authorize("user"), async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      ayah_nik,
      ayah_nama,
      ayah_tempat_lahir,
      ayah_tanggal_lahir,
      ayah_pendidikan,
      ayah_pekerjaan,
      ayah_no_tlp,
      ibu_nik,
      ibu_nama,
      ibu_tempat_lahir,
      ibu_tanggal_lahir,
      ibu_pendidikan,
      ibu_pekerjaan,
      ibu_no_tlp,
    } = req.body;

    const data = await client.query(
      `SELECT * FROM pendaftar WHERE userid = $1`,
      [userId]
    );

    if (data.rowCount > 0) {
      await client.query(
        `UPDATE pendaftar SET ayah_nik = $1, ayah_nama = $2, ayah_tempat_lahir = $3,
        ayah_tanggal_lahir = $4, ayah_pendidikan = $5, ayah_pekerjaan = $6,
         ayah_no_tlp = $7, ibu_nik = $8, ibu_nama = $9,
        ibu_tempat_lahir = $10, ibu_tanggal_lahir = $11, ibu_pendidikan = $12, ibu_pekerjaan = $13,
         ibu_no_tlp = $14 WHERE userid = $15`,
        [
          ayah_nik,
          ayah_nama,
          ayah_tempat_lahir,
          ayah_tanggal_lahir,
          ayah_pendidikan,
          ayah_pekerjaan,
          ayah_no_tlp,
          ibu_nik,
          ibu_nama,
          ibu_tempat_lahir,
          ibu_tanggal_lahir,
          ibu_pendidikan,
          ibu_pekerjaan,
          ibu_no_tlp,
          userId,
        ]
      );

      return res.status(200).json({ message: "Data Berhasil disipan" });
    } else {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

router.post("/keluarga", authorize("user"), async (req, res) => {
  try {
    const { nama, tgl } = req.body;

    const userId = req.user.id;

    await client.query(
      `INSERT INTO keluarga(user_id, nama, tanggal_lahir) VALUES($1, $2, $3) RETURNING *`,
      [userId, nama, tgl]
    );

    return res.status(200).json({ message: "Data Berhasil disimpan" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

router.get("/keluarga/:id", authorize("user"), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await client.query(
      `SELECT * FROM keluarga WHERE user_id = $1 ORDER BY tanggal_lahir`,
      [id]
    );

    const families = data.rows;

    res.status(200).json(families);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/hapus-keluarga/:id", authorize("user"), async (req, res) => {
  try {
    const id = req.params.id;

    await client.query(`DELETE FROM keluarga WHERE id = $1`, [id]);

    res.status(200).json({ message: "Berhasil dihapus" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

// Alamat
router.post("/alamat", authorize("user"), async (req, res) => {
  try {
    const {
      alamat,
      desa,
      jarak,
      kecamatan,
      kode_pos,
      kota,
      transportasi,
      provinsi,
    } = req.body;
    const userId = req.user.id;

    const data = await client.query(`SELECT * from alamat WHERE userid = $1`, [
      userId,
    ]);

    if (data.rowCount > 0) {
      await client.query(
        `UPDATE alamat SET alamat = $1, desa = $2, jarak = $3, 
      kecamatan = $4, kode_pos = $5, kota = $6, transportasi = $7, 
      provinsi = $8 WHERE userid = $9`,
        [
          alamat,
          desa,
          jarak,
          kecamatan,
          kode_pos,
          kota,
          transportasi,
          provinsi,
          userId,
        ]
      );
      return res.status(200).json({ message: "Data berhasil diperbarui" });
    } else {
      await client.query(
        `INSERT INTO alamat(userid, alamat, desa, jarak, kecamatan, 
          kode_pos, kota, transportasi, provinsi) 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          userId,
          alamat,
          desa,
          jarak,
          kecamatan,
          kode_pos,
          kota,
          transportasi,
          provinsi,
        ]
      );
      return res.status(200).json({ message: "Data berhasil disimpan" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

// Asal Sekolah
router.post("/asal-sekolah", authorize("user"), async (req, res) => {
  try {
    const { desa, kecamatan, kota, nama, npsn, provinsi } = req.body;
    const userId = req.user.id;

    const data = await client.query(
      `SELECT * from asal_sekolah WHERE userid = $1`,
      [userId]
    );

    if (data.rowCount > 0) {
      await client.query(
        `UPDATE asal_sekolah SET desa = $1, kecamatan = $2, kota = $3, 
          nama = $4, npsn = $5, provinsi = $6 WHERE userid = $7`,
        [desa, kecamatan, kota, nama, npsn, provinsi, userId]
      );
      return res.status(200).json({ message: "Data berhasil diperbarui" });
    } else {
      await client.query(
        `INSERT INTO asal_sekolah(userid, desa, kecamatan, kota, nama, 
          npsn, provinsi) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [userId, desa, kecamatan, kota, nama, npsn, provinsi]
      );
      return res.status(200).json({ message: "Data berhasil disimpan" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

// Berrkas
router.post("/berkas", authorize("user"), upload.any(), async (req, res) => {
  try {
    const sanitizedUserName = req.user.nama.replace(/\s+/g, "_");
    const filePath = req.files[0].fieldname;
    const fileExtension = path.extname(req.files[0].originalname);
    const fileLink = `${process.env.SERVER}/assets/berkas/${sanitizedUserName}/${sanitizedUserName}_${filePath}${fileExtension}`;

    const id = req.user.id;
    const file_name = req.body.name;

    const data = await client.query(`SELECT * FROM berkas WHERE user_id = $1`, [
      id,
    ]);

    if (data.rowCount > 0 && data.rows[0].file_name === file_name) {
      await client.query(
        `UPDATE berkas SET file_link = $1 WHERE user_id = $2`,
        [fileLink, id]
      );

      res.status(200).json({ message: "Berhasil diperbarui" });
    } else {
      await client.query(
        `INSERT INTO berkas(user_id, file_name, file_link) VALUES($1, $2, $3) RETURNING *`,
        [id, file_name, fileLink]
      );

      res.status(200).json({ message: "Data berhasil disimpan" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

// Rubah status
router.put("/ubah-status", authorize("admin"), async (req, res) => {
  try {
    const { status, id } = req.query;

    await client.query(
      `UPDATE pendaftar SET status_pendaftaran = $1 WHERE userid = $2`,
      [status, id]
    );

    res.status(200).json({ message: "Status pendaftaran berhasil diperbarui" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/hapus-berkas/:id", authorize("user"), async (req, res) => {
  try {
    const id = req.params.id;

    // 1. Ambil data file dari database
    const data = await client.query(`SELECT * FROM berkas WHERE id = $1`, [id]);
    if (data.rowCount === 0) {
      return res.status(404).json({ message: "Berkas tidak ditemukan" });
    }
    const fileLink = data.rows[0].file_link;

    // 2. Hapus file fisik jika ada
    if (fileLink) {
      let filePath = fileLink;
      // Hilangkan domain jika ada
      if (filePath.startsWith("http")) {
        filePath = "/" + filePath.split("/").slice(3).join("/");
      }
      // Hilangkan undefined jika ada
      filePath = filePath.replace(/^undefined/, "");
      // Pastikan path relatif dari root project
      filePath = "." + filePath;

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // 3. Hapus data dari database
    await client.query(`DELETE FROM berkas WHERE id = $1`, [id]);

    res.status(200).json({ message: "Berkas berhasil dihapus" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

// Download data formulir berdasarkan tapel id
router.get("/download/:tapel/:tapelname", async (req, res) => {
  try {
    const tapel = req.params.tapel;
    const tapelname = req.params.tapelname;

    // 1. Query all pendaftar for the given tapel, join with jenjang, sekolah, tapel
    const pendaftarQuery = await client.query(
      `SELECT 
        p.id, p.userid, p.kode_pendaftaran, p.nisn, p.no_kk, p.nik, p.no_akta, p.nama, p.tempat_lahir, p.tanggal_lahir, p.kelamin, p.agama, p.anak_ke, p.jml_saudara, p.tinggi, p.berat, p.kepala,
        p.ayah_nik, p.ayah_nama, p.ayah_tempat_lahir, p.ayah_tanggal_lahir, p.ayah_pendidikan, p.ayah_pekerjaan, p.ayah_no_tlp,
        p.ibu_nik, p.ibu_nama, p.ibu_tempat_lahir, p.ibu_tanggal_lahir, p.ibu_pendidikan, p.ibu_pekerjaan, p.ibu_no_tlp,
        j.nama AS jenjang, s.nama AS sekolah, t.tapel AS satuan_pendidikan
      FROM pendaftar p
      INNER JOIN jenjang j ON j.id = p.jenjang_id
      INNER JOIN sekolah s ON s.id = p.sekolah_id
      INNER JOIN tapel t ON t.id = p.tapel_id
      WHERE p.tapel_id = $1
      ORDER BY p.kode_pendaftaran ASC`,
      [tapel]
    );
    const pendaftarList = pendaftarQuery.rows;

    // 2. For each pendaftar, fetch alamat and asal_sekolah
    const userIds = pendaftarList.map((p) => p.userid);
    let alamatMap = {};
    let sekolahMap = {};
    if (userIds.length > 0) {
      const alamatQuery = await client.query(
        `SELECT * FROM alamat WHERE userid = ANY($1)`,
        [userIds]
      );
      alamatQuery.rows.forEach((row) => {
        alamatMap[row.userid] = row;
      });
      const sekolahQuery = await client.query(
        `SELECT * FROM asal_sekolah WHERE userid = ANY($1)`,
        [userIds]
      );
      sekolahQuery.rows.forEach((row) => {
        sekolahMap[row.userid] = row;
      });
    }

    // 3. Compose data for Excel
    const dataExcel = pendaftarList.map((p) => {
      const alamat = alamatMap[p.userid] || {};
      const asal = sekolahMap[p.userid] || {};
      return {
        // A. DATA PENDAFTARAN
        "Kode Pendaftaran": p.kode_pendaftaran,
        "Satuan Pendidikan": p.satuan_pendidikan || "",
        Sekolah: p.sekolah || "",
        Jenjang: p.jenjang || "",
        // B. DATA PRIBADI
        "Nama Lengkap": p.nama,
        NISN: p.nisn,
        NIK: p.nik,
        "No. KK": p.no_kk,
        "No. Akta": p.no_akta,
        "Tempat Lahir": p.tempat_lahir,
        "Tanggal Lahir": p.tanggal_lahir,
        "Jenis Kelamin": p.kelamin === "m" ? "Laki-laki" : "Perempuan",
        Agama: p.agama,
        "Anak Ke": p.anak_ke,
        "Jumlah Saudara": p.jml_saudara,
        "Tinggi Badan": p.tinggi,
        "Berat Badan": p.berat,
        "Lingkar Kepala": p.kepala,
        // C. DATA ORANG TUA
        "Nama Ayah": p.ayah_nama,
        "NIK Ayah": p.ayah_nik,
        "Tempat Lahir Ayah": p.ayah_tempat_lahir,
        "Tanggal Lahir Ayah": p.ayah_tanggal_lahir,
        "Pendidikan Ayah": p.ayah_pendidikan,
        "Pekerjaan Ayah": p.ayah_pekerjaan,
        "No. Telp Ayah": p.ayah_no_tlp,
        "Nama Ibu": p.ibu_nama,
        "NIK Ibu": p.ibu_nik,
        "Tempat Lahir Ibu": p.ibu_tempat_lahir,
        "Tanggal Lahir Ibu": p.ibu_tanggal_lahir,
        "Pendidikan Ibu": p.ibu_pendidikan,
        "Pekerjaan Ibu": p.ibu_pekerjaan,
        "No. Telp Ibu": p.ibu_no_tlp,
        // D. DATA ALAMAT
        Alamat: alamat.alamat || "",
        "Desa/Kelurahan": alamat.desa || "",
        Kecamatan: alamat.kecamatan || "",
        "Kota/Kabupaten": alamat.kota || "",
        Provinsi: alamat.provinsi || "",
        "Kode Pos": alamat.kode_pos || "",
        "Jarak ke Sekolah": alamat.jarak || "",
        Transportasi: alamat.transportasi || "",
        // E. DATA SEKOLAH ASAL
        "Nama Sekolah Asal": asal.nama || "",
        NPSN: asal.npsn || "",
        "Desa/Kelurahan Asal": asal.desa || "",
        "Kecamatan Asal": asal.kecamatan || "",
        "Kota/Kabupaten Asal": asal.kota || "",
        "Provinsi Asal": asal.provinsi || "",
      };
    });

    // 4. Create Excel workbook
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(dataExcel);
    xlsx.utils.book_append_sheet(workbook, worksheet, "Data Pendaftar");
    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    // 5. Send as download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=pendaftar-${tapelname}.xlsx`
    );
    res.setHeader("Content-Length", buffer.length);
    res.send(buffer);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

export default router;
