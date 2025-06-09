
import { Link } from "react-router-dom";
import { Camera, Calendar, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const features = [
    {
      icon: Camera,
      title: "Equipment Catalog",
      description: "Browse our comprehensive collection of professional film and photography equipment."
    },
    {
      icon: Calendar,
      title: "Easy Reservations",
      description: "Book equipment with our intuitive calendar interface and conflict detection."
    },
    {
      icon: Clock,
      title: "Real-time Availability",
      description: "Check equipment status and availability in real-time across all departments."
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Role-based access control ensures equipment is managed safely and efficiently."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Professional Equipment
            <span className="text-primary block">Rental System</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your equipment checkout process with our comprehensive rental management system. 
            Perfect for film schools, production houses, and creative departments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/equipment">Browse Equipment</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link to="/reservations">My Reservations</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose RentLink?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built specifically for educational institutions and production teams who need reliable equipment management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20 px-4">
        <div className="max-w-4xl mx-auto text-center text-primary-foreground">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of institutions already using RentLink to manage their equipment efficiently.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
            <Link to="/equipment">Start Browsing</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
