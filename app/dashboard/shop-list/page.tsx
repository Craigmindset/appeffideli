"use client";

import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Leaf,
  Beef,
  Wheat,
  Flame,
  Milk,
  Star,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Mock reviews data
const reviews = [
  {
    id: 1,
    name: "Amara",
    image: "/images/avatar1.jpg",
    rating: 5,
    review:
      "The shop list has completely transformed my meal prep! So organized and efficient.",
  },
  {
    id: 2,
    name: "Chioma",
    image: "/images/avatar2.jpg",
    rating: 5,
    review:
      "I save so much time at the market now. Everything is categorized perfectly!",
  },
  {
    id: 3,
    name: "Blessing",
    image: "/images/avatar3.jpg",
    rating: 4,
    review:
      "Love how detailed it is. My family eats healthier since I started using it.",
  },
  {
    id: 4,
    name: "Ngozi",
    image: "/images/avatar4.jpg",
    rating: 5,
    review:
      "Best shopping guide for Nigerian meals. No more forgetting ingredients!",
  },
  {
    id: 5,
    name: "Funmi",
    image: "/images/avatar5.jpg",
    rating: 5,
    review: "So helpful for meal planning and budgeting. Highly recommend!",
  },
];

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
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const nextReview = () => {
    setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentReviewIndex(
      (prev) => (prev - 1 + reviews.length) % reviews.length
    );
  };

  const currentReview = reviews[currentReviewIndex];

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
          columnWidth - 2
        );
        pdf.text(
          subtitleLines,
          xPosition,
          yPosition + titleLines.length * 3 + 2
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
        <p className="text-muted-foreground mt-2">
          Your comprehensive guide to smart grocery shopping
        </p>
      </div>

      {/* First Section: Description & Reviews */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Description */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">
              Transform Your Meal Preparation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              The Effideli Shop List has revolutionized the way families
              approach meal preparation, making grocery shopping more efficient
              and stress-free. Our carefully curated shopping guide helps you:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>
                  <strong>Save Time:</strong> Organized categories mean faster
                  shopping trips
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>
                  <strong>Eat Healthier:</strong> Balanced selection across all
                  food groups
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>
                  <strong>Reduce Waste:</strong> Buy exactly what you need for
                  your meal plans
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>
                  <strong>Budget Better:</strong> Clear categories help track
                  spending
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Reviews Slider */}
        <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 dark:from-secondary/10 dark:to-secondary/20">
          <CardHeader>
            <CardTitle>What Our Clients Say</CardTitle>
            <CardDescription>Real reviews from satisfied users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={currentReview.image}
                      alt={currentReview.name}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {currentReview.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {currentReview.name}
                    </h3>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < currentReview.rating
                              ? "fill-yellow-500 text-yellow-500"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <blockquote className="text-muted-foreground italic border-l-4 border-primary pl-4 py-2 min-h-[80px]">
                  "{currentReview.review}"
                </blockquote>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={prevReview}
                    className="rounded-full"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex gap-2">
                    {reviews.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentReviewIndex(index)}
                        className={`h-2 w-2 rounded-full transition-all ${
                          index === currentReviewIndex
                            ? "bg-primary w-6"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                        aria-label={`Go to review ${index + 1}`}
                      />
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextReview}
                    className="rounded-full"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                  <CardTitle className="text-lg">{category.title}</CardTitle>
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
                        <span className={`${category.color} font-bold mt-0.5`}>
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
    </div>
  );
}
