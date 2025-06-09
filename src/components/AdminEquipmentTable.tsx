
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const mockEquipment = [
  { id: "1", name: "Canon EOS R5", category: "Camera", status: "available", lastMaintenance: "2024-05-15" },
  { id: "2", name: "Sony FX3", category: "Camera", status: "checked-out", lastMaintenance: "2024-05-10" },
  { id: "3", name: "Canon 24-70mm f/2.8L", category: "Lens", status: "available", lastMaintenance: "2024-05-20" },
  { id: "4", name: "Aputure 300D Mark II", category: "Lighting", status: "maintenance", lastMaintenance: "2024-06-01" },
  { id: "5", name: "Manfrotto Tripod", category: "Support", status: "available", lastMaintenance: "2024-05-25" }
];

const AdminEquipmentTable = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "checked-out":
        return "bg-red-100 text-red-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipment</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Maintenance</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockEquipment.map((equipment) => (
              <TableRow key={equipment.id}>
                <TableCell className="font-medium">{equipment.name}</TableCell>
                <TableCell>{equipment.category}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(equipment.status)}>
                    {equipment.status.replace("-", " ")}
                  </Badge>
                </TableCell>
                <TableCell>{equipment.lastMaintenance}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">Maintenance</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminEquipmentTable;
