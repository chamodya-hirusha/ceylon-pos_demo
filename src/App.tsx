import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import { ShortcutProvider } from "@/contexts/ShortcutContext";
import { ShopProvider } from "@/contexts/ShopContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import POSScreen from "./components/pos/POSScreen";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import SalesHistory from "./pages/admin/SalesHistory";
import Inventory from "./pages/admin/Inventory";
import Employees from "./pages/admin/Employee";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import History from "./pages/pos/History";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: ('admin' | 'manager' | 'cashier')[] }> = ({
  children,
  allowedRoles = ['admin', 'manager', 'cashier'],
}) => {
  const { isAuthenticated, userType } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (userType && !allowedRoles.includes(userType)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, userType } = useAuth();

  return (
    <Routes>
      {/* Public route - Login */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            (userType === 'admin' || userType === 'manager') ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/pos" replace />
            )
          ) : (
            <Index />
          )
        }
      />

      {/* POS Terminal - For cashiers and admin */}
      <Route
        path="/pos"
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'cashier']}>
            <CartProvider>
              <POSScreen />
            </CartProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pos/history"
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'cashier']}>
            <History />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="pos" element={
          <CartProvider>
            <POSScreen />
          </CartProvider>
        } />
        <Route path="products" element={<Products />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="sales" element={<SalesHistory />} />
        <Route path="reports" element={<Reports />} />
        <Route path="employee" element={<Employees />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <ShopProvider>
        <AuthProvider>
          <ShortcutProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </ShortcutProvider>
        </AuthProvider>
      </ShopProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
