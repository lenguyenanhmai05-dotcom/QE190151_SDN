import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] text-center space-y-6 max-w-2xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary border border-secondary text-secondary-foreground text-xs font-semibold tracking-wide uppercase">
          SDN Project Platform
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground" data-testid="page-title">
          Chào mừng bạn đến với hệ thống
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-lg">
          Ứng dụng Next.js App Router, Prisma ORM, Supabase PostgreSQL và hệ thống xác thực Email / Password.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Button asChild size="lg" className="bg-primary hover:bg-[#8F2620] text-primary-foreground px-8 font-medium shadow-md shadow-primary/20" data-testid="home-login-button">
            <Link href="/login">Đăng nhập</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-border hover:bg-muted font-medium" data-testid="home-register-button">
            <Link href="/register">Đăng ký tài khoản</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary via-[#CD5252] to-[#CC8780] p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium uppercase tracking-wider text-white">
            Trang chủ hệ thống
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight" data-testid="page-title">
            Welcome back, {user.name || user.email}!
          </h1>
          <p className="text-white/90 text-sm sm:text-base max-w-xl">
            Bạn đã đăng nhập thành công vào hệ thống. Trang chủ đã sẵn sàng để tích hợp các tính năng theo yêu cầu đề thi.
          </p>
        </div>
        <div className="absolute -right-8 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* User Information & Quick Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border shadow-sm bg-white" data-testid="auth-status-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground">
              Thông tin tài khoản
            </CardTitle>
            <CardDescription className="text-xs">
              Chi tiết người dùng hiện tại
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between py-1.5 border-b border-border/60">
              <span className="text-muted-foreground text-xs">Email:</span>
              <span className="font-medium text-foreground text-xs" data-testid="user-email">
                {user.email}
              </span>
            </div>
            {user.name && (
              <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground text-xs">Họ và tên:</span>
                <span className="font-medium text-foreground text-xs" data-testid="user-name">
                  {user.name}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between py-1.5">
              <span className="text-muted-foreground text-xs">Vai trò (Role):</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-secondary text-secondary-foreground" data-testid="user-role">
                {user.role}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Feature Slot ready for exam */}
        <Card className="border-border shadow-sm bg-white md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground">
              Khu vực chức năng bài thi
            </CardTitle>
            <CardDescription className="text-xs">
              Sẵn sàng kết nối bảng dữ liệu theo đề bài ngày mai
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-xl bg-muted/40 border border-dashed border-border flex flex-col items-center justify-center text-center py-8">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold text-lg mb-2">
                ✓
              </div>
              <h3 className="font-semibold text-sm text-foreground">
                Hệ thống xác thực và cơ sở dữ liệu đã hoạt động hoàn hảo
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-md">
                Khi nhận đề thi vào ngày mai, bạn chỉ cần gửi yêu cầu (ví dụ: quản lý sản phẩm, danh mục, đơn hàng...), các bảng và giao diện sẽ được render ngay tại đây.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <form action="/api/auth/logout" method="POST">
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  className="bg-primary hover:bg-[#8F2620] text-xs font-medium"
                  data-testid="logout-button"
                >
                  Đăng xuất khỏi hệ thống
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
