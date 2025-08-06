import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Settings, 
  Edit, 
  Trash2, 
  Loader2,
  Package,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { ModuleService, Module, CreateModuleInput } from '@/services/module.service';
import { useAuth } from '@/hooks/useAuth';

const ModuleManagement: React.FC = () => {
  const { user } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState<CreateModuleInput>({
    name: '',
    display_name: '',
    description: '',
    category: '',
    is_active: true,
  });

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setIsLoading(true);
      const data = await ModuleService.getModules(false); // Get all modules including inactive
      setModules(data || []);
    } catch (error) {
      console.error('Failed to fetch modules:', error);
      toast.error('Failed to load modules');
      setModules([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.display_name || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await ModuleService.createModule(formData);
      toast.success('Module created successfully');
      setShowCreateForm(false);
      setFormData({
        name: '',
        display_name: '',
        description: '',
        category: '',
        is_active: true,
      });
      fetchModules();
    } catch (error) {
      console.error('Failed to create module:', error);
      toast.error('Failed to create module');
    }
  };

  const handleUpdateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingModule) return;

    try {
      await ModuleService.updateModule(editingModule.id, formData);
      toast.success('Module updated successfully');
      setEditingModule(null);
      setFormData({
        name: '',
        display_name: '',
        description: '',
        category: '',
        is_active: true,
      });
      fetchModules();
    } catch (error) {
      console.error('Failed to update module:', error);
      toast.error('Failed to update module');
    }
  };

  const handleDeleteModule = async (id: number) => {
    if (!confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(id);
      await ModuleService.deleteModule(id);
      toast.success('Module deleted successfully');
      fetchModules();
    } catch (error) {
      console.error('Failed to delete module:', error);
      toast.error('Failed to delete module');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setFormData({
      name: module.name,
      display_name: module.display_name,
      description: module.description || '',
      category: module.category,
      is_active: module.is_active,
    });
  };

  const handleCancelEdit = () => {
    setEditingModule(null);
    setFormData({
      name: '',
      display_name: '',
      description: '',
      category: '',
      is_active: true,
    });
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      'operations': 'bg-blue-100 text-blue-800',
      'management': 'bg-green-100 text-green-800',
      'reports': 'bg-purple-100 text-purple-800',
    };
    
    return (
      <Badge className={colors[category] || 'bg-gray-100 text-gray-800'}>
        {category}
      </Badge>
    );
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

  return (
    <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Module Management</h1>
          <p className="text-muted-foreground">
            Manage available modules for restaurants
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Module
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingModule) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingModule ? 'Edit Module' : 'Create New Module'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingModule ? handleUpdateModule : handleCreateModule} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Module Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., order_management"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name *</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="e.g., Order Management"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the module"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., operations, management, reports"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="is_active">Status</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingModule ? 'Update Module' : 'Create Module'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    handleCancelEdit();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Modules List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !modules || modules.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No modules found</h3>
            <p className="text-muted-foreground mb-6">
              Get started by adding your first module.
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <Card key={module.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      {module.display_name}
                    </CardTitle>
                    <div className="flex gap-2 mt-2">
                      {getCategoryBadge(module.category)}
                      {module.is_active ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditModule(module)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteModule(module.id)}
                      disabled={isDeleting === module.id}
                    >
                      {isDeleting === module.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Name:</span> {module.name}
                  </div>
                  
                  {module.description && (
                    <div className="text-sm text-gray-600">
                      {module.description}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Created: {new Date(module.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModuleManagement; 