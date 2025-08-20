import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Package, Layers } from 'lucide-react';

interface PricingItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  unit_type: 'hour' | 'day' | 'week' | 'month' | 'year' | 'piece' | 'project';
  discount?: number;
  tax_rate?: number;
  gst_rate?: number;
  hsn_code?: string;
}

interface PricingVariant {
  id: string;
  name: string;
  description: string;
  items: PricingItem[];
  discount_percentage?: number;
  is_recommended?: boolean;
}

interface PricingTable {
  items: PricingItem[];
  variants: PricingVariant[];
  tax_rate: number;
  discount_percentage: number;
  show_variants: boolean;
}

interface ProposalPricingTableProps {
  pricingTable: PricingTable;
  onPricingTableChange: (pricingTable: PricingTable) => void;
  currency: string;
}

const ProposalPricingTable = ({ pricingTable, onPricingTableChange, currency }: ProposalPricingTableProps) => {
  const updatePricingTable = (updates: Partial<PricingTable>) => {
    onPricingTableChange({
      ...pricingTable,
      ...updates,
    });
  };

  const addItem = () => {
    const newItem: PricingItem = {
      id: `item_${Date.now()}`,
      name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      unit_type: 'hour',
    };

    updatePricingTable({
      items: [...pricingTable.items, newItem],
    });
  };

  const updateItem = (id: string, updates: Partial<PricingItem>) => {
    const updatedItems = pricingTable.items.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    updatePricingTable({ items: updatedItems });
  };

  const removeItem = (id: string) => {
    const updatedItems = pricingTable.items.filter(item => item.id !== id);
    updatePricingTable({ items: updatedItems });
  };

  const addVariant = () => {
    const newVariant: PricingVariant = {
      id: `variant_${Date.now()}`,
      name: '',
      description: '',
      items: [],
    };

    updatePricingTable({
      variants: [...pricingTable.variants, newVariant],
    });
  };

  const updateVariant = (id: string, updates: Partial<PricingVariant>) => {
    const updatedVariants = pricingTable.variants.map(variant =>
      variant.id === id ? { ...variant, ...updates } : variant
    );
    updatePricingTable({ variants: updatedVariants });
  };

  const removeVariant = (id: string) => {
    const updatedVariants = pricingTable.variants.filter(variant => variant.id !== id);
    updatePricingTable({ variants: updatedVariants });
  };

  const addItemToVariant = (variantId: string) => {
    const newItem: PricingItem = {
      id: `item_${Date.now()}`,
      name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      unit_type: 'hour',
    };

    const variant = pricingTable.variants.find(v => v.id === variantId);
    if (variant) {
      updateVariant(variantId, {
        items: [...variant.items, newItem],
      });
    }
  };

  const updateVariantItem = (variantId: string, itemId: string, updates: Partial<PricingItem>) => {
    const variant = pricingTable.variants.find(v => v.id === variantId);
    if (variant) {
      const updatedItems = variant.items.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      );
      updateVariant(variantId, { items: updatedItems });
    }
  };

  const removeVariantItem = (variantId: string, itemId: string) => {
    const variant = pricingTable.variants.find(v => v.id === variantId);
    if (variant) {
      const updatedItems = variant.items.filter(item => item.id !== itemId);
      updateVariant(variantId, { items: updatedItems });
    }
  };

  const calculateItemTotal = (item: PricingItem) => {
    const subtotal = item.quantity * item.unit_price;
    const discount = (item.discount || 0) / 100;
    const afterDiscount = subtotal * (1 - discount);
    const tax = afterDiscount * ((item.tax_rate || pricingTable.tax_rate || 0) / 100);
    const gst = afterDiscount * ((item.gst_rate || 0) / 100);
    return afterDiscount + tax + gst;
  };

  const calculateTotal = () => {
    const itemsTotal = pricingTable.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    const discount = (pricingTable.discount_percentage || 0) / 100;
    return itemsTotal * (1 - discount);
  };

  const calculateVariantTotal = (variant: PricingVariant) => {
    const itemsTotal = variant.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    const discount = (variant.discount_percentage || 0) / 100;
    return itemsTotal * (1 - discount);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pricing Structure</CardTitle>
          <CardDescription>
            Create detailed pricing with items, variants, and packages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="items">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="items" className="gap-2">
                <Package className="h-4 w-4" />
                Line Items
              </TabsTrigger>
              <TabsTrigger value="variants" className="gap-2">
                <Layers className="h-4 w-4" />
                Packages/Variants
              </TabsTrigger>
            </TabsList>

            <TabsContent value="items" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Line Items</h3>
                <Button onClick={addItem} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {pricingTable.items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No items added yet. Add your first pricing item to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pricingTable.items.map((item) => (
                    <Card key={item.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Input
                            placeholder="Item name"
                            value={item.name}
                            onChange={(e) => updateItem(item.id, { name: e.target.value })}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <Textarea
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, { description: e.target.value })}
                          rows={2}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                          <div>
                            <label className="text-sm font-medium">Quantity</label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Unit Price</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => updateItem(item.id, { unit_price: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Unit Type</label>
                            <Select
                              value={item.unit_type}
                              onValueChange={(value) => updateItem(item.id, { unit_type: value as PricingItem['unit_type'] })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hour">Hour</SelectItem>
                                <SelectItem value="day">Day</SelectItem>
                                <SelectItem value="week">Week</SelectItem>
                                <SelectItem value="month">Month</SelectItem>
                                <SelectItem value="year">Year</SelectItem>
                                <SelectItem value="piece">Piece</SelectItem>
                                <SelectItem value="project">Project</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Discount (%)</label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discount || ''}
                              onChange={(e) => updateItem(item.id, { discount: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">GST (%)</label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={item.gst_rate || ''}
                              onChange={(e) => updateItem(item.id, { gst_rate: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Total</label>
                            <div className="h-10 flex items-center px-3 border border-input bg-muted rounded-md">
                              {formatCurrency(calculateItemTotal(item))}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">HSN Code</label>
                            <Input
                              placeholder="HSN/SAC Code"
                              value={item.hsn_code || ''}
                              onChange={(e) => updateItem(item.id, { hsn_code: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Tax Rate (%)</label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={item.tax_rate || ''}
                              onChange={(e) => updateItem(item.id, { tax_rate: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {/* Global Settings */}
                  <Card className="p-4 bg-muted/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Global Tax Rate (%)</label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={pricingTable.tax_rate || ''}
                          onChange={(e) => updatePricingTable({ tax_rate: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Global Discount (%)</label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={pricingTable.discount_percentage || ''}
                          onChange={(e) => updatePricingTable({ discount_percentage: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Total */}
                  <Card className="p-4 bg-primary/5 border-primary/20">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Total Amount</h3>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(calculateTotal())}
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="variants" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Pricing Packages</h3>
                <Button onClick={addVariant} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Package
                </Button>
              </div>

              {pricingTable.variants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No packages created yet. Create different pricing tiers for your client.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pricingTable.variants.map((variant) => (
                    <Card key={variant.id} className={`relative ${variant.is_recommended ? 'ring-2 ring-primary' : ''}`}>
                      {variant.is_recommended && (
                        <Badge className="absolute -top-2 left-4 bg-primary">
                          Recommended
                        </Badge>
                      )}
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Input
                            placeholder="Package name"
                            value={variant.name}
                            onChange={(e) => updateVariant(variant.id, { name: e.target.value })}
                            className="font-semibold"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariant(variant.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Package description"
                          value={variant.description}
                          onChange={(e) => updateVariant(variant.id, { description: e.target.value })}
                          rows={2}
                        />
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center">
                          <span className="text-2xl font-bold">
                            {formatCurrency(calculateVariantTotal(variant))}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Items</label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addItemToVariant(variant.id)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {variant.items.map((item) => (
                              <div key={item.id} className="border rounded p-2 text-sm">
                                <div className="flex items-center justify-between">
                                  <Input
                                    placeholder="Item name"
                                    value={item.name}
                                    onChange={(e) => updateVariantItem(variant.id, item.id, { name: e.target.value })}
                                    className="text-xs h-6"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeVariantItem(variant.id, item.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-1 mt-1">
                                  <Input
                                    type="number"
                                    placeholder="Qty"
                                    value={item.quantity}
                                    onChange={(e) => updateVariantItem(variant.id, item.id, { quantity: parseInt(e.target.value) || 1 })}
                                    className="text-xs h-6"
                                  />
                                  <Input
                                    type="number"
                                    placeholder="Price"
                                    value={item.unit_price}
                                    onChange={(e) => updateVariantItem(variant.id, item.id, { unit_price: parseFloat(e.target.value) || 0 })}
                                    className="text-xs h-6"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Discount (%)</label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={variant.discount_percentage || ''}
                            onChange={(e) => updateVariant(variant.id, { discount_percentage: parseFloat(e.target.value) || 0 })}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`recommended_${variant.id}`}
                            checked={variant.is_recommended || false}
                            onChange={(e) => updateVariant(variant.id, { is_recommended: e.target.checked })}
                            className="rounded"
                          />
                          <label htmlFor={`recommended_${variant.id}`} className="text-sm">
                            Mark as recommended
                          </label>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProposalPricingTable;