import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Building2, 
  Save, 
  Loader2,
  Plus,
  Trash2,
  Edit,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { RestaurantService } from '@/services/restaurant.service';
import { useAuth } from '@/hooks/useAuth';

interface RestaurantSettings {
  max_outlets: number;
  is_active: boolean;
  module_permissions: Array<{
    module_id: number;
    module_name: string;
    display_name: string;
    category: string;
    is_enabled: boolean;
  }>;
}

interface Module {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  category: string;
  is_active: boolean;
}

const RestaurantSettings: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [maxOutlets, setMaxOutlets] = useState(1);

  useEffect(() => {
    if (id) {
      fetchSettings();
      fetchModules();
    }
  }, [id]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await RestaurantService.getRestaurantSettings(parseInt(id!));
      setSettings(data);
      setMaxOutlets(data?.max_outlets || 1);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load restaurant settings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const data = await RestaurantService.getModules();
      setModules(data || []);
    } catch (error) {
      console.error('Failed to fetch modules:', error);
      toast.error('Failed to load modules');
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      await RestaurantService.updateRestaurantSettings(parseInt(id!), {
        max_outlets: maxOutlets,
        module_permissions: settings?.module_permissions || []
      });
      toast.success('Settings updated successfully');
      fetchSettings();
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleModuleToggle = (moduleId: number, enabled: boolean) => {
    if (!settings) return;

    const updatedPermissions = settings.module_permissions.map(permission => 
      permission.module_id === moduleId 
        ? { ...permission, is_enabled: enabled }
        : permission
    );

    setSettings({
      ...settings,
      module_permissions: updatedPermissions
    });
  };

  if (!user || user.role !== 'super_admin') {
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
          <h1 className="text-3xl font-bold tracking-tight">Restaurant Settings</h1>
          <p className="text-muted-foreground">
            Manage restaurant configuration and module permissions
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Outlet Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Outlet Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="max_outlets">Maximum Number of Outlets</Label>
              <Input
                id="max_outlets"
                type="number"
                value={maxOutlets}
                onChange={(e) => setMaxOutlets(parseInt(e.target.value) || 1)}
                min="1"
                max="100"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Set the maximum number of outlets this restaurant can create
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="settings_active"
                checked={settings?.is_active || false}
                disabled
              />
              <Label htmlFor="settings_active">Settings Active</Label>
            </div>
          </CardContent>
        </Card>

        {/* Module Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Module Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {modules.map((module) => {
                const permission = settings?.module_permissions.find(p => p.module_id === module.id);
                const isEnabled = permission?.is_enabled || false;

                return (
                  <div key={module.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{module.display_name}</div>
                      <div className="text-sm text-muted-foreground">{module.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{module.category}</Badge>
                        {module.is_active ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(enabled) => handleModuleToggle(module.id, enabled)}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default RestaurantSettings; 