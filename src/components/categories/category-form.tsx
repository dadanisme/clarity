"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/use-categories";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { Category } from "@/types";
import { SegmentedControl } from "@/components/ui/segmented-control";

interface CategoryFormData {
  name: string;
  type: "income" | "expense";
  color: string;
}

interface CategoryFormProps {
  category?: Category;
  mode: "create" | "edit";
  trigger?: React.ReactNode;
}

const colorOptions = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#6b7280",
  "#84cc16",
];

export function CategoryForm({ category, mode, trigger }: CategoryFormProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CategoryFormData>({
    defaultValues: category
      ? {
          name: category.name,
          type: category.type,
          color: category.color,
        }
      : {
          name: "",
          type: "expense",
          color: "#3b82f6",
        },
  });

  const watchedColor = watch("color");

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (mode === "create" && user?.id) {
        await createCategory.mutateAsync({
          userId: user.id,
          data: {
            ...data,
            isDefault: false,
          },
        });
      } else if (mode === "edit" && user?.id && category) {
        await updateCategory.mutateAsync({
          userId: user.id,
          categoryId: category.id,
          data: {
            ...data,
            isDefault: category.isDefault,
          },
        });
      }

      setOpen(false);
      reset();
    } catch (error) {
      console.error("Category save failed:", error);
    }
  };

  const handleDelete = async () => {
    if (user?.id && category) {
      try {
        await deleteCategory.mutateAsync({
          userId: user.id,
          categoryId: category.id,
        });
        setOpen(false);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            {mode === "create" ? (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Category" : "Edit Category"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new category to organize your transactions."
              : "Update the category details."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter category name"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <SegmentedControl
                value={watch("type")}
                onValueChange={(value) =>
                  setValue("type", value as "income" | "expense")
                }
                options={[
                  { value: "expense", label: "Expense" },
                  { value: "income", label: "Income" },
                ]}
              />
            </div>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    watchedColor === color
                      ? "border-foreground scale-110"
                      : "border-border hover:border-foreground"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setValue("color", color)}
                />
              ))}
            </div>
            {errors.color && (
              <p className="text-sm text-destructive">{errors.color.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            {mode === "edit" && (
              <div className="flex space-x-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 text-destructive hover:text-destructive/80 border-destructive/20 hover:border-destructive/30"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Category</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &quot;
                        {category?.name}&quot;? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Updating..." : "Update Category"}
                </Button>
              </div>
            )}
            {mode === "create" && (
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Category"}
                </Button>
              </div>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
