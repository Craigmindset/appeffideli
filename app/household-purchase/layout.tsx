import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";

export default function HouseholdPurchaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto p-4 sm:p-6">{children}</main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
