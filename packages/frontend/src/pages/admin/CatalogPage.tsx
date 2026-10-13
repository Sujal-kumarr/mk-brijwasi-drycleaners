import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { useFetch, useMutate } from '../../hooks/useApi';
import { api } from '../../lib/api';
import { Plus, Edit2, Trash2, Tag, Shirt, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';

export function CatalogPage() {
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);

  // Editing state
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedItemForPrice, setSelectedItemForPrice] = useState<any>(null);

  // Forms state
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '' });
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    pricingUnit: 'PER_PIECE',
    categoryId: '',
  });
  const [priceForm, setPriceForm] = useState({
    laundryServiceId: '',
    priceInRupees: '50',
    estimatedDays: 2,
  });

  // Queries
  const { data: categories, isLoading, refetch: refetchCategories } = useFetch<any[]>(
    ['adminCategories'],
    '/catalog/categories'
  );
  const { data: services } = useFetch<any[]>(['adminServices'], '/catalog/services');

  React.useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategoryTab) {
      setSelectedCategoryTab(categories[0].id);
    }
  }, [categories, selectedCategoryTab]);

  const activeCategory = categories?.find((c) => c.id === selectedCategoryTab);

  // Mutations
  const categoryMutation = useMutate(
    async (values: typeof categoryForm) => {
      if (editingCategory) {
        return (await api.put(`/catalog/categories/${editingCategory.id}`, values)).data;
      }
      return (await api.post('/catalog/categories', values)).data;
    },
    [['adminCategories'], ['bookingCatalog']]
  );

  const deleteCategoryMutation = useMutate(
    async (id: string) => {
      return (await api.delete(`/catalog/categories/${id}`)).data;
    },
    [['adminCategories'], ['bookingCatalog']]
  );

  const itemMutation = useMutate(
    async (values: typeof itemForm) => {
      if (editingItem) {
        return (await api.put(`/catalog/items/${editingItem.id}`, values)).data;
      }
      return (await api.post('/catalog/items', values)).data;
    },
    [['adminCategories'], ['bookingCatalog']]
  );

  const deleteItemMutation = useMutate(
    async (id: string) => {
      return (await api.delete(`/catalog/items/${id}`)).data;
    },
    [['adminCategories'], ['bookingCatalog']]
  );

  const priceMutation = useMutate(
    async (payload: any) => {
      return (await api.post('/catalog/prices', payload)).data;
    },
    [['adminCategories'], ['bookingCatalog']]
  );

  // Handlers
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', slug: '', description: '' });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, slug: cat.slug, description: cat.description || '' });
    setIsCategoryModalOpen(true);
  };

  const handleOpenAddItem = () => {
    setEditingItem(null);
    setItemForm({
      name: '',
      description: '',
      pricingUnit: 'PER_PIECE',
      categoryId: activeCategory?.id || '',
    });
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item: any) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      description: item.description || '',
      pricingUnit: item.pricingUnit,
      categoryId: item.categoryId,
    });
    setIsItemModalOpen(true);
  };

  const handleOpenAddPrice = (item: any) => {
    setSelectedItemForPrice(item);
    setPriceForm({
      laundryServiceId: services?.[0]?.id || '',
      priceInRupees: '60',
      estimatedDays: 2,
    });
    setIsPriceModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Catalog & Pricing Rates"
          description="Manage clothing categories, individual garments, laundry services, and rate card"
        />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleOpenAddCategory}>
            <Plus className="w-4 h-4 mr-1" /> Add Category
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenAddItem} disabled={!activeCategory}>
            <Plus className="w-4 h-4 mr-1" /> Add Garment
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner className="w-8 h-8 text-primary" />
        </div>
      ) : (
        <div>
          {/* Categories Horizontal Tabs */}
          <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2 mb-6">
            {categories?.map((cat) => (
              <div key={cat.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryTab(cat.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                    selectedCategoryTab === cat.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  {cat.name} ({cat._count?.items ?? cat.items?.length ?? 0})
                </button>
              </div>
            ))}
          </div>

          {/* Active Category Header with Edit & Delete */}
          {activeCategory && (
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-xs">
              <div>
                <span className="font-extrabold text-sm text-slate-900 block">
                  Category: {activeCategory.name}
                </span>
                <span className="text-slate-500">{activeCategory.description || 'No description'}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEditCategory(activeCategory)}
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-600 hover:bg-rose-50"
                  onClick={() => {
                    if (confirm(`Deactivate category "${activeCategory.name}"?`)) {
                      deleteCategoryMutation.mutate(activeCategory.id, {
                        onSuccess: () => toast.success('Category deactivated'),
                      });
                    }
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </Button>
              </div>
            </div>
          )}

          {/* Garments in Active Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeCategory?.items?.map((item: any) => (
              <Card key={item.id} className="border-slate-200">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                      <Shirt className="w-4 h-4 text-primary" /> {item.name}
                    </CardTitle>
                    <span className="text-[10px] bg-slate-100 font-semibold px-2 py-0.5 rounded text-slate-500 mt-1 inline-block">
                      {item.pricingUnit === 'PER_PIECE' ? 'Per Piece' : 'Per Kg'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditItem(item)}
                      className="p-1 h-auto"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-auto text-rose-500"
                      onClick={() => {
                        if (confirm(`Deactivate garment "${item.name}"?`)) {
                          deleteItemMutation.mutate(item.id, {
                            onSuccess: () => toast.success('Garment removed'),
                          });
                        }
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-xs text-slate-500 mb-3">{item.description || 'Standard garment'}</p>

                  <div className="border-t border-slate-100 pt-2 space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      <span>Service Rates</span>
                      <button
                        type="button"
                        onClick={() => handleOpenAddPrice(item)}
                        className="text-primary hover:underline flex items-center font-semibold"
                      >
                        <Plus className="w-3 h-3 mr-0.5" /> Set Rate
                      </button>
                    </div>

                    {item.prices?.map((pr: any) => (
                      <div
                        key={pr.id}
                        className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-lg"
                      >
                        <span className="font-medium text-slate-700">
                          {pr.laundryService?.name || 'Laundry Service'}
                        </span>
                        <span className="font-extrabold text-primary">
                          ₹{(pr.priceInPaise / 100).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            categoryMutation.mutate(categoryForm, {
              onSuccess: () => {
                toast.success('Category saved');
                setIsCategoryModalOpen(false);
              },
            });
          }}
          className="space-y-4 text-xs"
        >
          <Input
            label="Category Name"
            required
            value={categoryForm.name}
            onChange={(e) => {
              const val = e.target.value;
              setCategoryForm({
                ...categoryForm,
                name: val,
                slug: val.toLowerCase().replace(/\s+/g, '-'),
              });
            }}
            placeholder="e.g. Traditional & Festive Wear"
          />
          <Input
            label="Slug (URL identifier)"
            required
            value={categoryForm.slug}
            onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
          />
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Description</label>
            <textarea
              rows={2}
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              className="w-full border border-slate-300 rounded p-2 text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={categoryMutation.isPending}>
              Save Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* Item Modal */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={editingItem ? 'Edit Garment' : 'Add New Garment'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            itemMutation.mutate(itemForm, {
              onSuccess: () => {
                toast.success('Garment saved');
                setIsItemModalOpen(false);
              },
            });
          }}
          className="space-y-4 text-xs"
        >
          <Input
            label="Garment Name"
            required
            value={itemForm.name}
            onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
            placeholder="e.g. Silk Kurta / Dupatta"
          />
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Pricing Unit</label>
            <select
              value={itemForm.pricingUnit}
              onChange={(e) => setItemForm({ ...itemForm, pricingUnit: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
            >
              <option value="PER_PIECE">Per Piece</option>
              <option value="PER_KG">Per Kilogram (Kg)</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Description</label>
            <textarea
              rows={2}
              value={itemForm.description}
              onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
              className="w-full border border-slate-300 rounded p-2 text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsItemModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={itemMutation.isPending}>
              Save Garment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Set Rate Modal */}
      <Modal
        isOpen={isPriceModalOpen}
        onClose={() => setIsPriceModalOpen(false)}
        title={`Set Service Rate for ${selectedItemForPrice?.name || ''}`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const paise = Math.round(parseFloat(priceForm.priceInRupees) * 100);
            priceMutation.mutate(
              {
                clothingItemId: selectedItemForPrice.id,
                laundryServiceId: priceForm.laundryServiceId,
                priceInPaise: paise,
                estimatedDays: Number(priceForm.estimatedDays),
              },
              {
                onSuccess: () => {
                  toast.success('Service rate updated');
                  setIsPriceModalOpen(false);
                },
              }
            );
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Service</label>
            <select
              value={priceForm.laundryServiceId}
              onChange={(e) => setPriceForm({ ...priceForm, laundryServiceId: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
            >
              {services?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Rate in INR (₹)"
            type="number"
            step="1"
            required
            value={priceForm.priceInRupees}
            onChange={(e) => setPriceForm({ ...priceForm, priceInRupees: e.target.value })}
          />

          <Input
            label="Estimated Turnaround (Days)"
            type="number"
            min="1"
            value={priceForm.estimatedDays}
            onChange={(e) => setPriceForm({ ...priceForm, estimatedDays: parseInt(e.target.value) })}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsPriceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={priceMutation.isPending}>
              Save Rate
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
