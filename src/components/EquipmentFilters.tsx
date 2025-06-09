
import { Button } from "@/components/ui/button";

interface EquipmentFiltersProps {
  categories: string[];
  statuses: string[];
  selectedCategory: string;
  selectedStatus: string;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: string) => void;
}

const EquipmentFilters = ({
  categories,
  statuses,
  selectedCategory,
  selectedStatus,
  onCategoryChange,
  onStatusChange,
}: EquipmentFiltersProps) => {
  const getCategoryName = (category: string) => {
    const categoryMap: Record<string, string> = {
      all: "כל הקטגוריות",
      Cameras: "מצלמות",
      Lenses: "עדשות",
      Audio: "אודיו",
      Lighting: "תאורה",
      Support: "חצובות ותמיכה"
    };
    return categoryMap[category] || category;
  };

  const getStatusName = (status: string) => {
    const statusMap: Record<string, string> = {
      all: "כל הסטטוסים",
      available: "זמין",
      "checked-out": "מושאל",
      maintenance: "תחזוקה"
    };
    return statusMap[status] || status;
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold mb-4 text-lg">קטגוריות</h3>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category)}
              className="rounded-full px-6 py-2 smooth-transition hover-lift"
            >
              {getCategoryName(category)}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4 text-lg">סטטוס</h3>
        <div className="flex flex-wrap gap-3">
          {statuses.map((status) => (
            <Button
              key={status}
              variant={selectedStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => onStatusChange(status)}
              className="rounded-full px-6 py-2 smooth-transition hover-lift"
            >
              {getStatusName(status)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EquipmentFilters;
