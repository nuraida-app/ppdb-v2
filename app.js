import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

import RouterUsers from "./router/user.js";
import RouterAuth from "./router/auth.js";
import RouterPembayaran from "./router/pembayaran.js";
import RouterTapel from "./router/Tapel.js";
import RouterSekolah from "./router/sekolah.js";
import RouterJenjang from "./router/jenjang.js";
import RouterInfo from "./router/info.js";
import RouterJadwal from "./router/jadwal.js";
import RouterKuis from "./router/kuisioner.js";
import RouterFormulir from "./router/form.js";
import RouterWilayah from "./router/wilayah.js";
import RouterStatistik from "./router/statistik.js";
import RouterSetting from "./router/setting.js";

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/api/users", RouterUsers);
app.use("/api/auth", RouterAuth);
app.use("/api/payment", RouterPembayaran);
app.use("/api/periode", RouterTapel);
app.use("/api/school", RouterSekolah);
app.use("/api/grade", RouterJenjang);
app.use("/api/info", RouterInfo);
app.use("/api/schedule", RouterJadwal);
app.use("/api/quiz", RouterKuis);
app.use("/api/form", RouterFormulir);
app.use("/api/area", RouterWilayah);
app.use("/api/statistic", RouterStatistik);
app.use("/api/setting", RouterSetting);

export default app;
