import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { University } from "@/types/database";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

const fallbackUniversities = [
  {
    name: "Dr. A.P.J. Abdul Kalam Technical University",
    location: "Lucknow, UP, IN",
    type: "State University",
    slug: "aktu",
  },
  {
    name: "University of Delhi",
    location: "New Delhi, DL, IN",
    type: "Central University",
    slug: "university-of-delhi",
  },
  {
    name: "Banaras Hindu University",
    location: "Varanasi, UP, IN",
    type: "Central University",
    slug: "banaras-hindu-university",
  },
  {
    name: "Jawaharlal Nehru University",
    location: "New Delhi, DL, IN",
    type: "Central University",
    slug: "jawaharlal-nehru-university",
  },
  {
    name: "University of Hyderabad",
    location: "Hyderabad, TG, IN",
    type: "Central University",
    slug: "university-of-hyderabad",
  },
  {
    name: "Jamia Millia Islamia",
    location: "New Delhi, DL, IN",
    type: "Central University",
    slug: "jamia-millia-islamia",
  },
];

// Pastel background colors for variety
const bgColors = ["bg-rose-50", "bg-sky-50", "bg-amber-50", "bg-emerald-50", "bg-violet-50", "bg-cyan-50"];
// Matching border top colors
const borderColors = ["border-t-rose-300", "border-t-sky-300", "border-t-amber-300", "border-t-emerald-300", "border-t-violet-300", "border-t-cyan-300"];

const Features = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [universities, setUniversities] = useState<University[]>([]);
  const [allUniversities, setAllUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);

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

  const fetchAllUniversities = useCallback(async () => {
    if (allUniversities.length > 0) return; // Already fetched
    
    setLoadingAll(true);
    try {
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setAllUniversities(data || []);
    } catch (error) {
      console.error('Error fetching all universities:', error);
    } finally {
      setLoadingAll(false);
    }
  }, [allUniversities.length]);

  const handleSearchFocus = () => {
    setShowAll(true);
    fetchAllUniversities();
  };

  const displayData = showAll 
    ? (allUniversities.length > 0 ? allUniversities : universities)
    : universities;

  const displayUniversities = displayData.length > 0
    ? displayData.map((uni, i) => ({
        name: uni.full_name,
        location: uni.location,
        type: uni.type,
        slug: uni.slug,
        bgColor: bgColors[i % bgColors.length],
        borderColor: borderColors[i % borderColors.length],
      }))
    : fallbackUniversities.map((uni, i) => ({
        ...uni,
        bgColor: bgColors[i % bgColors.length],
        borderColor: borderColors[i % borderColors.length],
      }));

  const filteredUniversities = displayUniversities.filter((uni) =>
    uni.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoading = loading || (showAll && loadingAll);

  return (
    <section id="features" className="py-8 md:py-10 bg-background">
      <div className="container max-w-6xl mx-auto px-6 md:px-8">
        {/* Search Bar - Moved to top */}
        <AnimatedSection animation="fade-down" delay={0}>
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                type="text"
                placeholder="Search your college"
                className="pl-12 h-12 text-base rounded-xl bg-background border-border transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
              />
            </div>
          </div>
        </AnimatedSection>

        {/* University Cards Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredUniversities.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No universities found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredUniversities.map((uni, index) => (
              <AnimatedSection key={index} animation="fade-up" delay={index * 50}>
                <Link
                  to={`/university/${uni.slug}`}
                  className={`group block ${uni.bgColor} rounded-xl border-t-4 ${uni.borderColor} border border-border p-4 card-hover`}
                >
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                    {uni.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {uni.type} • {uni.location}
                  </p>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Features;
