import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

export const isNative = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const isWeb = (): boolean => {
  return !Capacitor.isNativePlatform();
};

export const getPlatform = (): 'ios' | 'android' | 'web' => {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
};

export const getDeviceInfo = async () => {
  try {
    return await Device.getInfo();
  } catch (error) {
    console.error('Error getting device info:', error);
    return null;
  }
};
