import { 
  LayoutDashboard, 
  Building2, 
  GraduationCap, 
  BookOpen, 
  HelpCircle, 
  FileText, 
  FileQuestion,
  Users,
  Home,
  ListChecks
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Universities', url: '/admin/universities', icon: Building2 },
  { title: 'Courses', url: '/admin/courses', icon: GraduationCap },
  { title: 'Subjects', url: '/admin/subjects', icon: BookOpen },
  { title: 'Questions', url: '/admin/questions', icon: HelpCircle },
  { title: 'MCQs', url: '/admin/mcqs', icon: ListChecks },
  { title: 'Notes', url: '/admin/notes', icon: FileText },
  { title: 'PYQs', url: '/admin/pyqs', icon: FileQuestion },
  { title: 'Users', url: '/admin/users', icon: Users },
];

export function AdminSidebar() {
  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">EXAM Simplex</h2>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/admin'}
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Quick Links</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/" 
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
                    activeClassName=""
                  >
                    <Home className="h-4 w-4" />
                    <span>View Site</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
