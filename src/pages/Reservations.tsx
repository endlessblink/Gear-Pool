
import { useState } from "react";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for reservations
const mockReservations = [
  {
    id: "1",
    equipmentName: "Canon EOS R5",
    equipmentImage: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop",
    status: "confirmed",
    startDate: "2024-06-15",
    endDate: "2024-06-17",
    purpose: "Student Film Project",
    returnLocation: "Equipment Room A"
  },
  {
    id: "2",
    equipmentName: "Sony FX3",
    equipmentImage: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop",
    status: "pending",
    startDate: "2024-06-20",
    endDate: "2024-06-22",
    purpose: "Documentary Shoot",
    returnLocation: "Equipment Room B"
  },
  {
    id: "3",
    equipmentName: "Aputure 300D Mark II",
    equipmentImage: "https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?w=400&h=300&fit=crop",
    status: "active",
    startDate: "2024-06-10",
    endDate: "2024-06-12",
    purpose: "Portrait Session",
    returnLocation: "Equipment Room A"
  },
  {
    id: "4",
    equipmentName: "Canon 24-70mm f/2.8L",
    equipmentImage: "https://images.unsplash.com/photo-1606983340187-52e86ca3803f?w=400&h=300&fit=crop",
    status: "completed",
    startDate: "2024-06-01",
    endDate: "2024-06-03",
    purpose: "Wedding Photography",
    returnLocation: "Equipment Room A"
  }
];

const Reservations = () => {
  const [activeTab, setActiveTab] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "pending":
        return "Pending Approval";
      case "active":
        return "Currently Rented";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const filterReservations = (status: string) => {
    if (status === "all") return mockReservations;
    return mockReservations.filter((reservation) => reservation.status === status);
  };

  const ReservationCard = ({ reservation }: { reservation: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <img
              src={reservation.equipmentImage}
              alt={reservation.equipmentName}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <CardTitle className="text-lg">{reservation.equipmentName}</CardTitle>
              <p className="text-sm text-muted-foreground">{reservation.purpose}</p>
            </div>
          </div>
          <Badge className={`${getStatusColor(reservation.status)} border`}>
            {getStatusText(reservation.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{reservation.startDate} to {reservation.endDate}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>Return to: {reservation.returnLocation}</span>
        </div>
        
        <div className="flex gap-2 pt-2">
          {reservation.status === "pending" && (
            <>
              <Button variant="outline" size="sm" className="flex-1">
                Cancel
              </Button>
              <Button size="sm" className="flex-1">
                Contact Admin
              </Button>
            </>
          )}
          {reservation.status === "confirmed" && (
            <>
              <Button variant="outline" size="sm" className="flex-1">
                Modify
              </Button>
              <Button size="sm" className="flex-1">
                Check Details
              </Button>
            </>
          )}
          {reservation.status === "active" && (
            <Button size="sm" className="w-full">
              Return Equipment
            </Button>
          )}
          {reservation.status === "completed" && (
            <Button variant="outline" size="sm" className="w-full">
              Reserve Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Reservations</h1>
        <p className="text-muted-foreground">
          Track and manage your equipment reservations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filterReservations("all").map((reservation) => (
            <ReservationCard key={reservation.id} reservation={reservation} />
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {filterReservations("pending").map((reservation) => (
            <ReservationCard key={reservation.id} reservation={reservation} />
          ))}
        </TabsContent>

        <TabsContent value="confirmed" className="space-y-4">
          {filterReservations("confirmed").map((reservation) => (
            <ReservationCard key={reservation.id} reservation={reservation} />
          ))}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {filterReservations("active").map((reservation) => (
            <ReservationCard key={reservation.id} reservation={reservation} />
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {filterReservations("completed").map((reservation) => (
            <ReservationCard key={reservation.id} reservation={reservation} />
          ))}
        </TabsContent>
      </Tabs>

      {filterReservations(activeTab).length === 0 && (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">No reservations found.</p>
          <Button className="mt-4">
            Browse Equipment
          </Button>
        </div>
      )}
    </div>
  );
};

export default Reservations;
