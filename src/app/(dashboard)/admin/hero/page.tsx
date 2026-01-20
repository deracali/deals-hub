"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Edit,
  Trash2,
  ImageIcon,
  Type,
  Layout,
  Palette,
  Loader2,
} from "lucide-react";

interface Hero {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  gradient: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function HeroPage() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    image: "",
    gradient: "",
  });

  // ✅ Fetch heroes
  const fetchHeroes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/heroes/get`,
      );
      if (!res.ok) throw new Error("Failed to fetch heroes");
      const data = await res.json();
      setHeroes(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroes();
  }, []);

  // ✅ Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `http://localhost:5000/api/heroes/update/${editingId}`
        : "http://localhost:5000/api/heroes/create";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save hero");

      await fetchHeroes();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        title: "",
        subtitle: "",
        description: "",
        image: "",
        gradient: "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Edit
  const handleEdit = (hero: Hero) => {
    setEditingId(hero._id);
    setFormData({
      title: hero.title,
      subtitle: hero.subtitle,
      description: hero.description,
      image: hero.image,
      gradient: hero.gradient,
    });
    setShowForm(true);
  };

  // ✅ Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hero?")) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/heroes/delete/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete hero");
      await fetchHeroes();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredHeroes = heroes.filter((h) =>
    h.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hero Management</h1>
          <p className="text-muted-foreground">
            Manage hero slides for your landing page
          </p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              title: "",
              subtitle: "",
              description: "",
              image: "",
              gradient: "",
            });
          }}
          className="bg-primary text-white"
        >
          <Plus className="mr-2" size={18} />{" "}
          {showForm ? "Close Form" : "Add Hero"}
        </Button>
      </div>

      {/* Search */}
      <div>
        <Input
          placeholder="Search by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Hero" : "Create New Hero"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="e.g., Discover Amazing Deals"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Subtitle</label>
                <Input
                  placeholder="e.g., Join Our Community"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitle: e.target.value })
                  }
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Brief description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Image URL</label>
                <Input
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Gradient</label>
                <Input
                  placeholder="e.g., bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
                  value={formData.gradient}
                  onChange={(e) =>
                    setFormData({ ...formData, gradient: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex justify-end md:col-span-2 gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 size={18} className="animate-spin mr-2" />
                  ) : null}
                  {editingId ? "Update Hero" : "Create Hero"}
                </Button>
              </div>
            </form>
            {error && <p className="text-destructive mt-2">{error}</p>}
          </CardContent>
        </Card>
      )}

      {/* Heroes List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredHeroes.map((hero) => (
          <Card key={hero._id} className="transition hover:shadow-md">
            <CardContent className="pt-6 space-y-4">
              <div
                className={`w-full h-40 rounded-xl ${hero.gradient} flex items-center justify-center text-white text-xl font-semibold`}
              >
                <img
                  src={hero.image}
                  alt={hero.title}
                  className="w-full h-full object-cover rounded-xl opacity-80"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold">{hero.title}</h3>
                <p className="text-muted-foreground text-sm">{hero.subtitle}</p>
                <p className="text-sm mt-1">{hero.description}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(hero)}
                >
                  <Edit size={16} />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(hero._id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && filteredHeroes.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <ImageIcon
              size={48}
              className="mx-auto text-muted-foreground mb-3"
            />
            <h3 className="font-medium text-lg mb-1">No hero slides found</h3>
            <p className="text-muted-foreground text-sm">
              {searchQuery
                ? "Try changing your search."
                : "Create your first hero slide to get started."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
