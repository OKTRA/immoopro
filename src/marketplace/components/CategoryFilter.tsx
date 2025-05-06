import { useState, useEffect } from "react";
import { Category } from "../types";
import { getCategories } from "../services/categoryService";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryFilterProps {
  onSelectCategory: (categoryId: string | null) => void;
  selectedCategoryId: string | null;
}

export default function CategoryFilter({
  onSelectCategory,
  selectedCategoryId,
}: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const { categories: fetchedCategories } = await getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="mb-6">
        <h3 className="mb-3 font-medium">Catégories</h3>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="mb-3 font-medium">Catégories</h3>
      <ScrollArea className="whitespace-nowrap pb-2">
        <div className="flex space-x-2">
          <Button
            variant={selectedCategoryId === null ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectCategory(null)}
          >
            Toutes
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={
                selectedCategoryId === category.id ? "default" : "outline"
              }
              size="sm"
              onClick={() => onSelectCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
