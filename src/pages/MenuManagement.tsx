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
import { z } from 'zod';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().min(0, 'Price must be a positive number'),
  desc: z.string().min(1, 'Description is required'),
  ingredients: z.string().optional(),
  priority: z.number().int().min(1, 'Priority must be at least 1'),
  imgSrc: z.string().url('Image source must be a valid URL').or(z.literal('')),
  timingTemplate: z.string().optional(),
  allergens: z.array(z.string()).optional(),
  dietaryLabels: z.array(z.string()).optional(),
  morningSpecial: z.boolean().optional(),
  eveningSpecial: z.boolean().optional(),
  dosaSpecial: z.boolean().optional(),
  popular: z.boolean().optional(),
  chefSpecial: z.boolean().optional(),
  morningTimings: z.object({
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  }).nullable().optional(),
  eveningTimings: z.object({
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  }).nullable().optional(),
}).refine(data => {
  if (!data.timingTemplate) {
    const mt = data.morningTimings;
    if (mt?.startTime && !mt.endTime) return false;
    if (!mt?.startTime && mt?.endTime) return false;
    const et = data.eveningTimings;
    if (et?.startTime && !et.endTime) return false;
    if (!et?.startTime && et?.endTime) return false;
  }
  return true;
}, {
  message: "Start and end times must both be provided if one is set",
  path: ["timingTemplate"]
});

type MenuFormValues = z.infer<typeof menuItemSchema>;

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

  const defaultValues: MenuFormValues = {
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
    popular: false,
    chefSpecial: false,
    morningTimings: null,
    eveningTimings: null,
  };

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<MenuFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues
  });

  const watchTimingTemplate = watch('timingTemplate');
  const watchAllergens = watch('allergens') || [];
  const watchDietary = watch('dietaryLabels') || [];

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
      toast.error('Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: MenuFormValues) => {
    setLoading(true);
    try {
      // Map zod form data safely to MenuItem
      const payload: Partial<MenuItem> = {
        ...data,
        morningTimings: data.morningTimings?.startTime && data.morningTimings?.endTime
          ? { startTime: data.morningTimings.startTime, endTime: data.morningTimings.endTime }
          : undefined,
        eveningTimings: data.eveningTimings?.startTime && data.eveningTimings?.endTime
          ? { startTime: data.eveningTimings.startTime, endTime: data.eveningTimings.endTime }
          : undefined,
      };

      if (isEditModalVisible && selectedItem) {
        await menuService.update(selectedItem._id, payload);
        updateItem(selectedItem._id, payload);
        toast.success('Menu item updated');
      } else {
        const newItem = await menuService.create(payload);
        addItem(newItem);
        toast.success('Menu item added');
      }
      setAddModalVisible(false);
      setEditModalVisible(false);
      reset(defaultValues);
    } catch (err) {
      console.error(err);
      toast.error(isEditModalVisible ? 'Failed to update item' : 'Failed to add item');
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
      toast.success('Menu item deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete menu item');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (item: MenuItem) => {
    setSelectedItem(item);
    reset({
      name: item.name,
      price: item.price,
      desc: item.desc || '',
      ingredients: item.ingredients || '',
      priority: item.priority || 1,
      imgSrc: item.imgSrc || '',
      timingTemplate: item.timingTemplate || '',
      allergens: item.allergens || [],
      dietaryLabels: item.dietaryLabels || [],
      morningSpecial: item.morningSpecial || false,
      eveningSpecial: item.eveningSpecial || false,
      dosaSpecial: item.dosaSpecial || false,
      popular: item.popular || false,
      chefSpecial: item.chefSpecial || false,
      morningTimings: item.morningTimings || null,
      eveningTimings: item.eveningTimings || null,
    });
    setEditModalVisible(true);
  };

  const openDeleteModal = (item: MenuItem) => {
    setSelectedItem(item);
    setDeleteModalVisible(true);
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.desc && item.desc.toLowerCase().includes(searchQuery.toLowerCase()))
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
            reset(defaultValues);
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
                    {item.popular && (
                      <Badge variant="warning" className="bg-orange-100 text-orange-700 text-[9px] px-1.5 py-0.5">🔥 Popular</Badge>
                    )}
                    {item.chefSpecial && (
                      <Badge variant="neutral" className="bg-violet-100 text-violet-700 text-[9px] px-1.5 py-0.5">👨‍🍳 Chef Special</Badge>
                    )}
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
          reset(defaultValues);
        }}
        title={`${isEditModalVisible ? 'Edit' : 'Add'} Menu Item`}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 px-2 sm:px-4 py-4">
          
          {/* Section 1: Basic Information */}
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-semibold text-neutral-900 tracking-tight">Basic Details</h4>
              <p className="text-xs text-neutral-500 mt-1">Core information about the menu item.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <Input
                label="Name *"
                {...register('name')}
                error={errors.name?.message}
                placeholder="E.g. Butter Roti"
              />
              <Input
                label="Price (₹) *"
                type="number"
                {...register('price', { valueAsNumber: true })}
                error={errors.price?.message}
                placeholder="E.g. 40"
              />
            </div>
            
            <Input
              label="Description *"
              multiline
              numberOfLines={2}
              {...register('desc')}
              error={errors.desc?.message}
              placeholder="Brief item details..."
            />

            <Input
              label="Ingredients"
              multiline
              numberOfLines={2}
              {...register('ingredients')}
              error={errors.ingredients?.message}
              placeholder="Wheat flour, butter, etc..."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <Input
                label="Image URL *"
                {...register('imgSrc')}
                error={errors.imgSrc?.message}
                placeholder="https://example.com/image.jpg"
              />
              <Input
                label="Priority (Order)"
                type="number"
                {...register('priority', { valueAsNumber: true })}
                error={errors.priority?.message}
                placeholder="1 = Highest"
              />
            </div>
          </div>

          {/* Section 2: Timings */}
          <div className="space-y-6 pt-8 border-t border-neutral-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-semibold text-neutral-900 tracking-tight">Availability & Timings</h4>
                <p className="text-xs text-neutral-500 mt-1">Configure when this item can be ordered.</p>
                {errors.timingTemplate && <p className="text-xs text-red-500 mt-1">{errors.timingTemplate.message}</p>}
              </div>
              <div className="w-full sm:w-64">
                <select
                  {...register('timingTemplate')}
                  className="w-full px-4 py-2 bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-700 focus:ring-2 focus:ring-saffron-500/20 focus:border-saffron-500 transition-all outline-none cursor-pointer"
                >
                  <option value="">Custom Timings</option>
                  {templates.map(t => (
                    <option key={t.key} value={t.key}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {watchTimingTemplate && (
              <div className="bg-neutral-50/50 p-5 rounded-2xl border border-neutral-100">
                {(() => {
                  const t = templates.find(temp => temp.key === watchTimingTemplate);
                  if (!t) return <p className="text-xs text-neutral-500">Loading...</p>;
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-saffron-500"></div>Morning</span>
                        <span className="text-sm font-medium text-neutral-800">{t.morningTimings?.startTime || 'Closed'} - {t.morningTimings?.endTime || 'Closed'}</span>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>Evening</span>
                        <span className="text-sm font-medium text-neutral-800">{t.eveningTimings?.startTime || 'Closed'} - {t.eveningTimings?.endTime || 'Closed'}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {!watchTimingTemplate && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-neutral-50/50 p-5 rounded-2xl border border-neutral-100 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-saffron-500"></div>
                    <span className="text-[11px] font-bold text-neutral-600 uppercase tracking-widest">Morning</span>
                  </div>
                  <Input
                    type="time"
                    label="Start Time"
                    {...register('morningTimings.startTime')}
                    error={errors.morningTimings?.startTime?.message}
                  />
                  <Input
                    type="time"
                    label="End Time"
                    {...register('morningTimings.endTime')}
                    error={errors.morningTimings?.endTime?.message}
                  />
                </div>
                
                <div className="bg-neutral-50/50 p-5 rounded-2xl border border-neutral-100 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                    <span className="text-[11px] font-bold text-neutral-600 uppercase tracking-widest">Evening</span>
                  </div>
                  <Input
                    type="time"
                    label="Start Time"
                    {...register('eveningTimings.startTime')}
                    error={errors.eveningTimings?.startTime?.message}
                  />
                  <Input
                    type="time"
                    label="End Time"
                    {...register('eveningTimings.endTime')}
                    error={errors.eveningTimings?.endTime?.message}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Attributes */}
          <div className="space-y-6 pt-8 border-t border-neutral-100">
            <div>
              <h4 className="text-base font-semibold text-neutral-900 tracking-tight">Attributes & Badges</h4>
              <p className="text-xs text-neutral-500 mt-1">Tags, dietary preferences, and highlights.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Allergens</label>
                <div className="flex flex-wrap gap-2">
                  {['Dairy', 'Nuts', 'Gluten', 'Soy'].map(allergen => {
                    const val = allergen.toLowerCase();
                    const isSelected = watchAllergens.includes(val);
                    return (
                      <button
                        key={allergen}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setValue('allergens', watchAllergens.filter(a => a !== val));
                          } else {
                            setValue('allergens', [...watchAllergens, val]);
                          }
                        }}
                        className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 border ${
                          isSelected
                            ? "bg-amber-50 text-amber-700 border-amber-200 shadow-sm"
                            : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-700"
                        }`}
                      >
                        {allergen}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Dietary Labels</label>
                <div className="flex flex-wrap gap-2">
                  {['Vegetarian', 'Vegan', 'Jain', 'Gluten-Free'].map(label => {
                    const val = label.toLowerCase();
                    const isSelected = watchDietary.includes(val);
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setValue('dietaryLabels', watchDietary.filter(a => a !== val));
                          } else {
                            setValue('dietaryLabels', [...watchDietary, val]);
                          }
                        }}
                        className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 border ${
                          isSelected
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
                            : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-700"
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Specials & Highlights</label>
                <div className="flex flex-wrap gap-3">
                  <Controller
                    name="popular"
                    control={control}
                    render={({ field }) => (
                      <button
                        type="button"
                        onClick={() => field.onChange(!field.value)}
                        className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 border flex items-center gap-2 ${
                          field.value 
                            ? "bg-orange-50 text-orange-700 border-orange-200 shadow-sm"
                            : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
                        }`}
                      >
                        🔥 Popular
                      </button>
                    )}
                  />
                  <Controller
                    name="chefSpecial"
                    control={control}
                    render={({ field }) => (
                      <button
                        type="button"
                        onClick={() => field.onChange(!field.value)}
                        className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 border flex items-center gap-2 ${
                          field.value 
                            ? "bg-violet-50 text-violet-700 border-violet-200 shadow-sm"
                            : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
                        }`}
                      >
                        👨‍🍳 Chef Special
                      </button>
                    )}
                  />
                  <Controller
                    name="morningSpecial"
                    control={control}
                    render={({ field }) => (
                      <button
                        type="button"
                        onClick={() => field.onChange(!field.value)}
                        className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 border flex items-center gap-2 ${
                          field.value 
                            ? "bg-amber-50 text-amber-700 border-amber-200 shadow-sm"
                            : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
                        }`}
                      >
                        ☀️ Morning Special
                      </button>
                    )}
                  />
                  <Controller
                    name="eveningSpecial"
                    control={control}
                    render={({ field }) => (
                      <button
                        type="button"
                        onClick={() => field.onChange(!field.value)}
                        className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 border flex items-center gap-2 ${
                          field.value 
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm"
                            : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
                        }`}
                      >
                        🌙 Evening Special
                      </button>
                    )}
                  />
                  <Controller
                    name="dosaSpecial"
                    control={control}
                    render={({ field }) => (
                      <button
                        type="button"
                        onClick={() => field.onChange(!field.value)}
                        className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 border flex items-center gap-2 ${
                          field.value 
                            ? "bg-rose-50 text-rose-700 border-rose-200 shadow-sm"
                            : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
                        }`}
                      >
                        🥞 Dosa Special
                      </button>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-6 shrink-0 border-t border-neutral-100 mt-2 pb-2">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-saffron-500 to-amber-500 shadow-[0_4px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.45)] hover:from-saffron-400 hover:to-amber-400"
              loading={loading}
            >
              {isEditModalVisible ? 'Update Item' : 'Create Item'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 hover:border-neutral-300 shadow-sm"
              onClick={() => {
                setAddModalVisible(false);
                setEditModalVisible(false);
                reset(defaultValues);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
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
