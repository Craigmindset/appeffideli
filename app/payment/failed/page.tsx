"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Order = {
  reference: string;
  amount: number;
  apartment_type?: string;
  order_type?: string;
};

function PaymentFailedContent({ reference }: { reference: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Fetch order details
    const fetchOrder = async () => {
      try {
        const { data } = await fetch(`/api/get-order?reference=${reference}`).then(res => res.json());
        if (data) {
          setOrder(data);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      }
    };

    fetchOrder();
  }, [reference]);

  useEffect(() => {
    // Only redirect for household purchase orders
    if (order?.order_type === "download" && order?.apartment_type !== "infant-recipe") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push("/household-purchase");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [order, router]);

  const isHouseholdPurchase = order?.order_type === "download" && order?.apartment_type !== "infant-recipe";

  return (
    <div className="text-center">
      <div className="flex justify-center mb-6">
        <XCircle className="h-16 w-16 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold mb-4">Payment Failed</h1>
      <p className="mb-6">We were unable to process your payment.</p>

      {order && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 max-w-md mx-auto text-left">
          <h2 className="text-lg font-semibold mb-4">Order Details</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reference:</span>
              <span>{order.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span>₦{order.amount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {isHouseholdPurchase && countdown > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
          <p className="text-sm text-blue-800">
            Redirecting you back to the purchase page in <span className="font-bold">{countdown}</span> seconds...
          </p>
        </div>
      )}

      <div className="space-y-4">
        {isHouseholdPurchase ? (
          <>
            <Button asChild>
              <Link href="/household-purchase">Return to Purchase Page</Link>
            </Button>
            <div>
              <Button variant="outline" asChild>
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <Button asChild>
              <Link href="/services">Try Again</Link>
            </Button>
            <div>
              <Button variant="outline" asChild>
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentFailedPage({
  searchParams,
}: {
  searchParams: { reference?: string };
}) {
  const reference = searchParams.reference || "";

  return (
    <div className="container max-w-4xl py-12">
      <PaymentFailedContent reference={reference} />
    </div>
  );
}

