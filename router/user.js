import express from "express";
import { client } from "../config/config.js";
import { authorize } from "../middleware/authorize.js";
import bcrypt from "bcrypt";

const router = express.Router();

router.get("/get", authorize("admin"), async (req, res) => {
  try {
    // Ambil query parameter `page` dan `limit` dari permintaan
    const page = parseInt(req.query.page, 10) || 1; // Halaman default 1
    const limit = parseInt(req.query.limit, 10) || 10; // Batas default 10
    const search = req.query.search;

    // Hitung offset untuk query SQL
    const offset = (page - 1) * limit;

    let users = [];
    let totalPages;

    if (search) {
      // Dapatkan total jumlah data untuk menghitung total halaman
      const totalCountResult = await client.query(
        `SELECT COUNT(*) FROM user_info 
        WHERE LOWER(nama) LIKE LOWER($1) 
        OR LOWER(email) LIKE LOWER($1)`,
        ["%" + search + "%"]
      );
      const totalCount = parseInt(totalCountResult.rows[0].count, 10);

      totalPages = Math.ceil(totalCount / limit);

      // Ambil data berdasarkan halaman dan batas
      const dataResult = await client.query(
        `SELECT * FROM user_info WHERE LOWER(nama) LIKE LOWER($1) 
        OR LOWER(email) LIKE LOWER($1) 
        ORDER BY nama ASC LIMIT $2 OFFSET $3`,
        ["%" + search + "%", limit, offset]
      );

      users = dataResult.rows;
    } else {
      // Dapatkan total jumlah data untuk menghitung total halaman
      const totalCountResult = await client.query(
        "SELECT COUNT(*) FROM user_info"
      );
      const totalCount = parseInt(totalCountResult.rows[0].count, 10);

      totalPages = Math.ceil(totalCount / limit);

      // Ambil data berdasarkan halaman dan batas
      const dataResult = await client.query(
        "SELECT * FROM user_info ORDER BY id DESC LIMIT $1 OFFSET $2",
        [limit, offset]
      );

      users = dataResult.rows;
    }

    // Kembalikan data dan metadata paginasi
    res.json({
      users,
      totalPages,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

router.get("/admin", async (req, res) => {
  try {
    const id = 1;

    const data = await client.query(
      `SELECT id, name, role, email FROM admin WHERE id = $1`,
      [id]
    );

    const admin = data.rows[0];

    res.status(200).json(admin);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/update-profile", authorize("user", "admin"), async (req, res) => {
  try {
    const { nama, email, tlp, oldPassword, newPassword } = req.body;
    const id = req.user.id;

    // Get current user data
    const userResult = await client.query(
      "SELECT * FROM user_info WHERE id = $1",
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const currentUser = userResult.rows[0];

    // If updating password, verify old password first
    if (oldPassword && newPassword) {
      const isValidPassword = await bcrypt.compare(
        oldPassword,
        currentUser.password
      );

      if (!isValidPassword) {
        return res.status(400).json({ message: "Password lama tidak sesuai" });
      }

      // Hash new password
      const hash = await bcrypt.hash(newPassword, 10);

      // Update with new password
      await client.query(
        `UPDATE user_info SET nama = $1, email = $2, password = $3, tlp = $4
        WHERE id = $5`,
        [nama, email, hash, tlp, id]
      );

      await client.query(
        `UPDATE pendaftar SET nama = $1
        WHERE userid = $2`,
        [nama, id]
      );

      return res
        .status(200)
        .json({ message: "Profile dan password berhasil diperbarui" });
    }

    // Update without password
    await client.query(
      `UPDATE user_info SET nama = $1, email = $2, tlp = $3
      WHERE id = $4`,
      [nama, email, tlp, id]
    );

    await client.query(
      `UPDATE pendaftar SET nama = $1
        WHERE userid = $2`,
      [nama, id]
    );

    res.status(200).json({ message: "Profile berhasil diperbarui" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

router.get("/tampilkan", authorize("admin"), async (req, res) => {
  try {
    const data = await client.query(`
      SELECT 
        "user".id, 
        "user".name, 
        "user".role, 
        "user".email, 
        pendaftar.berkas
      FROM "user"
      INNER JOIN pendaftar 
      ON pendaftar.userid = "user".id
    `);

    // Mapping hasil query ke array `users`
    const users = data.rows.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      berkas: user.berkas,
    }));

    res.status(200).json(users); // Kembalikan array `users`
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

// Recovery
router.get("/temukan-email/:email", async (req, res) => {
  try {
    const data = await client.query(`SELECT * FROM "user" WHERE email = $1`, [
      req.params.email,
    ]);

    if (data.rowCount > 0) {
      const user = data.rows[0];

      res.status(200).json({ user, message: "Email ditemukan" });
    } else {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/pulihkan-akun", async (req, res) => {
  try {
    const { email, password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    await client.query(
      `UPDATE "user" SET password = $1
        WHERE email = $2`,
      [hash, email]
    );

    res.status(200).json({ message: "Password password berhasil diperbarui" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Tampilkan user
router.get("/tampilkan-akun", authorize("admin"), async (req, res) => {
  try {
    const data = await client.query(`SELECT * FROM "user"`);

    const users = data.rows;

    res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/logout", authorize("user", "admin"), async (req, res) => {
  try {
    // Clear the session/token
    res.clearCookie("token");
    res.status(200).json({ message: "Berhasil logout" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

// User Dashboard
router.get("/dashboard", authorize("user"), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get pendaftar data
    const pendaftarResult = await client.query(
      `SELECT p.*, j.nama as jenjang_nama, s.nama as sekolah_nama 
       FROM pendaftar p 
       LEFT JOIN jenjang j ON p.jenjang_id = j.id 
       LEFT JOIN sekolah s ON p.sekolah_id = s.id 
       WHERE p.userid = $1`,
      [userId]
    );

    // Get alamat data
    const alamatResult = await client.query(
      `SELECT * FROM alamat WHERE userid = $1`,
      [userId]
    );

    // Get asal_sekolah data
    const asalSekolahResult = await client.query(
      `SELECT * FROM asal_sekolah WHERE userid = $1`,
      [userId]
    );

    // Get pembayaran data
    const pembayaranResult = await client.query(
      `SELECT * FROM pembayaran WHERE user_id = $1 ORDER BY tgl_bayar DESC LIMIT 1`,
      [userId]
    );

    // Get jadwal data
    const jadwalResult = await client.query(
      `SELECT ju.*, j.kegiatan, j.waktu, j.mode 
       FROM jadwal_user ju 
       LEFT JOIN jadwal j ON ju.jadwal_id = j.id 
       WHERE ju.user_id = $1 
       ORDER BY ju.waktu ASC`,
      [userId]
    );

    // Calculate registration progress
    const progress = calculateProgress(
      pendaftarResult.rows[0],
      alamatResult.rows[0],
      asalSekolahResult.rows[0],
      pembayaranResult.rows[0]
    );

    res.status(200).json({
      pendaftar: pendaftarResult.rows[0] || null,
      alamat: alamatResult.rows[0] || null,
      asal_sekolah: asalSekolahResult.rows[0] || null,
      pembayaran: pembayaranResult.rows[0] || null,
      jadwal: jadwalResult.rows || [],
      progress,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

// Helper function to calculate registration progress
function calculateProgress(pendaftar, alamat, asalSekolah, pembayaran) {
  let progress = 0;
  const totalSteps = 4; // Total number of steps in registration

  // Step 1: Check pendaftar data
  if (pendaftar) {
    const requiredPendaftarFields = [
      "nama",
      "nisn",
      "no_kk",
      "nik",
      "no_akta",
      "tempat_lahir",
      "tanggal_lahir",
      "kelamin",
      "agama",
      "anak_ke",
      "jml_saudara",
      "tinggi",
      "berat",
      "kepala",
      "ayah_nik",
      "ayah_nama",
      "ayah_tempat_lahir",
      "ayah_tanggal_lahir",
      "ayah_pendidikan",
      "ayah_pekerjaan",
      "ayah_no_tlp",
      "ibu_nik",
      "ibu_nama",
      "ibu_tempat_lahir",
      "ibu_tanggal_lahir",
      "ibu_pendidikan",
      "ibu_pekerjaan",
      "ibu_no_tlp",
    ];

    const pendaftarComplete = requiredPendaftarFields.every(
      (field) => pendaftar[field]
    );
    if (pendaftarComplete) progress++;
  }

  // Step 2: Check alamat data
  if (alamat) {
    const requiredAlamatFields = [
      "provinsi",
      "kota",
      "kecamatan",
      "desa",
      "alamat",
      "kode_pos",
      "jarak",
      "transportasi",
    ];

    const alamatComplete = requiredAlamatFields.every((field) => alamat[field]);
    if (alamatComplete) progress++;
  }

  // Step 3: Check asal_sekolah data
  if (asalSekolah) {
    const requiredAsalSekolahFields = [
      "npsn",
      "nama",
      "provinsi",
      "kota",
      "kecamatan",
      "desa",
    ];

    const asalSekolahComplete = requiredAsalSekolahFields.every(
      (field) => asalSekolah[field]
    );
    if (asalSekolahComplete) progress++;
  }

  // Step 4: Check payment status
  if (pembayaran && pembayaran.ket) progress++;

  return Math.round((progress / totalSteps) * 100);
}

export default router;
