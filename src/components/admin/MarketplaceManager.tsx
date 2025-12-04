import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingBag, 
  CheckCircle, 
  XCircle, 
  Eye,
  Clock,
  IndianRupee,
  Loader2,
  Package
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
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

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
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingProducts.map((product) => (
                    <TableRow key={product.id}>
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
                        {product.subcategory && (
                          <Badge variant="secondary" className="ml-1 text-xs">{product.subcategory}</Badge>
                        )}
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
                      <TableCell className="text-sm text-muted-foreground">
                        {product.location || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleApprove(product.id)}
                            disabled={processing}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => setSelectedProduct(product)}
                            disabled={processing}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
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
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No products yet
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
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
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(product.created_at).toLocaleDateString()}
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
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
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
    </div>
  );
}