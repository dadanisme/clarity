import { supabase } from "./config";
import { FeatureFlag, FeatureSubscription } from "@/types";

export const FEATURE_METADATA = {
  [FeatureFlag.AI_RECEIPT_SCANNING]: {
    name: "AI Receipt Scanning",
    description:
      "Scan receipts with AI and automatically extract transaction details",
  },
  [FeatureFlag.EXCEL_IMPORT]: {
    name: "Excel Import",
    description: "Import transactions from Excel files",
  },
} as const;

export class FeatureService {
  static async hasFeature(
    userId: string,
    feature: FeatureFlag
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from("feature_subscriptions")
      .select("status")
      .eq("user_id", userId)
      .eq("feature_flag", feature)
      .eq("status", "active")
      .single();

    if (error) return false;
    return data?.status === "active";
  }

  static async getUserFeatures(userId: string): Promise<FeatureSubscription[]> {
    const { data, error } = await supabase
      .from("feature_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active");

    if (error) throw error;
    return data || [];
  }

  static async getAllUserFeatures(
    userId: string
  ): Promise<FeatureSubscription[]> {
    const { data, error } = await supabase
      .from("feature_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("granted_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getExistingFeatureSubscription(
    userId: string,
    feature: FeatureFlag
  ): Promise<FeatureSubscription | null> {
    const { data, error } = await supabase
      .from("feature_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("feature_flag", feature)
      .order("granted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async canGrantFeature(
    userId: string,
    feature: FeatureFlag
  ): Promise<{
    canGrant: boolean;
    reason?: string;
    existingSubscription?: FeatureSubscription;
  }> {
    const existingSubscription = await this.getExistingFeatureSubscription(
      userId,
      feature
    );

    if (!existingSubscription) {
      return { canGrant: true };
    }

    if (existingSubscription.status === "active") {
      return {
        canGrant: false,
        reason: "Feature is already active for this user",
        existingSubscription,
      };
    }

    return { canGrant: true, existingSubscription };
  }

  static async canRevokeFeature(
    userId: string,
    feature: FeatureFlag
  ): Promise<{
    canRevoke: boolean;
    reason?: string;
    existingSubscription?: FeatureSubscription;
  }> {
    const existingSubscription = await this.getExistingFeatureSubscription(
      userId,
      feature
    );

    if (!existingSubscription) {
      return {
        canRevoke: false,
        reason: "No feature subscription found for this user",
      };
    }

    if (existingSubscription.status === "revoked") {
      return {
        canRevoke: false,
        reason: "Feature is already revoked for this user",
        existingSubscription,
      };
    }

    return { canRevoke: true, existingSubscription };
  }

  static async grantFeature(
    userId: string,
    feature: FeatureFlag,
    grantedBy: string,
    feature_name: string,
    notes?: string
  ): Promise<FeatureSubscription> {
    // Check if the feature can be granted
    const { canGrant, reason, existingSubscription } =
      await this.canGrantFeature(userId, feature);

    if (!canGrant) {
      if (existingSubscription?.status === "active") {
        // Return the existing active subscription instead of throwing an error
        return existingSubscription;
      }
      throw new Error(reason || "Cannot grant feature");
    }

    // If there's an existing revoked subscription, reactivate it
    if (existingSubscription?.status === "revoked") {
      const { data, error } = await supabase
        .from("feature_subscriptions")
        .update({
          status: "active",
          granted_by: grantedBy,
          granted_at: new Date().toISOString(),
          notes,
          revoked_at: null,
          revoked_by: null,
        })
        .eq("id", existingSubscription.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    // Create a new subscription (first time)
    const subscriptionData = {
      user_id: userId,
      feature_flag: feature,
      feature_name: feature_name,
      status: "active" as const,
      granted_by: grantedBy,
      granted_at: new Date().toISOString(),
      notes,
      revoked_at: null,
      revoked_by: null,
    };

    const { data, error } = await supabase
      .from("feature_subscriptions")
      .insert([subscriptionData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async revokeFeature(
    userId: string,
    feature: FeatureFlag,
    revokedBy: string
  ): Promise<FeatureSubscription> {
    // Check if the feature can be revoked
    const { canRevoke, reason, existingSubscription } =
      await this.canRevokeFeature(userId, feature);

    if (!canRevoke) {
      throw new Error(reason || "Cannot revoke feature");
    }

    // We know existingSubscription exists and is active at this point
    const { data, error } = await supabase
      .from("feature_subscriptions")
      .update({
        status: "revoked",
        revoked_by: revokedBy,
        revoked_at: new Date().toISOString(),
      })
      .eq("id", existingSubscription!.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getFeatureHistory(
    userId: string,
    feature: FeatureFlag
  ): Promise<FeatureSubscription[]> {
    const { data, error } = await supabase
      .from("feature_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("feature_flag", feature)
      .order("granted_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getUsersWithFeature(
    feature: FeatureFlag
  ): Promise<FeatureSubscription[]> {
    const { data, error } = await supabase
      .from("feature_subscriptions")
      .select(
        `
        *,
        users (id, email, display_name, role)
      `
      )
      .eq("feature_flag", feature)
      .eq("status", "active");

    if (error) throw error;
    return data || [];
  }

  static async getAllActiveFeatures(): Promise<FeatureSubscription[]> {
    const { data, error } = await supabase
      .from("feature_subscriptions")
      .select(
        `
        *,
        users (id, email, display_name, role)
      `
      )
      .eq("status", "active")
      .order("granted_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static subscribeToUserFeatures(
    userId: string,
    callback: (features: FeatureSubscription[]) => void
  ) {
    return supabase
      .channel("user-features")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "feature_subscriptions",
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          const features = await this.getUserFeatures(userId);
          callback(features);
        }
      )
      .subscribe();
  }

  static subscribeToAllFeatures(
    callback: (features: FeatureSubscription[]) => void
  ) {
    return supabase
      .channel("all-features")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "feature_subscriptions",
        },
        async () => {
          const features = await this.getAllActiveFeatures();
          callback(features);
        }
      )
      .subscribe();
  }
}

export default FeatureService;
