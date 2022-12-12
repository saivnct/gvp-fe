import {Injectable} from '@angular/core';
import {AES, enc, SHA256} from 'crypto-js';

@Injectable({
  providedIn: 'root'
})

export class SessionService {

  // NOTE: Your Secret Key should be user inputed or obtained through a secure authenticated request.
  // Do NOT ship your Secret Key in your code.
  secretKey = 'secret_key_398742';

  //sessionStorage or localStorage
  storage: Storage = window['localStorage'];

  constructor() { }

  setWithExpiry(key: string, value: any, ttl: number) {
    const now = new Date()

    // `item` is an object which contains the original value
    // as well as the time when it's supposed to expire
    const item = {
      value: value,
      expiry: now.getTime() + ttl,
    }

    const encryptedValue = this.encryptString(JSON.stringify(item));
    this.storage.setItem(key, encryptedValue);
  }

  getWithExpiry(key: string) {
    const itemStr = this.storage.getItem(key)
    // if the item doesn't exist, return null
    if (!itemStr) {
      return null
    }

    try {
      const decryptedValue = this.decryptString(itemStr);

      const item = JSON.parse(decryptedValue);
      const now = new Date()
      // compare the expiry time of the item with the current time
      if (now.getTime() > item.expiry) {
        // If the item is expired, delete the item from storage
        // and return null
        this.storage.removeItem(key)
        return null
      }
      return item.value
    } catch (e) {

    }
    return null

  }

  setItem(key: string, value: any): void {
    const valueToString =
      typeof value === 'object' ? JSON.stringify(value) : String(value);
    const encryptedValue = this.encryptString(valueToString);

    this.storage.setItem(key, encryptedValue);
  }

  getItem(key: string): string | any | undefined {
    const item = this.storage.getItem(key);

    if (item) {
      const decryptedValue = this.decryptString(item);

      try {
        return JSON.parse(decryptedValue);
      } catch (error) {
        return decryptedValue;
      }
    }

    return undefined;
  }

  removeItem(key: string): void {
    this.storage.removeItem(key);
  }

  removeItemFromPattern(pattern: string): void {
    const storageKeys = Object.keys(this.storage);
    const filteredKeys = storageKeys.filter(key => key.includes(pattern));

    filteredKeys.forEach(key => {
      this.storage.removeItem(key);
    });
  }

  clear(): void {
    this.storage.clear();
  }

  encryptString(str: string): string {
    return AES.encrypt(str, this.secretKey).toString();
  }

  decryptString(str: string): string {
    try {
      return AES.decrypt(str, this.secretKey).toString(enc.Utf8);
    } catch (e) {

    }
    return ''
  }

  hash(key: any): any {
    key = SHA256(key, this.secretKey as Object);
    return key.toString();
  }

}
