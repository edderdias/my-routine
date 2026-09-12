import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { firestoreService } from '../services/firestoreService';
import { User } from '../types';
import { validatePassword } from '../utils/passwordValidator';

interface AuthResponse {
  success: boolean;
  message?: string;
  isUnverified?: boolean;
}

export interface UnverifiedUserInfo {
  uid: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  emailPendingVerification: boolean;
  unverifiedUser: UnverifiedUserInfo | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<AuthResponse>;
  register: (name: string, email: string, phone: string, password?: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  forgotPassword: (email: string) => Promise<AuthResponse>;
  resendVerificationEmail: () => Promise<AuthResponse>;
  checkEmailVerified: () => Promise<AuthResponse>;
  cancelVerificationFlow: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getFirebaseErrorMessage(error: any): string {
  const code = error?.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado no sistema. Faça login ou solicite recuperação de senha.';
    case 'auth/invalid-email':
      return 'O formato do e-mail informado é inválido.';
    case 'auth/user-not-found':
      return 'Nenhuma conta cadastrada com este e-mail.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas sem sucesso. Por segurança, aguarde alguns instantes e tente novamente.';
    case 'auth/network-request-failed':
      return 'Erro de conexão com o servidor. Verifique sua conexão com a internet.';
    case 'auth/weak-password':
      return 'A senha é fraca. Utilize letras, números e caracteres especiais.';
    default:
      return error?.message || 'Ocorreu um erro no processamento. Tente novamente.';
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [emailPendingVerification, setEmailPendingVerification] = useState(false);
  const [unverifiedUser, setUnverifiedUser] = useState<UnverifiedUserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync with Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentFirebaseUser) => {
      setFirebaseUser(currentFirebaseUser);

      if (currentFirebaseUser) {
        // Enforce email verification rule: user CANNOT access the system until email is verified
        if (!currentFirebaseUser.emailVerified) {
          setUser(null);
          setEmailPendingVerification(true);
          setUnverifiedUser({
            uid: currentFirebaseUser.uid,
            email: currentFirebaseUser.email || '',
            name: currentFirebaseUser.displayName || 'Usuário',
          });
          setLoading(false);
          return;
        }

        // User is verified! Load full profile from Firestore
        setEmailPendingVerification(false);
        setUnverifiedUser(null);

        try {
          const userDocRef = doc(db, 'users', currentFirebaseUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setUser({
              id: currentFirebaseUser.uid,
              name: data.name || currentFirebaseUser.displayName || 'Usuário',
              email: data.email || currentFirebaseUser.email || '',
              phone: data.phone || '',
              avatar: data.avatar || '',
              createdAt: data.createdAt || new Date().toISOString(),
            });
          } else {
            // Document does not exist yet (e.g. freshly verified) -> create it
            const newUser: User = {
              id: currentFirebaseUser.uid,
              name: currentFirebaseUser.displayName || 'Usuário',
              email: currentFirebaseUser.email || '',
              phone: '',
              createdAt: new Date().toISOString(),
            };
            await firestoreService.initializeUser(newUser);
            setUser(newUser);
          }
        } catch (err) {
          console.error('Error fetching Firestore user profile:', err);
          // Fallback basic user from auth
          setUser({
            id: currentFirebaseUser.uid,
            name: currentFirebaseUser.displayName || 'Usuário',
            email: currentFirebaseUser.email || '',
            phone: '',
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setUser(null);
        setEmailPendingVerification(false);
        setUnverifiedUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password = ''): Promise<AuthResponse> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Informe seu e-mail cadastrado.' };
    }
    if (!password) {
      return { success: false, message: 'Informe sua senha de acesso.' };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = userCredential.user;

      // Check if email has been verified
      if (!fbUser.emailVerified) {
        setEmailPendingVerification(true);
        setUnverifiedUser({
          uid: fbUser.uid,
          email: fbUser.email || cleanEmail,
          name: fbUser.displayName || 'Usuário',
        });
        return {
          success: false,
          isUnverified: true,
          message: 'Seu cadastro requer confirmação de e-mail antes de acessar o sistema.',
        };
      }

      return { success: true, message: 'Login realizado com sucesso!' };
    } catch (err: any) {
      return { success: false, message: getFirebaseErrorMessage(err) };
    }
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    password = ''
  ): Promise<AuthResponse> => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      return { success: false, message: 'Informe seu nome completo.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Informe um endereço de e-mail válido.' };
    }
    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 10) {
      return { success: false, message: 'Informe seu WhatsApp com DDD (mínimo 10 dígitos).' };
    }

    // Password validation rule: must have letters, numbers, and special characters
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return {
        success: false,
        message: passwordValidation.errorMessage || 'A senha não atende aos requisitos de segurança.',
      };
    }

    try {
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = userCredential.user;

      // 2. Set display name in Firebase Auth
      await updateFirebaseProfile(fbUser, {
        displayName: cleanName,
      });

      // 3. Initialize real profile & default categories in Firestore
      const newUserObj: User = {
        id: fbUser.uid,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        createdAt: new Date().toISOString(),
      };
      await firestoreService.initializeUser(newUserObj);

      // 4. Send Firebase Email Verification
      await sendEmailVerification(fbUser);

      // 5. Transition to email confirmation wait screen
      setEmailPendingVerification(true);
      setUnverifiedUser({
        uid: fbUser.uid,
        email: cleanEmail,
        name: cleanName,
      });

      return {
        success: true,
        isUnverified: true,
        message: `Cadastro realizado! Enviamos um e-mail de confirmação para ${cleanEmail}. Clique no link para ativar sua conta e acessar o sistema.`,
      };
    } catch (err: any) {
      return { success: false, message: getFirebaseErrorMessage(err) };
    }
  };

  // Resend email verification
  const resendVerificationEmail = async (): Promise<AuthResponse> => {
    if (!auth.currentUser) {
      return { success: false, message: 'Nenhuma sessão ativa para reenvio. Faça login novamente.' };
    }

    try {
      await sendEmailVerification(auth.currentUser);
      return {
        success: true,
        message: 'Novo e-mail de confirmação enviado com sucesso! Verifique sua caixa de entrada e lixeira/spam.',
      };
    } catch (err: any) {
      return { success: false, message: getFirebaseErrorMessage(err) };
    }
  };

  // Check if email has been verified after user clicked the link in their inbox
  const checkEmailVerified = async (): Promise<AuthResponse> => {
    if (!auth.currentUser) {
      return { success: false, message: 'Nenhuma sessão ativa. Faça login para verificar.' };
    }

    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        setEmailPendingVerification(false);
        setUnverifiedUser(null);

        // Fetch or create user profile in Firestore
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUser({
            id: auth.currentUser.uid,
            name: data.name || auth.currentUser.displayName || 'Usuário',
            email: data.email || auth.currentUser.email || '',
            phone: data.phone || '',
            avatar: data.avatar || '',
            createdAt: data.createdAt || new Date().toISOString(),
          });
        }

        return {
          success: true,
          message: 'E-mail confirmado com sucesso! Bem-vindo ao Minha Rotina.',
        };
      } else {
        return {
          success: false,
          message: 'O e-mail ainda não foi confirmado. Por favor, clique no link recebido em seu e-mail e tente novamente.',
        };
      }
    } catch (err: any) {
      return { success: false, message: getFirebaseErrorMessage(err) };
    }
  };

  // Cancel verification flow / sign out to enter another account
  const cancelVerificationFlow = async () => {
    await signOut(auth);
    setEmailPendingVerification(false);
    setUnverifiedUser(null);
    setUser(null);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
      setEmailPendingVerification(false);
      setUnverifiedUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);

    try {
      // Update in Firestore
      const userDoc = doc(db, 'users', user.id);
      await setDoc(userDoc, {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar || '',
      }, { merge: true });

      // If name changed, update Firebase Auth display name
      if (updates.name && auth.currentUser) {
        await updateFirebaseProfile(auth.currentUser, {
          displayName: updates.name,
        });
      }
    } catch (err) {
      console.error('Error updating Firestore user profile:', err);
    }
  };

  // Forgot password sending email reset link
  const forgotPassword = async (email: string): Promise<AuthResponse> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Informe um endereço de e-mail válido.' };
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      return {
        success: true,
        message: `Enviamos um link para o seu e-mail (${cleanEmail}) para cadastrar sua nova senha. Verifique sua caixa de entrada e pasta de spam.`,
      };
    } catch (err: any) {
      return { success: false, message: getFirebaseErrorMessage(err) };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isAuthenticated: !!user && !emailPendingVerification,
        emailPendingVerification,
        unverifiedUser,
        loading,
        login,
        register,
        logout,
        updateProfile,
        forgotPassword,
        resendVerificationEmail,
        checkEmailVerified,
        cancelVerificationFlow,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
