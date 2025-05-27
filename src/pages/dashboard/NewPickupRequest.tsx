// src/pages/dashboard/NewPickupRequest.tsx
// Fixed New Pickup Request Page with proper estimated value calculation for all items

import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Plus, 
  Minus, 
  Package, 
  MapPin, 
  Calendar, 
  Clock,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Laptop,
  Monitor,
  Printer,
  Battery,
  Keyboard,
  Home,
  Trash2
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import TextArea from '../../components/ui/TextArea';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AuthContext from '../../context/AuthContext';
import { DEVICE_CONDITIONS, TIME_SLOTS } from '../../config';
import { useCategories } from '../../hooks/useCategories';
import { useCreateOrder } from '../../hooks/useOrders';
import { useCheckPincode } from '../../hooks/usePincodes';
import { useToast } from '../../hooks/useToast';

const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    smartphone: <Smartphone className="h-6 w-6" />,
    laptop: <Laptop className="h-6 w-6" />,
    monitor: <Monitor className="h-6 w-6" />,
    printer: <Printer className="h-6 w-6" />,
    battery: <Battery className="h-6 w-6" />,
    keyboard: <Keyboard className="h-6 w-6" />,
    home: <Home className="h-6 w-6" />
  };
  return iconMap[iconName] || <Package className="h-6 w-6" />;
};

// Form validation schemas for each step
const step1Schema = yup.object({
  items: yup.array().of(
    yup.object({
      categoryId: yup.string().required('Category is required'),
      subcategory: yup.string(),
      brand: yup.string(),
      model: yup.string(),
      condition: yup.string().required('Condition is required'),
      quantity: yup.number().min(1, 'Quantity must be at least 1').required('Quantity is required'),
      description: yup.string()
    })
  ).min(1, 'At least one item is required')
});

const step2Schema = yup.object({
  street: yup.string().required('Street address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  pincode: yup.string().matches(/^[0-9]{6}$/, 'Pincode must be 6 digits').required('Pincode is required'),
  landmark: yup.string()
});

const step3Schema = yup.object({
  preferredDate: yup.date().min(new Date(), 'Date must be in the future').required('Preferred date is required'),
  timeSlot: yup.string().required('Time slot is required'),
  contactNumber: yup.string().matches(/^[0-9]{10}$/, 'Phone number must be 10 digits').required('Contact number is required'),
  specialInstructions: yup.string()
});

type FormData = {
  items: Array<{
    categoryId: string;
    subcategory?: string;
    brand?: string;
    model?: string;
    condition: string;
    quantity: number;
    description?: string;
  }>;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  preferredDate: Date;
  timeSlot: string;
  contactNumber: string;
  specialInstructions?: string;
};

const NewPickupRequest: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [estimatedTotal, setEstimatedTotal] = useState(0);
  const [itemEstimates, setItemEstimates] = useState<{ [key: number]: number }>({});
  const [pincodeStatus, setPincodeStatus] = useState<{ serviceable: boolean; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  // API Hooks
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const createOrderMutation = useCreateOrder();

  const categories = categoriesData?.data || [];

  const { register, handleSubmit, control, watch, setValue, formState: { errors }, trigger } = useForm<FormData>({
    resolver: yupResolver(
      currentStep === 1 ? step1Schema : 
      currentStep === 2 ? step2Schema : 
      step3Schema
    ),
    defaultValues: {
      items: [{ categoryId: '', condition: '', quantity: 1 }],
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      pincode: user?.address?.pincode || '',
      landmark: user?.address?.landmark || '',
      contactNumber: user?.phone || ''
    },
    mode: 'onChange' // Enable real-time validation
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const watchedItems = watch("items");
  const watchedPincode = watch("pincode");

  // Check pincode serviceability
  const { data: pincodeData } = useCheckPincode(watchedPincode);

  useEffect(() => {
    if (pincodeData && watchedPincode?.length === 6) {
      setPincodeStatus({
        serviceable: pincodeData.serviceable,
        message: pincodeData.serviceable ? 
          `Service available in ${pincodeData.data?.area}, ${pincodeData.data?.city}` :
          pincodeData.message || 'Service not available in this area'
      });
    } else {
      setPincodeStatus(null);
    }
  }, [pincodeData, watchedPincode]);

  // Enhanced calculation with proper reactivity
  useEffect(() => {
    let total = 0;
    const newItemEstimates: { [key: number]: number } = {};

    watchedItems.forEach((item, index) => {
      if (item && item.categoryId && item.condition && item.quantity && item.quantity > 0) {
        const category = categories.find(c => c._id === item.categoryId);
        if (category) {
          let basePrice = category.basePrice;
          
          // Apply subcategory modifier
          if (item.subcategory && category.subcategories) {
            const subcategory = category.subcategories.find(sub => sub.name === item.subcategory);
            if (subcategory && subcategory.priceModifier) {
              basePrice *= subcategory.priceModifier;
            }
          }
          
          // Apply condition modifier
          const conditionMultiplier = category.conditionMultipliers?.[item.condition as keyof typeof category.conditionMultipliers] || 0.5;
          const itemTotal = Math.round(basePrice * conditionMultiplier * item.quantity);
          
          newItemEstimates[index] = itemTotal;
          total += itemTotal;
        }
      } else {
        newItemEstimates[index] = 0;
      }
    });

    setItemEstimates(newItemEstimates);
    setEstimatedTotal(total);
  }, [watchedItems, categories]);

  const addItem = () => {
    append({ categoryId: '', condition: '', quantity: 1 });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const nextStep = async () => {
    const isValid = await trigger();
    if (isValid) {
      if (currentStep < 3) {
        // Validate pincode serviceability before proceeding to step 3
        if (currentStep === 2 && !pincodeStatus?.serviceable) {
          showError('Service is not available in your pincode. Please check your pincode or contact support.');
          return;
        }
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getSelectedCategory = (categoryId: string) => {
    return categories.find(c => c._id === categoryId);
  };

  const onSubmit = async (data: FormData) => {
    if (currentStep < 3) {
      nextStep();
    } else {
      // Submit the form
      setIsSubmitting(true);
      try {
        // Calculate final pricing
        const items = data.items.map((item, index) => ({
          categoryId: item.categoryId,
          subcategory: item.subcategory || '',
          brand: item.brand || '',
          model: item.model || '',
          condition: item.condition,
          quantity: item.quantity,
          estimatedPrice: itemEstimates[index] || 0,
          description: item.description || ''
        }));

        const orderData = {
          items,
          pickupDetails: {
            address: {
              street: data.street,
              city: data.city,
              state: data.state,
              pincode: data.pincode,
              landmark: data.landmark || ''
            },
            preferredDate: data.preferredDate.toISOString(),
            timeSlot: data.timeSlot,
            contactNumber: data.contactNumber,
            specialInstructions: data.specialInstructions || ''
          },
          pricing: {
            estimatedTotal,
            pickupCharges: 0
          }
        };

        await createOrderMutation.mutateAsync(orderData);
        showSuccess('Pickup request submitted successfully!');
        navigate('/dashboard/pickups');
      } catch (error: any) {
        showError(error.response?.data?.message || 'Failed to submit pickup request');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (categoriesLoading) {
    return <LoadingSpinner fullScreen />;
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Package className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-gray-900">Add Your Items</h2>
              <p className="text-gray-600">Tell us what e-waste items you want to dispose of</p>
            </div>

            {fields.map((field, index) => {
              const selectedCategory = getSelectedCategory(watchedItems[index]?.categoryId);
              const itemEstimate = itemEstimates[index] || 0;
              
              return (
                <Card key={field.id} variant="bordered" className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Item #{index + 1}</h3>
                    {fields.length > 1 && (
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Category"
                      options={[
                        { value: '', label: 'Select Category' },
                        ...categories.map(cat => ({ value: cat._id, label: cat.name }))
                      ]}
                      error={errors.items?.[index]?.categoryId?.message}
                      {...register(`items.${index}.categoryId`)}
                    />

                    {selectedCategory?.subcategories && selectedCategory.subcategories.length > 0 && (
                      <Select
                        label="Subcategory (Optional)"
                        options={[
                          { value: '', label: 'Select Subcategory' },
                          ...selectedCategory.subcategories.map(sub => ({ value: sub.name, label: sub.name }))
                        ]}
                        {...register(`items.${index}.subcategory`)}
                      />
                    )}

                    <Input
                      label="Brand (Optional)"
                      placeholder="e.g., Apple, Samsung, HP"
                      {...register(`items.${index}.brand`)}
                    />

                    <Input
                      label="Model (Optional)"
                      placeholder="e.g., iPhone 12, Galaxy S21"
                      {...register(`items.${index}.model`)}
                    />

                    <Select
                      label="Condition"
                      options={[
                        { value: '', label: 'Select Condition' },
                        ...DEVICE_CONDITIONS.map(cond => ({ value: cond.value, label: cond.label }))
                      ]}
                      error={errors.items?.[index]?.condition?.message}
                      {...register(`items.${index}.condition`)}
                    />

                    <Input
                      label="Quantity"
                      type="number"
                      min="1"
                      error={errors.items?.[index]?.quantity?.message}
                      {...register(`items.${index}.quantity`, { 
                        valueAsNumber: true,
                        onChange: () => {
                          // Force re-calculation when quantity changes
                          setTimeout(() => {
                            const items = watch("items");
                            // Trigger useEffect by creating new array
                            setValue("items", [...items]);
                          }, 0);
                        }
                      })}
                    />
                  </div>

                  <TextArea
                    label="Description (Optional)"
                    placeholder="Any additional details about the item..."
                    rows={2}
                    {...register(`items.${index}.description`)}
                  />

                  {/* Enhanced Item Estimate Display */}
                  {watchedItems[index]?.categoryId && watchedItems[index]?.condition && watchedItems[index]?.quantity && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-green-800">
                          Estimated value for this item:
                        </p>
                        <span className="text-lg font-bold text-green-600">
                          ₹{itemEstimate.toLocaleString()}
                        </span>
                      </div>
                      
                      {selectedCategory && (
                        <div className="text-xs text-green-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Base price:</span>
                            <span>₹{selectedCategory.basePrice.toLocaleString()}</span>
                          </div>
                          {watchedItems[index]?.subcategory && (
                            <div className="flex justify-between">
                              <span>Subcategory modifier:</span>
                              <span>{selectedCategory.subcategories?.find(sub => sub.name === watchedItems[index]?.subcategory)?.priceModifier || 1}x</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Condition modifier ({watchedItems[index]?.condition}):</span>
                            <span>{selectedCategory.conditionMultipliers?.[watchedItems[index]?.condition as keyof typeof selectedCategory.conditionMultipliers] || 0.5}x</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Quantity:</span>
                            <span>{watchedItems[index]?.quantity || 1}</span>
                          </div>
                          <div className="border-t border-green-300 pt-1 mt-2 flex justify-between font-medium">
                            <span>Total:</span>
                            <span>₹{itemEstimate.toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}

            <div className="text-center">
              <Button variant="outline" onClick={addItem} type="button">
                <Plus className="mr-2 h-4 w-4" />
                Add Another Item
              </Button>
            </div>

            {estimatedTotal > 0 && (
              <Card variant="elevated" className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Total Estimated Value</h3>
                  <p className="text-3xl font-bold text-green-600 mb-2">₹{estimatedTotal.toLocaleString()}</p>
                  <p className="text-sm text-green-700 mb-3">
                    *Final amount may vary based on actual condition assessment
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-green-800">{watchedItems.length}</div>
                      <div className="text-green-600">Total items</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-green-800">FREE</div>
                      <div className="text-green-600">Pickup charges</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-green-800">₹{estimatedTotal.toLocaleString()}</div>
                      <div className="text-green-600">You'll receive</div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <MapPin className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-gray-900">Pickup Address</h2>
              <p className="text-gray-600">Confirm where we should collect your items</p>
            </div>

            <Input
              label="Street Address"
              placeholder="House/Flat number, Street name"
              error={errors.street?.message}
              {...register('street')}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="City"
                error={errors.city?.message}
                {...register('city')}
              />
              <Input
                label="State"
                error={errors.state?.message}
                {...register('state')}
              />
              <div>
                <Input
                  label="Pincode"
                  placeholder="6-digit pincode"
                  error={errors.pincode?.message}
                  {...register('pincode')}
                />
                {pincodeStatus && (
                  <div className={`mt-2 p-3 rounded-lg text-sm ${
                    pincodeStatus.serviceable ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    <div className="flex items-center">
                      {pincodeStatus.serviceable ? '✅' : '❌'}
                      <span className="ml-2">{pincodeStatus.message}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Input
              label="Landmark (Optional)"
              placeholder="Near metro station, mall, etc."
              {...register('landmark')}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Calendar className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-gray-900">Schedule Pickup</h2>
              <p className="text-gray-600">Choose when you'd like us to collect your items</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Preferred Date"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                error={errors.preferredDate?.message}
                {...register('preferredDate')}
              />

              <Select
                label="Time Slot"
                options={[
                  { value: '', label: 'Select Time Slot' },
                  ...TIME_SLOTS.map(slot => ({ value: slot.value, label: slot.label }))
                ]}
                error={errors.timeSlot?.message}
                {...register('timeSlot')}
              />
            </div>

            <Input
              label="Contact Number"
              placeholder="10-digit mobile number"
              error={errors.contactNumber?.message}
              {...register('contactNumber')}
            />

            <TextArea
              label="Special Instructions (Optional)"
              placeholder="Any specific instructions for our pickup team..."
              rows={3}
              {...register('specialInstructions')}
            />

            {/* Order Summary */}
            <Card variant="elevated" className="p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-medium">{watchedItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Value:</span>
                  <span className="font-medium text-green-600">₹{estimatedTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pickup Charges:</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total Amount:</span>
                    <span className="font-bold text-green-600">₹{estimatedTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {/* Items breakdown */}
              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Items breakdown:</h4>
                <div className="space-y-1">
                  {watchedItems.map((item, index) => {
                    const category = getSelectedCategory(item.categoryId);
                    const estimate = itemEstimates[index] || 0;
                    
                    if (!category || !item.condition || !item.quantity) return null;
                    
                    return (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.quantity}x {category.name} ({item.condition})
                        </span>
                        <span className="text-gray-900">₹{estimate.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Request New Pickup</h1>
        <p className="text-gray-600">Schedule a pickup for your e-waste items</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep >= step 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {step}
              </div>
              <div className="ml-3 text-sm">
                <p className={`font-medium ${currentStep >= step ? 'text-green-600' : 'text-gray-500'}`}>
                  {step === 1 ? 'Items' : step === 2 ? 'Address' : 'Schedule'}
                </p>
              </div>
              {step < 3 && (
                <div className={`
                  w-16 h-1 mx-4
                  ${currentStep > step ? 'bg-green-500' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card variant="elevated" className="p-8">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={prevStep} disabled={isSubmitting} type="button">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              )}
            </div>
            <div>
              <Button 
                type="submit" 
                variant="primary" 
                loading={isSubmitting}
                disabled={currentStep === 2 && !pincodeStatus?.serviceable}
              >
                {currentStep === 3 ? 'Submit Request' : 'Next'}
                {currentStep < 3 && <ChevronRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default NewPickupRequest;