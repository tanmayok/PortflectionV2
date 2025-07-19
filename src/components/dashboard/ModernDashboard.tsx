"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Share2,
  Download,
  TrendingUp,
  Users,
  Globe,
  Palette,
  Layout,
  Sparkles,
  BarChart3,
  Calendar,
  Star,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// Types
interface Portfolio {
  id: string;
  name: string;
  title: string;
  portfolioType: string;
  isPublished: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  theme?: {
    colors: {
      primary: string;
      secondary: string;
    };
  };
  _count?: {
    projects: number;
    experiences: number;
    skills: number;
    educations: number;
  };
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  downloads: number;
  rating: number;
  isPremium: boolean;
}

// Mock data for demonstration
const mockPortfolios: Portfolio[] = [
  {
    id: "1",
    name: "John Doe Portfolio",
    title: "Full Stack Developer",
    portfolioType: "developer",
    isPublished: true,
    views: 1250,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
    theme: {
      colors: {
        primary: "#3b82f6",
        secondary: "#64748b",
      },
    },
    _count: {
      projects: 8,
      experiences: 3,
      skills: 15,
      educations: 2,
    },
  },
  {
    id: "2",
    name: "Design Portfolio",
    title: "UX/UI Designer",
    portfolioType: "designer",
    isPublished: false,
    views: 0,
    createdAt: "2024-01-18",
    updatedAt: "2024-01-18",
    theme: {
      colors: {
        primary: "#8b5cf6",
        secondary: "#ec4899",
      },
    },
    _count: {
      projects: 5,
      experiences: 2,
      skills: 12,
      educations: 1,
    },
  },
];

const mockTemplates: Template[] = [
  {
    id: "1",
    name: "Modern Developer",
    description: "Clean and professional template for developers",
    category: "developer",
    preview:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
    downloads: 1250,
    rating: 4.8,
    isPremium: false,
  },
  {
    id: "2",
    name: "Creative Designer",
    description: "Vibrant template perfect for creative professionals",
    category: "designer",
    preview: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400",
    downloads: 890,
    rating: 4.9,
    isPremium: true,
  },
  {
    id: "3",
    name: "Business Professional",
    description: "Elegant template for business consultants",
    category: "business",
    preview:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    downloads: 650,
    rating: 4.7,
    isPremium: false,
  },
];

// Portfolio Card Component
const PortfolioCard: React.FC<{
  portfolio: Portfolio;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
}> = ({ portfolio, onEdit, onDelete, onShare }) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{portfolio.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{portfolio.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={portfolio.isPublished ? "default" : "secondary"}>
              {portfolio.isPublished ? "Published" : "Draft"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Theme Preview */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: portfolio.theme?.colors.primary }}
            />
            <div
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: portfolio.theme?.colors.secondary }}
            />
          </div>
          <span className="text-xs text-muted-foreground capitalize">
            {portfolio.portfolioType} theme
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span>{portfolio.views.toLocaleString()} views</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{new Date(portfolio.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Content Stats */}
        {portfolio._count && (
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="text-center">
              <div className="font-medium">{portfolio._count.projects}</div>
              <div className="text-muted-foreground">Projects</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{portfolio._count.skills}</div>
              <div className="text-muted-foreground">Skills</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{portfolio._count.experiences}</div>
              <div className="text-muted-foreground">Experience</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{portfolio._count.educations}</div>
              <div className="text-muted-foreground">Education</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" onClick={onEdit} className="flex-1">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button size="sm" variant="outline" onClick={onShare}>
            <Share2 className="w-4 h-4" />
          </Button>
          {portfolio.isPublished && (
            <Button size="sm" variant="outline" asChild>
              <Link href={`/portfolio/${portfolio.id}`} target="_blank">
                <Eye className="w-4 h-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Template Card Component
const TemplateCard: React.FC<{
  template: Template;
  onUse: () => void;
}> = ({ template, onUse }) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <CardHeader className="p-0">
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img
            src={template.preview}
            alt={template.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {template.isPremium && (
            <Badge className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500">
              <Star className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold">{template.name}</h3>
          <p className="text-sm text-muted-foreground">
            {template.description}
          </p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Download className="w-4 h-4 text-muted-foreground" />
              <span>{template.downloads.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span>{template.rating}</span>
            </div>
          </div>
          <Badge variant="outline" className="capitalize">
            {template.category}
          </Badge>
        </div>

        <Button onClick={onUse} className="w-full">
          Use Template
        </Button>
      </CardContent>
    </Card>
  );
};

// Main Dashboard Component
export const ModernDashboard: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>(mockPortfolios);
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);

  // Filter portfolios based on search
  const filteredPortfolios = portfolios.filter(
    (portfolio) =>
      portfolio.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      portfolio.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter templates based on category
  const filteredTemplates = templates.filter(
    (template) =>
      selectedCategory === "all" || template.category === selectedCategory
  );

  const handleCreatePortfolio = () => {
    // Navigate to portfolio builder
    window.location.href = "/dashboard/builder";
  };

  const handleEditPortfolio = (portfolioId: string) => {
    window.location.href = `/dashboard/builder?edit=${portfolioId}`;
  };

  const handleDeletePortfolio = async (portfolioId: string) => {
    try {
      setLoading(true);
      // API call to delete portfolio
      setPortfolios((prev) => prev.filter((p) => p.id !== portfolioId));
      toast.success("Portfolio deleted successfully");
    } catch (error) {
      toast.error("Failed to delete portfolio");
    } finally {
      setLoading(false);
    }
  };

  const handleSharePortfolio = (portfolio: Portfolio) => {
    if (portfolio.isPublished) {
      const url = `${window.location.origin}/portfolio/${portfolio.id}`;
      navigator.clipboard.writeText(url);
      toast.success("Portfolio link copied to clipboard");
    } else {
      toast.error("Portfolio must be published to share");
    }
  };

  const handleUseTemplate = (templateId: string) => {
    window.location.href = `/dashboard/builder?template=${templateId}`;
  };

  // Calculate stats
  const stats = {
    totalPortfolios: portfolios.length,
    publishedPortfolios: portfolios.filter((p) => p.isPublished).length,
    totalViews: portfolios.reduce((sum, p) => sum + p.views, 0),
    avgViews:
      Math.round(
        portfolios.reduce((sum, p) => sum + p.views, 0) / portfolios.length
      ) || 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Portfolio Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your portfolios and track their performance
            </p>
          </div>
          <Button onClick={handleCreatePortfolio} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Create Portfolio
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Portfolios
              </CardTitle>
              <Layout className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPortfolios}</div>
              <p className="text-xs text-muted-foreground">
                {stats.publishedPortfolios} published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalViews.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.avgViews} avg per portfolio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12%</div>
              <p className="text-xs text-muted-foreground">vs last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2min</div>
              <p className="text-xs text-muted-foreground">avg time on page</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="portfolios" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="portfolios">My Portfolios</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolios" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search portfolios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Portfolios Grid */}
            {filteredPortfolios.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPortfolios.map((portfolio) => (
                  <PortfolioCard
                    key={portfolio.id}
                    portfolio={portfolio}
                    onEdit={() => handleEditPortfolio(portfolio.id)}
                    onDelete={() => handleDeletePortfolio(portfolio.id)}
                    onShare={() => handleSharePortfolio(portfolio)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Layout className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  No portfolios found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Create your first portfolio to get started"}
                </p>
                <Button onClick={handleCreatePortfolio}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Portfolio
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            {/* Template Categories */}
            <div className="flex flex-wrap gap-2">
              {["all", "developer", "designer", "business", "creative"].map(
                (category) => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize"
                  >
                    {category}
                  </Button>
                )
              )}
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onUse={() => handleUseTemplate(template.id)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ModernDashboard;
