import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Package,
  IndianRupee,
  Loader2,
} from "lucide-react";

const categoryGradients: Record<string, string> = {
  electronics: "from-blue-500 to-cyan-500",
  books: "from-emerald-500 to-teal-500",
  stationery: "from-orange-500 to-amber-500",
  tasks: "from-violet-500 to-purple-500",
  other: "from-pink-500 to-rose-500",
};

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, loading, cartTotal, removeFromCart, updateQuantity } = useCart();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add some products to get started</p>
        <Button onClick={() => navigate("/store")} className="bg-gradient-to-r from-emerald-500 to-teal-500">
          <ShoppingBag className="h-4 w-4 mr-2" />
          Browse Store
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="h-8 w-8 text-emerald-500" />
          <h1 className="text-3xl font-bold">Your Cart</h1>
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            {cartItems.length} items
          </Badge>
        </div>

        <div className="grid gap-4 mb-8">
          {cartItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${categoryGradients[item.product?.category || 'other']} flex items-center justify-center flex-shrink-0`}>
                    <Package className="h-8 w-8 text-white/60" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{item.product?.title}</h3>
                    <Badge variant="outline" className="text-xs mt-1">
                      {item.product?.condition}
                    </Badge>
                    <div className="flex items-center gap-1 mt-2 text-lg font-bold text-emerald-600">
                      <IndianRupee className="h-4 w-4" />
                      {item.product?.price || 0}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <Card className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal ({cartItems.length} items)</span>
              <span className="flex items-center gap-1">
                <IndianRupee className="h-4 w-4" />
                {cartTotal}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span className="text-emerald-600">Free</span>
            </div>
            <div className="border-t pt-4 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="flex items-center gap-1 text-emerald-600">
                <IndianRupee className="h-5 w-5" />
                {cartTotal}
              </span>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              size="lg"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
