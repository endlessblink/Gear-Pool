
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const mockUsers = [
  { id: "1", name: "Alex Johnson", email: "alex.johnson@university.edu", role: "student", department: "Film Studies", status: "active" },
  { id: "2", name: "Sarah Chen", email: "sarah.chen@university.edu", role: "faculty", department: "Photography", status: "active" },
  { id: "3", name: "Mike Brown", email: "mike.brown@university.edu", role: "admin", department: "IT", status: "active" },
  { id: "4", name: "Emma Wilson", email: "emma.wilson@university.edu", role: "student", department: "Media Arts", status: "inactive" },
  { id: "5", name: "Dr. Smith", email: "dr.smith@university.edu", role: "faculty", department: "Film Studies", status: "active" }
];

const AdminUserTable = () => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "faculty":
        return "bg-blue-100 text-blue-800";
      case "student":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active" 
      ? "bg-green-100 text-green-800" 
      : "bg-gray-100 text-gray-800";
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge className={getRoleColor(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user.department}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(user.status)}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">
                      {user.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
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

export default AdminUserTable;
