"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { ORDERS_COLLECTION, toOrder } from "@/lib/firebase/orders";
import { useAuth } from "@/context/AuthContext";
import type { Order } from "@/models/types";
import { Icon } from "@/components/Icon";

const STATUS_STEPS = ["Placed", "Processing", "Shipped", "Delivered"];

export default function OrderStatusPage() {
  const { user, isAuth } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing local state when the dependency (user) itself changes
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    // Live listener, matches OrderStatus's .snapshots() stream in the
    // Flutter app — order status updates appear without a manual refresh.
    const q = query(collection(getDb(), ORDERS_COLLECTION), where("id", "==", user.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map((doc) => toOrder(doc.id, doc.data())));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  if (!isAuth) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile lg:px-gutter py-24 flex flex-col items-center text-center gap-6">
        <Icon name="local_shipping" className="text-[40px] text-on-surface-variant" />
        <p className="text-body-lg text-on-surface-variant">Please log in to view your orders.</p>
        <Link href="/login" className="bg-primary text-on-primary px-8 py-3 uppercase text-[13px] font-semibold tracking-wider">
          Log In
        </Link>
      </div>
    );
  }

  const sortedOrders = orders.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile lg:px-gutter py-12 pb-section-gap">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-16">
        <div className="lg:col-span-3">
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-6 lg:sticky lg:top-32">
            <h2 className="font-display text-[24px] text-primary text-center mb-1">{user?.name}</h2>
            <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-bronze-accent mb-6">
              Preferred Client
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
                  <Icon name="call" className="text-[18px] text-primary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Phone</p>
                  <p className="text-body-md text-primary">{user?.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
                  <Icon name="mail" className="text-[18px] text-primary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Email</p>
                  <p className="text-body-md text-primary break-all">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
                  <Icon name="location_city" className="text-[18px] text-primary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">City</p>
                  <p className="text-body-md text-primary">{user?.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
                  <Icon name="home" className="text-[18px] text-primary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Address</p>
                  <p className="text-body-md text-primary">{user?.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-9">
          <div className="flex items-baseline justify-between mb-8">
            <h1 className="font-display text-[32px] lg:text-[40px] text-primary">My Orders</h1>
            <span className="text-body-md text-on-surface-variant italic">
              {orders.length} order{orders.length === 1 ? "" : "s"} found
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-outline-variant border-t-primary rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-on-surface-variant">
              <Icon name="inventory_2" className="text-[32px]" />
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {sortedOrders.map((order) => (
                <button
                  key={order.docId}
                  type="button"
                  onClick={() => setSelected(order)}
                  className="flex items-center gap-5 bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-5 text-left hover:shadow-md transition-shadow"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={order.items[0]?.imageUrl}
                    alt=""
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0 bg-surface-container-low"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="bg-secondary-container text-on-secondary-container text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full">
                        {order.orderStatus}
                      </span>
                      <span className="text-[12px] text-on-surface-variant">Order #{order.docId.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <h3 className="font-display text-[19px] text-primary truncate">
                      {order.items[0]?.name}
                      {order.items.length > 1 ? ` + ${order.items.length - 1} more` : ""}
                    </h3>
                    <p className="text-body-md text-on-surface-variant mt-1">{order.totalAmount}&#2547;</p>
                  </div>
                  <div className="hidden sm:block text-[12px] text-on-surface-variant flex-shrink-0">
                    {order.createdAt.toLocaleDateString()}
                  </div>
                  <Icon name="chevron_right" className="text-on-surface-variant flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal>
          <div className="absolute inset-0 bg-primary/50" onClick={() => setSelected(null)} />
          <div className="relative bg-surface rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-surface flex items-center justify-between px-8 py-6 border-b border-outline-variant/20">
              <h2 className="font-display text-[24px] text-primary">Order #{selected.docId.slice(0, 8).toUpperCase()}</h2>
              <button type="button" aria-label="Close" onClick={() => setSelected(null)}>
                <Icon name="close" className="text-on-surface" />
              </button>
            </div>
            <div className="p-8 flex flex-col gap-8">
              <div>
                <h3 className="text-[13px] font-semibold text-primary uppercase tracking-widest mb-5">Tracking Information</h3>
                <div className="flex flex-col">
                  {STATUS_STEPS.map((step, i) => {
                    const currentIndex = STATUS_STEPS.indexOf(selected.orderStatus);
                    const reached = currentIndex >= 0 ? i <= currentIndex : i === 0;
                    const isLast = i === STATUS_STEPS.length - 1;
                    return (
                      <div key={step} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              reached ? "bg-primary" : "bg-surface-container-high"
                            }`}
                          >
                            {reached && <div className="w-2 h-2 rounded-full bg-on-primary" />}
                          </div>
                          {!isLast && <div className={`w-px flex-1 min-h-8 ${reached ? "bg-primary" : "bg-outline-variant/40"}`} />}
                        </div>
                        <div className="pb-8">
                          <p className={`text-[13px] font-semibold uppercase tracking-wide ${reached ? "text-primary" : "text-on-surface-variant"}`}>
                            {step}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-surface-container-low rounded-xl p-6">
                <h3 className="text-[13px] font-semibold text-primary uppercase tracking-widest mb-4">Order Details</h3>
                <div className="flex flex-col gap-4 mb-4">
                  {selected.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt={item.name} className="w-14 h-14 object-cover rounded-md flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-body-md text-primary truncate">{item.name}</p>
                        <p className="text-[12px] text-on-surface-variant">Qty {item.quantity}</p>
                      </div>
                      <span className="text-body-md text-primary">{item.price * item.quantity}&#2547;</span>
                    </div>
                  ))}
                </div>
                <div className="w-full h-px bg-outline-variant/30 my-4" />
                <div className="flex justify-between font-display text-[18px] text-primary mb-4">
                  <span>Total</span>
                  <span>{selected.totalAmount}&#2547;</span>
                </div>
                <div className="flex items-start gap-2 text-body-md text-on-surface-variant">
                  <Icon name="location_on" className="text-[18px] flex-shrink-0" />
                  <span>
                    {selected.address}, {selected.city}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
