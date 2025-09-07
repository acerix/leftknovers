import { useState, useRef } from 'react';
import { CreateFoodItem } from '@/shared/types';
import { Camera, Plus, X, Upload } from 'lucide-react';

interface AddFoodFormProps {
  onAdd: (item: CreateFoodItem) => Promise<void>;
  onClose: () => void;
}

export default function AddFoodForm({ onAdd, onClose }: AddFoodFormProps) {
  const [formData, setFormData] = useState<CreateFoodItem>({
    name: '',
    description: '',
    expiration_date: '',
    category: '',
    storage_location: '',
    photo_url: '',
  });
  const [selectedOption, setSelectedOption] = useState<{ value: number; label: string } | null>(null);
  const [customDays, setCustomDays] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate expiration date based on selected option or custom days
    let daysToAdd = selectedOption?.value;
    if (selectedOption === null && customDays) {
      daysToAdd = parseFloat(customDays);
    }
    
    if (!formData.name || !daysToAdd || daysToAdd <= 0) return;
    
    const expirationDate = new Date();
    // Handle fractional days (like 0.5 for 12 hours)
    expirationDate.setTime(expirationDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
    const formattedDate = expirationDate.toISOString().split('T')[0];
    
    const itemData = {
      ...formData,
      expiration_date: formattedDate
    };
    
    setLoading(true);
    try {
      await onAdd(itemData);
      onClose();
    } catch (error) {
      console.error('Failed to add item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, GIF, WebP, etc.)');
      return;
    }

    // Check file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      alert('File is too large. Please select an image smaller than 10MB.');
      return;
    }

    console.log('Processing file:', {
      name: file.name,
      type: file.type,
      size: `${Math.round(file.size / 1024)} KB`
    });

    setUploadingPhoto(true);
    
    // Create a URL for the uploaded file
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        if (!result) {
          throw new Error('Failed to read file');
        }
        
        console.log('File processed successfully, size:', Math.round(result.length / 1024), 'KB (base64)');
        
        setFormData(prev => ({ 
          ...prev, 
          photo_url: result
        }));
        setUploadError(null);
        setUploadingPhoto(false);
      } catch (error) {
        console.error('Error processing file:', error);
        setUploadError('Failed to process the image. Please try again or select a different file.');
        setUploadingPhoto(false);
      }
    };

    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      setUploadError('Failed to read the file. Please try again or select a different file.');
      setUploadingPhoto(false);
    };

    reader.onabort = () => {
      console.log('File reading was aborted');
      setUploadError('File reading was cancelled.');
      setUploadingPhoto(false);
    };

    try {
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error starting file read:', error);
      setUploadError('Failed to start reading the file. Please try again.');
      setUploadingPhoto(false);
    }
    
    // Clear any previous errors when starting upload
    setUploadError(null);
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Prefer back camera on mobile
        } 
      });
      setCameraStream(stream);
      setShowCamera(true);
      
      // Wait for video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please use the upload option instead.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to data URL
    const dataURL = canvas.toDataURL('image/jpeg', 0.8);
    
    setFormData(prev => ({ 
      ...prev, 
      photo_url: dataURL
    }));
    
    stopCamera();
  };

  const categories = [
    'Leftovers',
    'Dairy',
    'Meat',
    'Vegetables',
    'Fruits',
    'Bread/Bakery',
    'Other'
  ];

  const storageLocations = [
    'Refrigerator',
    'Freezer',
    'Pantry',
    'Counter'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {showCamera ? (
        // Camera View
        <div className="bg-white rounded-xl p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Take Photo</h2>
            <button 
              onClick={stopCamera}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={stopCamera}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Camera className="w-4 h-4" />
                Capture
              </button>
            </div>
          </div>
          
          {/* Hidden canvas for photo capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      ) : (
        // Form View
        <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Add Food Item</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Photo</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCameraCapture}
                disabled={uploadingPhoto}
                className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 transition-colors disabled:opacity-50"
              >
                <Camera className="w-5 h-5" />
                <span className="text-sm">Camera</span>
              </button>
              
              <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 transition-colors cursor-pointer">
                <Upload className="w-5 h-5" />
                <span className="text-sm">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
              </label>
            </div>
            
            {uploadingPhoto && (
              <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-600">Processing image...</span>
              </div>
            )}
            
            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-red-700">{uploadError}</p>
                    <p className="text-xs text-red-600 mt-1">
                      Try selecting a smaller image (under 10MB) in JPG, PNG, or WebP format.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadError(null)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            
            {formData.photo_url && !uploadingPhoto && (
              <div className="mt-2 space-y-2">
                <img 
                  src={formData.photo_url} 
                  alt="Preview" 
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, photo_url: '' }));
                    setUploadError(null);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Remove Photo
                </button>
              </div>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Leftover pasta"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Homemade marinara"
            />
          </div>

          {/* Expiration Date */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Expires In *</label>
            
            {/* Quick options */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 0.5, label: '12h' },
                { value: 1, label: '1 day' },
                { value: 2, label: '2 days' },
                { value: 3, label: '3 days' },
                { value: 4, label: '4 days' }
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setSelectedOption(option);
                    setCustomDays('');
                  }}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    selectedOption?.value === option.value
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
              
              <button
                type="button"
                onClick={() => {
                  setSelectedOption(null);
                  setCustomDays(customDays || '7');
                }}
                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  selectedOption === null && customDays
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Other
              </button>
            </div>
            
            {/* Custom days input */}
            {selectedOption === null && (
              <div className="space-y-1">
                <input
                  type="number"
                  min="0.5"
                  max="365"
                  step="0.5"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  placeholder="Enter days"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
                <p className="text-xs text-gray-500">Enter number of days (0.5-365, e.g., 0.5 for 12 hours)</p>
              </div>
            )}
            
            {/* Preview */}
            {(selectedOption || customDays) && (
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                Expires on: {new Date(Date.now() + (selectedOption?.value || parseFloat(customDays) || 0) * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Storage Location */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Storage Location</label>
            <select
              value={formData.storage_location}
              onChange={(e) => setFormData(prev => ({ ...prev, storage_location: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select location</option>
              {storageLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name || (!selectedOption && !customDays)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add Item
            </button>
          </div>
        </form>
        </div>
      )}
    </div>
  );
}
