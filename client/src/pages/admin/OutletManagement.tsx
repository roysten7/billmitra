import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Plus, 
  Save, 
  Loader2,
  MapPin,
  Edit,
  Trash2,
  Map,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { RestaurantService } from '@/services/restaurant.service';
import { useAuth } from '@/hooks/useAuth';

interface Outlet {
  id: number;
  name: string;
  alias?: string;
  email?: string;
  landmark?: string;
  zip_code: string;
  fax?: string;
  tin_no?: string;
  country: string;
  state: string;
  city: string;
  timezone: string;
  address: string;
  area?: string;
  latitude: number;
  longitude: number;
  additional_info?: string;
  cuisines?: string;
  seating_capacity: string;
  logo_url?: string;
  images?: string[];
  restaurant_type: string;
  online_order_channels?: string[];
  code?: string;
  fssai_lic_no?: string;
  tax_authority_name: string;
  outlet_serving_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateOutletForm {
  name: string;
  alias?: string;
  email?: string;
  landmark?: string;
  zip_code: string;
  fax?: string;
  tin_no?: string;
  country: string;
  state: string;
  city: string;
  timezone: string;
  address: string;
  area?: string;
  latitude: number;
  longitude: number;
  additional_info?: string;
  cuisines?: string;
  seating_capacity: string;
  restaurant_type: string;
  online_order_channels: string[];
  code?: string;
  fssai_lic_no?: string;
  tax_authority_name: string;
  outlet_serving_type: string;
}

const OutletManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [maxOutlets, setMaxOutlets] = useState(1);
  const [currentOutlets, setCurrentOutlets] = useState(0);

  const [formData, setFormData] = useState<CreateOutletForm>({
    name: '',
    alias: '',
    email: '',
    landmark: '',
    zip_code: '',
    fax: '',
    tin_no: '',
    country: 'India',
    state: '',
    city: '',
    timezone: 'Asia/Kolkata',
    address: '',
    area: '',
    latitude: 0,
    longitude: 0,
    additional_info: '',
    cuisines: '',
    seating_capacity: '1-10',
    restaurant_type: 'Fine Dine',
    online_order_channels: [],
    code: '',
    fssai_lic_no: '',
    tax_authority_name: '',
    outlet_serving_type: 'Service'
  });

  useEffect(() => {
    if (id) {
      fetchOutlets();
      fetchRestaurantSettings();
    }
  }, [id]);

  const fetchOutlets = async () => {
    try {
      setIsLoading(true);
      const data = await RestaurantService.getOutlets(parseInt(id!));
      setOutlets(data || []);
      setCurrentOutlets(data?.length || 0);
    } catch (error) {
      console.error('Failed to fetch outlets:', error);
      toast.error('Failed to load outlets');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRestaurantSettings = async () => {
    try {
      const settings = await RestaurantService.getRestaurantSettings(parseInt(id!));
      setMaxOutlets(settings?.max_outlets || 1);
    } catch (error) {
      console.error('Failed to fetch restaurant settings:', error);
    }
  };

  const handleInputChange = (field: keyof CreateOutletForm, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateOutlet = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.zip_code || !formData.country || !formData.state || 
        !formData.city || !formData.address || !formData.tax_authority_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (currentOutlets >= maxOutlets) {
      toast.error(`Maximum ${maxOutlets} outlets allowed`);
      return;
    }

    try {
      setIsCreating(true);
      await RestaurantService.createOutlet(parseInt(id!), formData);
      toast.success('Outlet created successfully');
      setShowCreateDialog(false);
      setFormData({
        name: '',
        alias: '',
        email: '',
        landmark: '',
        zip_code: '',
        fax: '',
        tin_no: '',
        country: 'India',
        state: '',
        city: '',
        timezone: 'Asia/Kolkata',
        address: '',
        area: '',
        latitude: 0,
        longitude: 0,
        additional_info: '',
        cuisines: '',
        seating_capacity: '1-10',
        restaurant_type: 'Fine Dine',
        online_order_channels: [],
        code: '',
        fssai_lic_no: '',
        tax_authority_name: '',
        outlet_serving_type: 'Service'
      });
      fetchOutlets();
    } catch (error) {
      console.error('Failed to create outlet:', error);
      toast.error('Failed to create outlet');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteOutlet = async (outletId: number) => {
    if (!confirm('Are you sure you want to delete this outlet? This action cannot be undone.')) {
      return;
    }

    try {
      await RestaurantService.deleteOutlet(parseInt(id!), outletId);
      toast.success('Outlet deleted successfully');
      fetchOutlets();
    } catch (error) {
      console.error('Failed to delete outlet:', error);
      toast.error('Failed to delete outlet');
    }
  };

  const getRestaurantTypeBadge = (type: string) => {
    const colors = {
      'Fine Dine': 'bg-purple-100 text-purple-800',
      'QSR': 'bg-blue-100 text-blue-800',
      'Only Take Away': 'bg-green-100 text-green-800',
      'Dark Kitchen': 'bg-gray-100 text-gray-800',
      'Food Court': 'bg-orange-100 text-orange-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{type}</Badge>;
  };

  const getServingTypeBadge = (type: string) => {
    const colors = {
      'Service': 'bg-green-100 text-green-800',
      'Goods': 'bg-blue-100 text-blue-800',
      'Both': 'bg-purple-100 text-purple-800'
    };
    return <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{type}</Badge>;
  };

  if (!user || (user.role !== 'super_admin' && user.role !== 'restaurant_admin')) {
    return (
      <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 mx-auto space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 mx-auto space-y-6">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(`/restaurants/${id}/edit`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Restaurant
        </Button>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Outlet Management</h1>
          <p className="text-muted-foreground">
            Manage restaurant outlets ({currentOutlets}/{maxOutlets})
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button disabled={currentOutlets >= maxOutlets}>
              <Plus className="h-4 w-4 mr-2" />
              Add Outlet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Outlet</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateOutlet} className="space-y-6">
              {/* Section 1: Outlet Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Section 1: Outlet Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Outlet Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter outlet name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="alias">Outlet Alias</Label>
                    <Input
                      id="alias"
                      value={formData.alias}
                      onChange={(e) => handleInputChange('alias', e.target.value)}
                      placeholder="Enter outlet alias"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Address Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Section 2: Address Information</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Enter physical location of your outlet. Provide your ZipCode and State accurately for GST calculation whenever applicable.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="landmark">Landmark</Label>
                    <Input
                      id="landmark"
                      value={formData.landmark}
                      onChange={(e) => handleInputChange('landmark', e.target.value)}
                      placeholder="Enter landmark"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip_code">Zip Code *</Label>
                    <Input
                      id="zip_code"
                      value={formData.zip_code}
                      onChange={(e) => handleInputChange('zip_code', e.target.value)}
                      placeholder="Enter zip code"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="fax">Fax</Label>
                    <Input
                      id="fax"
                      value={formData.fax}
                      onChange={(e) => handleInputChange('fax', e.target.value)}
                      placeholder="Enter fax number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tin_no">Tin No.</Label>
                    <Input
                      id="tin_no"
                      value={formData.tin_no}
                      onChange={(e) => handleInputChange('tin_no', e.target.value)}
                      placeholder="Enter TIN number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="India">India</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="Enter state"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter city"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                        <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter full address"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="area">Area</Label>
                    <Input
                      id="area"
                      value={formData.area}
                      onChange={(e) => handleInputChange('area', e.target.value)}
                      placeholder="Enter area"
                    />
                  </div>
                  <div>
                    <Label htmlFor="latitude">Latitude *</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value) || 0)}
                      placeholder="Enter latitude"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude *</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value) || 0)}
                      placeholder="Enter longitude"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Additional Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Section 3: Additional Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="additional_info">Additional Info</Label>
                    <Textarea
                      id="additional_info"
                      value={formData.additional_info}
                      onChange={(e) => handleInputChange('additional_info', e.target.value)}
                      placeholder="Enter additional information"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cuisines">Cuisines</Label>
                    <Input
                      id="cuisines"
                      value={formData.cuisines}
                      onChange={(e) => handleInputChange('cuisines', e.target.value)}
                      placeholder="Enter cuisines"
                    />
                  </div>
                  <div>
                    <Label htmlFor="seating_capacity">Seating Capacity</Label>
                    <Select value={formData.seating_capacity} onValueChange={(value) => handleInputChange('seating_capacity', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10</SelectItem>
                        <SelectItem value="10-25">10-25</SelectItem>
                        <SelectItem value="25-50">25-50</SelectItem>
                        <SelectItem value="50-100">50-100</SelectItem>
                        <SelectItem value="100+">100+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="restaurant_type">Restaurant Type</Label>
                    <Select value={formData.restaurant_type} onValueChange={(value) => handleInputChange('restaurant_type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fine Dine">Fine Dine</SelectItem>
                        <SelectItem value="QSR">QSR</SelectItem>
                        <SelectItem value="Only Take Away">Only Take Away</SelectItem>
                        <SelectItem value="Dark Kitchen">Dark Kitchen</SelectItem>
                        <SelectItem value="Food Court">Food Court</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value)}
                      placeholder="Enter code"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fssai_lic_no">FSSAI Lic No.</Label>
                    <Input
                      id="fssai_lic_no"
                      value={formData.fssai_lic_no}
                      onChange={(e) => handleInputChange('fssai_lic_no', e.target.value)}
                      placeholder="Enter FSSAI license number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tax_authority_name">Tax Authority Name *</Label>
                    <Input
                      id="tax_authority_name"
                      value={formData.tax_authority_name}
                      onChange={(e) => handleInputChange('tax_authority_name', e.target.value)}
                      placeholder="Enter tax authority name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="outlet_serving_type">Outlet Serving Type</Label>
                    <Select value={formData.outlet_serving_type} onValueChange={(value) => handleInputChange('outlet_serving_type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Service">Service</SelectItem>
                        <SelectItem value="Goods">Goods</SelectItem>
                        <SelectItem value="Both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Create Outlet
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {outlets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No outlets found</h3>
            <p className="text-muted-foreground mb-6">
              Get started by adding your first outlet.
            </p>
            <Button onClick={() => setShowCreateDialog(true)} disabled={currentOutlets >= maxOutlets}>
              <Plus className="h-4 w-4 mr-2" />
              Add Outlet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {outlets.map((outlet) => (
            <Card key={outlet.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      {outlet.name}
                    </CardTitle>
                    {outlet.alias && (
                      <p className="text-sm text-muted-foreground">{outlet.alias}</p>
                    )}
                    <div className="flex gap-1 mt-2">
                      {getRestaurantTypeBadge(outlet.restaurant_type)}
                      {getServingTypeBadge(outlet.outlet_serving_type)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteOutlet(outlet.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {outlet.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{outlet.email}</span>
                    </div>
                  )}
                  
                  {outlet.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{outlet.address}</span>
                    </div>
                  )}
                  
                  {outlet.city && outlet.state && (
                    <div className="text-sm text-gray-600">
                      {outlet.city}, {outlet.state}
                    </div>
                  )}
                  
                  {outlet.seating_capacity && (
                    <div className="text-sm text-gray-600">
                      Capacity: {outlet.seating_capacity}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Map className="h-4 w-4 mr-2" />
                    See location on map
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OutletManagement; 