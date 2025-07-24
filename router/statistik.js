import express from "express";
import { client } from "../config/config.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.get("/demography", authorize("admin"), async (req, res) => {
  try {
    const queries = {
      provinsi: `
        SELECT a.provinsi, COUNT(*) AS total
        FROM alamat a
        JOIN pendaftar p ON a.userid = p.userid
        WHERE a.provinsi IS NOT NULL
        GROUP BY a.provinsi
        ORDER BY total DESC
        LIMIT 5
      `,
      regional: `
        SELECT a.kota, COUNT(*) AS total
        FROM alamat a
        JOIN pendaftar p ON a.userid = p.userid
        WHERE a.kota IS NOT NULL
        GROUP BY a.kota
        ORDER BY total DESC
        LIMIT 5
      `,
      kecamatan: `
        SELECT a.kecamatan, COUNT(*) AS total
        FROM alamat a
        JOIN pendaftar p ON a.userid = p.userid
        WHERE a.kecamatan IS NOT NULL
        GROUP BY a.kecamatan
        ORDER BY total DESC
        LIMIT 5
      `,
      desa: `
        SELECT a.desa, COUNT(*) AS total
        FROM alamat a
        JOIN pendaftar p ON a.userid = p.userid
        WHERE a.desa IS NOT NULL
        GROUP BY a.desa
        ORDER BY total DESC
        LIMIT 5
      `,
    };

    // Jalankan semua query secara paralel
    const [provinsi, regional, kecamatan, desa] = await Promise.all([
      client.query(queries.provinsi),
      client.query(queries.regional),
      client.query(queries.kecamatan),
      client.query(queries.desa),
    ]);

    const demography = {
      provinsi: provinsi.rows,
      regional: regional.rows,
      kecamatan: kecamatan.rows,
      desa: desa.rows,
    };

    return res.status(200).json(demography);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

router.get("/data-dashboard", authorize("admin"), async (req, res) => {
  try {
    const queries = {
      // Total pendaftar dan statistik jenis kelamin
      pendaftarStats: `
        SELECT 
          COUNT(*) as total_pendaftar,
          COUNT(CASE WHEN kelamin = 'm' THEN 1 END) as total_laki,
          COUNT(CASE WHEN kelamin = 'f' THEN 1 END) as total_perempuan
        FROM pendaftar
      `,

      // Statistik per jenjang
      jenjangStats: `
        SELECT 
          j.nama as jenjang,
          COUNT(p.id) as jumlah_pendaftar
        FROM jenjang j
        LEFT JOIN pendaftar p ON j.id = p.jenjang_id
        GROUP BY j.id, j.nama
      `,

      // Statistik pembayaran
      pembayaranStats: `
        SELECT 
          COUNT(*) as total_transaksi,
          SUM(nominal) as total_pembayaran,
          COUNT(DISTINCT user_id) as total_pembayar,
          ROUND(AVG(nominal)) as rata_rata_pembayaran
        FROM pembayaran
      `,

      // Statistik sekolah
      sekolahStats: `
        SELECT 
          s.nama as nama_sekolah,
          COUNT(p.id) as jumlah_pendaftar
        FROM sekolah s
        LEFT JOIN pendaftar p ON s.id = p.sekolah_id
        GROUP BY s.id, s.nama
        ORDER BY jumlah_pendaftar DESC
        LIMIT 5
      `,

      // Status pendaftaran
      statusStats: `
        SELECT 
          status_pendaftaran,
          COUNT(*) as jumlah
        FROM pendaftar
        GROUP BY status_pendaftaran
      `,

      // Statistik user
      userStats: `
        SELECT 
          COUNT(*) as total_user,
          COUNT(CASE WHEN peran = 'admin' THEN 1 END) as total_admin,
          COUNT(CASE WHEN peran = 'user' THEN 1 END) as total_pengguna
        FROM user_info
      `,
    };

    // Jalankan semua query secara paralel
    const [
      pendaftarStats,
      jenjangStats,
      pembayaranStats,
      sekolahStats,
      statusStats,
      userStats,
    ] = await Promise.all([
      client.query(queries.pendaftarStats),
      client.query(queries.jenjangStats),
      client.query(queries.pembayaranStats),
      client.query(queries.sekolahStats),
      client.query(queries.statusStats),
      client.query(queries.userStats),
    ]);

    // Format response
    const dashboard = {
      pendaftar: {
        total: parseInt(pendaftarStats.rows[0].total_pendaftar),
        laki_laki: parseInt(pendaftarStats.rows[0].total_laki),
        perempuan: parseInt(pendaftarStats.rows[0].total_perempuan),
      },
      jenjang: jenjangStats.rows,
      pembayaran: {
        total_transaksi: parseInt(pembayaranStats.rows[0].total_transaksi),
        total_pembayaran: parseInt(pembayaranStats.rows[0].total_pembayaran),
        total_pembayar: parseInt(pembayaranStats.rows[0].total_pembayar),
        rata_rata_pembayaran: parseInt(
          pembayaranStats.rows[0].rata_rata_pembayaran
        ),
      },
      sekolah_terpopuler: sekolahStats.rows,
      status_pendaftaran: statusStats.rows,
      pengguna: {
        total: parseInt(userStats.rows[0].total_user),
        admin: parseInt(userStats.rows[0].total_admin),
        user: parseInt(userStats.rows[0].total_pengguna),
      },
    };

    res.status(200).json(dashboard);
  } catch (error) {
    console.error("Error in data-dashboard:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/pembayaran", authorize("admin"), async (req, res) => {
  try {
    // Dapatkan query parameter 'days', default ke 7 hari
    const days = req.query.days ? parseInt(req.query.days) : 7;

    // Batasi jumlah hari maksimal ke 30 hari
    const maxDays = Math.min(days, 30);

    // Query data nominal dan tanggal berdasarkan jumlah hari
    const query = `
      SELECT nominal, tgl_bayar 
      FROM pembayaran 
      WHERE tgl_bayar >= NOW() - INTERVAL '${maxDays} days'
      ORDER BY tgl_bayar ASC
    `;

    const result = await client.query(query);

    // Kirim data dalam format JSON
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/sosial-media", async (req, res) => {
  try {
    // Query to get the count of each media type
    const mediaCounts = await client.query(
      `SELECT media, COUNT(*) as count 
       FROM pembayaran 
       GROUP BY media`
    );

    // Total count of all media
    const total = mediaCounts.rows.reduce(
      (acc, item) => acc + parseInt(item.count),
      0
    );

    // Calculate percentage for each media
    const mediaAnalysis = mediaCounts.rows.map((item) => {
      const percentage = ((item.count / total) * 100).toFixed();
      return {
        media: item.media,
        count: item.count,
        percentage: percentage,
      };
    });

    res.status(200).json(mediaAnalysis);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
