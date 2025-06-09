
import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EquipmentCard from "@/components/EquipmentCard";
import EquipmentFilters from "@/components/EquipmentFilters";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Mock data for equipment with Hebrew names
const mockEquipment = [
  {
    id: "1",
    name: "Canon EOS R5",
    category: "Cameras",
    status: "available",
    image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop",
    specifications: {
      רזולוציה: "45MP",
      וידאו: "8K RAW",
      חיבור: "RF Mount"
    },
    description: "מצלמה מקצועית ללא מראה עם יכולות וידאו 8K"
  },
  {
    id: "2",
    name: "Sony FX3",
    category: "Cameras",
    status: "checked-out",
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop",
    specifications: {
      חיישן: "Full Frame",
      הקלטה: "4K 120fps",
      חיבור: "E Mount"
    },
    description: "מצלמת קולנוע מותאמת ליוצרי תוכן"
  },
  {
    id: "3",
    name: "Canon 24-70mm f/2.8L",
    category: "Lenses",
    status: "available",
    image: "https://images.unsplash.com/photo-1606983340187-52e86ca3803f?w=400&h=300&fit=crop",
    specifications: {
      צמצם: "f/2.8",
      מוקד: "24-70mm",
      חיבור: "EF Mount"
    },
    description: "עדשת זום מקצועית לצילום רב תכליתי"
  },
  {
    id: "4",
    name: "Rode VideoMic Pro",
    category: "Audio",
    status: "available",
    image: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&h=300&fit=crop",
    specifications: {
      סוג: "Shotgun",
      הזנה: "Battery/Phantom",
      חיבור: "3.5mm/XLR"
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
      גובה: "165cm",
      עומס: "8kg",
      חומר: "Carbon Fiber"
    },
    description: "חצובה מקצועית מסיבי פחמן"
  },
  {
    id: "6",
    name: "Aputure 300D Mark II",
    category: "Lighting",
    status: "available",
    image: "https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?w=400&h=300&fit=crop",
    specifications: {
      הספק: "300W",
      CRI: "96+",
      שליטה: "Wireless"
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">קטלוג ציוד</h1>
          <p className="text-lg text-gray-600">
            עיין והזמן ציוד מקצועי לפרויקטים שלך
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="search-container max-w-2xl mx-auto p-4">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="חפש ציוד..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-12 pl-4 py-3 text-lg border-0 bg-transparent focus:ring-0 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {/* Mobile Filter Button */}
          <div className="md:hidden mb-4">
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full justify-center">
                  <Filter className="h-4 w-4 ml-2" />
                  מסננים
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="py-6">
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
          <div className="hidden md:block bg-white rounded-2xl p-6 shadow-sm border">
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
          {(selectedCategory !== "all" || selectedStatus !== "all") && (
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedCategory !== "all" && (
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1" 
                  onClick={() => setSelectedCategory("all")}
                >
                  קטגוריה: {selectedCategory} ×
                </Badge>
              )}
              {selectedStatus !== "all" && (
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1" 
                  onClick={() => setSelectedStatus("all")}
                >
                  סטטוס: {selectedStatus} ×
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {filteredEquipment.map((equipment, index) => (
            <div 
              key={equipment.id} 
              className="animate-scale-in" 
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <EquipmentCard equipment={equipment} />
            </div>
          ))}
        </div>

        {filteredEquipment.length === 0 && (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">לא נמצא ציוד</h3>
              <p className="text-gray-600 mb-6">לא נמצא ציוד התואם לקריטריונים שלך</p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedStatus("all");
                }}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                נקה מסננים
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Equipment;
