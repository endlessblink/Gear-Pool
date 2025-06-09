
import { Link } from "react-router-dom";
import { Camera, Calendar, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const features = [
    {
      icon: Camera,
      title: "קטלוג ציוד",
      description: "עיין באוסף הציוד המקצועי שלנו לצילום וקולנוע."
    },
    {
      icon: Calendar,
      title: "הזמנות קלות",
      description: "הזמן ציוד עם הממשק האינטואיטיבי שלנו ובדיקת זמינות בזמן אמת."
    },
    {
      icon: Clock,
      title: "זמינות בזמן אמת",
      description: "בדוק את סטטוס הציוד וזמינותו בזמן אמת בכל המחלקות."
    },
    {
      icon: Shield,
      title: "בטוח ואמין",
      description: "בקרת גישה מבוססת תפקידים מבטיחה ניהול בטוח ויעיל של הציוד."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-bl from-blue-50 to-indigo-100 py-24 px-4">
        <div className="max-w-7xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            מערכת השכרת
            <span className="text-primary block">ציוד מקצועית</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
            ייעל את תהליך השאלת הציוד שלך עם מערכת הניהול המקיפה שלנו. 
            מושלמת לבתי ספר לקולנוע, בתי הפקה ומחלקות יצירתיות.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="lg" className="text-xl px-10 py-8 rounded-full hover-lift smooth-transition">
              <Link to="/equipment">עיין בציוד</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-xl px-10 py-8 rounded-full hover-lift smooth-transition">
              <Link to="/reservations">ההזמנות שלי</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              למה לבחור במערכת שלנו?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              נבנתה במיוחד עבור מוסדות חינוך וצוותי הפקה שזקוקים לניהול ציוד אמין.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover-lift smooth-transition rounded-2xl border-2 hover:border-primary/20">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
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
      <section className="bg-primary py-24 px-4">
        <div className="max-w-5xl mx-auto text-center text-primary-foreground">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            מוכן להתחיל?
          </h2>
          <p className="text-xl mb-10 opacity-90 leading-relaxed">
            הצטרף למאות מוסדות שכבר משתמשים במערכת שלנו לניהול ציוד יעיל.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-xl px-10 py-8 rounded-full hover-lift smooth-transition">
            <Link to="/equipment">התחל לעיין</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
