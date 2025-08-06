import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isAvailable: boolean;
};

export const MenuManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample data - in a real app, this would come from an API
  const [menuItems] = useState<MenuItem[]>([
    {
      id: '1',
      name: 'Butter Chicken',
      description: 'Tender chicken cooked in a rich buttery tomato sauce',
      price: 320,
      category: 'Main Course',
      isVegetarian: false,
      isVegan: false,
      isAvailable: true,
    },
    {
      id: '2',
      name: 'Paneer Tikka',
      description: 'Grilled cottage cheese with Indian spices',
      price: 280,
      category: 'Starter',
      isVegetarian: true,
      isVegan: false,
      isAvailable: true,
    },
    {
      id: '3',
      name: 'Dal Makhani',
      description: 'Black lentils slow-cooked with butter and cream',
      price: 240,
      category: 'Main Course',
      isVegetarian: true,
      isVegan: false,
      isAvailable: true,
    },
  ]);

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Menu Management</h2>
          <p className="text-muted-foreground">
            Manage your restaurant's menu items and categories
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Menu Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="w-full max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search menu items..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-32">Category</TableHead>
                <TableHead className="w-24 text-right">Price (₹)</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="line-clamp-1">{item.description}</div>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right">₹{item.price}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No menu items found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuManagement;
