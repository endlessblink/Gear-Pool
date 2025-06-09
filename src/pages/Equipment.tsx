
import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EquipmentCard from "@/components/EquipmentCard";
import EquipmentFilters from "@/components/EquipmentFilters";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Mock data for equipment
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
    description: "Professional mirrorless camera with 8K video capability"
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
    description: "Cinema camera optimized for content creation"
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
    description: "Professional zoom lens for versatile shooting"
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
    description: "Professional on-camera microphone"
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
    description: "Professional carbon fiber tripod system"
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
    description: "Professional LED light with wireless control"
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
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Equipment Catalog</h1>
        <p className="text-muted-foreground">
          Browse and reserve professional equipment for your projects
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <EquipmentFilters
                categories={categories}
                statuses={statuses}
                selectedCategory={selectedCategory}
                selectedStatus={selectedStatus}
                onCategoryChange={setSelectedCategory}
                onStatusChange={setSelectedStatus}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Filters */}
        <div className="hidden md:block">
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
        <div className="flex flex-wrap gap-2">
          {selectedCategory !== "all" && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedCategory("all")}>
              Category: {selectedCategory} ×
            </Badge>
          )}
          {selectedStatus !== "all" && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedStatus("all")}>
              Status: {selectedStatus} ×
            </Badge>
          )}
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.map((equipment) => (
          <EquipmentCard key={equipment.id} equipment={equipment} />
        ))}
      </div>

      {filteredEquipment.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No equipment found matching your criteria.</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
              setSelectedStatus("all");
            }}
            className="mt-4"
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default Equipment;
