"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, FileText, Youtube } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Recipe {
  id: string;
  title: string;
  description: string;
  recipe_suit: string;
  image_url: string;
  pdf_file: string;
  youtube_link: string;
  created_at: string;
}

export default function RecipeVaultPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSuit, setSelectedSuit] = useState("all");

  // Fetch recipes on mount
  useEffect(() => {
    fetchRecipes();
  }, []);

  // Filter recipes when search or suit changes
  useEffect(() => {
    filterRecipes();
  }, [searchTerm, selectedSuit, recipes]);

  const fetchRecipes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/recipe-vault");
      const data = await response.json();

      if (data.success) {
        setRecipes(data.recipes);
        setFilteredRecipes(data.recipes);
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterRecipes = () => {
    let filtered = recipes;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((recipe) =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by recipe suit
    if (selectedSuit !== "all") {
      filtered = filtered.filter(
        (recipe) => recipe.recipe_suit === selectedSuit,
      );
    }

    setFilteredRecipes(filtered);
  };

  // Get unique recipe suits for filter dropdown
  const recipeSuits = ["all", ...new Set(recipes.map((r) => r.recipe_suit))];

  return (
    <>
      {/* Hero Section */}
      <div className="relative -mx-6 -mt-6 mb-12 bg-gradient-to-r from-orange-500 via-pink-500 to-orange-400 dark:from-orange-600 dark:via-pink-600 dark:to-orange-500 pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Effidelicious Recipe Vault
          </h1>
          <p className="text-lg text-orange-50 max-w-2xl mx-auto">
            A premium collection of tested recipes, meal plans, and cooking
            guides designed to help you create memorable meals with confidence.
          </p>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Image */}
          <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-lg">
            <Image
              src="/newgloria.jpg"
              alt="Effidelicious Recipe Vault"
              fill
              className="object-cover object-center"
              style={{ objectPosition: "center 20%" }}
              priority
            />
          </div>

          {/* Content */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Welcome to the Effidelicious Recipe Vault!
            </h2>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>
                Discover a growing collection of carefully tested recipes
                designed to bring flavor, confidence, and creativity into your
                kitchen. From family meals and baby-friendly dishes to
                international cuisines and special occasion menus, each recipe
                includes detailed instructions, ingredient guides, and practical
                cooking tips.
              </p>
              <p>
                Whether you are a beginner or an experienced cook, our recipes
                are created to help you prepare delicious meals that create
                lasting memories around the table.
              </p>
              <p className="font-semibold text-primary">
                Cook with confidence. Cook with purpose. Cook the Effidelicious
                way.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 md:justify-end">
          {/* Search Input */}
          <div className="relative w-full md:w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search recipes by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Recipe Suit Filter */}
          <Select value={selectedSuit} onValueChange={setSelectedSuit}>
            <SelectTrigger className="w-full md:w-[250px]">
              <SelectValue placeholder="Filter by Recipe Suit" />
            </SelectTrigger>
            <SelectContent>
              {recipeSuits.map((suit) => (
                <SelectItem key={suit} value={suit}>
                  {suit === "all" ? "All Recipe Suits" : suit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          {(searchTerm || selectedSuit !== "all") && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedSuit("all");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Results Count */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
          Showing {filteredRecipes.length} of {recipes.length} recipes
        </p>
      </div>

      {/* Recipe Cards Section */}
      <div className="space-y-8 pb-12">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Loading recipes...
            </p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No recipes found matching your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Recipe Image */}
                <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                  <Image
                    src={recipe.image_url || "/images/placeholder-recipe.jpg"}
                    alt={recipe.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Recipe Content */}
                <div className="p-5 space-y-3">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
                    {recipe.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {recipe.description}
                  </p>

                  {/* Recipe Suit Badge */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium">
                      <FileText className="h-3 w-3" />
                      {recipe.recipe_suit}
                    </span>
                  </div>

                  {/* Action Links */}
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                    {/* PDF Link */}
                    {recipe.pdf_file && (
                      <a
                        href={recipe.pdf_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        Recipe PDF
                      </a>
                    )}

                    {/* YouTube Link */}
                    {recipe.youtube_link && (
                      <a
                        href={recipe.youtube_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-red-600 hover:underline"
                      >
                        <Youtube className="h-4 w-4" />
                        Watch Video
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
