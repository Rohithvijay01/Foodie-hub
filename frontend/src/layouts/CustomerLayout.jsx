import { Outlet } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import { useNotifications } from '@/services/notificationService';

export default function CustomerLayout() {
  // Initialize SSE notifications globally for customers
  useNotifications();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#16171d]">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      
      {/* A simple footer for now */}
      <footer className="border-t bg-background py-8 mt-auto">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 Campus Bite - University Canteen Management System</p>
        </div>
      </footer>
    </div>
  );
}
