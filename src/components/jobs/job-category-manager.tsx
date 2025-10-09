"use client";

import { useState } from "react";
import { JobCategory } from "@/lib/abstractions/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Tag,
  Target,
  MapPin,
  Building
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { database } from "@/lib/abstractions";

interface JobCategoryManagerProps {
  categories: JobCategory[];
  onCategoryCreated: (category: JobCategory) => void;
  onCategoryUpdated: (category: JobCategory) => void;
  onCategoryDeleted: (categoryId: string) => void;
}

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  paused: { label: 'Paused', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800' },
};

export function JobCategoryManager({ 
  categories, 
  onCategoryCreated, 
  onCategoryUpdated, 
  onCategoryDeleted 
}: JobCategoryManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<JobCategory | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetRole: '',
    targetCompanies: '',
    targetLocations: '',
    status: 'active' as 'active' | 'paused' | 'completed'
  });

  const handleCreateCategory = async () => {
    try {
      const categoryData = {
        name: formData.name,
        description: formData.description || undefined,
        targetRole: formData.targetRole,
        targetCompanies: formData.targetCompanies 
          ? formData.targetCompanies.split(',').map(c => c.trim()).filter(Boolean)
          : undefined,
        targetLocations: formData.targetLocations
          ? formData.targetLocations.split(',').map(l => l.trim()).filter(Boolean)
          : undefined,
        status: formData.status
      };

      const categoryId = await database.createJobCategory(categoryData);
      const newCategory = await database.getJobCategoryById(categoryId);
      if (newCategory) {
        onCategoryCreated(newCategory);
        resetForm();
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to create category:', error);
      alert('Failed to create category. Please try again.');
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      const updates = {
        name: formData.name,
        description: formData.description || undefined,
        targetRole: formData.targetRole,
        targetCompanies: formData.targetCompanies 
          ? formData.targetCompanies.split(',').map(c => c.trim()).filter(Boolean)
          : undefined,
        targetLocations: formData.targetLocations
          ? formData.targetLocations.split(',').map(l => l.trim()).filter(Boolean)
          : undefined,
        status: formData.status
      };

      const updatedCategory = await database.updateJobCategory(editingCategory.id, updates);
      onCategoryUpdated(updatedCategory);
      setEditingCategory(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update category:', error);
      alert('Failed to update category. Please try again.');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(categoryId);
      await database.deleteJobCategory(categoryId);
      onCategoryDeleted(categoryId);
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditCategory = (category: JobCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      targetRole: category.targetRole,
      targetCompanies: category.targetCompanies?.join(', ') || '',
      targetLocations: category.targetLocations?.join(', ') || '',
      status: category.status
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      targetRole: '',
      targetCompanies: '',
      targetLocations: '',
      status: 'active'
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job Categories</h2>
          <p className="mt-1 text-gray-600">
            Organize your job searches by role, project, or company
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Category
        </Button>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Tag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first job category to organize your job searches
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Category
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                      {category.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Target className="h-4 w-4" />
                      {category.targetRole}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 focus:text-red-600"
                        disabled={deletingId === category.id}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {deletingId === category.id ? 'Deleting...' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <Badge className={statusConfig[category.status].color}>
                      {statusConfig[category.status].label}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatDate(category.updatedAt)}
                    </span>
                  </div>

                  {/* Description */}
                  {category.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  {/* Target Companies */}
                  {category.targetCompanies && category.targetCompanies.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-gray-700">Target Companies:</span>
                      <div className="flex flex-wrap gap-1">
                        {category.targetCompanies.slice(0, 3).map((company, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Building className="h-3 w-3 mr-1" />
                            {company}
                          </Badge>
                        ))}
                        {category.targetCompanies.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{category.targetCompanies.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Target Locations */}
                  {category.targetLocations && category.targetLocations.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-gray-700">Target Locations:</span>
                      <div className="flex flex-wrap gap-1">
                        {category.targetLocations.slice(0, 3).map((location, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {location}
                          </Badge>
                        ))}
                        {category.targetLocations.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{category.targetLocations.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || !!editingCategory} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setEditingCategory(null);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? 'Update the details of your job category.'
                : 'Create a new category to organize your job searches by role, project, or company.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                placeholder="e.g., Engineering Manager Search 2024"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this job search category..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="targetRole">Target Role</Label>
              <Input
                id="targetRole"
                placeholder="e.g., Engineering Manager, Senior Software Engineer"
                value={formData.targetRole}
                onChange={(e) => setFormData(prev => ({ ...prev, targetRole: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="targetCompanies">Target Companies (Optional)</Label>
              <Input
                id="targetCompanies"
                placeholder="e.g., Google, Microsoft, Amazon (comma-separated)"
                value={formData.targetCompanies}
                onChange={(e) => setFormData(prev => ({ ...prev, targetCompanies: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="targetLocations">Target Locations (Optional)</Label>
              <Input
                id="targetLocations"
                placeholder="e.g., San Francisco, Remote, New York (comma-separated)"
                value={formData.targetLocations}
                onChange={(e) => setFormData(prev => ({ ...prev, targetLocations: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'paused' | 'completed' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setEditingCategory(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
              disabled={!formData.name.trim() || !formData.targetRole.trim()}
            >
              {editingCategory ? 'Update Category' : 'Create Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
