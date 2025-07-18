import { supabase } from './config'
import { RealtimeChannel } from '@supabase/supabase-js'

export class RealtimeService {
  static subscribeToUserData(userId: string, callback: (data: any) => void): RealtimeChannel {
    return supabase
      .channel('user-data')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }

  static subscribeToCategories(userId: string, callback: (data: any) => void): RealtimeChannel {
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
        callback
      )
      .subscribe()
  }

  static subscribeToTransactions(userId: string, callback: (data: any) => void): RealtimeChannel {
    return supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }

  static subscribeToFeatureSubscriptions(userId: string, callback: (data: any) => void): RealtimeChannel {
    return supabase
      .channel('feature-subscriptions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feature_subscriptions',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }

  static subscribeToAllUsers(callback: (data: any) => void): RealtimeChannel {
    return supabase
      .channel('all-users')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        callback
      )
      .subscribe()
  }

  static subscribeToAllFeatureSubscriptions(callback: (data: any) => void): RealtimeChannel {
    return supabase
      .channel('all-feature-subscriptions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feature_subscriptions'
        },
        callback
      )
      .subscribe()
  }

  static unsubscribe(channel: RealtimeChannel): void {
    supabase.removeChannel(channel)
  }

  static unsubscribeAll(): void {
    supabase.removeAllChannels()
  }
}

export default RealtimeService