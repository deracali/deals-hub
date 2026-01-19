"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, ImageIcon, Percent, Package } from "lucide-react";

interface CuratedCategory {
  _id: string;
  title: string;
  description: string;
  image: string;
  dealsCount: number;
  maxDiscount: number;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function CuratedDealsPage(): JSX.Element {
  const [categories, setCategories] = useState<CuratedCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    dealsCount: "",
    maxDiscount: "",
    color: "bg-blue-600",
  });

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/curated-categories/get`,
      );
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error fetching curated deals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle create or update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      title: formData.title,
      description: formData.description,
      image: formData.image,
      dealsCount: Number(formData.dealsCount),
      maxDiscount: Number(formData.maxDiscount),
      color: formData.color,
    };

    try {
      const url = editingId
        ? `http://localhost:5000/api/curated-categories/update/${editingId}`
        : "http://localhost:5000/api/curated-categories/create";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save category");

      await fetchCategories();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        title: "",
        description: "",
        image: "",
        dealsCount: "",
        maxDiscount: "",
        color: "bg-blue-600",
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (category: CuratedCategory) => {
    setEditingId(category._id);
    setFormData({
      title: category.title,
      description: category.description,
      image: category.image,
      dealsCount: String(category.dealsCount),
      maxDiscount: String(category.maxDiscount),
      color: category.color,
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this curated category?"))
      return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/curated-categories/delete/${id}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) throw new Error("Failed to delete category");
      await fetchCategories();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Curated Deal Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage curated deal collections and their promotional info
          </p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
          }}
          className="bg-primary"
        >
          <Plus size={18} className="mr-2" /> Add New
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? "Edit Category" : "Add New Category"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Deals Count</label>
                <Input
                  type="number"
                  value={formData.dealsCount}
                  onChange={(e) =>
                    setFormData({ ...formData, dealsCount: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Max Discount (%)</label>
                <Input
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) =>
                    setFormData({ ...formData, maxDiscount: e.target.value })
                  }
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Image URL</label>
                <Input
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Color Class</label>
                <Input
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-2 md:col-span-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : editingId ? "Update" : "Create"}
                </Button>
              </div>
            </form>
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((cat) => (
          <Card
            key={cat._id}
            className="border-border transition hover:shadow-md overflow-hidden"
          >
            <div
              className="h-40 bg-cover bg-center"
              style={{ backgroundImage: `url(${cat.image})` }}
            />
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">{cat.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="p-2 hover:bg-accent rounded-lg"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="p-2 hover:bg-accent rounded-lg"
                  >
                    <Trash2 size={16} className="text-destructive" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{cat.description}</p>
              <div className="flex items-center gap-2 text-sm">
                <Package size={14} /> {cat.dealsCount} deals
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Percent size={14} /> Up to {cat.maxDiscount}% off
              </div>
              <div className="text-xs text-muted-foreground">
                Color: {cat.color}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && filteredCategories.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">
          No curated categories found.
        </Card>
      )}
    </div>
  );
}
