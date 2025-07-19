import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import { FeatureSubscription, FeatureFlag, FeatureSubscriptionStatus } from "@/types";

export class FeatureService {
  // Check if user has access to a specific feature
  static async hasFeature(userId: string, feature: FeatureFlag): Promise<boolean> {
    try {
      const featureDoc = await getDoc(
        doc(db, "users", userId, "subscriptions", feature)
      );
      
      if (!featureDoc.exists()) {
        return false;
      }
      
      const subscription = featureDoc.data() as FeatureSubscription;
      return subscription.status === FeatureSubscriptionStatus.ACTIVE;
    } catch (error) {
      console.error(`Error checking feature ${feature} for user ${userId}:`, error);
      return false;
    }
  }

  // Get all features for a user
  static async getUserFeatures(userId: string): Promise<FeatureSubscription[]> {
    try {
      const subscriptionsRef = collection(db, "users", userId, "subscriptions");
      const snapshot = await getDocs(subscriptionsRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        grantedAt: doc.data().grantedAt?.toDate() || new Date(),
        revokedAt: doc.data().revokedAt?.toDate() || undefined,
      })) as FeatureSubscription[];
    } catch (error) {
      console.error(`Error getting features for user ${userId}:`, error);
      return [];
    }
  }

  // Subscribe to real-time user features
  static subscribeToUserFeatures(
    userId: string,
    onUpdate: (features: FeatureSubscription[]) => void
  ) {
    const subscriptionsRef = collection(db, "users", userId, "subscriptions");
    
    return onSnapshot(subscriptionsRef, (snapshot) => {
      const features = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        grantedAt: doc.data().grantedAt?.toDate() || new Date(),
        revokedAt: doc.data().revokedAt?.toDate() || undefined,
      })) as FeatureSubscription[];
      
      onUpdate(features);
    }, (error) => {
      console.error(`Error subscribing to features for user ${userId}:`, error);
      onUpdate([]);
    });
  }

  // Subscribe to a specific feature for a user
  static subscribeToFeature(
    userId: string,
    feature: FeatureFlag,
    onUpdate: (hasAccess: boolean) => void
  ) {
    const featureRef = doc(db, "users", userId, "subscriptions", feature);
    
    return onSnapshot(featureRef, (doc) => {
      if (doc.exists()) {
        const subscription = doc.data() as FeatureSubscription;
        onUpdate(subscription.status === FeatureSubscriptionStatus.ACTIVE);
      } else {
        onUpdate(false);
      }
    }, (error) => {
      console.error(`Error subscribing to feature ${feature} for user ${userId}:`, error);
      onUpdate(false);
    });
  }

  // Grant a feature to a user (admin only)
  static async grantFeature(
    userId: string,
    feature: FeatureFlag,
    grantedBy: string,
    featureName: string,
    notes?: string
  ): Promise<void> {
    try {
      const subscription: Omit<FeatureSubscription, "id"> = {
        userId,
        featureName,
        status: FeatureSubscriptionStatus.ACTIVE,
        grantedAt: new Date(),
        grantedBy,
        ...(notes && { notes }), // Only include notes if it's not undefined/empty
      };

      await setDoc(
        doc(db, "users", userId, "subscriptions", feature),
        {
          ...subscription,
          grantedAt: serverTimestamp(),
        }
      );
    } catch (error) {
      console.error(`Error granting feature ${feature} to user ${userId}:`, error);
      throw error;
    }
  }

  // Revoke a feature from a user (admin only)
  static async revokeFeature(
    userId: string,
    feature: FeatureFlag,
    revokedBy: string
  ): Promise<void> {
    try {
      const featureRef = doc(db, "users", userId, "subscriptions", feature);
      const featureDoc = await getDoc(featureRef);
      
      if (featureDoc.exists()) {
        const currentData = featureDoc.data() as FeatureSubscription;
        await setDoc(featureRef, {
          ...currentData,
          status: FeatureSubscriptionStatus.REVOKED,
          revokedBy,
          revokedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error(`Error revoking feature ${feature} from user ${userId}:`, error);
      throw error;
    }
  }

  // Delete a feature subscription completely (admin only)
  static async deleteFeature(userId: string, feature: FeatureFlag): Promise<void> {
    try {
      await deleteDoc(doc(db, "users", userId, "subscriptions", feature));
    } catch (error) {
      console.error(`Error deleting feature ${feature} from user ${userId}:`, error);
      throw error;
    }
  }

  // Get all users with a specific feature
  static async getUsersWithFeature(feature: FeatureFlag): Promise<string[]> {
    try {
      // Note: This requires a composite index in Firestore
      // Query across all users is expensive, consider caching
      const users: string[] = [];
      
      // This is a simplified approach - in production you might want to maintain
      // a separate collection for feature analytics
      console.warn("getUsersWithFeature is not efficiently implemented yet");
      
      return users;
    } catch (error) {
      console.error(`Error getting users with feature ${feature}:`, error);
      return [];
    }
  }
}

// Feature metadata for UI display
export const FEATURE_METADATA = {
  [FeatureFlag.AI_RECEIPT_SCANNING]: {
    name: "AI Receipt Scanning",
    description: "Automatically parse receipts using AI to create transactions",
    icon: "camera",
  },
  [FeatureFlag.EXCEL_IMPORT]: {
    name: "Excel Import",
    description: "Import transactions from Excel/CSV files",
    icon: "file-spreadsheet",
  },
  [FeatureFlag.EXCEL_EXPORT]: {
    name: "Excel Export",
    description: "Export transactions to Excel/CSV files",
    icon: "download",
  },
} as const;