import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useRecentViews } from '@/hooks/useRecentViews';
import { useLibrary } from '@/hooks/useLibrary';
import { useStudylists } from '@/hooks/useStudylists';
import { CreateStudylistDialog } from '@/components/CreateStudylistDialog';
import AIToolDialog from '@/components/AIToolDialog';
import {
  Home,
  Library,
  Sparkles,
  MessageSquare,
  Brain,
  Plus,
  ChevronDown,
  ChevronRight,
  Clock,
  GraduationCap,
  BookOpen,
  FolderPlus,
  User,
  LogOut,
  Settings,
} from 'lucide-react';

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { recentViews } = useRecentViews();
  const { libraryItems } = useLibrary();
  const { studylists } = useStudylists();

  const [recentOpen, setRecentOpen] = useState(true);
  const [coursesOpen, setCoursesOpen] = useState(true);
  const [studylistsOpen, setStudylistsOpen] = useState(true);
  const [createStudylistOpen, setCreateStudylistOpen] = useState(false);
  
  const [aiNotesOpen, setAiNotesOpen] = useState(false);
  const [askAiOpen, setAskAiOpen] = useState(false);
  const [aiQuizOpen, setAiQuizOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'G';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const courseItems = libraryItems.filter(item => item.item_type === 'course');

  return (
    <>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="p-4">
          {/* User Profile Section */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 p-2 h-auto">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium truncate">
                        {profile?.full_name || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/onboarding')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 p-2 h-auto"
              onClick={() => navigate('/auth')}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-muted">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">Guest user</p>
                  <p className="text-xs text-muted-foreground">Sign in to save progress</p>
                </div>
              )}
            </Button>
          )}

          {/* + New Button */}
          {!collapsed && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full mt-3 gap-2">
                  <Plus className="h-4 w-4" />
                  New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => setCreateStudylistOpen(true)}>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Create Studylist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/onboarding')}>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Add Course
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </SidebarHeader>

        <SidebarContent className="px-2">
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/')}>
                    <NavLink to="/" className="gap-3">
                      <Home className="h-4 w-4" />
                      {!collapsed && <span>Home</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/library')}>
                    <NavLink to="/library" className="gap-3">
                      <Library className="h-4 w-4" />
                      {!collapsed && <span>My Library</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* AI Tools */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs text-muted-foreground">
              {!collapsed && 'AI Tools'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setAiNotesOpen(true)} className="gap-3">
                    <Sparkles className="h-4 w-4" />
                    {!collapsed && <span>AI Notes</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setAskAiOpen(true)} className="gap-3">
                    <MessageSquare className="h-4 w-4" />
                    {!collapsed && <span>Ask AI</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setAiQuizOpen(true)} className="gap-3">
                    <Brain className="h-4 w-4" />
                    {!collapsed && <span>AI Quiz</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Recent Section */}
          {!collapsed && user && recentViews.length > 0 && (
            <SidebarGroup>
              <Collapsible open={recentOpen} onOpenChange={setRecentOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="cursor-pointer flex items-center justify-between text-xs text-muted-foreground hover:text-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Recent
                    </div>
                    {recentOpen ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {recentViews.slice(0, 5).map((item) => (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton asChild className="text-xs">
                            <Link to={item.item_url} className="gap-2 truncate">
                              <BookOpen className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{item.item_name}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          )}

          {/* My Library - Courses */}
          {!collapsed && user && courseItems.length > 0 && (
            <SidebarGroup>
              <Collapsible open={coursesOpen} onOpenChange={setCoursesOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="cursor-pointer flex items-center justify-between text-xs text-muted-foreground hover:text-foreground">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-3 w-3" />
                      Courses
                    </div>
                    {coursesOpen ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {courseItems.map((item) => (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton asChild className="text-xs">
                            <Link to={item.url || '#'} className="gap-2 truncate">
                              <BookOpen className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{item.name || item.code}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          )}

          {/* Studylists */}
          {!collapsed && user && (
            <SidebarGroup>
              <Collapsible open={studylistsOpen} onOpenChange={setStudylistsOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="cursor-pointer flex items-center justify-between text-xs text-muted-foreground hover:text-foreground">
                    <div className="flex items-center gap-2">
                      <FolderPlus className="h-3 w-3" />
                      Studylists
                    </div>
                    {studylistsOpen ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {studylists.length === 0 ? (
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            onClick={() => setCreateStudylistOpen(true)}
                            className="text-xs text-muted-foreground"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Create your first studylist</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ) : (
                        <>
                          {studylists.map((list) => (
                            <SidebarMenuItem key={list.id}>
                              <SidebarMenuButton asChild className="text-xs">
                                <Link to={`/studylists/${list.id}`} className="gap-2 truncate">
                                  <BookOpen className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{list.name}</span>
                                  <span className="ml-auto text-muted-foreground">
                                    {list.item_count}
                                  </span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              onClick={() => setCreateStudylistOpen(true)}
                              className="text-xs text-muted-foreground"
                            >
                              <Plus className="h-3 w-3" />
                              <span>New studylist</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </>
                      )}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter className="p-4">
          {!collapsed && (
            <p className="text-xs text-muted-foreground text-center">
              EXAM Simplex © 2025
            </p>
          )}
        </SidebarFooter>
      </Sidebar>

      {/* Dialogs */}
      <CreateStudylistDialog
        open={createStudylistOpen}
        onOpenChange={setCreateStudylistOpen}
      />
      <AIToolDialog
        open={aiNotesOpen}
        onOpenChange={setAiNotesOpen}
        type="notes"
        title="AI Notes Generator"
        subtitle="Generate comprehensive notes on any topic"
        placeholder="Enter a topic to generate notes..."
      />
      <AIToolDialog
        open={askAiOpen}
        onOpenChange={setAskAiOpen}
        type="ask"
        title="Ask AI"
        subtitle="Ask any question about your studies"
        placeholder="Ask a question..."
      />
      <AIToolDialog
        open={aiQuizOpen}
        onOpenChange={setAiQuizOpen}
        type="quiz"
        title="AI Quiz"
        subtitle="Generate practice questions"
        placeholder="Enter a topic for quiz questions..."
      />
    </>
  );
}
