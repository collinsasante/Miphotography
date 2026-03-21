import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 bg-[#FAFAF9]">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
