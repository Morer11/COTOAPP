import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Smartphone, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Header() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-surface material-shadow-1 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 coto-bg-primary rounded-lg flex items-center justify-center">
              <Smartphone className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold coto-text-primary">COTOAPP📱</h1>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/#features" className="coto-text-secondary hover:coto-primary transition-colors">
              Features
            </Link>
            <Link href="/#pricing" className="coto-text-secondary hover:coto-primary transition-colors">
              Pricing
            </Link>
            <Link href="/#support" className="coto-text-secondary hover:coto-primary transition-colors">
              Support
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <Link href={user.isAdmin ? "/admin" : "/dashboard"}>
                  <Button variant="ghost" className="coto-text-secondary hover:coto-primary">
                    {user.isAdmin ? "Admin Panel" : "Dashboard"}
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="coto-bg-primary text-white text-sm">
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="coto-text-secondary hover:coto-primary">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="coto-bg-primary hover:bg-blue-700 text-white">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
