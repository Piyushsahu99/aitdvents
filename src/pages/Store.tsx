import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingBag, 
  Plus, 
  Package, 
  BookOpen, 
  Laptop, 
  FileText, 
  Pencil,
  Search,
  Filter,
  Clock,
  MapPin,
  User,
  Loader2,
  IndianRupee,
  Eye,
  Heart,
  MessageCircle
} from "lucide-react";

type ProductCategory = 'electronics' | 'books' | 'stationery' | 'tasks' | 'other';
type ProductCondition = 'new' | 'like_new' | 'good' | 'fair' | 'old';
type ProductStatus = 'pending' | 'approved' | 'rejected' | 'sold' | 'archived';

interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  subcategory: string | null;
  condition: ProductCondition;
  status: ProductStatus;
  images: string[];
  location: string | null;
  contact_info: string | null;
  is_admin_product: boolean;
  views_count: number;
  created_at: string;
  seller?: {
    full_name: string;
    avatar_url: string | null;
    college: string | null;
  };
}

const categoryIcons: Record<ProductCategory, any> = {
  electronics: Laptop,
  books: BookOpen,
  stationery: Pencil,
  tasks: FileText,
  other: Package,
};

const categoryLabels: Record<ProductCategory, string> = {
  electronics: "Electronics",
  books: "Books",
  stationery: "Stationery",
  tasks: "Tasks & Notes",
  other: "Other",
};

const conditionLabels: Record<ProductCondition, string> = {
  new: "Brand New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
  old: "Used",
};

export default function Store() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCondition, setSelectedCondition] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "other" as ProductCategory,
    subcategory: "",
    condition: "good" as ProductCondition,
    location: "",
    contact_info: "",
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    fetchProducts();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("marketplace_products")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch seller profiles separately
      const sellerIds = [...new Set((data || []).map(p => p.seller_id))];
      const { data: profiles } = await supabase
        .from("student_profiles")
        .select("user_id, full_name, avatar_url, college")
        .in("user_id", sellerIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));
      
      const productsWithSeller = (data || []).map(product => ({
        ...product,
        seller: profileMap.get(product.seller_id) || null,
      }));

      setProducts(productsWithSeller);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please login", description: "You need to login to list a product", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("marketplace_products").insert([{
        seller_id: user.id,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        category: formData.category,
        subcategory: formData.subcategory || null,
        condition: formData.condition,
        location: formData.location || null,
        contact_info: formData.contact_info || null,
        status: "pending",
      }]);

      if (error) throw error;

      toast({ 
        title: "Product Submitted!", 
        description: "Your product is pending admin approval. You'll be notified once approved." 
      });
      setIsDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        price: "",
        category: "other",
        subcategory: "",
        condition: "good",
        location: "",
        contact_info: "",
      });
      fetchProducts();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesCondition = selectedCondition === "all" || product.condition === selectedCondition;
    return matchesSearch && matchesCategory && matchesCondition;
  });

  const categories: ProductCategory[] = ['electronics', 'books', 'stationery', 'tasks', 'other'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-8 px-3 sm:px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Student Marketplace
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">Buy and sell books, electronics, notes, and more!</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-500">
                <Plus className="h-4 w-4 mr-2" />
                Sell Something
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>List a Product</DialogTitle>
                <DialogDescription>
                  Your listing will be reviewed by admin before going live.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Engineering Physics Textbook"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as ProductCategory })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{categoryLabels[cat]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition *</Label>
                    <Select value={formData.condition} onValueChange={(v) => setFormData({ ...formData, condition: v as ProductCondition })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(conditionLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.category === 'tasks' && (
                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Type</Label>
                    <Select value={formData.subcategory} onValueChange={(v) => setFormData({ ...formData, subcategory: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="notes">Notes</SelectItem>
                        <SelectItem value="previous_papers">Previous Papers</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0 for free"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your product..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="City/College"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact Info</Label>
                    <Input
                      id="contact"
                      value={formData.contact_info}
                      onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                      placeholder="Phone/WhatsApp"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Submit for Approval
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{categoryLabels[cat]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCondition} onValueChange={setSelectedCondition}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              {Object.entries(conditionLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Tabs */}
        <Tabs defaultValue="all" className="mb-6">
          <div className="overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-max sm:w-auto gap-1 p-1">
              <TabsTrigger value="all" onClick={() => setSelectedCategory("all")} className="text-xs sm:text-sm">
                <ShoppingBag className="h-4 w-4 mr-1" />
                All
              </TabsTrigger>
              {categories.map(cat => {
                const Icon = categoryIcons[cat];
                return (
                  <TabsTrigger 
                    key={cat} 
                    value={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="text-xs sm:text-sm"
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {categoryLabels[cat]}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        </Tabs>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No products found. Be the first to list something!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => {
              const Icon = categoryIcons[product.category];
              return (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all group">
                  {/* Product Image/Placeholder */}
                  <div className="aspect-square bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 relative overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}
                    <Badge className="absolute top-2 left-2 text-xs" variant="secondary">
                      {categoryLabels[product.category]}
                    </Badge>
                    {product.is_admin_product && (
                      <Badge className="absolute top-2 right-2 text-xs bg-primary">
                        Official
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm truncate mb-1">{product.title}</h3>
                    <div className="flex items-center gap-1 text-lg font-bold text-primary mb-2">
                      <IndianRupee className="h-4 w-4" />
                      {product.price === 0 ? 'Free' : product.price.toLocaleString()}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {conditionLabels[product.condition]}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {product.views_count}
                      </div>
                    </div>

                    {product.location && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{product.location}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}