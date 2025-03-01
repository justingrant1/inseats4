
import { useState } from "react";
import { Music, Trophy, Theater, Laugh, Calendar } from "lucide-react";

// Category types
const categories = [
  { id: "all", name: "All Events", icon: Calendar },
  { id: "concerts", name: "Concerts", icon: Music },
  { id: "sports", name: "Sports", icon: Trophy },
  { id: "theater", name: "Theater", icon: Theater },
  { id: "comedy", name: "Comedy", icon: Laugh },
];

interface CategorySelectorProps {
  onCategoryChange: (category: string) => void;
  currentCategory?: string;
}

const CategorySelector = ({ 
  onCategoryChange, 
  currentCategory = "all" 
}: CategorySelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    onCategoryChange(categoryId);
  };

  return (
    <div className="w-full overflow-x-auto hide-scrollbar pb-2">
      <div className="flex space-x-2 min-w-max">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`
                flex items-center px-4 py-2 rounded-full transition-all
                ${isSelected 
                  ? "bg-black text-white" 
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"}
              `}
            >
              <Icon size={16} className={isSelected ? "text-gold-500" : ""} />
              <span className="ml-2 font-medium">{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySelector;
