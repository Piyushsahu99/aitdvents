import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/useImageUpload";
import { ImageUploader } from "./ImageUploader";
import { 
  ShoppingBag, 
  CheckCircle, 
  XCircle, 
  Clock,
  IndianRupee,
  Loader2,
  Edit,
  Image as ImageIcon
} from "lucide-react";

interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory: string | null;
  condition: string;
  status: string;
  location: string | null;
  contact_info: string | null;
  is_admin_product: boolean;
  created_at: string;
  rejection_reason: string | null;
  images: string[];
}

const categoryLabels: Record<string, string> = {
  electronics: "Electronics",
  books: "Books",
  stationery: "Stationery",
  tasks: "Tasks & Notes",
  other: "Other",
};

const conditionLabels: Record<string, string> = {
  new: "Brand New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
  old: "Used",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  sold: "bg-blue-500",
  archived: "bg-gray-500",
};

export function MarketplaceManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [editMode, setEditMode] = useState<'reject' | 'edit'>('reject');
  const { toast } = useToast();
  const { uploadImage, uploading } = useImageUpload({ bucket: 'product-images' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("marketplace_products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("marketplace_products")
        .update({ 
          status: "approved", 
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Success", description: "Product approved and now live!" });
      fetchProducts();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      toast({ title: "Error", description: "Please provide a rejection reason", variant: "destructive" });
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from("marketplace_products")
        .update({ 
          status: "rejected", 
          rejection_reason: rejectionReason 
        })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Success", description: "Product rejected" });
      setSelectedProduct(null);
      setRejectionReason("");
      fetchProducts();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from("marketplace_products")
        .update({
          title: editingProduct.title,
          description: editingProduct.description,
          price: editingProduct.price,
          images: editingProduct.images,
          location: editingProduct.location,
        })
        .eq("id", editingProduct.id);

      if (error) throw error;
      toast({ title: "Success", description: "Product updated" });
      setEditingProduct(null);
      fetchProducts();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleImageUpload = async (file: File, index: number) => {
    if (!editingProduct) return null;
    
    const url = await uploadImage(file);
    if (url) {
      const newImages = [...(editingProduct.images || [])];
      if (index >= newImages.length) {
        newImages.push(url);
      } else {
        newImages[index] = url;
      }
      setEditingProduct({ ...editingProduct, images: newImages });
    }
    return url;
  };

  const removeImage = (index: number) => {
    if (!editingProduct) return;
    const newImages = editingProduct.images.filter((_, i) => i !== index);
    setEditingProduct({ ...editingProduct, images: newImages });
  };

  const pendingProducts = products.filter(p => p.status === "pending");
  const approvedProducts = products.filter(p => p.status === "approved");
  const rejectedProducts = products.filter(p => p.status === "rejected");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold">{products.length}</p>
          <p className="text-xs text-muted-foreground">Total Products</p>
        </Card>
        <Card className="p-3 text-center bg-yellow-500/10">
          <p className="text-2xl font-bold text-yellow-600">{pendingProducts.length}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </Card>
        <Card className="p-3 text-center bg-green-500/10">
          <p className="text-2xl font-bold text-green-600">{approvedProducts.length}</p>
          <p className="text-xs text-muted-foreground">Approved</p>
        </Card>
        <Card className="p-3 text-center bg-red-500/10">
          <p className="text-2xl font-bold text-red-600">{rejectedProducts.length}</p>
          <p className="text-xs text-muted-foreground">Rejected</p>
        </Card>
      </div>

      {/* Pending Approvals */}
      {pendingProducts.length > 0 && (
        <Card className="border-yellow-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <Clock className="h-5 w-5" />
              Pending Approval ({pendingProducts.length})
            </CardTitle>
            <CardDescription>Review and approve product listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.images?.[0] ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.title}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {product.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{categoryLabels[product.category] || product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-semibold">
                          <IndianRupee className="h-3 w-3" />
                          {product.price === 0 ? 'Free' : product.price}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{conditionLabels[product.condition] || product.condition}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            onClick={() => handleApprove(product.id)}
                            disabled={processing}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => { setEditingProduct(product); setEditMode('edit'); }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => { setSelectedProduct(product); setEditMode('reject'); }}
                            disabled={processing}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            All Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No products yet
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.images?.[0] ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.title}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.title}</p>
                          {product.is_admin_product && (
                            <Badge className="text-xs">Admin Product</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{categoryLabels[product.category] || product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" />
                          {product.price === 0 ? 'Free' : product.price}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[product.status]} text-white`}>
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => { setEditingProduct(product); setEditMode('edit'); }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={!!selectedProduct && editMode === 'reject'} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Product</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting "{selectedProduct?.title}"
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setSelectedProduct(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedProduct && handleReject(selectedProduct.id)}
              disabled={processing}
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Rejection
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Product
            </DialogTitle>
            <DialogDescription>
              Update product details and images
            </DialogDescription>
          </DialogHeader>
          
          {editingProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={editingProduct.title}
                    onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={editingProduct.location || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, location: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Product Images ({editingProduct.images?.length || 0}/5)
                </Label>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(editingProduct.images || []).map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {(editingProduct.images?.length || 0) < 5 && (
                    <ImageUploader
                      value=""
                      onChange={(url) => {
                        if (url) {
                          const newImages = [...(editingProduct.images || []), url];
                          setEditingProduct({ ...editingProduct, images: newImages });
                        }
                      }}
                      onUpload={(file) => handleImageUpload(file, editingProduct.images?.length || 0)}
                      uploading={uploading}
                      showPreview={false}
                      label="Add Image"
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setEditingProduct(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateProduct} disabled={processing}>
                  {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
