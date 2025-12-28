import { Search, ArrowRight } from "lucide-react";
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
    <section id="features" className="py-20 md:py-28 bg-muted/30">
      <div className="container px-[10%]">
        <h2 className="text-3xl md:text-4xl font-serif font-semibold text-center text-foreground mb-10">
          Find Your School
        </h2>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-14">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search schools"
              className="pl-12 h-14 text-base rounded-xl bg-background border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* University Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {filteredUniversities.map((uni, index) => (
            <Link
              key={index}
              to={`/university/${uni.slug}`}
              className="group block bg-card rounded-xl border-t-4 border-t-primary border border-border p-6 hover:shadow-md transition-all duration-200"
            >
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                {uni.location}
              </p>
              <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors flex items-center justify-between">
                {uni.name}
                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
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
