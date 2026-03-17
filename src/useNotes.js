import { useState, useEffect, useRef, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isConfigured, onAuthChange, signInWithGoogle, signOutUser } from './firebase.js';

const STORAGE_KEY = 'ddia-notes';

export function useNotes() {
  const [text, setText] = useState('');
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSynced, setIsSynced] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const debounceRef = useRef(null);
  const userRef = useRef(null);

  // Load from localStorage immediately
  useEffect(() => {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) setText(local);
  }, []);

  // Listen for auth changes and load from Firestore
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      userRef.current = firebaseUser;
      if (firebaseUser && isConfigured && db) {
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid, 'notes', 'global'));
          if (snap.exists()) {
            const cloudText = snap.data().text || '';
            setText(cloudText);
            localStorage.setItem(STORAGE_KEY, cloudText);
          } else {
            // First sign-in: push local notes to cloud
            const local = localStorage.getItem(STORAGE_KEY);
            if (local) {
              await setDoc(doc(db, 'users', firebaseUser.uid, 'notes', 'global'), {
                text: local,
                updatedAt: new Date().toISOString(),
              });
            }
          }
          setIsSynced(true);
        } catch (e) {
          console.error('Firestore load error:', e);
        }
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const saveToCloud = useCallback(async (newText) => {
    const currentUser = userRef.current;
    if (!currentUser || !isConfigured || !db) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'users', currentUser.uid, 'notes', 'global'), {
        text: newText,
        updatedAt: new Date().toISOString(),
      });
      setIsSynced(true);
    } catch (e) {
      console.error('Firestore save error:', e);
      setIsSynced(false);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updateText = useCallback((newText) => {
    setText(newText);
    localStorage.setItem(STORAGE_KEY, newText);
    setIsSynced(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveToCloud(newText), 1500);
  }, [saveToCloud]);

  const signIn = useCallback(async () => {
    const u = await signInWithGoogle();
    return u;
  }, []);

  const signOut = useCallback(async () => {
    await signOutUser();
    setUser(null);
    userRef.current = null;
    setIsSynced(true);
  }, []);

  return { text, setText: updateText, isSaving, isSynced, isLoading, user, signIn, signOut };
}
