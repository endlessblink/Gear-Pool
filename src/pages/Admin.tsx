
import { useState } from "react";
import { Plus, Search, Filter, BarChart3, Users, Camera, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import AdminStats from "@/components/AdminStats";
import AdminEquipmentTable from "@/components/AdminEquipmentTable";
import AdminUserTable from "@/components/AdminUserTable";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    { title: "Total Equipment", value: "156", change: "+12", icon: Camera, color: "text-blue-600" },
    { title: "Active Reservations", value: "23", change: "+5", icon: Calendar, color: "text-green-600" },
    { title: "Total Users", value: "89", change: "+8", icon: Users, color: "text-purple-600" },
    { title: "Usage Rate", value: "73%", change: "+2.1%", icon: BarChart3, color: "text-orange-600" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage equipment, users, and monitor system activity
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="reservations">Reservations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AdminStats stats={stats} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { user: "Alex Johnson", action: "Reserved Canon EOS R5", time: "2 hours ago" },
                    { user: "Sarah Chen", action: "Returned Sony FX3", time: "4 hours ago" },
                    { user: "Mike Brown", action: "Equipment maintenance completed", time: "6 hours ago" },
                    { user: "Emma Wilson", action: "New user registration", time: "8 hours ago" }
                  ].map((activity, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">{activity.user}</p>
                        <p className="text-sm text-muted-foreground">{activity.action}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Equipment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Available</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "78%" }}></div>
                      </div>
                      <span className="text-sm">78%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Checked Out</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "15%" }}></div>
                      </div>
                      <span className="text-sm">15%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Maintenance</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "7%" }}></div>
                      </div>
                      <span className="text-sm">7%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Search equipment..." className="pl-10" />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Equipment
            </Button>
          </div>
          
          <AdminEquipmentTable />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Search users..." className="pl-10" />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
          
          <AdminUserTable />
        </TabsContent>

        <TabsContent value="reservations" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Search reservations..." className="pl-10" />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { user: "John Doe", equipment: "Canon EOS R5", dates: "June 15-17", status: "pending" },
                  { user: "Jane Smith", equipment: "Sony FX3", dates: "June 20-22", status: "pending" },
                  { user: "Bob Wilson", equipment: "Lighting Kit", dates: "June 18-20", status: "pending" }
                ].map((reservation, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{reservation.user}</p>
                      <p className="text-sm text-muted-foreground">{reservation.equipment} • {reservation.dates}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Reject</Button>
                      <Button size="sm">Approve</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
