import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoadUserMutation } from "./controller/api/auth/ApiAuth";
import { setLogin } from "./controller/slice/AuthSlice";
import Auth from "./pages/auth/Auth";
import { useGetSettingQuery } from "./controller/api/admin/ApiSetting";
import LoadingComponent from "./pages/components/LoadingComponent";
// Optimize lazy loading with prefetch
const AdminDash = lazy(() =>
  import(/* webpackPrefetch: true */ "./pages/admin/Dashboard/AdminDash")
);
const AdminRegister = lazy(() =>
  import(/* webpackPrefetch: true */ "./pages/admin/register/AdminRegister")
);
const AdminRegisterDetail = lazy(() =>
  import(
    /* webpackPrefetch: true */ "./pages/admin/register/AdminRegisterDetail"
  )
);
const AdminPayment = lazy(() =>
  import(/* webpackPrefetch: true */ "./pages/admin/payment/AdminPayment")
);
const AdminPeriode = lazy(() =>
  import(/* webpackPrefetch: true */ "./pages/admin/periode/AdminPeriode")
);
const AdminSchool = lazy(() =>
  import(/* webpackPrefetch: true */ "./pages/admin/School/AdminSchool")
);
const AdminGrade = lazy(() =>
  import(/* webpackPrefetch: true */ "./pages/admin/Grade/AdminGrade")
);

const AdminSchedule = lazy(() =>
  import(/* webpackPrefetch: true */ "./pages/admin/schedule/AdminSchedule")
);

const AdminInfo = lazy(() =>
  import(/* webpackPrefetch: true */ "./pages/admin/info/AdminInfo")
);
const AdminQuiz = lazy(() =>
  import(/* webpackPrefetch: true */ "./pages/admin/questionaire/AdminQuiz")
);
const AdminUser = lazy(() =>
  import(/* webpackPrefetch: true */ "./pages/admin/user/AdminUser")
);
const AdminStatistic = lazy(() =>
  import(/* webpackPrefetch: true */ "./pages/admin/statistic/AdminStatistic")
);
const AdminProfile = lazy(() =>
  import(/* webpackPrefetch: true */ "./pages/admin/profile/AdminProfile")
);
const AdminSetting = lazy(() =>
  import(/* webpackPrefetch: true */ "./pages/admin/setting/AdminSetting")
);

// User Dashboard
const UserDash = lazy(() =>
  import(/* webpackPrefetch: true */ "./pages/user/Dashboard/UserDash")
);

const UserProfile = lazy(() =>
  import(/* webpackPrefetch: true */ "./pages/user/profile/UserProfile")
);

// User Formulir
const Formulir = lazy(() =>
  import(/* webpackPrefetch: true */ "./pages/user/Formulir/Formulir")
);

// User Pembayaran
const Pembayaran = lazy(() =>
  import(/* webpackPrefetch: true */ "./pages/user/Pembayaran/Pembayaran")
);

// User Kuisioner
const Kuisioner = lazy(() =>
  import(/* webpackPrefetch: true */ "./pages/user/Kuisioner/Kuisioner")
);

const App = () => {
  const dispatch = useDispatch();
  const [loadUser] = useLoadUserMutation();

  const { data: setting } = useGetSettingQuery();

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const timeoutPromise = new Promise(
          (_, reject) =>
            setTimeout(() => reject(new Error("Request timed out")), 5000) // Reduced timeout
        );

        const response = await Promise.race([
          loadUser().unwrap(),
          timeoutPromise,
        ]);

        dispatch(setLogin(response));
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    fetchUser();
  }, [dispatch, loadUser]);

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingComponent />}>
        <Routes>
          <Route path="/" element={<Auth data={setting} />} />

          {/* Admin Routes */}
          <Route path="/admin-dashboard" element={<AdminDash />} />
          <Route path="/admin-pendaftar" element={<AdminRegister />} />
          <Route
            path="/admin-pendaftar/:userId"
            element={<AdminRegisterDetail />}
          />
          <Route path="/admin-pembayaran" element={<AdminPayment />} />
          <Route path="/admin-periode" element={<AdminPeriode />} />
          <Route path="/admin-sekolah" element={<AdminSchool />} />
          <Route path="/admin-jenjang" element={<AdminGrade />} />
          <Route path="/admin-jadwal" element={<AdminSchedule />} />
          <Route path="/admin-info" element={<AdminInfo />} />
          <Route path="/admin-kuisioner" element={<AdminQuiz />} />
          <Route path="/admin-user" element={<AdminUser />} />
          <Route path="/admin-statistik" element={<AdminStatistic />} />
          <Route path="/admin-profile" element={<AdminProfile />} />
          <Route path="/admin-setting" element={<AdminSetting />} />

          {/* User Routes */}
          <Route path="/user-dashboard" element={<UserDash />} />
          <Route path="/user-formulir" element={<Formulir />} />
          <Route path="/user-pembayaran" element={<Pembayaran />} />
          <Route path="/user-kuisioner" element={<Kuisioner />} />
          <Route path="/user-profile" element={<UserProfile />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
