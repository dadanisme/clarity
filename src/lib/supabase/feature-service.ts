import { supabase } from './config'
import { FeatureFlag, FeatureSubscription } from '@/types'

export const FEATURE_METADATA = {
  [FeatureFlag.AI_RECEIPT_SCANNING]: {
    name: "AI Receipt Scanning",
    description: "Scan receipts with AI and automatically extract transaction details"
  },
  [FeatureFlag.EXCEL_IMPORT]: {
    name: "Excel Import",
    description: "Import transactions from Excel files"
  }
} as const

export class FeatureService {
  static async hasFeature(userId: string, feature: FeatureFlag): Promise<boolean> {
    const { data, error } = await supabase
      .from('feature_subscriptions')
      .select('status')
      .eq('user_id', userId)
      .eq('feature_flag', feature)
      .eq('status', 'active')
      .single()

    if (error) return false
    return data?.status === 'active'
  }

  static async getUserFeatures(userId: string): Promise<FeatureSubscription[]> {
    const { data, error } = await supabase
      .from('feature_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')

    if (error) throw error
    return data || []
  }

  static async getAllUserFeatures(userId: string): Promise<FeatureSubscription[]> {
    const { data, error } = await supabase
      .from('feature_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('granted_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async grantFeature(
    userId: string,
    feature: FeatureFlag,
    grantedBy: string,
    featureName: string,
    notes?: string
  ): Promise<FeatureSubscription> {
    const { data, error } = await supabase
      .from('feature_subscriptions')
      .upsert([{
        user_id: userId,
        feature_flag: feature,
        feature_name: featureName,
        status: 'active',
        granted_by: grantedBy,
        granted_at: new Date().toISOString(),
        notes,
        revoked_at: null,
        revoked_by: null
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async revokeFeature(
    userId: string,
    feature: FeatureFlag,
    revokedBy: string
  ): Promise<FeatureSubscription> {
    const { data, error } = await supabase
      .from('feature_subscriptions')
      .update({
        status: 'revoked',
        revoked_by: revokedBy,
        revoked_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('feature_flag', feature)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getFeatureHistory(
    userId: string,
    feature: FeatureFlag
  ): Promise<FeatureSubscription[]> {
    const { data, error } = await supabase
      .from('feature_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('feature_flag', feature)
      .order('granted_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getUsersWithFeature(feature: FeatureFlag): Promise<FeatureSubscription[]> {
    const { data, error } = await supabase
      .from('feature_subscriptions')
      .select(`
        *,
        users (id, email, display_name, role)
      `)
      .eq('feature_flag', feature)
      .eq('status', 'active')

    if (error) throw error
    return data || []
  }

  static async getAllActiveFeatures(): Promise<FeatureSubscription[]> {
    const { data, error } = await supabase
      .from('feature_subscriptions')
      .select(`
        *,
        users (id, email, display_name, role)
      `)
      .eq('status', 'active')
      .order('granted_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static subscribeToUserFeatures(
    userId: string,
    callback: (features: FeatureSubscription[]) => void
  ) {
    return supabase
      .channel('user-features')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feature_subscriptions',
          filter: `user_id=eq.${userId}`
        },
        async () => {
          const features = await this.getUserFeatures(userId)
          callback(features)
        }
      )
      .subscribe()
  }

  static subscribeToAllFeatures(
    callback: (features: FeatureSubscription[]) => void
  ) {
    return supabase
      .channel('all-features')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feature_subscriptions'
        },
        async () => {
          const features = await this.getAllActiveFeatures()
          callback(features)
        }
      )
      .subscribe()
  }
}

export default FeatureService