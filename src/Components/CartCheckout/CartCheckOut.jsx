"use client";

import { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";

export default function CartCheckOuts() {
  const [sortBy, setSortBy] = useState("price");
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "iPhone 11 pro",
      specs: "256GB, Navy Blue",
      quantity: 2,
      price: 900,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 2,
      name: "Samsung galaxy Note 10",
      specs: "256GB, Navy Blue",
      quantity: 2,
      price: 900,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 3,
      name: "Canon EOS M50",
      specs: "Onyx Black",
      quantity: 1,
      price: 1199,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 4,
      name: "MacBook Pro",
      specs: "1TB, Graphite",
      quantity: 1,
      price: 1799,
      image: "/placeholder.svg?height=80&width=80",
    },
  ]);

  // Add functions to handle quantity changes
  const increaseQuantity = (id) => {
    setCartItems(
      cartItems.map((item) => {
        if (item.id === id) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      })
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems(
      cartItems.map((item) => {
        if (item.id === id && item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      })
    );
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = 20;
  const total = subtotal + shipping;

  // Replace the static cart items with a dynamic map
  // Replace the entire space-y-4 div containing the products with this:

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl rounded-lg bg-white p-6 shadow-md">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Shopping Cart Section */}
          <div className="lg:col-span-2">
            <Link
              href="#"
              className="mb-6 inline-flex items-center text-gray-600 hover:text-[#2c6c53]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue shopping
            </Link>

            <div className="mb-6 border-b border-gray-200 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-xl font-medium">Shopping cart</h1>
                <p className="text-gray-600">
                  You have {cartItems.length} items in your cart
                </p>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none rounded border border-gray-300 bg-white px-3 py-1 pr-8 text-sm focus:border-[#2c6c53] focus:outline-none"
                    >
                      <option value="price">price</option>
                      <option value="name">name</option>
                      <option value="newest">newest</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex-grow">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.specs}</p>
                    </div>

                    <div className="flex items-center gap-4 md:gap-8">
                      <div className="flex items-center">
                        <button
                          onClick={() => decreaseQuantity(item.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-l border border-gray-300 bg-gray-50 hover:bg-gray-100"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <div className="flex h-8 w-10 items-center justify-center border-y border-gray-300 bg-white text-center">
                          {item.quantity}
                        </div>
                        <button
                          onClick={() => increaseQuantity(item.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-r border border-gray-300 bg-gray-50 hover:bg-gray-100"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="w-24 text-right">
                        <span className="text-lg font-medium">
                          ${item.price * item.quantity}
                        </span>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-[#4a7dbd] p-6 text-white">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-medium">Card details</h2>
                <div className="h-10 w-10 overflow-hidden rounded-full bg-white">
                  <Image
                    src="/placeholder.svg?height=40&width=40"
                    alt="Profile"
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="mb-6">
                <p className="mb-2">Card type</p>
                <div className="flex gap-2">
                  <div className="flex h-10 w-14 items-center justify-center rounded bg-white p-1">
                    <Image
                      src="/placeholder.svg?height=24&width=36"
                      alt="Mastercard"
                      width={36}
                      height={24}
                      className="h-6 object-contain"
                    />
                  </div>
                  <div className="flex h-10 w-14 items-center justify-center rounded bg-white p-1">
                    <Image
                      src="/placeholder.svg?height=24&width=36"
                      alt="Visa"
                      width={36}
                      height={24}
                      className="h-6 object-contain"
                    />
                  </div>
                  <div className="flex h-10 w-14 items-center justify-center rounded bg-white p-1">
                    <Image
                      src="/placeholder.svg?height=24&width=36"
                      alt="American Express"
                      width={36}
                      height={24}
                      className="h-6 object-contain"
                    />
                  </div>
                  <div className="flex h-10 w-14 items-center justify-center rounded bg-white p-1">
                    <Image
                      src="/placeholder.svg?height=24&width=36"
                      alt="PayPal"
                      width={36}
                      height={24}
                      className="h-6 object-contain"
                    />
                  </div>
                </div>
              </div>

              <form className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Cardholder's Name"
                    className="w-full rounded border-0 bg-white/10 p-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Card Number"
                    className="w-full rounded border-0 bg-white/10 p-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Expiration"
                    className="w-full rounded border-0 bg-white/10 p-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <input
                    type="text"
                    placeholder="Cvv"
                    className="w-full rounded border-0 bg-white/10 p-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
              </form>

              <div className="mt-8 border-t border-white/20 pt-4">
                <div className="flex justify-between py-2">
                  <span>Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Shipping</span>
                  <span className="font-medium">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Total(Incl. taxes)</span>
                  <span className="font-medium">${total.toFixed(2)}</span>
                </div>
              </div>

              <button className="mt-6 w-full rounded bg-[#5bc0de] p-3 font-medium text-white transition-colors hover:bg-[#31b0d5]">
                <div className="flex items-center justify-between">
                  <span>${total.toFixed(2)}</span>
                  <div className="flex items-center">
                    <span className="mr-2">CHECKOUT</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
