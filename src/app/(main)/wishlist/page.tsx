"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Header from "@/components/general/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, Bookmark, ShoppingBag } from "lucide-react";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const popup = (message: string) => {
    const div = document.createElement("div");
    div.innerText = message;
    div.className = "fixed top-5 left-1/2 -translate-x-1/2 bg-black text-white text-sm px-4 py-2 rounded-lg shadow-lg z-[9999]";
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2000);
  };

  // --- 1. Load Data from LocalStorage ---
  const loadLocalBookmarks = useCallback(() => {
    setLoading(true);
    try {
      const localData = localStorage.getItem('savedDeals');
      if (localData) {
        const parsedData = JSON.parse(localData);

        // Convert the object/array from localStorage into the array format the UI expects
        // This handles both array format and object-index format
        const itemsArray = Array.isArray(parsedData)
          ? parsedData
          : Object.values(parsedData);

        setBookmarks(itemsArray);
      } else {
        setBookmarks([]);
      }
    } catch (error) {
      console.error("Error loading bookmarks from localStorage:", error);
      popup("Failed to load saved items");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocalBookmarks();
  }, [loadLocalBookmarks]);

  // --- 2. Remove Bookmark ---
  const handleRemove = (bookmarkId: string) => {
    try {
      const updated = bookmarks.filter(item => (item._id || item.id) !== bookmarkId);
      setBookmarks(updated);

      // Update LocalStorage so it persists
      localStorage.setItem('savedDeals', JSON.stringify(updated));
      popup("Removed from bookmarks");
    } catch (error) {
      popup("Failed to remove bookmark");
    }
  };

  const isEmpty = !loading && bookmarks.length === 0;

  return (
    <div className="p-6 bg-white min-h-screen font-sans max-w-7xl mx-auto">
      <Header />

      <div className="mb-10 mt-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Bookmark className="text-blue-500" fill="currentColor" size={28} />
            My Bookmarks
          </h1>
          <p className="text-gray-500 mt-1">Items you've saved from local storage.</p>
        </div>
        <div className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
          {bookmarks.length} Saved Items
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-3xl" />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-gray-100 rounded-[3rem]">
          <div className="bg-gray-50 p-8 rounded-full mb-6">
            <Bookmark className="w-12 h-12 text-gray-200" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Your wishlist is empty</h2>
          <Button
            onClick={() => window.location.href = '/deals'}
            className="mt-8 bg-blue-500 hover:bg-blue-600 rounded-2xl px-8 h-12 font-bold"
          >
            Start Exploring
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-20">
          {bookmarks.map((item) => {
            // Using || to handle different ID and Price naming conventions in your storage
            const itemId = item._id || item.id;
            const itemPrice = item.discountedPrice || item.price || 0;
            const itemImage = item.image || (item.images && item.images[0]);

            return (
              <Card key={itemId} className="group border-none shadow-sm hover:shadow-xl transition-all py-0 duration-300 rounded-[2rem] overflow-hidden bg-gray-50/50">
                <CardContent className="p-0">
                  <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
                    <img
                      src={itemImage || "/api/placeholder/400/320"}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => handleRemove(itemId)}
                        className="p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-xl shadow-sm hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">
                      {item.category || 'Deal'}
                    </p>
                    <h3 className="font-bold text-gray-900 line-clamp-1">{item.title}</h3>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-bold">Price</span>
                        <span className="text-lg font-black text-gray-900">
                          {item.currencySymbol || item.currency || '$'}
                          {Number(itemPrice).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-xl border-gray-200 hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => window.open(item.url, '_blank')}
                        >
                          <ExternalLink size={18} />
                        </Button>
                        <Button
                          className="rounded-xl bg-gray-900 hover:bg-blue-600 text-white font-bold px-4"
                          onClick={() => window.location.href = `/deals/${itemId}`}
                        >
                          <ShoppingBag size={18} className="mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
