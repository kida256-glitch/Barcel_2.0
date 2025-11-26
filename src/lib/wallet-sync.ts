'use client';

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc,
  onSnapshot,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirestoreDB } from './firebase';
import { getDeviceId, getDeviceInfo, getDeviceName } from './device';
import type { WalletInfo } from './wallet';

export interface WalletDeviceRecord {
  walletAddress: string;
  deviceId: string;
  deviceName: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    language: string;
    timezone: string;
    screenResolution: string;
  };
  walletType: string;
  chainId: number;
  connectedAt: Timestamp;
  lastSeenAt: Timestamp;
  isActive: boolean;
}

export interface WalletConnection {
  address: string;
  walletType: string;
  chainId: number;
  devices: Array<{
    deviceId: string;
    deviceName: string;
    connectedAt: Date;
    lastSeenAt: Date;
    isCurrentDevice: boolean;
    isActive: boolean;
  }>;
  firstConnectedAt: Date;
  lastSeenAt: Date;
}

/**
 * Sync wallet connection to Firestore
 * This allows tracking wallets across different devices
 */
export async function syncWalletToFirebase(wallet: WalletInfo): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const db = getFirestoreDB();
    if (!db) {
      console.warn('Firestore not available. Wallet sync skipped.');
      return;
    }
    const deviceId = getDeviceId();
    const deviceInfo = getDeviceInfo();
    const deviceName = getDeviceName();

    // Create a unique document ID combining wallet address and device ID
    const docId = `${wallet.address.toLowerCase()}_${deviceId}`;
    const walletRef = doc(db, 'wallet_connections', docId);

    const walletRecord: WalletDeviceRecord = {
      walletAddress: wallet.address.toLowerCase(),
      deviceId,
      deviceName,
      deviceInfo,
      walletType: wallet.walletType,
      chainId: wallet.chainId,
      connectedAt: serverTimestamp() as Timestamp,
      lastSeenAt: serverTimestamp() as Timestamp,
      isActive: true,
    };

    // Check if this wallet-device combination already exists
    const existingDoc = await getDoc(walletRef);
    if (existingDoc.exists()) {
      // Update last seen and keep original connectedAt
      const existingData = existingDoc.data() as WalletDeviceRecord;
      await setDoc(walletRef, {
        ...walletRecord,
        connectedAt: existingData.connectedAt, // Keep original connection time
        lastSeenAt: serverTimestamp(),
        isActive: true,
      }, { merge: true });
    } else {
      // Create new record
      await setDoc(walletRef, walletRecord);
    }
  } catch (error) {
    console.error('Error syncing wallet to Firebase:', error);
    // Don't throw - allow app to continue working even if sync fails
  }
}

/**
 * Remove wallet connection from Firestore
 */
export async function removeWalletFromFirebase(walletAddress: string): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const db = getFirestoreDB();
    if (!db) return;
    const deviceId = getDeviceId();
    const docId = `${walletAddress.toLowerCase()}_${deviceId}`;
    const walletRef = doc(db, 'wallet_connections', docId);

    // Mark as inactive instead of deleting (for history)
    await setDoc(walletRef, {
      isActive: false,
      lastSeenAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error removing wallet from Firebase:', error);
  }
}

/**
 * Get all devices connected to a specific wallet address
 */
export async function getWalletDevices(walletAddress: string): Promise<WalletConnection | null> {
  if (typeof window === 'undefined') return null;

  try {
    const db = getFirestoreDB();
    if (!db) return null;
    const deviceId = getDeviceId();
    const walletAddressLower = walletAddress.toLowerCase();

    const q = query(
      collection(db, 'wallet_connections'),
      where('walletAddress', '==', walletAddressLower)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const devices: WalletConnection['devices'] = [];
    let firstConnectedAt: Date | null = null;
    let lastSeenAt: Date | null = null;
    let walletType = '';
    let chainId = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data() as WalletDeviceRecord;
      const connectedAt = data.connectedAt?.toDate() || new Date();
      const seenAt = data.lastSeenAt?.toDate() || new Date();

      if (!firstConnectedAt || connectedAt < firstConnectedAt) {
        firstConnectedAt = connectedAt;
      }
      if (!lastSeenAt || seenAt > lastSeenAt) {
        lastSeenAt = seenAt;
      }

      if (!walletType) walletType = data.walletType;
      if (!chainId) chainId = data.chainId;

      devices.push({
        deviceId: data.deviceId,
        deviceName: data.deviceName,
        connectedAt,
        lastSeenAt: seenAt,
        isCurrentDevice: data.deviceId === deviceId,
        isActive: data.isActive,
      });
    });

    if (!firstConnectedAt || !lastSeenAt) {
      return null;
    }

    return {
      address: walletAddress,
      walletType,
      chainId,
      devices: devices.sort((a, b) => b.lastSeenAt.getTime() - a.lastSeenAt.getTime()),
      firstConnectedAt,
      lastSeenAt,
    };
  } catch (error) {
    console.error('Error getting wallet devices:', error);
    return null;
  }
}

/**
 * Get all wallets connected from the current device
 */
export async function getCurrentDeviceWallets(): Promise<WalletConnection[]> {
  if (typeof window === 'undefined') return [];

  try {
    const db = getFirestoreDB();
    if (!db) return [];
    const deviceId = getDeviceId();

    const q = query(
      collection(db, 'wallet_connections'),
      where('deviceId', '==', deviceId),
      where('isActive', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const wallets = new Map<string, WalletConnection>();

    querySnapshot.forEach((doc) => {
      const data = doc.data() as WalletDeviceRecord;
      const address = data.walletAddress;

      if (!wallets.has(address)) {
        wallets.set(address, {
          address,
          walletType: data.walletType,
          chainId: data.chainId,
          devices: [],
          firstConnectedAt: data.connectedAt?.toDate() || new Date(),
          lastSeenAt: data.lastSeenAt?.toDate() || new Date(),
        });
      }

      const wallet = wallets.get(address)!;
      wallet.devices.push({
        deviceId: data.deviceId,
        deviceName: data.deviceName,
        connectedAt: data.connectedAt?.toDate() || new Date(),
        lastSeenAt: data.lastSeenAt?.toDate() || new Date(),
        isCurrentDevice: true,
        isActive: data.isActive,
      });
    });

    return Array.from(wallets.values());
  } catch (error) {
    console.error('Error getting current device wallets:', error);
    return [];
  }
}

/**
 * Subscribe to wallet connections for a specific address
 * Returns a function to unsubscribe
 */
export function subscribeToWalletDevices(
  walletAddress: string,
  callback: (connection: WalletConnection | null) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  try {
    const db = getFirestoreDB();
    if (!db) {
      return () => {};
    }
    const deviceId = getDeviceId();
    const walletAddressLower = walletAddress.toLowerCase();

    const q = query(
      collection(db, 'wallet_connections'),
      where('walletAddress', '==', walletAddressLower)
    );

    return onSnapshot(
      q,
      (querySnapshot) => {
        if (querySnapshot.empty) {
          callback(null);
          return;
        }

        const devices: WalletConnection['devices'] = [];
        let firstConnectedAt: Date | null = null;
        let lastSeenAt: Date | null = null;
        let walletType = '';
        let chainId = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data() as WalletDeviceRecord;
          const connectedAt = data.connectedAt?.toDate() || new Date();
          const seenAt = data.lastSeenAt?.toDate() || new Date();

          if (!firstConnectedAt || connectedAt < firstConnectedAt) {
            firstConnectedAt = connectedAt;
          }
          if (!lastSeenAt || seenAt > lastSeenAt) {
            lastSeenAt = seenAt;
          }

          if (!walletType) walletType = data.walletType;
          if (!chainId) chainId = data.chainId;

          devices.push({
            deviceId: data.deviceId,
            deviceName: data.deviceName,
            connectedAt,
            lastSeenAt: seenAt,
            isCurrentDevice: data.deviceId === deviceId,
            isActive: data.isActive,
          });
        });

        if (firstConnectedAt && lastSeenAt) {
          callback({
            address: walletAddress,
            walletType,
            chainId,
            devices: devices.sort((a, b) => b.lastSeenAt.getTime() - a.lastSeenAt.getTime()),
            firstConnectedAt,
            lastSeenAt,
          });
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error in wallet devices subscription:', error);
        callback(null);
      }
    );
  } catch (error) {
    console.error('Error setting up wallet devices subscription:', error);
    return () => {};
  }
}

