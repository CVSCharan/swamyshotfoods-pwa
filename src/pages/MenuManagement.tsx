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
    console.log("Submitting formData:", formData);
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
      dosaSpecial: false,
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
                  
                  {/* Tags / Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
                    {item.morningSpecial && (
                      <Badge variant="warning" className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5">☀️ Morning Special</Badge>
                    )}
                    {item.eveningSpecial && (
                      <Badge variant="primary" className="bg-indigo-100 text-indigo-700 text-[9px] px-1.5 py-0.5">🌙 Evening Special</Badge>
                    )}
                    {item.dosaSpecial && (
                      <Badge variant="secondary" className="bg-rose-100 text-rose-700 text-[9px] px-1.5 py-0.5">🥞 Dosa Special</Badge>
                    )}
                    {item.timingTemplate ? (
                      <Badge variant="neutral" className="bg-neutral-100 text-neutral-600 text-[9px] px-1.5 py-0.5">🕒 Template: {item.timingTemplate}</Badge>
                    ) : (item.morningTimings || item.eveningTimings) ? (
                      <Badge variant="neutral" className="bg-neutral-100 text-neutral-600 text-[9px] px-1.5 py-0.5">
                        🕒 {item.morningTimings ? `${item.morningTimings.startTime}-${item.morningTimings.endTime}` : ''} 
                        {item.morningTimings && item.eveningTimings ? ' & ' : ''}
                        {item.eveningTimings ? `${item.eveningTimings.startTime}-${item.eveningTimings.endTime}` : ''}
                      </Badge>
                    ) : null}
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
        <div className="space-y-6 max-h-[75vh] overflow-y-auto px-1 scrollbar-hide pb-4">
          
          {/* Section 1: Basic Information */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-neutral-800 font-display border-b border-neutral-100 pb-2 mb-3">
              Basic Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>
            
            <Input
              label="Description"
              multiline
              numberOfLines={2}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Image URL"
                value={formData.imgSrc || ''}
                onChange={(e) => setFormData({ ...formData, imgSrc: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
              <Input
                label="Priority (Display Order)"
                type="number"
                value={formData.priority !== undefined ? formData.priority : ''}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                placeholder="1 = Highest"
              />
            </div>
          </div>

          {/* Section 2: Timings */}
          <div className="bg-neutral-50/50 p-4 sm:p-5 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-neutral-800 font-display border-b border-neutral-100 pb-2 mb-3">
              Availability & Timings
            </h4>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-600 tracking-wide uppercase">Timing Template</label>
              <select
                value={formData.timingTemplate || ''}
                onChange={(e) => setFormData({ ...formData, timingTemplate: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-700 shadow-sm focus:ring-2 focus:ring-saffron-500/20 focus:border-saffron-500 transition-all outline-none"
              >
                <option value="">Use Custom Timings</option>
                {templates.map(t => (
                  <option key={t.key} value={t.key}>{t.name}</option>
                ))}
              </select>
            </div>

            {formData.timingTemplate && (
              <div className="bg-white p-4 rounded-xl border border-saffron-100 shadow-inner">
                {(() => {
                  const t = templates.find(temp => temp.key === formData.timingTemplate);
                  if (!t) return <p className="text-xs text-neutral-500">Loading...</p>;
                  return (
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="flex-1">
                        <span className="text-[10px] font-bold text-saffron-600 uppercase tracking-wider block mb-1">Morning Session</span>
                        <span className="text-sm font-medium text-neutral-700">{t.morningTimings?.startTime || 'Closed'} - {t.morningTimings?.endTime || 'Closed'}</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">Evening Session</span>
                        <span className="text-sm font-medium text-neutral-700">{t.eveningTimings?.startTime || 'Closed'} - {t.eveningTimings?.endTime || 'Closed'}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {!formData.timingTemplate && (
              <div className="space-y-4 pt-2">
                <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
                  <span className="text-[10px] font-bold text-saffron-600 uppercase tracking-wider block mb-3">Morning Session</span>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="time"
                      label="Start Time"
                      value={formData.morningTimings?.startTime || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        morningTimings: { ...formData.morningTimings, startTime: e.target.value, endTime: formData.morningTimings?.endTime || '' }
                      })}
                    />
                    <Input
                      type="time"
                      label="End Time"
                      value={formData.morningTimings?.endTime || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        morningTimings: { ...formData.morningTimings, endTime: e.target.value, startTime: formData.morningTimings?.startTime || '' }
                      })}
                    />
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-3">Evening Session</span>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="time"
                      label="Start Time"
                      value={formData.eveningTimings?.startTime || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        eveningTimings: { ...formData.eveningTimings, startTime: e.target.value, endTime: formData.eveningTimings?.endTime || '' }
                      })}
                    />
                    <Input
                      type="time"
                      label="End Time"
                      value={formData.eveningTimings?.endTime || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        eveningTimings: { ...formData.eveningTimings, endTime: e.target.value, startTime: formData.eveningTimings?.startTime || '' }
                      })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Attributes (Pill Toggles) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-100 shadow-sm space-y-5">
            <h4 className="text-sm font-bold text-neutral-800 font-display border-b border-neutral-100 pb-2">
              Item Attributes
            </h4>

            {/* Allergens */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-bold text-neutral-500 tracking-wider uppercase">Allergens</label>
              <div className="flex flex-wrap gap-2">
                {['Dairy', 'Nuts', 'Gluten', 'Soy'].map(allergen => {
                  const lowerAllergen = allergen.toLowerCase();
                  const isChecked = formData.allergens?.map(a => a.toLowerCase()).includes(lowerAllergen) || false;
                  return (
                    <button
                      key={allergen}
                      type="button"
                      onClick={() => {
                        const current = formData.allergens?.map(a => a.toLowerCase()) || [];
                        const updated = isChecked
                          ? current.filter(a => a !== lowerAllergen)
                          : [...current, lowerAllergen];
                        setFormData({ ...formData, allergens: updated });
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                        isChecked 
                          ? "bg-amber-50 text-amber-700 border-amber-200 shadow-sm ring-1 ring-amber-500/20"
                          : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
                      }`}
                    >
                      {allergen}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dietary Labels */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-bold text-neutral-500 tracking-wider uppercase">Dietary Labels</label>
              <div className="flex flex-wrap gap-2">
                {['Vegetarian', 'Vegan', 'Jain', 'Gluten-Free'].map(label => {
                  const lowerLabel = label.toLowerCase();
                  const isChecked = formData.dietaryLabels?.map(l => l.toLowerCase()).includes(lowerLabel) || false;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        const current = formData.dietaryLabels?.map(l => l.toLowerCase()) || [];
                        const updated = isChecked
                          ? current.filter(l => l !== lowerLabel)
                          : [...current, lowerLabel];
                        setFormData({ ...formData, dietaryLabels: updated });
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                        isChecked 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm ring-1 ring-emerald-500/20"
                          : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Specials */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-bold text-neutral-500 tracking-wider uppercase">Specials & Highlights</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, morningSpecial: !formData.morningSpecial })}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border flex items-center gap-1.5 ${
                    formData.morningSpecial 
                      ? "bg-sky-50 text-sky-700 border-sky-200 shadow-sm ring-1 ring-sky-500/20"
                      : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
                  }`}
                >
                  ☀️ Morning Special
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, eveningSpecial: !formData.eveningSpecial })}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border flex items-center gap-1.5 ${
                    formData.eveningSpecial 
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm ring-1 ring-indigo-500/20"
                      : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
                  }`}
                >
                  🌙 Evening Special
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, dosaSpecial: !formData.dosaSpecial })}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border flex items-center gap-1.5 ${
                    formData.dosaSpecial 
                      ? "bg-rose-50 text-rose-700 border-rose-200 shadow-sm ring-1 ring-rose-500/20"
                      : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
                  }`}
                >
                  🥞 Dosa Special
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 shrink-0 border-t border-neutral-100 mt-2">
            <Button
              className="flex-1 bg-gradient-to-r from-saffron-500 to-amber-500 shadow-[0_4px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.45)] hover:from-saffron-400 hover:to-amber-400"
              onClick={isEditModalVisible ? handleUpdateItem : handleAddItem}
              loading={loading}
            >
              {isEditModalVisible ? 'Update Item' : 'Create Item'}
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 hover:border-neutral-300 shadow-sm"
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
              className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 shadow-[0_4px_20px_rgba(239,68,68,0.3)]"
              onClick={handleDeleteItem}
              loading={loading}
            >
              Delete
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300"
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
