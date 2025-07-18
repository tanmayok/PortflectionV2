"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Calendar,
  Star,
  Clock,
  Copy,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Portfolio } from '@/types/component-system';

interface PortfolioCard {
  id: string;
  name: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  lastModified: Date;
  publishedAt?: Date;
  thumbnail?: string;
  sectionsCount: number;
}

export const PortfolioManagementDashboard = () => {
  const [portfolios, setPortfolios] = useState<PortfolioCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockPortfolios: PortfolioCard[] = [
      {
        id: '1',
        name: 'Personal Portfolio',
        slug: 'personal-portfolio',
        status: 'published',
        views: 1250,
        lastModified: new Date('2024-01-20'),
        publishedAt: new Date('2024-01-15'),
        sectionsCount: 6
      },
      {
        id: '2',
        name: 'Design Portfolio',
        slug: 'design-portfolio',
        status: 'draft',
        views: 0,
        lastModified: new Date('2024-01-18'),
        sectionsCount: 4
      },
      {
        id: '3',
        name: 'Developer Showcase',
        slug: 'developer-showcase',
        status: 'published',
        views: 890,
        lastModified: new Date('2024-01-10'),
        publishedAt: new Date('2024-01-08'),
        sectionsCount: 8
      }
    ];

    setTimeout(() => {
      setPortfolios(mockPortfolios);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPortfolios = portfolios.filter(portfolio => {
    const matchesSearch = portfolio.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || portfolio.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: portfolios.length,
    published: portfolios.filter(p => p.status === 'published').length,
    drafts: portfolios.filter(p => p.status === 'draft').length,
    totalViews: portfolios.reduce((sum, p) => sum + p.views, 0)
  };

  const handleCreateNew = () => {
    // Navigate to builder
    window.location.href = '/dashboard/portfolio-builder';
  };

  const handleEdit = (portfolioId: string) => {
    window.location.href = `/dashboard/portfolio-builder?edit=${portfolioId}`;
  };

  const handleDelete = async (portfolioId: string) => {
    try {
      // API call to delete portfolio
      setPortfolios(prev => prev.filter(p => p.id !== portfolioId));
      toast.success('Portfolio deleted successfully');
    } catch (error) {
      toast.error('Failed to delete portfolio');
    }
  };

  const handleDuplicate = async (portfolioId: string) => {
    try {
      // API call to duplicate portfolio
      const original = portfolios.find(p => p.id === portfolioId);
      if (original) {
        const duplicate: PortfolioCard = {
          ...original,
          id: Date.now().toString(),
          name: `${original.name} (Copy)`,
          slug: `${original.slug}-copy`,
          status: 'draft',
          views: 0,
          lastModified: new Date(),
          publishedAt: undefined
        };
        setPortfolios(prev => [duplicate, ...prev]);
        toast.success('Portfolio duplicated successfully');
      }
    } catch (error) {
      toast.error('Failed to duplicate portfolio');
    }
  };

  const handleShare = (portfolio: PortfolioCard) => {
    if (portfolio.status === 'published') {
      const url = `${window.location.origin}/portfolio/${portfolio.id}`;
      navigator.clipboard.writeText(url);
      toast.success('Portfolio link copied to clipboard');
    } else {
      toast.error('Portfolio must be published to share');
    }
  };

  const PortfolioCardComponent = ({ portfolio }: { portfolio: PortfolioCard }) => {
    return (
      <Card className="group hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{portfolio.name}</CardTitle>
              <p className="text-sm text-muted-foreground">/{portfolio.slug}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={
                portfolio.status === 'published' ? 'default' : 
                portfolio.status === 'draft' ? 'secondary' : 'outline'
              }>
                {portfolio.status}
              </Badge>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Thumbnail placeholder */}
          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
            <Globe className="w-8 h-8 text-gray-400" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium">{portfolio.views}</div>
              <div className="text-muted-foreground">Views</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{portfolio.sectionsCount}</div>
              <div className="text-muted-foreground">Sections</div>
            </div>
            <div className="text-center">
              <div className="font-medium">
                {portfolio.lastModified.toLocaleDateString()}
              </div>
              <div className="text-muted-foreground">Modified</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={() => handleEdit(portfolio.id)} className="flex-1">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleShare(portfolio)}>
              <Share2 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleDuplicate(portfolio.id)}>
              <Copy className="w-4 h-4" />
            </Button>
            {portfolio.status === 'published' && (
              <Button size="sm" variant="outline" asChild>
                <Link href={`/portfolio/${portfolio.id}`} target="_blank">
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and track your portfolio performance
          </p>
        </div>
        <Button onClick={handleCreateNew} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Create New Portfolio
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolios</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.published} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all portfolios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
            <p className="text-xs text-muted-foreground">
              Live portfolios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.drafts}</div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
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
        
        <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Portfolio Grid */}
      {filteredPortfolios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPortfolios.map((portfolio) => (
            <PortfolioCardComponent key={portfolio.id} portfolio={portfolio} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Globe className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery || selectedStatus !== 'all' ? 'No portfolios found' : 'No portfolios yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedStatus !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Create your first portfolio to get started'
            }
          </p>
          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Create Portfolio
          </Button>
        </div>
      )}
    </div>
  );
};