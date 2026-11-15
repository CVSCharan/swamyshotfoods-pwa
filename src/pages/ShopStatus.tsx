import React, { useEffect, useState, useRef } from 'react';
import { useStoreConfigStore } from '../stores/useStoreConfigStore';
import type { StoreConfig } from '../stores/useStoreConfigStore';
import { storeConfigService } from '../services/storeConfigService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Switch } from '../components/ui/Switch';
import { Badge } from '../components/ui/Badge';
import { AlertCircle, Camera } from 'lucide-react';
import { toast } from 'sonner';

export const ShopStatus: React.FC = () => {
  const { config, isConnected, setConfig } = useStoreConfigStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cookingInputRef = useRef<HTMLInputElement>(null);
  const avatarUploadLock = useRef(false);
  const cookingUploadLock = useRef(false);

  const [noticeText, setNoticeText] = useState('');
  const [holidayText, setHolidayText] = useState('');
  const [shopDesc, setShopDesc] = useState('');
  const [menuHeaderText, setMenuHeaderText] = useState('');
  const [menuFooterText, setMenuFooterText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isCookingUploading, setIsCookingUploading] = useState(false);

  // Sync state values when config changes (e.g. from SSE)
  useEffect(() => {
    if (config) {
      setNoticeText(config.noticeMessage || '');
      setHolidayText(config.holidayMessage || '');
      setShopDesc(config.description || '');
      setMenuHeaderText(config.menuHeaderMessage || '');
      setMenuFooterText(config.menuFooterMessage || '');
    }
  }, [config]);

  // Image Upload Safeguards
  const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MiB raw file limit
  const MAX_AVATAR_DIMENSION = 800; // max width/height for avatar
  const MAX_AVATAR_DATA_URL_LENGTH = 1000000; // 1 MB Data URL ceiling matching API schema
  const JPEG_QUALITY = 0.7;
  const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const ALLOWED_COOKING_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  /**
   * Compresses and proportionally resizes static avatar images onto a canvas:
   * - Enforces 2 MiB raw file ceiling
   * - Restricts to supported MIME types (JPEG, PNG, WebP)
   * - Limits dimensions to max 800x800 preserving aspect ratio
   * - Handles transparent PNGs by drawing a white background first
   * - Exports JPEG at 0.7 quality (~80-150 KB output)
   * - Fails explicitly on decoding/canvas errors without uploading raw file
   */
  const compressAvatarImage = (file: File): Promise<string> => {
    if (!file || file.size === 0) {
      return Promise.reject(new Error('Please select a valid non-empty image file.'));
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return Promise.reject(new Error('File is too large. Maximum allowed size is 2MB to ensure fast loading.'));
    }

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      return Promise.reject(new Error('Unsupported image format. Please select a JPEG, PNG, or WebP image.'));
    }

    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        try {
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          if (!width || !height) {
            reject(new Error('Unable to determine image dimensions.'));
            return;
          }

          if (width > MAX_AVATAR_DIMENSION || height > MAX_AVATAR_DIMENSION) {
            if (width > height) {
              height = Math.round((height * MAX_AVATAR_DIMENSION) / width);
              width = MAX_AVATAR_DIMENSION;
            } else {
              width = Math.round((width * MAX_AVATAR_DIMENSION) / height);
              height = MAX_AVATAR_DIMENSION;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas 2D rendering context is not available.'));
            return;
          }

          // Handle transparency by painting a solid white background
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
          if (!dataUrl || !dataUrl.startsWith('data:image/jpeg;base64,')) {
            reject(new Error('Failed to encode compressed image.'));
            return;
          }

          if (dataUrl.length > MAX_AVATAR_DATA_URL_LENGTH) {
            reject(new Error('Compressed avatar photo exceeds maximum allowed size (1MB). Please select a simpler image.'));
            return;
          }

          resolve(dataUrl);
        } catch (err) {
          reject(err instanceof Error ? err : new Error('Image compression failed.'));
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to decode image file. Please verify it is a valid image.'));
      };

      img.src = objectUrl;
    });
  };

  /**
   * Reads cooking media preserving original MIME types and animation frames (especially GIFs):
   * - Enforces 2 MiB raw file ceiling
   * - Restricts to supported MIME types (GIF, JPEG, PNG, WebP)
   * - Uses FileReader directly without canvas re-encoding to preserve animation frames
   * - Handles read errors and aborts explicitly
   */
  const readCookingMedia = (file: File): Promise<string> => {
    if (!file || file.size === 0) {
      return Promise.reject(new Error('Please select a valid non-empty media file.'));
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return Promise.reject(new Error('File is too large. Maximum allowed size is 2MB to ensure fast loading.'));
    }

    if (!ALLOWED_COOKING_TYPES.includes(file.type)) {
      return Promise.reject(new Error('Unsupported format. Please select a GIF, JPEG, PNG, or WebP image.'));
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to process media file data.'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read media file.'));
      };

      reader.onabort = () => {
        reject(new Error('Media file reading was cancelled.'));
      };

      reader.readAsDataURL(file);
    });
  };

  const updateConfig = async (updates: Partial<StoreConfig>, showPageLoading = true) => {
    if (showPageLoading) {
      setLoading(true);
    }
    try {
      const updatedConfig = await storeConfigService.update(updates);
      if (updatedConfig) {
        setConfig(updatedConfig);
      }
      toast.success('Store status updated successfully!');
      return updatedConfig;
    } catch (err) {
      console.error(err);
      toast.error('Failed to update store status');
      return undefined;
    } finally {
      if (showPageLoading) {
        setLoading(false);
      }
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (avatarUploadLock.current) return;
    avatarUploadLock.current = true;
    setIsAvatarUploading(true);

    try {
      const file = e.target.files?.[0];
      if (!file) return;

      let compressedDataUrl: string;
      try {
        compressedDataUrl = await compressAvatarImage(file);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to process avatar photo';
        toast.error(message);
        return;
      }

      await updateConfig({ ownerAvatarUrl: compressedDataUrl }, false);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      avatarUploadLock.current = false;
      setIsAvatarUploading(false);
    }
  };

  const handleCookingImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (cookingUploadLock.current) return;
    cookingUploadLock.current = true;
    setIsCookingUploading(true);

    try {
      const file = e.target.files?.[0];
      if (!file) return;

      let dataUrl: string;
      try {
        dataUrl = await readCookingMedia(file);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to process cooking media';
        toast.error(message);
        return;
      }

      await updateConfig({ cookingImageUrl: dataUrl }, false);
    } finally {
      if (cookingInputRef.current) {
        cookingInputRef.current.value = '';
      }
      cookingUploadLock.current = false;
      setIsCookingUploading(false);
    }
  };

  const triggerFileSelect = () => {
    if (avatarUploadLock.current || isAvatarUploading) return;
    fileInputRef.current?.click();
  };

  const triggerCookingSelect = () => {
    if (cookingUploadLock.current || isCookingUploading) return;
    cookingInputRef.current?.click();
  };

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-neutral-500 font-display">
        <svg
          className="animate-spin h-8 w-8 text-saffron-500 mb-4"
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
              <p className="text-xs font-semibold text-neutral-500 font-display uppercase tracking-wider mb-1">
                Shop Status
              </p>
              <h2 className="font-display font-black text-2xl text-neutral-900 mb-2">
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
          <CardContent className="flex flex-col gap-4 py-6">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-xs font-semibold text-neutral-500 font-display uppercase tracking-wider mb-1">
                  Kitchen State
                </p>
                <h2 className="font-display font-black text-2xl text-neutral-900 mb-2">
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
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cooking Media Upload - Separate Card */}
      {config.isCooking && (
        <Card className="p-1 animate-fade-in">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Cooking GIF/Image</CardTitle>
              <CardDescription>Displayed on the website when cooking is on</CardDescription>
            </div>
            <div>
              <input
                type="file"
                ref={cookingInputRef}
                onChange={handleCookingImageChange}
                accept="image/gif,image/jpeg,image/png,image/webp"
                disabled={isCookingUploading}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={triggerCookingSelect}
                loading={isCookingUploading}
                disabled={isCookingUploading}
              >
                Change Media
              </Button>
            </div>
          </CardHeader>
          {config.cookingImageUrl && (
            <CardContent className="flex justify-center pt-4">
              <div className="relative group w-32 h-32 rounded-2xl overflow-hidden border-2 border-neutral-200 bg-white shadow-xl">
                <img src={config.cookingImageUrl} alt="Cooking Media" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={triggerCookingSelect}
                  disabled={isCookingUploading}
                  className={`absolute inset-0 bg-neutral-900/50 flex items-center justify-center transition-opacity duration-200 cursor-pointer ${
                    isCookingUploading ? 'opacity-100 cursor-not-allowed' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <Camera size={18} className="text-white" />
                </button>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Shop Logo / Profile Photo */}
      <Card className="p-1">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Shop Logo / Profile Photo</CardTitle>
            <CardDescription>Displayed on the website landing page and splash screen</CardDescription>
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/jpeg,image/png,image/webp"
              disabled={isAvatarUploading}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={triggerFileSelect}
              loading={isAvatarUploading}
              disabled={isAvatarUploading}
            >
              Change Photo
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex justify-center pt-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-saffron-500 shadow-xl bg-white flex items-center justify-center">
              <img src={config.ownerAvatarUrl || '/logo.png'} alt="Avatar" className={`w-full h-full ${config.ownerAvatarUrl ? 'object-cover' : 'object-contain p-2'}`} />
            </div>
            <button
              type="button"
              onClick={triggerFileSelect}
              disabled={isAvatarUploading}
              className={`absolute inset-0 bg-neutral-900/50 rounded-full flex items-center justify-center transition-opacity duration-200 cursor-pointer ${
                isAvatarUploading ? 'opacity-100 cursor-not-allowed' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <Camera size={18} className="text-white" />
            </button>
          </div>
        </CardContent>
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

      {/* Menu Header Message */}
      <Card className="p-1">
        <CardHeader>
          <CardTitle>Menu Header Message</CardTitle>
          <CardDescription>Information shown at the top of the public menu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            multiline
            numberOfLines={3}
            value={menuHeaderText}
            onChange={(e) => setMenuHeaderText(e.target.value)}
            placeholder="Special offers, timings announcement, etc..."
            disabled={loading}
          />
          <Button
            size="sm"
            onClick={() => updateConfig({ menuHeaderMessage: menuHeaderText })}
            loading={loading}
          >
            Save Header Message
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
