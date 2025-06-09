
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
        return "bg-green-50 text-green-700 border-green-200";
      case "checked-out":
        return "bg-red-50 text-red-700 border-red-200";
      case "maintenance":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
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

  const getCategoryText = (category: string) => {
    const categoryNames: Record<string, string> = {
      "Cameras": "מצלמות",
      "Lenses": "עדשות",
      "Audio": "אודיו",
      "Lighting": "תאורה",
      "Support": "תמיכה"
    };
    return categoryNames[category] || category;
  };

  return (
    <Card className="card-hover bg-white border-0 shadow-sm overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-xl">
          <img
            src={equipment.image}
            alt={equipment.name}
            className="w-full h-56 object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute top-4 left-4">
            <Badge className={`${getStatusColor(equipment.status)} border font-medium`}>
              {getStatusText(equipment.status)}
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-white/90 text-gray-700 font-medium">
              {getCategoryText(equipment.category)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <h3 className="font-bold text-xl mb-2 text-gray-900">{equipment.name}</h3>
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">{equipment.description}</p>
        
        <div className="space-y-3">
          {Object.entries(equipment.specifications).slice(0, 3).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">{key}:</span>
              <span className="font-semibold text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0 flex gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 border-gray-200 hover:bg-gray-50"
          disabled={equipment.status !== "available"}
        >
          <Clock className="h-4 w-4 ml-2" />
          הזמנה מהירה
        </Button>
        <Button 
          size="sm" 
          className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
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
