import { useState } from "react";
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
  User
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const GetStarted = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const sidebarItems = [
    { icon: Home, label: "Home", active: false },
    { icon: BookOpen, label: "My Library", active: false },
    { icon: StickyNote, label: "AI Notes", active: false },
    { icon: MessageSquare, label: "Ask AI", active: false },
    { icon: HelpCircle, label: "AI Quiz", active: false },
  ];

  const universities = [
    "Aligarh Muslim University, Aligarh",
    "Assam University, Silchar",
    "Babasaheb Bhimrao Ambedkar University, Lucknow",
    "Banaras Hindu University, Banaras",
    "Central Agricultural University, Imphal",
    "Central Sanskrit University",
    "Central Tribal University",
    "Central University of Kerala, Kasaragod",
    "Central University of Andhra Pradesh",
    "Central University of Gujarat",
    "Central University of Haryana, Mahendergarh",
    "Central University of Himachal Pradesh, Dharmshala, Kangra",
    "Central University of Jammu",
    "Central University of Jharkhand, Ranchi",
    "Central University of Karnataka, Gulbarga",
    "Central University of Kashmir, Srinagar",
    "Central University of Orissa, Koraput",
    "Central University of Punjab, Bathhinda",
    "Central University of Rajasthan, Jaipur",
    "Central University of South Bihar",
    "Central University of Tamil Nadu, Tiruvarur",
    "Dr. Harisingh Gaur Vishwavidyalaya, Sagar",
    "Dr Rajendra Prasad Central Agricultural University, Samastipur",
    "Gati Shakti Vishwavidyalaya",
    "Guru Ghasidas Vishwavidyalaya, Bilaspur",
    "Hemwati Nandan Bahuguna Garhwal University, Srinagar, Garhwal",
    "Indian Maritime University",
    "Indira Gandhi National Tribal University, Amarkantak",
    "Jamia Millia Islamia University",
    "Jawaharlal Nehru University",
    "Mahatama Gandhi Antarrashtriya Hindi Vishwavidyalaya, Wardha",
    "Mahatma Gandhi Central University, Motihari",
    "Manipur University, Imphal",
    "Maulana Azad National Urdu University, Hyderabad",
    "Mizoram University, Aizwal",
    "Nagaland University",
    "Nalanda University",
    "National Sanskrit University, Tirupati",
    "National Sports University",
    "North Eastern Hill University, Shillong",
    "Pondicherry University, Puducherry",
    "Rajiv Gandhi National Aviation University",
    "Rajiv Gandhi University, Itanagar",
    "Rani Lakshmi Bai Central Agricultural University",
    "Sammakka Sarakka Central Tribal University",
    "Shri Lal Bahadur Shastri National Sanskrit University",
    "Sikkim University, Gangtok",
    "South Asian University, New Delhi",
    "Tezpur University, Tezpur",
    "The English and Foreign Languages University, Hyderabad",
    "Tripura University, Agartala",
    "University of Allahabad, Allahabad",
    "University of Delhi",
    "University of Hyderabad, Hyderabad",
    "Visva Bharati, Shantiniketan",
  ];

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
                {/* Building base */}
                <rect x="30" y="40" width="60" height="50" fill="#E8F4FC" rx="2" />
                {/* Columns */}
                <rect x="38" y="45" width="8" height="45" fill="#D1E9F6" rx="1" />
                <rect x="52" y="45" width="8" height="45" fill="#D1E9F6" rx="1" />
                <rect x="66" y="45" width="8" height="45" fill="#D1E9F6" rx="1" />
                <rect x="80" y="45" width="8" height="45" fill="#D1E9F6" rx="1" />
                {/* Roof */}
                <path d="M25 45 L60 20 L95 45" stroke="#D1E9F6" strokeWidth="4" fill="none" />
                {/* Decorative elements */}
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
            <div className="grid md:grid-cols-2 gap-3">
              {universities.map((university) => (
                <button
                  key={university}
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
                  <span className="text-primary hover:underline font-medium">{university}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GetStarted;
