import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, SlidersHorizontal } from 'lucide-react';
import { useMenuStore } from '../stores/useMenuStore';
import type { MenuItem } from '../stores/useMenuStore';
import { menuService, type TimingTemplate } from '../services/menuService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';

export const MenuManagement: React.FC = () => {
  const {
    items,
    loading,
    setItems,
    addItem,
    updateItem,
    deleteItem,
    setLoading,
  } = useMenuStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [templates, setTemplates] = useState<TimingTemplate[]>([]);

  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    price: 0,
    desc: '',
    ingredients: '',
    priority: 1,
    imgSrc: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchMenuItems();
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const data = await menuService.getTimingTemplates();
      setTemplates(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const data = await menuService.getAll();
      setItems(data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name?.trim()) errors.name = 'Name is required';
    if (formData.price === undefined || formData.price <= 0) {
      errors.price = 'Price must be a positive number';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddItem = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const newItem = await menuService.create(formData);
      addItem(newItem);
      setAddModalVisible(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert('Failed to add menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async () => {
    if (!selectedItem || !validateForm()) return;

    setLoading(true);
    try {
      await menuService.update(selectedItem._id, formData);
      updateItem(selectedItem._id, formData);
      setEditModalVisible(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert('Failed to update menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    setLoading(true);
    try {
      await menuService.delete(selectedItem._id);
      deleteItem(selectedItem._id);
      setDeleteModalVisible(false);
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete menu item');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (item: MenuItem) => {
    setSelectedItem(item);
    setFormData(item);
    setFormErrors({});
    setEditModalVisible(true);
  };

  const openDeleteModal = (item: MenuItem) => {
    setSelectedItem(item);
    setDeleteModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      desc: '',
      ingredients: '',
      priority: 1,
      imgSrc: '',
      timingTemplate: '',
      allergens: [],
      dietaryLabels: [],
      morningSpecial: false,
      eveningSpecial: false,
      morningTimings: null,
      eveningTimings: null,
    });
    setFormErrors({});
    setSelectedItem(null);
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-saffron-500 text-sm transition-colors"
          />
        </div>
        <Button
          onClick={() => {
            resetForm();
            setAddModalVisible(true);
          }}
          className="flex items-center gap-2 justify-center py-2.5"
        >
          <Plus size={18} />
          Add Menu Item
        </Button>
      </div>

      {/* Menu items grid */}
      {loading && items.length === 0 ? (
        <div className="flex justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-saffron-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 text-neutral-500 font-display">
          No menu items found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card key={item._id} hoverable className="p-1 flex flex-col justify-between h-full">
              <div>
                {/* Food Image */}
                <div className="h-44 w-full rounded-t-xl bg-neutral-100 overflow-hidden relative">
                  {item.imgSrc ? (
                    <img
                      src={item.imgSrc}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 font-display font-semibold">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-2.5 right-2.5">
                    <Badge variant="success" className="bg-emerald-950/80 backdrop-blur text-emerald-400 border-emerald-800/50">
                      ₹{item.price}
                    </Badge>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-display font-bold text-neutral-900 text-base tracking-tight leading-tight">
                      {item.name}
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-500 line-clamp-2 mt-1 leading-relaxed">
                    {item.desc || 'No description provided.'}
                  </p>
                  {item.ingredients && (
                    <div className="mt-3 text-[10px] text-neutral-500 font-medium">
                      <span className="font-semibold text-neutral-400">Ingredients: </span>
                      {item.ingredients}
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-4 pt-0 flex items-center justify-between gap-3 mt-4 shrink-0">
                <div className="flex items-center gap-1.5 bg-neutral-100 px-2 py-1 rounded-lg border border-neutral-200 text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">
                  <SlidersHorizontal size={10} className="text-saffron-500" />
                  Priority: {item.priority}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-lg bg-white border border-neutral-200 hover:border-saffron-500 text-neutral-500 hover:text-saffron-500 transition-all cursor-pointer"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(item)}
                    className="p-2 rounded-lg bg-white border border-neutral-200 hover:border-red-500 text-neutral-500 hover:text-red-500 transition-all cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Modal
        visible={isAddModalVisible || isEditModalVisible}
        onDismiss={() => {
          setAddModalVisible(false);
          setEditModalVisible(false);
          resetForm();
        }}
        title={`${isEditModalVisible ? 'Edit' : 'Add'} Menu Item`}
      >
        <div className="space-y-4">
          <Input
            label="Name *"
            value={formData.name || ''}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
            }}
            error={formErrors.name}
            placeholder="E.g. Butter Roti"
          />

          <Input
            label="Price (₹) *"
            type="number"
            value={formData.price !== undefined ? formData.price : ''}
            onChange={(e) => {
              setFormData({ ...formData, price: parseFloat(e.target.value) || 0 });
              if (formErrors.price) setFormErrors({ ...formErrors, price: '' });
            }}
            error={formErrors.price}
            placeholder="E.g. 40"
          />

          <Input
            label="Description"
            multiline
            numberOfLines={3}
            value={formData.desc || ''}
            onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
            placeholder="Brief item details..."
          />

          <Input
            label="Ingredients"
            multiline
            numberOfLines={2}
            value={formData.ingredients || ''}
            onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
            placeholder="Wheat flour, butter, etc..."
          />

          <Input
            label="Priority (Order)"
            type="number"
            value={formData.priority !== undefined ? formData.priority : ''}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
            placeholder="1, 2, 3..."
          />

          <Input
            label="Image URL"
            value={formData.imgSrc || ''}
            onChange={(e) => setFormData({ ...formData, imgSrc: e.target.value })}
            placeholder="Https://example.com/image.jpg"
          />

          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-700 font-display tracking-wide uppercase">Timing Template</label>
            <select
              value={formData.timingTemplate || ''}
              onChange={(e) => setFormData({ ...formData, timingTemplate: e.target.value })}
              className="w-full px-4 py-3 glass-input rounded-xl text-sm placeholder-neutral-400 focus:ring-2 focus:ring-saffron-500/20 transition-all duration-200"
            >
              <option value="">No Template (Use Custom)</option>
              {templates.map(t => (
                <option key={t.key} value={t.key}>{t.name}</option>
              ))}
            </select>
          </div>

          {!formData.timingTemplate && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-neutral-700 font-display tracking-wide uppercase">Custom Timings</label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Morning Start"
                  value={formData.morningTimings?.startTime || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    morningTimings: { ...formData.morningTimings, startTime: e.target.value, endTime: formData.morningTimings?.endTime || '' }
                  })}
                  placeholder="08:00"
                />
                <Input
                  label="Morning End"
                  value={formData.morningTimings?.endTime || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    morningTimings: { ...formData.morningTimings, endTime: e.target.value, startTime: formData.morningTimings?.startTime || '' }
                  })}
                  placeholder="11:30"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Evening Start"
                  value={formData.eveningTimings?.startTime || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    eveningTimings: { ...formData.eveningTimings, startTime: e.target.value, endTime: formData.eveningTimings?.endTime || '' }
                  })}
                  placeholder="16:00"
                />
                <Input
                  label="Evening End"
                  value={formData.eveningTimings?.endTime || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    eveningTimings: { ...formData.eveningTimings, endTime: e.target.value, startTime: formData.eveningTimings?.startTime || '' }
                  })}
                  placeholder="22:30"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-700 font-display tracking-wide uppercase">Allergens</label>
            <div className="flex flex-wrap gap-3">
              {['Dairy', 'Nuts', 'Gluten', 'Soy'].map(allergen => (
                <label key={allergen} className="flex items-center gap-2 text-sm text-neutral-600">
                  <input
                    type="checkbox"
                    checked={formData.allergens?.includes(allergen) || false}
                    onChange={(e) => {
                      const current = formData.allergens || [];
                      const updated = e.target.checked
                        ? [...current, allergen]
                        : current.filter(a => a !== allergen);
                      setFormData({ ...formData, allergens: updated });
                    }}
                    className="rounded text-saffron-500 focus:ring-saffron-500"
                  />
                  {allergen}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-700 font-display tracking-wide uppercase">Dietary Labels</label>
            <div className="flex flex-wrap gap-3">
              {['Vegan', 'Jain', 'Gluten-Free'].map(label => (
                <label key={label} className="flex items-center gap-2 text-sm text-neutral-600">
                  <input
                    type="checkbox"
                    checked={formData.dietaryLabels?.includes(label) || false}
                    onChange={(e) => {
                      const current = formData.dietaryLabels || [];
                      const updated = e.target.checked
                        ? [...current, label]
                        : current.filter(l => l !== label);
                      setFormData({ ...formData, dietaryLabels: updated });
                    }}
                    className="rounded text-saffron-500 focus:ring-saffron-500"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-700 font-display tracking-wide uppercase">Specials</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-neutral-600">
                <input
                  type="checkbox"
                  checked={formData.morningSpecial || false}
                  onChange={(e) => setFormData({ ...formData, morningSpecial: e.target.checked })}
                  className="rounded text-saffron-500 focus:ring-saffron-500"
                />
                Morning Special
              </label>
              <label className="flex items-center gap-2 text-sm text-neutral-600">
                <input
                  type="checkbox"
                  checked={formData.eveningSpecial || false}
                  onChange={(e) => setFormData({ ...formData, eveningSpecial: e.target.checked })}
                  className="rounded text-saffron-500 focus:ring-saffron-500"
                />
                Evening Special
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 shrink-0">
            <Button
              className="flex-1"
              onClick={isEditModalVisible ? handleUpdateItem : handleAddItem}
              loading={loading}
            >
              {isEditModalVisible ? 'Update' : 'Create'}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setAddModalVisible(false);
                setEditModalVisible(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        visible={isDeleteModalVisible}
        onDismiss={() => setDeleteModalVisible(false)}
        title="Delete Menu Item"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-700 font-display font-medium">
            Are you sure you want to delete <span className="font-extrabold text-saffron-500">"{selectedItem?.name}"</span>? This action is permanent and cannot be undone.
          </p>

          <div className="flex items-center gap-3 pt-4">
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDeleteItem}
              loading={loading}
            >
              Delete
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteModalVisible(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
