
import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EquipmentCard from "@/components/EquipmentCard";
import EquipmentFilters from "@/components/EquipmentFilters";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Mock data for equipment with Hebrew descriptions
const mockEquipment = [
  {
    id: "1",
    name: "Canon EOS R5",
    category: "Cameras",
    status: "available",
    image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop",
    specifications: {
      resolution: "45MP",
      videoCapability: "8K RAW",
      mount: "RF Mount"
    },
    description: "מצלמה מירורלס מקצועית עם יכולת וידאו 8K"
  },
  {
    id: "2",
    name: "Sony FX3",
    category: "Cameras",
    status: "checked-out",
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop",
    specifications: {
      sensor: "Full Frame",
      recording: "4K 120fps",
      mount: "E Mount"
    },
    description: "מצלמת קולנוע מותאמת ליצירת תוכן"
  },
  {
    id: "3",
    name: "Canon 24-70mm f/2.8L",
    category: "Lenses",
    status: "available",
    image: "https://images.unsplash.com/photo-1606983340187-52e86ca3803f?w=400&h=300&fit=crop",
    specifications: {
      aperture: "f/2.8",
      focal: "24-70mm",
      mount: "EF Mount"
    },
    description: "עדשת זום מקצועית לצילום מגוון"
  },
  {
    id: "4",
    name: "Rode VideoMic Pro",
    category: "Audio",
    status: "available",
    image: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&h=300&fit=crop",
    specifications: {
      type: "Shotgun",
      power: "Battery/Phantom",
      connection: "3.5mm/XLR"
    },
    description: "מיקרופון מקצועי למצלמה"
  },
  {
    id: "5",
    name: "Manfrotto Tripod",
    category: "Support",
    status: "maintenance",
    image: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400&h=300&fit=crop",
    specifications: {
      maxHeight: "165cm",
      load: "8kg",
      material: "Carbon Fiber"
    },
    description: "מערכת חצובה מקצועית מסיבי פחמן"
  },
  {
    id: "6",
    name: "Aputure 300D Mark II",
    category: "Lighting",
    status: "available",
    image: "https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?w=400&h=300&fit=crop",
    specifications: {
      power: "300W",
      cri: "96+",
      control: "Wireless"
    },
    description: "תאורת LED מקצועית עם שליטה אלחוטית"
  }
];

const Equipment = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const categories = ["all", "Cameras", "Lenses", "Audio", "Lighting", "Support"];
  const statuses = ["all", "available", "checked-out", "maintenance"];

  const filteredEquipment = mockEquipment.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

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
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-foreground mb-3">קטלוג ציוד</h1>
        <p className="text-muted-foreground text-lg">
          עיין והזמן ציוד מקצועי לפרויקטים שלך
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="חיפוש ציוד..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-12 rounded-full border-2 h-12 text-lg"
            />
          </div>
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden rounded-full px-6">
                <Filter className="h-5 w-5 ml-2" />
                פילטרים
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="mt-8">
                <EquipmentFilters
                  categories={categories}
                  statuses={statuses}
                  selectedCategory={selectedCategory}
                  selectedStatus={selectedStatus}
                  onCategoryChange={setSelectedCategory}
                  onStatusChange={setSelectedStatus}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Filters */}
        <div className="hidden md:block glass-effect rounded-2xl p-6">
          <EquipmentFilters
            categories={categories}
            statuses={statuses}
            selectedCategory={selectedCategory}
            selectedStatus={selectedStatus}
            onCategoryChange={setSelectedCategory}
            onStatusChange={setSelectedStatus}
          />
        </div>

        {/* Active Filters */}
        <div className="flex flex-wrap gap-3">
          {selectedCategory !== "all" && (
            <Badge 
              variant="secondary" 
              className="cursor-pointer rounded-full px-4 py-2 hover:bg-secondary/80 smooth-transition" 
              onClick={() => setSelectedCategory("all")}
            >
              קטגוריה: {getCategoryName(selectedCategory)} ×
            </Badge>
          )}
          {selectedStatus !== "all" && (
            <Badge 
              variant="secondary" 
              className="cursor-pointer rounded-full px-4 py-2 hover:bg-secondary/80 smooth-transition" 
              onClick={() => setSelectedStatus("all")}
            >
              סטטוס: {getStatusName(selectedStatus)} ×
            </Badge>
          )}
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEquipment.map((equipment) => (
          <EquipmentCard key={equipment.id} equipment={equipment} />
        ))}
      </div>

      {filteredEquipment.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-xl mb-6">לא נמצא ציוד המתאים לקריטריונים שלך.</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
              setSelectedStatus("all");
            }}
            className="rounded-full px-8 py-3"
          >
            נקה את כל הפילטרים
          </Button>
        </div>
      )}
    </div>
  );
};

export default Equipment;
