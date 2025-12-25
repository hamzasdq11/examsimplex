import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";

const featuredUniversities = [
  {
    name: "Aligarh Muslim University",
    location: "Aligarh, UP, IN",
    type: "Central University",
    courses: 45,
    slug: "aligarh-muslim-university",
  },
  {
    name: "University of Delhi",
    location: "New Delhi, DL, IN",
    type: "Central University",
    courses: 52,
    slug: "university-of-delhi",
  },
  {
    name: "Banaras Hindu University",
    location: "Varanasi, UP, IN",
    type: "Central University",
    courses: 48,
    slug: "banaras-hindu-university",
  },
  {
    name: "Jawaharlal Nehru University",
    location: "New Delhi, DL, IN",
    type: "Central University",
    courses: 38,
    slug: "jawaharlal-nehru-university",
  },
  {
    name: "University of Hyderabad",
    location: "Hyderabad, TG, IN",
    type: "Central University",
    courses: 35,
    slug: "university-of-hyderabad",
  },
  {
    name: "Jamia Millia Islamia",
    location: "New Delhi, DL, IN",
    type: "Central University",
    courses: 42,
    slug: "jamia-millia-islamia",
  },
];

const Features = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUniversities = featuredUniversities.filter((uni) =>
    uni.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="features" className="py-16 md:py-24 bg-muted/50">
      <div className="container">
        <h2 className="text-3xl md:text-5xl font-display font-bold text-center text-foreground mb-8">
          Find Your School
        </h2>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search schools"
              className="pl-12 h-14 text-lg rounded-xl bg-background border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* University Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredUniversities.map((uni, index) => (
            <Link
              key={index}
              to={`/university/${uni.slug}`}
              className="group block bg-card rounded-xl border-t-4 border-t-primary border border-border p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                {uni.location}
              </p>
              <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {uni.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {uni.type} • {uni.courses} Courses
              </p>
            </Link>
          ))}
        </div>

        {/* See More Button */}
        <div className="text-center">
          <Link to="/get-started">
            <Button variant="outline" size="lg" className="rounded-full px-8">
              See More
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Features;
