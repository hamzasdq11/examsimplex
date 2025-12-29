import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Home, 
  BookOpen, 
  StickyNote, 
  MessageSquare, 
  HelpCircle, 
  Clock, 
  FolderOpen, 
  List,
  ChevronDown,
  Search,
  Plus,
  User,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { University } from "@/types/database";

const GetStarted = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUniversities() {
      try {
        const { data, error } = await supabase
          .from('universities')
          .select('*')
          .order('name');
        
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

  const sidebarItems = [
    { icon: Home, label: "Home", active: false },
    { icon: BookOpen, label: "My Library", active: false },
    { icon: StickyNote, label: "AI Notes", active: false },
    { icon: MessageSquare, label: "Ask AI", active: false },
    { icon: HelpCircle, label: "AI Quiz", active: false },
  ];

  // Fallback universities if database is empty
  const fallbackUniversities = [
    "Aligarh Muslim University, Aligarh",
    "Assam University, Silchar",
    "Babasaheb Bhimrao Ambedkar University, Lucknow",
    "Banaras Hindu University, Banaras",
    "Central Agricultural University, Imphal",
    "Central University of Kerala, Kasaragod",
    "Central University of Gujarat",
    "Central University of Rajasthan, Jaipur",
    "Jawaharlal Nehru University",
    "Tezpur University, Tezpur",
    "University of Delhi",
    "University of Hyderabad, Hyderabad",
  ];

  const displayUniversities = universities.length > 0 
    ? universities 
    : fallbackUniversities.map((name, i) => ({
        id: `fallback-${i}`,
        name: name.split(",")[0],
        full_name: name,
        slug: name.split(",")[0].toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-"),
        location: name.includes(",") ? name.split(",")[1]?.trim() || "India" : "India",
        logo_url: null,
        type: "Central",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

  const filteredUniversities = displayUniversities.filter((university) => 
    university.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    university.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-border bg-background flex flex-col">
        {/* User Profile */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Guest user</p>
              <button className="text-sm text-primary hover:underline">
                + Add your university or school
              </button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex justify-between mt-4 text-center">
            <div>
              <p className="text-lg font-semibold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">Uploads</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">Upvotes</p>
            </div>
          </div>

          {/* New Button */}
          <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
          
          <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5" />
              <span className="text-sm font-medium">Recent</span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </button>

          <div className="pt-4">
            <p className="px-3 text-sm font-medium text-muted-foreground mb-2">My Library</p>
            
            <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <div className="flex items-center gap-3">
                <FolderOpen className="h-5 w-5" />
                <span className="text-sm font-medium">Courses</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>

            <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <div className="flex items-center gap-3">
                <List className="h-5 w-5" />
                <span className="text-sm font-medium">Studylists</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto pt-16">
          {/* Illustration */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="30" y="40" width="60" height="50" fill="#E8F4FC" rx="2" />
                <rect x="38" y="45" width="8" height="45" fill="#D1E9F6" rx="1" />
                <rect x="52" y="45" width="8" height="45" fill="#D1E9F6" rx="1" />
                <rect x="66" y="45" width="8" height="45" fill="#D1E9F6" rx="1" />
                <rect x="80" y="45" width="8" height="45" fill="#D1E9F6" rx="1" />
                <path d="M25 45 L60 20 L95 45" stroke="#D1E9F6" strokeWidth="4" fill="none" />
                <circle cx="85" cy="25" r="8" fill="#FFC857" />
                <rect x="90" y="15" width="12" height="12" fill="#4A90D9" rx="2" />
                <circle cx="35" cy="70" r="6" fill="#7BC47F" />
                <circle cx="48" cy="78" r="4" fill="#7BC47F" />
                <circle cx="75" cy="75" r="5" fill="#7BC47F" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-3">
            What Institution do you study at?
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Search for an institution and find study materials
          </p>

          {/* Search Input */}
          <div className="relative mb-12">
            <Input
              type="text"
              placeholder="Type to start searching"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-6 pr-12 rounded-full border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>

          {/* Popular Universities */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Most popular universities and schools
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {filteredUniversities.map((university) => (
                  <Link
                    key={university.id}
                    to={`/university/${university.slug}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 2L2 5V7H14V5L8 2Z" fill="#E53935" />
                        <rect x="3" y="8" width="2" height="5" fill="#E53935" />
                        <rect x="7" y="8" width="2" height="5" fill="#E53935" />
                        <rect x="11" y="8" width="2" height="5" fill="#E53935" />
                        <rect x="1" y="13" width="14" height="1" fill="#E53935" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-primary hover:underline font-medium block">{university.full_name}</span>
                      <span className="text-xs text-muted-foreground">{university.type} • {university.location}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GetStarted;
