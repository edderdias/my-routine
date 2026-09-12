import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Category, NotificationLog, Task, User, UserSettings } from '../types';
import { DEFAULT_CATEGORIES, createDefaultSettings } from './storage';

// Helper to remove undefined fields because Firestore throws on undefined
function cleanForFirestore<T extends Record<string, any>>(obj: T): T {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      cleaned[key] = cleanForFirestore(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned as T;
}

export const firestoreService = {
  // Initialize user profile, default categories, and settings in Firestore if not present
  async initializeUser(user: User): Promise<void> {
    if (!user.id) return;

    try {
      const userDocRef = doc(db, 'users', user.id);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        const defaultSettings = createDefaultSettings(user);
        await setDoc(userDocRef, cleanForFirestore({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar || '',
          createdAt: user.createdAt || new Date().toISOString(),
          settings: defaultSettings,
        }));

        // Initialize default categories for this user in subcollection
        const catColRef = collection(db, 'users', user.id, 'categories');
        for (const cat of DEFAULT_CATEGORIES) {
          await setDoc(doc(catColRef, cat.id), cleanForFirestore({
            ...cat,
            userId: user.id,
          }));
        }
      }
    } catch (err) {
      console.error('Error initializing user in Firestore:', err);
    }
  },

  // Real-time listener for tasks
  subscribeTasks(userId: string, onUpdate: (tasks: Task[]) => void): Unsubscribe {
    if (!userId) {
      onUpdate([]);
      return () => {};
    }

    const tasksCol = collection(db, 'users', userId, 'tasks');
    return onSnapshot(
      tasksCol,
      (snapshot) => {
        const tasks: Task[] = snapshot.docs.map((docSnap) => docSnap.data() as Task);
        onUpdate(tasks);
      },
      (error) => {
        console.error('Firestore tasks subscribe error:', error);
      }
    );
  },

  // Real-time listener for categories
  subscribeCategories(userId: string, onUpdate: (categories: Category[]) => void): Unsubscribe {
    if (!userId) {
      onUpdate([]);
      return () => {};
    }

    const catsCol = collection(db, 'users', userId, 'categories');
    return onSnapshot(
      catsCol,
      (snapshot) => {
        if (snapshot.empty) {
          // If no categories in Firestore, we can return DEFAULT_CATEGORIES
          onUpdate(DEFAULT_CATEGORIES);
        } else {
          const categories: Category[] = snapshot.docs.map((docSnap) => docSnap.data() as Category);
          onUpdate(categories);
        }
      },
      (error) => {
        console.error('Firestore categories subscribe error:', error);
      }
    );
  },

  // Real-time listener for notification logs
  subscribeLogs(userId: string, onUpdate: (logs: NotificationLog[]) => void): Unsubscribe {
    if (!userId) {
      onUpdate([]);
      return () => {};
    }

    const logsCol = collection(db, 'users', userId, 'logs');
    return onSnapshot(
      logsCol,
      (snapshot) => {
        const logs: NotificationLog[] = snapshot.docs
          .map((docSnap) => docSnap.data() as NotificationLog)
          .sort((a, b) => new Date(b.sentTime).getTime() - new Date(a.sentTime).getTime());
        onUpdate(logs);
      },
      (error) => {
        console.error('Firestore logs subscribe error:', error);
      }
    );
  },

  // Real-time listener for settings & user profile
  subscribeSettings(userId: string, onUpdate: (settings: UserSettings) => void): Unsubscribe {
    if (!userId) {
      return () => {};
    }

    const userDoc = doc(db, 'users', userId);
    return onSnapshot(
      userDoc,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data?.settings) {
            onUpdate(data.settings as UserSettings);
          }
        }
      },
      (error) => {
        console.error('Firestore settings subscribe error:', error);
      }
    );
  },

  // Save task
  async saveTask(userId: string, task: Task): Promise<void> {
    const taskDoc = doc(db, 'users', userId, 'tasks', task.id);
    await setDoc(taskDoc, cleanForFirestore(task));
  },

  // Update task
  async updateTask(userId: string, taskId: string, updates: Partial<Task>): Promise<void> {
    const taskDoc = doc(db, 'users', userId, 'tasks', taskId);
    await updateDoc(taskDoc, cleanForFirestore(updates));
  },

  // Delete task
  async deleteTask(userId: string, taskId: string): Promise<void> {
    const taskDoc = doc(db, 'users', userId, 'tasks', taskId);
    await deleteDoc(taskDoc);
  },

  // Save or update category
  async saveCategory(userId: string, category: Category): Promise<void> {
    const catDoc = doc(db, 'users', userId, 'categories', category.id);
    await setDoc(catDoc, cleanForFirestore(category));
  },

  // Delete category
  async deleteCategory(userId: string, categoryId: string): Promise<void> {
    const catDoc = doc(db, 'users', userId, 'categories', categoryId);
    await deleteDoc(catDoc);
  },

  // Save log
  async saveLog(userId: string, log: NotificationLog): Promise<void> {
    const logDoc = doc(db, 'users', userId, 'logs', log.id);
    await setDoc(logDoc, cleanForFirestore(log));
  },

  // Save settings
  async saveSettings(userId: string, settings: UserSettings): Promise<void> {
    const userDoc = doc(db, 'users', userId);
    await updateDoc(userDoc, {
      settings: cleanForFirestore(settings),
    });
  },
};
