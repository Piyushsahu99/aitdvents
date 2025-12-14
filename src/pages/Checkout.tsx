import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingBag,
  MapPin,
  CreditCard,
  IndianRupee,
  Loader2,
  Check,
  Copy,
  Smartphone,
  Tag,
  Package,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

const UPI_ID = "9919562443-0@airtel";

export default function Checkout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cartItems, cartTotal, clearCart } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [user, setUser] = useState<any>(null);
  
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      navigate("/store");
      return;
    }
    setUser(session.user);
    
    // Pre-fill from profile
    const { data: profile } = await supabase
      .from("student_profiles")
      .select("full_name, phone")
      .eq("user_id", session.user.id)
      .single();
    
    if (profile) {
      setDeliveryInfo(prev => ({
        ...prev,
        name: profile.full_name || "",
        phone: profile.phone || "",
      }));
    }
  };

  const discount = appliedCoupon ? Number(appliedCoupon.discount_amount) : 0;
  const finalTotal = Math.max(0, cartTotal - discount);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setCouponLoading(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (error || !data) {
        toast({ title: "Invalid Coupon", description: "This coupon code is not valid", variant: "destructive" });
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast({ title: "Expired Coupon", description: "This coupon has expired", variant: "destructive" });
        return;
      }

      if (data.max_uses && data.current_uses >= data.max_uses) {
        toast({ title: "Coupon Limit Reached", description: "This coupon has reached its usage limit", variant: "destructive" });
        return;
      }

      if (data.min_order_amount && cartTotal < Number(data.min_order_amount)) {
        toast({ 
          title: "Minimum Order Required", 
          description: `Minimum order of ₹${data.min_order_amount} required`, 
          variant: "destructive" 
        });
        return;
      }

      setAppliedCoupon(data);
      toast({ title: "Coupon Applied!", description: `₹${data.discount_amount} discount applied` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to apply coupon", variant: "destructive" });
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const validateForm = () => {
    const { name, phone, address, city, state, pincode } = deliveryInfo;
    if (!name || !phone || !address || !city || !state || !pincode) {
      toast({ title: "Missing Information", description: "Please fill all delivery details", variant: "destructive" });
      return false;
    }
    if (phone.length < 10) {
      toast({ title: "Invalid Phone", description: "Please enter a valid phone number", variant: "destructive" });
      return false;
    }
    if (pincode.length !== 6) {
      toast({ title: "Invalid Pincode", description: "Please enter a valid 6-digit pincode", variant: "destructive" });
      return false;
    }
    return true;
  };

  const proceedToPayment = () => {
    if (!validateForm()) return;
    setShowPayment(true);
  };

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    toast({ title: "UPI ID Copied!", description: "Paste it in your payment app" });
    setTimeout(() => setCopied(false), 2000);
  };

  const openUPIApp = () => {
    const upiLink = `upi://pay?pa=${UPI_ID}&pn=AITD%20Store&am=${finalTotal}&cu=INR&tn=Order%20Payment`;
    window.location.href = upiLink;
  };

  const confirmPayment = async () => {
    setLoading(true);
    try {
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          subtotal: cartTotal,
          discount_amount: discount,
          total: finalTotal,
          coupon_id: appliedCoupon?.id || null,
          delivery_name: deliveryInfo.name,
          delivery_phone: deliveryInfo.phone,
          delivery_address: deliveryInfo.address,
          delivery_city: deliveryInfo.city,
          delivery_state: deliveryInfo.state,
          delivery_pincode: deliveryInfo.pincode,
          payment_status: "completed",
          status: "confirmed",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_title: item.product.title,
        product_price: item.product.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update coupon usage if applied
      if (appliedCoupon) {
        await supabase
          .from("coupons")
          .update({ current_uses: appliedCoupon.current_uses + 1 })
          .eq("id", appliedCoupon.id);
      }

      // Send confirmation emails
      try {
        await supabase.functions.invoke("send-order-confirmation", {
          body: {
            orderNumber,
            customerEmail: user.email,
            customerName: deliveryInfo.name,
            items: cartItems.map(item => ({
              title: item.product.title,
              price: item.product.price,
              quantity: item.quantity,
            })),
            subtotal: cartTotal,
            discount,
            total: finalTotal,
            deliveryAddress: `${deliveryInfo.address}, ${deliveryInfo.city}, ${deliveryInfo.state} - ${deliveryInfo.pincode}`,
          },
        });
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }

      // Clear cart
      await clearCart();
      
      setOrderId(orderNumber);
      setShowPayment(false);
      setOrderSuccess(true);
    } catch (error: any) {
      console.error("Order error:", error);
      toast({ title: "Order Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-6">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
            <p className="text-muted-foreground mb-4">
              Your order has been placed successfully
            </p>
            <Badge className="mb-6 text-lg px-4 py-2">{orderId}</Badge>
            <p className="text-sm text-muted-foreground mb-6">
              You will receive a confirmation email shortly
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate("/store")}>
                Continue Shopping
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500" onClick={() => navigate("/profile")}>
                View Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <Button variant="ghost" onClick={() => navigate("/cart")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Button>

        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-emerald-500" />
          Checkout
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Delivery Address */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-500" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      value={deliveryInfo.name}
                      onChange={(e) => setDeliveryInfo({ ...deliveryInfo, name: e.target.value })}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number *</Label>
                    <Input
                      value={deliveryInfo.phone}
                      onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })}
                      placeholder="10-digit phone number"
                      maxLength={10}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address *</Label>
                  <Textarea
                    value={deliveryInfo.address}
                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
                    placeholder="House/Flat No., Street, Area"
                    rows={2}
                  />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>City *</Label>
                    <Input
                      value={deliveryInfo.city}
                      onChange={(e) => setDeliveryInfo({ ...deliveryInfo, city: e.target.value })}
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State *</Label>
                    <Input
                      value={deliveryInfo.state}
                      onChange={(e) => setDeliveryInfo({ ...deliveryInfo, state: e.target.value })}
                      placeholder="State"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pincode *</Label>
                    <Input
                      value={deliveryInfo.pincode}
                      onChange={(e) => setDeliveryInfo({ ...deliveryInfo, pincode: e.target.value })}
                      placeholder="6-digit pincode"
                      maxLength={6}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coupon Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-emerald-500" />
                  Apply Coupon
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-emerald-500" />
                      <span className="font-semibold">{appliedCoupon.code}</span>
                      <Badge className="bg-emerald-500">-₹{appliedCoupon.discount_amount}</Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={removeCoupon}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="flex-1"
                    />
                    <Button onClick={applyCoupon} disabled={couponLoading}>
                      {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="truncate max-w-[180px]">{item.product.title} x{item.quantity}</span>
                    <span className="flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      {item.product.price * item.quantity}
                    </span>
                  </div>
                ))}
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="flex items-center gap-1">
                      <IndianRupee className="h-4 w-4" />
                      {cartTotal}
                    </span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-emerald-600">Free</span>
                  </div>
                </div>

                <div className="border-t pt-4 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="flex items-center gap-1 text-emerald-600">
                    <IndianRupee className="h-5 w-5" />
                    {finalTotal}
                  </span>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  size="lg"
                  onClick={proceedToPayment}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay ₹{finalTotal}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-500" />
              Complete Payment
            </DialogTitle>
            <DialogDescription>
              Pay via UPI to complete your order
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            <div className="text-center p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl">
              <p className="text-sm text-muted-foreground mb-2">Amount to Pay</p>
              <div className="flex items-center justify-center gap-1 text-4xl font-bold text-emerald-600">
                <IndianRupee className="h-8 w-8" />
                {finalTotal}
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={openUPIApp} className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500">
                <Smartphone className="h-5 w-5 mr-2" />
                Pay with UPI App
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or copy UPI ID</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Input value={UPI_ID} readOnly className="text-center font-mono" />
                <Button variant="outline" size="icon" onClick={copyUPI}>
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              onClick={confirmPayment}
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  I've Completed Payment
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
