import React, { useEffect, useState, useRef } from 'react';
import { useStoreConfigStore } from '../stores/useStoreConfigStore';
import type { StoreConfig } from '../stores/useStoreConfigStore';
import { storeConfigService } from '../services/storeConfigService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Switch } from '../components/ui/Switch';
import { Badge } from '../components/ui/Badge';
import { AlertCircle, Camera, CheckCircle2 } from 'lucide-react';

export const ShopStatus: React.FC = () => {
  const { config, isConnected, setConfig } = useStoreConfigStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [noticeText, setNoticeText] = useState('');
  const [holidayText, setHolidayText] = useState('');
  const [shopDesc, setShopDesc] = useState('');
  const [menuFooterText, setMenuFooterText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Sync state values when config changes (e.g. from SSE)
  useEffect(() => {
    if (config) {
      setNoticeText(config.noticeMessage || '');
      setHolidayText(config.holidayMessage || '');
      setShopDesc(config.description || '');
      setMenuFooterText(config.menuFooterMessage || '');
    }
  }, [config]);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const updateConfig = async (updates: Partial<StoreConfig>) => {
    setLoading(true);
    try {
      await storeConfigService.update(updates);
      if (config) {
        setConfig({ ...config, ...updates });
      }
      showNotification('Store status updated successfully!');
    } catch (err) {
      console.error(err);
      showNotification('Failed to update store status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File is too large. Max size is 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        await updateConfig({ ownerAvatarUrl: reader.result });
      }
    };
    reader.onerror = () => {
      showNotification('Failed to read image file', 'error');
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-stone-400 font-display">
        <svg
          className="animate-spin h-8 w-8 text-gold-500 mb-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>Loading Shop Status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Toast Notification */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl font-display font-semibold text-xs animate-slide-up ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25'
              : 'bg-red-500/10 text-red-500 border-red-500/25'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {/* Connection warning in body if offline */}
      {!isConnected && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold font-display">
          <AlertCircle size={18} />
          Offline. Any changes will queue or fail until connection is re-established.
        </div>
      )}

      {/* Header Cards (Open/Closed & Cooking) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card hoverable className="p-1">
          <CardContent className="flex items-center justify-between py-6">
            <div>
              <p className="text-xs font-semibold text-stone-400 font-display uppercase tracking-wider mb-1">
                Shop Status
              </p>
              <h2 className="font-display font-black text-2xl text-stone-100 mb-2">
                {config.isShopOpen ? 'Open for Business' : 'Closed Right Now'}
              </h2>
              <Badge variant={config.isShopOpen ? 'success' : 'destructive'}>
                {config.isShopOpen ? 'Open' : 'Closed'}
              </Badge>
            </div>
            <Switch
              checked={config.isShopOpen}
              onChange={(val) => updateConfig({ isShopOpen: val })}
              disabled={loading}
            />
          </CardContent>
        </Card>

        <Card hoverable className="p-1">
          <CardContent className="flex items-center justify-between py-6">
            <div>
              <p className="text-xs font-semibold text-stone-400 font-display uppercase tracking-wider mb-1">
                Kitchen State
              </p>
              <h2 className="font-display font-black text-2xl text-stone-100 mb-2">
                {config.isCooking ? 'Cooking Active' : 'Kitchen Resting'}
              </h2>
              <Badge variant={config.isCooking ? 'success' : 'secondary'}>
                {config.isCooking ? 'Cooking ON' : 'Cooking OFF'}
              </Badge>
            </div>
            <Switch
              checked={config.isCooking}
              onChange={(val) => updateConfig({ isCooking: val })}
              disabled={loading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Owner Profile Photo */}
      <Card className="p-1">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Owner Profile Photo</CardTitle>
            <CardDescription>Displayed on the website landing page</CardDescription>
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <Button variant="outline" size="sm" onClick={triggerFileSelect} loading={loading}>
              Change Photo
            </Button>
          </div>
        </CardHeader>
        {config.ownerAvatarUrl && (
          <CardContent className="flex justify-center pt-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gold-500 shadow-xl bg-stone-900">
                <img src={config.ownerAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <button
                onClick={triggerFileSelect}
                className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
              >
                <Camera size={18} className="text-stone-100" />
              </button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Notice Board */}
      <Card className="p-1">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Notice Board</CardTitle>
            <CardDescription>Important customer announcements</CardDescription>
          </div>
          <Switch
            checked={config.isNoticeActive}
            onChange={(val) => updateConfig({ isNoticeActive: val })}
            disabled={loading}
          />
        </CardHeader>
        {config.isNoticeActive && (
          <CardContent className="space-y-4">
            <Input
              multiline
              numberOfLines={3}
              value={noticeText}
              onChange={(e) => setNoticeText(e.target.value)}
              placeholder="Enter notice details..."
              disabled={loading}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateConfig({ noticeMessage: noticeText })}
              loading={loading}
            >
              Update Notice Text
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Holiday Mode */}
      <Card className="p-1">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Holiday Mode</CardTitle>
            <CardDescription>Indicate shop is temporarily on holiday</CardDescription>
          </div>
          <Switch
            checked={config.isHoliday}
            onChange={(val) => updateConfig({ isHoliday: val })}
            disabled={loading}
          />
        </CardHeader>
        {config.isHoliday && (
          <CardContent className="space-y-4">
            <Input
              multiline
              numberOfLines={3}
              value={holidayText}
              onChange={(e) => setHolidayText(e.target.value)}
              placeholder="Enter holiday notification details..."
              disabled={loading}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateConfig({ holidayMessage: holidayText })}
              loading={loading}
            >
              Update Holiday Message
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Shop Description */}
      <Card className="p-1">
        <CardHeader>
          <CardTitle>Shop Description</CardTitle>
          <CardDescription>Introduction and information about the shop</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            multiline
            numberOfLines={4}
            value={shopDesc}
            onChange={(e) => setShopDesc(e.target.value)}
            placeholder="Introduce Swamy's Hot Foods..."
            disabled={loading}
          />
          <Button
            size="sm"
            onClick={() => updateConfig({ description: shopDesc })}
            loading={loading}
          >
            Save Description
          </Button>
        </CardContent>
      </Card>

      {/* Menu Footer Message */}
      <Card className="p-1">
        <CardHeader>
          <CardTitle>Menu Footer Message</CardTitle>
          <CardDescription>Information shown at the bottom of the public menu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            multiline
            numberOfLines={5}
            value={menuFooterText}
            onChange={(e) => setMenuFooterText(e.target.value)}
            placeholder="Packing charges, food warnings, ingredients details..."
            disabled={loading}
          />
          <Button
            size="sm"
            onClick={() => updateConfig({ menuFooterMessage: menuFooterText })}
            loading={loading}
          >
            Save Menu Footer Message
          </Button>
        </CardContent>
      </Card>
      
    </div>
  );
};
