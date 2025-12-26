import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Videos from "./pages/Videos";
import VideoDetail from "./pages/VideoDetail";
import Channel from "./pages/Channel";
import Keywords from "./pages/Keywords";
import Competitors from "./pages/Competitors";
import AITools from "./pages/AITools";
import TitleGenerator from "./pages/TitleGenerator";
import DescriptionGenerator from "./pages/DescriptionGenerator";
import TagsGenerator from "./pages/TagsGenerator";
import ThumbnailGenerator from "./pages/ThumbnailGenerator";
import ContentIdeasGenerator from "./pages/ContentIdeasGenerator";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/videos"
              element={
                <ProtectedRoute>
                  <Videos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/videos/:id"
              element={
                <ProtectedRoute>
                  <VideoDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/channel"
              element={
                <ProtectedRoute>
                  <Channel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/keywords"
              element={
                <ProtectedRoute>
                  <Keywords />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/competitors"
              element={
                <ProtectedRoute>
                  <Competitors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/ai-tools"
              element={
                <ProtectedRoute>
                  <AITools />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/ai-tools/titles"
              element={
                <ProtectedRoute>
                  <TitleGenerator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/ai-tools/descriptions"
              element={
                <ProtectedRoute>
                  <DescriptionGenerator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/ai-tools/tags"
              element={
                <ProtectedRoute>
                  <TagsGenerator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/ai-tools/thumbnails"
              element={
                <ProtectedRoute>
                  <ThumbnailGenerator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/ai-tools/content-ideas"
              element={
                <ProtectedRoute>
                  <ContentIdeasGenerator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
