"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Leaf,
  Beef,
  Wheat,
  Flame,
  Milk,
  Download,
  Calendar,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { createBrowserSupabaseClient } from "@/lib/supabase";

const shopCategories = [
  {
    icon: Leaf,
    title: "Herbs & Vegetables",
    subtitle: "(Fresh produce – usually bought first)",
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    items: [
      "Spinach / Ugu",
      "Waterleaf",
      "Lettuce",
      "Cabbage",
      "Carrots",
      "Tomatoes",
      "Pepper (bell / chili)",
      "Onions",
      "Cucumbers",
      "Okra",
      "Green beans",
    ],
  },
  {
    icon: Beef,
    title: "Proteins",
    subtitle: "(Main body-building foods)",
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    items: [
      "Chicken",
      "Beef",
      "Goat meat",
      "Fish (fresh / frozen)",
      "Stockfish",
      "Dried fish",
      "Eggs",
      "Turkey",
      "Snails",
    ],
  },
  {
    icon: Wheat,
    title: "Grains & Carbohydrates",
    subtitle: "(Energy foods & staples)",
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    items: [
      "Rice",
      "Beans",
      "Spaghetti / Pasta",
      "Yam",
      "Potatoes",
      "Garri",
      "Bread",
      "Noodles",
      "Oats",
    ],
  },
  {
    icon: Flame,
    title: "Spices, Oils & Seasonings",
    subtitle: "(Flavor & cooking essentials)",
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    items: [
      "Salt",
      "Curry powder",
      "Thyme",
      "Seasoning cubes",
      "Pepper mix",
      "Ginger",
      "Garlic",
      "Palm oil",
      "Vegetable oil",
      "Ground crayfish",
    ],
  },
  {
    icon: Milk,
    title: "Dairy & Others",
    subtitle: "(Breakfast, snacks & extras)",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    items: [
      "Milk",
      "Cheese",
      "Butter / Margarine",
      "Yogurt",
      "Sugar",
      "Tea",
      "Coffee",
      "Snacks",
      "Fruits (apples, bananas, oranges)",
    ],
  },
];

export default function ShopListPage() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(
    null,
  );
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndSubscription = async () => {
      try {
        const supabase = createBrowserSupabaseClient();

        // Check if user is authenticated
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          setSubscriptionStatus("unauthenticated");
          return;
        }

        // Check subscription status from users_profile table
        const { data: profileData, error: profileError } = await supabase
          .from("users_profile")
          .select("meal_subscription_status")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          setSubscriptionStatus("error");
          return;
        }

        const status = profileData?.meal_subscription_status;
        setSubscriptionStatus(status);
      } catch (err) {
        console.error("Authentication check failed:", err);
        setSubscriptionStatus("error");
      }
    };

    checkAuthAndSubscription();
  }, []);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      // Create a new jsPDF instance
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Add title
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Effideli Shop List", 105, 15, { align: "center" });

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("Your comprehensive guide to smart grocery shopping", 105, 22, {
        align: "center",
      });

      let yPosition = 35;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 15;
      const lineHeight = 6;
      const columnWidth = 35;
      const columns = 5;
      const startX = margin;

      // Add categories
      shopCategories.forEach((category, categoryIndex) => {
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 20;
        }

        // Calculate column position
        const columnIndex = categoryIndex % columns;
        const xPosition = startX + columnIndex * columnWidth;

        // Reset Y position for new row
        if (columnIndex === 0 && categoryIndex > 0) {
          yPosition += 70; // Space between rows
        }

        // If first column, set the Y position for this row
        if (columnIndex === 0) {
          // Check if we need a new page
          if (yPosition > pageHeight - 80) {
            pdf.addPage();
            yPosition = 20;
          }
        }

        // Category title
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        const titleLines = pdf.splitTextToSize(category.title, columnWidth - 2);
        pdf.text(titleLines, xPosition, yPosition);

        // Subtitle
        pdf.setFontSize(6);
        pdf.setFont("helvetica", "italic");
        const subtitleLines = pdf.splitTextToSize(
          category.subtitle,
          columnWidth - 2,
        );
        pdf.text(
          subtitleLines,
          xPosition,
          yPosition + titleLines.length * 3 + 2,
        );

        // Items
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");
        let itemY =
          yPosition + titleLines.length * 3 + subtitleLines.length * 2.5 + 2;

        category.items.forEach((item, itemIndex) => {
          const itemText = `${itemIndex + 1}. ${item}`;
          const itemLines = pdf.splitTextToSize(itemText, columnWidth - 2);
          pdf.text(itemLines, xPosition, itemY);
          itemY += itemLines.length * 3.5;
        });
      });

      // Add footer
      const pageCount = (pdf as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "italic");
        pdf.text(`Effideli - Page ${i} of ${pageCount}`, 105, pageHeight - 10, {
          align: "center",
        });
      }

      // Save the PDF
      pdf.save("Effideli-Shop-List.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8" ref={contentRef}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Effideli Shop List
        </h1>
        <p className="text-muted-foreground mt-2 mx-auto">
          The Effideli Shop List has revolutionized the way families approach
          meal preparation, making grocery shopping more efficient and
          stress-free. Our carefully curated shopping guide helps you:
        </p>
      </div>

      {/* Show subscription prompt if user doesn't have an active subscription */}
      {subscriptionStatus !== "active" ? (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  You are currently not subscribed to any plan
                </h3>
                <p className="text-muted-foreground">
                  Please click "Get Plan" to begin your meal planning journey
                </p>
              </div>
              <Button
                onClick={() => router.push("/services/meal-plan-subscription")}
                size="lg"
                className="mt-4"
              >
                Get Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Second Section: Shopping Categories */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Shopping Categories</h2>
              <Button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="gap-2 whitespace-nowrap"
                size="lg"
              >
                {isDownloading ? (
                  <>
                    <Download className="h-4 w-4 animate-pulse" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {shopCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <Card
                    key={category.title}
                    className={`${category.bgColor} border-2 hover:shadow-lg transition-shadow`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`p-2 rounded-lg bg-white dark:bg-gray-800 ${category.color}`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>
                      <CardTitle className="text-lg">
                        {category.title}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {category.subtitle}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.items.map((item, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span
                              className={`${category.color} font-bold mt-0.5`}
                            >
                              {index + 1}.
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
