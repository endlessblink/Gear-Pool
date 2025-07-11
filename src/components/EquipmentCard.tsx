
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

interface Equipment {
  id: string;
  name: string;
  category: string;
  status: string;
  image: string;
  specifications: Record<string, string>;
  description: string;
}

interface EquipmentCardProps {
  equipment: Equipment;
}

const EquipmentCard = ({ equipment }: EquipmentCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "checked-out":
        return "bg-red-100 text-red-800 border-red-200";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "זמין";
      case "checked-out":
        return "מושאל";
      case "maintenance":
        return "תחזוקה";
      default:
        return status;
    }
  };

  const getCategoryName = (category: string) => {
    const categoryMap: Record<string, string> = {
      Cameras: "מצלמות",
      Lenses: "עדשות",
      Audio: "אודיו",
      Lighting: "תאורה",
      Support: "חצובות ותמיכה"
    };
    return categoryMap[category] || category;
  };

  const translateSpec = (key: string) => {
    const specMap: Record<string, string> = {
      resolution: "רזולוציה",
      videoCapability: "יכולת וידאו",
      mount: "מאונט",
      sensor: "חיישן",
      recording: "הקלטה",
      aperture: "צמצם",
      focal: "אורך מוקד",
      type: "סוג",
      power: "כוח",
      connection: "חיבור",
      maxHeight: "גובה מקסימלי",
      load: "עומס",
      material: "חומר",
      cri: "CRI"
    };
    return specMap[key] || key;
  };

  return (
    <Card className="group hover-lift smooth-transition rounded-2xl overflow-hidden border-2 hover:border-primary/20">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden">
          <img
            src={equipment.image}
            alt={equipment.name}
            className="w-full h-48 object-cover group-hover:scale-105 smooth-transition"
          />
          <div className="absolute top-4 left-4">
            <Badge className={`${getStatusColor(equipment.status)} border rounded-full px-3 py-1`}>
              {getStatusText(equipment.status)}
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {getCategoryName(equipment.category)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <h3 className="font-bold text-xl mb-2 text-foreground">{equipment.name}</h3>
        <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{equipment.description}</p>
        
        <div className="space-y-3">
          {Object.entries(equipment.specifications).slice(0, 3).map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">{translateSpec(key)}:</span>
              <span className="font-semibold">{value}</span>
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0 flex gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 rounded-full"
          disabled={equipment.status !== "available"}
        >
          <Clock className="h-4 w-4 ml-2" />
          הזמנה מהירה
        </Button>
        <Button 
          size="sm" 
          className="flex-1 rounded-full"
          disabled={equipment.status !== "available"}
        >
          <Calendar className="h-4 w-4 ml-2" />
          תזמון
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EquipmentCard;
