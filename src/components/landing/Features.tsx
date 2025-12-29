import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { University } from "@/types/database";

const fallbackUniversities = [
  {
    name: "Dr. A.P.J. Abdul Kalam Technical University",
    location: "Lucknow, UP, IN",
    type: "State University",
    courses: 120,
    slug: "aktu",
    bgColor: "bg-rose-50",
    borderColor: "border-t-rose-400",
  },
  {
    name: "University of Delhi",
    location: "New Delhi, DL, IN",
    type: "Central University",
    courses: 52,
    slug: "university-of-delhi",
    bgColor: "bg-sky-50",
    borderColor: "border-t-sky-400",
  },
  {
    name: "Banaras Hindu University",
    location: "Varanasi, UP, IN",
    type: "Central University",
    courses: 48,
    slug: "banaras-hindu-university",
    bgColor: "bg-amber-50",
    borderColor: "border-t-amber-400",
  },
  {
    name: "Jawaharlal Nehru University",
    location: "New Delhi, DL, IN",
    type: "Central University",
    courses: 38,
    slug: "jawaharlal-nehru-university",
    bgColor: "bg-emerald-50",
    borderColor: "border-t-emerald-400",
  },
  {
    name: "University of Hyderabad",
    location: "Hyderabad, TG, IN",
    type: "Central University",
    courses: 35,
    slug: "university-of-hyderabad",
    bgColor: "bg-violet-50",
    borderColor: "border-t-violet-400",
  },
  {
    name: "Jamia Millia Islamia",
    location: "New Delhi, DL, IN",
    type: "Central University",
    courses: 42,
    slug: "jamia-millia-islamia",
    bgColor: "bg-orange-50",
    borderColor: "border-t-orange-400",
  },
];

const bgColors = ["bg-rose-50", "bg-sky-50", "bg-amber-50", "bg-emerald-50", "bg-violet-50", "bg-orange-50"];
const borderColors = ["border-t-rose-400", "border-t-sky-400", "border-t-amber-400", "border-t-emerald-400", "border-t-violet-400", "border-t-orange-400"];

const Features = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUniversities() {
      try {
        const { data, error } = await supabase
          .from('universities')
          .select('*')
          .order('name')
          .limit(6);
        
        if (error) throw error;
        setUniversities(data || []);
      } catch (error) {
        console.error('Error fetching universities:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUniversities();
  }, []);

  const displayUniversities = universities.length > 0
    ? universities.map((uni, i) => ({
        name: uni.full_name,
        location: uni.location,
        type: uni.type,
        courses: 0,
        slug: uni.slug,
        bgColor: bgColors[i % bgColors.length],
        borderColor: borderColors[i % borderColors.length],
      }))
    : fallbackUniversities;

  const filteredUniversities = displayUniversities.filter((uni) =>
    uni.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="features" className="py-8 md:py-10 bg-background">
      <div className="container max-w-6xl mx-auto px-6 md:px-8">
        {/* University Cards Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {filteredUniversities.map((uni, index) => (
              <Link
                key={index}
                to={`/university/${uni.slug}`}
                className={`group block ${uni.bgColor} rounded-xl border-t-4 ${uni.borderColor} border border-border p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
              >
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {uni.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {uni.type} • {uni.location}
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search schools"
              className="pl-12 h-12 text-base rounded-xl bg-background border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
