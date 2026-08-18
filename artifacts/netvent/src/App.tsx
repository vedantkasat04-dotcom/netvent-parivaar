import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import About from "@/pages/about";
import Events from "@/pages/events";
import EventDetail from "@/pages/event-detail";
import Team from "@/pages/team";
import Parivaar from "@/pages/parivaar";
import Gallery from "@/pages/gallery";
import MemberProfile from "@/pages/member-profile";
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
import ForgotPassword from "@/pages/auth/forgot-password";
import ResetPassword from "@/pages/auth/reset-password";

import Dashboard from "@/pages/dashboard";
import Groups from "@/pages/groups";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, adminOnly = false, ...rest }: any) {
  return (
    <Route
      {...rest}
      component={(props: any) => {
        const { user, isLoading, isAuthenticated } = useAuth();
        
        if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
        
        if (!isAuthenticated) {
          return <Redirect to="/login" />;
        }
        
        if (adminOnly && user?.role !== "ADMIN") {
          return <Redirect to="/" />;
        }
        
        return <Component {...props} />;
      }}
    />
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/events" component={Events} />
      <Route path="/events/:eventId" component={EventDetail} />
      <Route path="/team" component={Team} />
      <Route path="/directory" component={Parivaar} />
      <Route path="/parivaar" component={Parivaar} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/members/:memberId" component={MemberProfile} />
      
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/join">{() => <Redirect to="/dashboard" />}</Route>
      
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <Route path="/groups" component={Groups} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
