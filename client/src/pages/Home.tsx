import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { CreditCard, LogOut, BarChart3 } from "lucide-react";

/**
 * Ooredoo Payment System - Home Page
 * Main entry point for payment processing
 */
export default function Home() {
  const { user, loading, error, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-white">Ooredoo Payment System</h1>
          </div>
          {isAuthenticated && (
            <div className="flex items-center gap-4">
              <span className="text-slate-300">{user?.email || "Admin"}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  setLocation("/");
                }}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Payment Card */}
          <Card className="md:col-span-2 bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-500" />
                معالجة الدفع
              </CardTitle>
              <CardDescription className="text-slate-400">
                أدخل بيانات بطاقتك الائتمانية أو استخدم KNET
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    placeholder="965XXXXXXXX"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    المبلغ (د.ك)
                  </label>
                  <input
                    type="number"
                    placeholder="0.000"
                    step="0.001"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    طريقة الدفع
                  </label>
                  <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none">
                    <option value="credit">بطاقة ائتمان</option>
                    <option value="knet">KNET</option>
                  </select>
                </div>
              </div>

              <Button 
                onClick={() => setLocation("/payment")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
              >
                متابعة الدفع
              </Button>
            </CardContent>
          </Card>

          {/* Admin Panel Card */}
          <Card className="bg-slate-800 border-slate-700 hover:border-green-500 transition-colors">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-500" />
                لوحة التحكم
              </CardTitle>
              <CardDescription className="text-slate-400">
                إدارة المعاملات والبيانات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAuthenticated ? (
                <>
                  <p className="text-sm text-slate-300">
                    أنت مسجل دخول كمسؤول
                  </p>
                  <Button
                    onClick={() => setLocation("/dashboard")}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                  >
                    الذهاب إلى لوحة التحكم
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-300">
                    سجل دخولك كمسؤول للوصول إلى لوحة التحكم
                  </p>
                  <Button
                    onClick={() => setLocation("/admin/login")}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                  >
                    تسجيل الدخول
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">معلومات النظام</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-2">
            <p>✅ نظام دفع آمن وموثوق</p>
            <p>✅ دعم بطاقات الائتمان و KNET</p>
            <p>✅ لوحة تحكم متقدمة لإدارة المعاملات</p>
            <p>✅ تقارير وإحصائيات فورية</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
