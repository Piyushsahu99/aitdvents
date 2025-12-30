import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useEarnCoins } from "@/hooks/useEarnCoins";
import { 
  ShoppingBag, 
  Plus, 
  Package, 
  BookOpen, 
  Laptop, 
  FileText, 
  Pencil,
  Search,
  MapPin,
  Loader2,
  IndianRupee,
  Sparkles,
  TrendingUp,
  Star,
  Send,
  ShoppingCart,
  Copy,
  Check,
  Smartphone,
  Zap,
  Upload,
  X,
  Image as ImageIcon,
  Coins
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

const categoryGradients: Record<ProductCategory, string> = {
  electronics: "from-blue-500 to-cyan-500",
  books: "from-emerald-500 to-teal-500",
  stationery: "from-orange-500 to-amber-500",
  tasks: "from-violet-500 to-purple-500",
  other: "from-pink-500 to-rose-500",
};

const conditionLabels: Record<ProductCondition, string> = {
  new: "Brand New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
  old: "Used",
};

const conditionColors: Record<ProductCondition, string> = {
  new: "bg-emerald-500",
  like_new: "bg-green-500",
  good: "bg-blue-500",
  fair: "bg-yellow-500",
  old: "bg-orange-500",
};

export default function Store() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
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
    images: [] as string[],
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { uploadImage, uploading } = useImageUpload({ bucket: 'product-images' });

  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { earnCoins, POINT_VALUES } = useEarnCoins();

  const UPI_ID = "9919562443-0@airtel";

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
        images: formData.images,
        status: "pending",
      }]);

      if (error) throw error;

      // Earn coins for listing a product
      await earnCoins(POINT_VALUES.PRODUCT_LIST, "product_list", "Listed a product on the marketplace");

      toast({ 
        title: "Product Submitted!", 
        description: "Your product is pending admin approval." 
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
        images: [],
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
    return matchesSearch && matchesCategory;
  });

  const featuredProducts = products.filter(p => p.is_admin_product);
  const categories: ProductCategory[] = ['electronics', 'books', 'stationery', 'tasks', 'other'];

  const handleBuyNow = (product: Product) => {
    if (!user) {
      toast({ title: "Please login", description: "You need to login to make a purchase", variant: "destructive" });
      return;
    }
    setSelectedProduct(product);
    setIsPaymentOpen(true);
  };

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    toast({ title: "UPI ID Copied!", description: "Paste it in your payment app" });
    setTimeout(() => setCopied(false), 2000);
  };

  const openUPIApp = (product: Product) => {
    const upiLink = `upi://pay?pa=${UPI_ID}&pn=AITD%20Store&am=${product.price}&cu=INR&tn=Purchase%20${encodeURIComponent(product.title)}`;
    window.location.href = upiLink;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 px-4 overflow-hidden bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-green-500/10">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-emerald-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-teal-500/20 rounded-full blur-3xl animate-float-delayed" />
        </div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div className="animate-fade-in-up">
              <Badge className="mb-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">
                <Sparkles className="h-3 w-3 mr-1.5" />
                Student Marketplace
              </Badge>
              <h1 className="text-3xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 bg-clip-text text-transparent">
                Buy & Sell with Students
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl">
                The trusted marketplace for books, electronics, notes, and more. Get amazing deals from fellow students!
              </p>
              <Badge className="mt-3 bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                <Coins className="h-3 w-3 mr-1" />
                Earn {POINT_VALUES.PRODUCT_LIST} coins per listing!
              </Badge>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all hover:scale-105 animate-fade-in-up stagger-1">
                  <Plus className="h-5 w-5 mr-2" />
                  Sell Something
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-emerald-500" />
                    List Your Product
                  </DialogTitle>
                  <DialogDescription>
                    Your listing will be reviewed before going live.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateProduct} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Engineering Physics Textbook"
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as ProductCategory })}>
                        <SelectTrigger className="rounded-xl">
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
                      <Label>Condition *</Label>
                      <Select value={formData.condition} onValueChange={(v) => setFormData({ ...formData, condition: v as ProductCondition })}>
                        <SelectTrigger className="rounded-xl">
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
                      <Label>Type</Label>
                      <Select value={formData.subcategory} onValueChange={(v) => setFormData({ ...formData, subcategory: v })}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="assignment">Assignment</SelectItem>
                          <SelectItem value="project">Project</SelectItem>
                          <SelectItem value="notes">Notes</SelectItem>
                          <SelectItem value="previous_papers">Previous Papers</SelectItem>
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
                      className="rounded-xl"
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
                      className="rounded-xl"
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
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact">WhatsApp</Label>
                      <Input
                        id="contact"
                        value={formData.contact_info}
                        onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                        placeholder="Phone number"
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Product Images ({formData.images.length}/3)
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={img} alt={`Product ${idx + 1}`} className="w-full h-20 object-cover rounded-lg border" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) })}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {formData.images.length < 3 && (
                        <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                          {uploading ? (
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          ) : (
                            <>
                              <Upload className="h-5 w-5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground mt-1">Add</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            disabled={uploading}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await uploadImage(file);
                                if (url) setFormData({ ...formData, images: [...formData.images, url] });
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <Button type="submit" className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500" disabled={submitting || uploading}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    Submit for Approval
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up stagger-2">
            {[
              { label: "Total Products", value: products.length, icon: ShoppingBag },
              { label: "Categories", value: "5+", icon: Package },
              { label: "Active Sellers", value: new Set(products.map(p => p.seller_id)).size, icon: TrendingUp },
              { label: "Verified Sellers", value: "100%", icon: Star },
            ].map((stat, idx) => (
              <div key={idx} className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 text-center hover:shadow-lg transition-all hover:-translate-y-1">
                <stat.icon className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-emerald-500" />
              Complete Your Purchase
            </DialogTitle>
            <DialogDescription>
              Pay via UPI to complete your order
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-6 mt-4">
              {/* Product Summary */}
              <div className="bg-muted/50 rounded-xl p-4 flex gap-4">
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${categoryGradients[selectedProduct.category]} flex items-center justify-center`}>
                  {(() => { const Icon = categoryIcons[selectedProduct.category]; return <Icon className="h-8 w-8 text-white/60" />; })()}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold line-clamp-1">{selectedProduct.title}</h4>
                  <p className="text-sm text-muted-foreground">{conditionLabels[selectedProduct.condition]}</p>
                  <div className="flex items-center gap-1 text-xl font-bold text-emerald-500 mt-1">
                    <IndianRupee className="h-5 w-5" />
                    {selectedProduct.price.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* UPI Payment Section */}
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Pay to this UPI ID</p>
                  <div className="bg-card border-2 border-dashed border-emerald-500/50 rounded-xl p-4">
                    <p className="text-lg font-mono font-bold text-foreground">{UPI_ID}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={copyUPI}
                    variant="outline"
                    className="rounded-xl"
                  >
                    {copied ? <Check className="h-4 w-4 mr-2 text-emerald-500" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? "Copied!" : "Copy UPI"}
                  </Button>
                  <Button
                    onClick={() => openUPIApp(selectedProduct)}
                    className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500"
                  >
                    <Smartphone className="h-4 w-4 mr-2" />
                    Open UPI App
                  </Button>
                </div>

                <div className="text-center text-xs text-muted-foreground space-y-1">
                  <p>Scan QR or use UPI ID in any payment app</p>
                  <p className="font-medium">GPay • PhonePe • Paytm • BHIM</p>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-sm text-amber-700 dark:text-amber-400">
                  <p className="font-medium">After payment:</p>
                  <p>Contact the seller with your payment screenshot to receive your product.</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Telegram Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 py-3 px-4">
        <div className="container mx-auto max-w-7xl flex items-center justify-center gap-2 text-white text-sm sm:text-base">
          <Send className="h-4 w-4 animate-pulse" />
          <span className="font-medium">Join our Telegram group for daily updates and exclusive deals!</span>
          <a 
            href="https://t.me/aitdevents" 
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs font-semibold transition-colors"
          >
            Join Now →
          </a>
        </div>
      </div>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="py-8 px-4 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-yellow-500/5">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Featured Products</h2>
                <p className="text-sm text-muted-foreground">Official store picks</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((product) => {
                const Icon = categoryIcons[product.category];
                const gradient = categoryGradients[product.category];
                return (
                  <Card 
                    key={product.id} 
                    className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-amber-500/30 ring-2 ring-amber-500/20 animate-fade-in-up"
                  >
                    <div className={`aspect-square bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-transparent">
                          <Icon className="h-20 w-20 text-white/40" />
                        </div>
                      )}
                      
                      <div className="absolute top-3 left-3">
                        <span className={`px-2.5 py-1 ${conditionColors[product.condition]} text-white text-xs font-medium rounded-full shadow-lg`}>
                          {conditionLabels[product.condition]}
                        </span>
                      </div>
                      
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg animate-pulse">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      </div>

                      <div className="absolute bottom-3 right-3">
                        <div className="bg-white/95 dark:bg-card/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-lg">
                          <div className="flex items-center gap-0.5 text-lg font-bold text-foreground">
                            <IndianRupee className="h-4 w-4" />
                            {product.price === 0 ? "Free" : product.price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-2 group-hover:text-emerald-500 transition-colors">
                        {product.title}
                      </h3>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {product.description}
                      </p>
                      
                      <Button 
                        onClick={() => handleBuyNow(product)}
                        className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        size="sm"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Buy Now
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-8 sm:py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-2xl text-base border-2 focus:border-emerald-500/50 bg-card"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-8 animate-fade-in stagger-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                  : "bg-card border border-border hover:border-emerald-500/50 text-foreground"
              }`}
            >
              <ShoppingBag className="h-4 w-4 inline-block mr-1.5" />
              All Products
            </button>
            {categories.map(cat => {
              const Icon = categoryIcons[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? `bg-gradient-to-r ${categoryGradients[cat]} text-white shadow-lg`
                      : "bg-card border border-border hover:border-primary/50 text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 inline-block mr-1.5" />
                  {categoryLabels[cat]}
                </button>
              );
            })}
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="p-4 rounded-full bg-emerald-500/10 mb-4">
                  <ShoppingBag className="h-12 w-12 text-emerald-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Be the first to list something in this category! Click "Sell Something" to get started.
                </p>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-to-r from-emerald-500 to-teal-500">
                  <Plus className="h-4 w-4 mr-2" />
                  List Your First Product
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product, index) => {
                const Icon = categoryIcons[product.category];
                const gradient = categoryGradients[product.category];
                return (
                  <Card 
                    key={product.id} 
                    className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border/50 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Product Image/Placeholder */}
                    <div className={`aspect-square bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-transparent">
                          <Icon className="h-20 w-20 text-white/40" />
                        </div>
                      )}
                      
                      {/* Condition Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-2.5 py-1 ${conditionColors[product.condition]} text-white text-xs font-medium rounded-full shadow-lg`}>
                          {conditionLabels[product.condition]}
                        </span>
                      </div>
                      
                      {product.is_admin_product && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                            <Star className="h-3 w-3 mr-1" />
                            Official
                          </Badge>
                        </div>
                      )}

                      {/* Price Tag */}
                      <div className="absolute bottom-3 right-3">
                        <div className="bg-white/95 dark:bg-card/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-lg">
                          <div className="flex items-center gap-0.5 text-lg font-bold text-foreground">
                            <IndianRupee className="h-4 w-4" />
                            {product.price === 0 ? "Free" : product.price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-2 group-hover:text-emerald-500 transition-colors">
                        {product.title}
                      </h3>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          {product.location && (
                            <>
                              <MapPin className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[100px]">{product.location}</span>
                            </>
                          )}
                        </div>
                        
                        <Badge variant="outline" className="text-xs">
                          {categoryLabels[product.category]}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                        {product.seller && (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-medium">
                              {product.seller.full_name?.charAt(0) || "U"}
                            </div>
                            <span className="text-xs text-muted-foreground truncate max-w-[60px]">
                              {product.seller.full_name || "Anonymous"}
                            </span>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => addToCart(product.id)}
                            size="sm"
                            variant="outline"
                            className="rounded-lg text-xs px-2"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button 
                            onClick={() => handleBuyNow(product)}
                            size="sm"
                            className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-xs px-3"
                          >
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            Buy
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}