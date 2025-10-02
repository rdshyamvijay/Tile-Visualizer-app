import AdminHeader from "@/components/app/admin-header";
import { AdminSidebar } from "@/components/app/admin-sidebar";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen">
        <Sidebar>
          <AdminSidebar />
        </Sidebar>
        <SidebarInset>
          <AdminHeader />
          <main className="p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
