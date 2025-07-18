import { supabase } from './config'
import { Category } from '@/types'

export class CategoriesService {
  static async getCategories(userId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createCategory(
    userId: string,
    categoryData: {
      name: string
      type: 'income' | 'expense'
      color: string
      isDefault: boolean
    }
  ): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ 
        name: categoryData.name,
        type: categoryData.type,
        color: categoryData.color,
        is_default: categoryData.isDefault,
        user_id: userId 
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateCategory(
    categoryId: string,
    updates: Partial<Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', categoryId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteCategory(categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)

    if (error) throw error
  }

  static async getCategoryById(categoryId: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw error
    }
    return data
  }

  static async getCategoriesByType(userId: string, type: 'income' | 'expense'): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getDefaultCategories(userId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static subscribeToCategories(
    userId: string,
    callback: (categories: Category[]) => void
  ) {
    return supabase
      .channel('categories')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories',
          filter: `user_id=eq.${userId}`
        },
        async () => {
          const categories = await this.getCategories(userId)
          callback(categories)
        }
      )
      .subscribe()
  }
}

export default CategoriesService