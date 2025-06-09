
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category)}
              className="capitalize"
            >
              {category === "all" ? "All Categories" : category}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Status</h3>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <Button
              key={status}
              variant={selectedStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => onStatusChange(status)}
              className="capitalize"
            >
              {status === "all" ? "All Status" : status.replace("-", " ")}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EquipmentFilters;
