import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  Loader2, 
  IndianRupee, 
  Eye, 
  MapPin,
  Phone,
  User,
  CheckCircle,
  Clock,
  Truck,
  XCircle
} from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  payment_status: string;
  subtotal: number;
  discount_amount: number;
  total: number;
  delivery_name: string;
  delivery_phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  delivery_pincode: string;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_title: string;
  product_price: number;
  quantity: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-blue-500",
  shipped: "bg-purple-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle,
  shipped: Truck,
  delivered: Package,
  cancelled: XCircle,
};

export function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const viewOrder = async (order: Order) => {
    setSelectedOrder(order);
    
    const { data, error } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);

    if (!error) {
      setOrderItems(data || []);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) throw error;
      toast({ title: "Success", description: `Order marked as ${status}` });
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    confirmed: orders.filter(o => o.status === "confirmed").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Package className="h-5 w-5 text-emerald-500" />
          Order Management
        </h2>
        <p className="text-sm text-muted-foreground">Track and manage customer orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-2">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </Card>
        <Card className="p-3 text-center bg-yellow-500/10">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </Card>
        <Card className="p-3 text-center bg-blue-500/10">
          <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
          <p className="text-xs text-muted-foreground">Confirmed</p>
        </Card>
        <Card className="p-3 text-center bg-purple-500/10">
          <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
          <p className="text-xs text-muted-foreground">Shipped</p>
        </Card>
        <Card className="p-3 text-center bg-green-500/10">
          <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
          <p className="text-xs text-muted-foreground">Delivered</p>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No orders yet
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const StatusIcon = statusIcons[order.status] || Clock;
                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {order.order_number}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.delivery_name}</p>
                          <p className="text-xs text-muted-foreground">{order.delivery_city}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1 font-semibold">
                          <IndianRupee className="h-3 w-3" />
                          {order.total}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[order.status]} text-white`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => viewOrder(order)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="font-mono">
                  {selectedOrder.order_number}
                </Badge>
                <Badge className={`${statusColors[selectedOrder.status]} text-white`}>
                  {selectedOrder.status}
                </Badge>
              </div>

              {/* Customer Info */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-3 space-y-2">
                  <p className="font-medium">{selectedOrder.delivery_name}</p>
                  <p className="text-sm flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {selectedOrder.delivery_phone}
                  </p>
                  <p className="text-sm flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-3 w-3 mt-1" />
                    {selectedOrder.delivery_address}, {selectedOrder.delivery_city}, {selectedOrder.delivery_state} - {selectedOrder.delivery_pincode}
                  </p>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-3">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
                      <span>{item.product_title} x{item.quantity}</span>
                      <span className="font-semibold">₹{item.product_price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="pt-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>₹{selectedOrder.subtotal}</span>
                    </div>
                    {selectedOrder.discount_amount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600">
                        <span>Discount</span>
                        <span>-₹{selectedOrder.discount_amount}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span className="text-emerald-600">₹{selectedOrder.total}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedOrder.status === "confirmed" ? "default" : "outline"}
                  onClick={() => updateOrderStatus(selectedOrder.id, "confirmed")}
                  disabled={updating}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Confirm
                </Button>
                <Button
                  size="sm"
                  variant={selectedOrder.status === "shipped" ? "default" : "outline"}
                  onClick={() => updateOrderStatus(selectedOrder.id, "shipped")}
                  disabled={updating}
                >
                  <Truck className="h-4 w-4 mr-1" />
                  Shipped
                </Button>
                <Button
                  size="sm"
                  variant={selectedOrder.status === "delivered" ? "default" : "outline"}
                  onClick={() => updateOrderStatus(selectedOrder.id, "delivered")}
                  disabled={updating}
                >
                  <Package className="h-4 w-4 mr-1" />
                  Delivered
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => updateOrderStatus(selectedOrder.id, "cancelled")}
                  disabled={updating}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
