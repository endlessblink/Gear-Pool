
import { Button } from "@/components/ui/button";

interface EquipmentFiltersProps {
  categories: string[];
  statuses: string[];
  selectedCategory: string;
  selectedStatus: string;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: string) => void;
}

const categoryNames: Record<string, string> = {
  "all": "הכל",
  "Cameras": "מצלמות",
  "Lenses": "עדשות",
  "Audio": "אודיו",
  "Lighting": "תאורה",
  "Support": "תמיכה"
};

const statusNames: Record<string, string> = {
  "all": "כל הסטטוסים",
  "available": "זמין",
  "checked-out": "מושאל",
  "maintenance": "תחזוקה"
};

const EquipmentFilters = ({
  categories,
  statuses,
  selectedCategory,
  selectedStatus,
  onCategoryChange,
  onStatusChange,
}: EquipmentFiltersProps) => {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-lg mb-4 text-gray-900">קטגוריות</h3>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <Button
              key={category}
              variant="ghost"
              size="sm"
              onClick={() => onCategoryChange(category)}
              className={`filter-button ${
                selectedCategory === category ? "active" : ""
              }`}
            >
              {categoryNames[category] || category}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-4 text-gray-900">סטטוס</h3>
        <div className="flex flex-wrap gap-3">
          {statuses.map((status) => (
            <Button
              key={status}
              variant="ghost"
              size="sm"
              onClick={() => onStatusChange(status)}
              className={`filter-button ${
                selectedStatus === status ? "active" : ""
              }`}
            >
              {statusNames[status] || status}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EquipmentFilters;
