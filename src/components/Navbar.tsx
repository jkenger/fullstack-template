import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Zap, User, Code, Menu, X, LogOut, Settings } from 'lucide-react'
import { useAuth, useAuthMutations } from '@/hooks/useAuth'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isLoading } = useAuth()
  const { logout } = useAuthMutations()

  const toggleMenu = () => setIsOpen(!isOpen)

  const handleSignOut = () => {
    logout.mutate()
    setIsOpen(false)
  }

  const navItems = [
    { to: '/', label: 'Home', icon: null },
    { to: '/stack', label: 'Tech Stack', icon: Code },
    { to: '/profile', label: 'Demo', icon: User },
  ]

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-2 font-bold text-xl"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span>Full-Stack Template</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map(item => (
              <Button key={item.label} variant="ghost" size="sm" asChild>
                <Link to={item.to}>
                  {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                  {item.label}
                </Link>
              </Button>
            ))}

            {/* Authentication Section */}
            {isLoading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.image || ''}
                        alt={user.name || ''}
                      />
                      <AvatarFallback>
                        {user.name?.charAt(0).toUpperCase() ||
                          user.email?.charAt(0).toUpperCase() ||
                          'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user.name && <p className="font-medium">{user.name}</p>}
                      {user.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <div className="py-4 space-y-2">
              {navItems.map(item => (
                <div key={item.label} className="px-2">
                  <Link
                    to={item.to}
                    className="flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <span>{item.label}</span>
                  </Link>
                </div>
              ))}

              {/* Mobile Authentication Section */}
              <div className="px-2 pt-2 border-t">
                {isLoading ? (
                  <div className="px-3 py-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                  </div>
                ) : user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.image || ''}
                            alt={user.name || ''}
                          />
                          <AvatarFallback>
                            {user.name?.charAt(0).toUpperCase() ||
                              user.email?.charAt(0).toUpperCase() ||
                              'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          {user.name && (
                            <p className="text-sm font-medium">{user.name}</p>
                          )}
                          {user.email && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {user.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setIsOpen(false)
                      }}
                      className="flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    className="flex items-center justify-center px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
