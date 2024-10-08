import "@/index.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/context/AuthProvider";
import React from "react";
import ReactDOM from "react-dom/client";
import Layout from "@/components/ui/Base/Layout";
import ErrorPage from "@/components/ErrorPage";
import AuthLoader from "@/components/AuthLoader";
import * as HomeRoute from "@/routes/Home";
import * as ProductRoute from "@/routes/Products";
import * as ProductDetailRoute from "@/routes/ProductDetail";
import * as RegisterRoute from "@/routes/Register";
import * as LoginRoute from "@/routes/Login";
import * as CartRoute from "@/routes/Cart";
import * as OrderHistoryRoute from "@/routes/OrderHistory";
import * as OrderDetailRoute from "@/routes/Order";
import * as ProfileRoute from "@/routes/Profile";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <HomeRoute.Home />,
        loader: HomeRoute.loader,
      },
      {
        path: "/products",
        element: <ProductRoute.Products />,
        loader: ProductRoute.loader,
      },
      {
        path: "/product/:slug",
        element: <ProductDetailRoute.ProductDetail />,
        loader: ProductDetailRoute.loader,
        action: ProductDetailRoute.action,
      },
      {
        path: "/register",
        element: <RegisterRoute.Register />,
        loader: AuthLoader,
        action: RegisterRoute.action,
      },
      {
        path: "/login",
        element: <LoginRoute.Login />,
        loader: AuthLoader,
        action: LoginRoute.action,
      },
      {
        path: "/carts",
        element: <CartRoute.Cart />,
        loader: CartRoute.loader,
        action: CartRoute.action,
      },
      {
        path: "/orders",
        element: <OrderHistoryRoute.OrderHistory />,
        loader: OrderHistoryRoute.loader,
      },
      {
        path: "/order/:orderId",
        element: <OrderDetailRoute.OrderDetail />,
        loader: OrderDetailRoute.loader,
      },
      {
        path: "/profile",
        element: <ProfileRoute.Profile />,
        loader: ProfileRoute.loader,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastContainer />
    </AuthProvider>
  </React.StrictMode>
);
