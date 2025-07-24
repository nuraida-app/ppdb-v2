import { configureStore } from "@reduxjs/toolkit";
// otentikasi
import AuthSlice from "./slice/AuthSlice";
import { ApiAuth } from "./api/auth/ApiAuth";
import { ApiUsers } from "./api/auth/ApiUser";

// Admin
import { ApiStatistic } from "./api/admin/ApiStatistic";
import { ApiPeriode } from "./api/admin/ApiPeriode";
import { ApiSchool } from "./api/admin/ApiSchool";
import { ApiGrade } from "./api/admin/ApiGrade";
import { ApiSchedule } from "./api/admin/ApiSchedule";
import { ApiInfo } from "./api/admin/ApiInfo";
import { ApiSetting } from "./api/admin/ApiSetting";

// Payment
import { ApiPayment } from "./api/payment/ApiPayment";

// Form
import { ApiForm } from "./api/form/ApiForm";
import { ApiArea } from "./api/form/ApiArea";

// Quiz
import { ApiQuiz } from "./api/quiz/ApiQuiz";

const isDev = import.meta.env.VITE_MODE === "development";

const store = configureStore({
  reducer: {
    auth: AuthSlice,
    [ApiAuth.reducerPath]: ApiAuth.reducer,
    [ApiUsers.reducerPath]: ApiUsers.reducer,

    // Admin
    [ApiStatistic.reducerPath]: ApiStatistic.reducer,
    [ApiPeriode.reducerPath]: ApiPeriode.reducer,
    [ApiSchool.reducerPath]: ApiSchool.reducer,
    [ApiGrade.reducerPath]: ApiGrade.reducer,
    [ApiSchedule.reducerPath]: ApiSchedule.reducer,
    [ApiInfo.reducerPath]: ApiInfo.reducer,
    [ApiQuiz.reducerPath]: ApiQuiz.reducer,
    [ApiSetting.reducerPath]: ApiSetting.reducer,

    // Payment
    [ApiPayment.reducerPath]: ApiPayment.reducer,

    // Form
    [ApiForm.reducerPath]: ApiForm.reducer,
    [ApiArea.reducerPath]: ApiArea.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      ApiAuth.middleware,
      ApiUsers.middleware,

      // Admin
      ApiStatistic.middleware,
      ApiPeriode.middleware,
      ApiSchool.middleware,
      ApiGrade.middleware,
      ApiSchedule.middleware,
      ApiInfo.middleware,
      ApiQuiz.middleware,
      ApiSetting.middleware,

      // Payment
      ApiPayment.middleware,

      // Form
      ApiForm.middleware,
      ApiArea.middleware,
    ]),
  devTools: isDev,
});

export default store;
