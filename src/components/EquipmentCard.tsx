
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
        return "Available";
      case "checked-out":
        return "Checked Out";
      case "maintenance":
        return "Maintenance";
      default:
        return status;
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={equipment.image}
            alt={equipment.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 right-4">
            <Badge className={`${getStatusColor(equipment.status)} border`}>
              {getStatusText(equipment.status)}
            </Badge>
          </div>
          <div className="absolute top-4 left-4">
            <Badge variant="secondary">{equipment.category}</Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-foreground">{equipment.name}</h3>
        <p className="text-muted-foreground text-sm mb-4">{equipment.description}</p>
        
        <div className="space-y-2">
          {Object.entries(equipment.specifications).slice(0, 3).map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-muted-foreground capitalize">{key}:</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          disabled={equipment.status !== "available"}
        >
          <Clock className="h-4 w-4 mr-2" />
          Quick Reserve
        </Button>
        <Button 
          size="sm" 
          className="flex-1"
          disabled={equipment.status !== "available"}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Schedule
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EquipmentCard;
