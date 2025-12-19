
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Crown, ShieldAlert, ShieldCheck } from 'lucide-react';
import { UserLevel, User as UserType } from '../types';
import { auth, db } from '../services/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';

interface AuthScreenProps {
  onAuth: (user: UserType) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ADMIN_EMAIL = 'admin@bobo.com';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      setError('الرجاء ملء جميع الحقول');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // --- عملية تسجيل الدخول ---
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // جلب بيانات المستخدم من Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (userDoc.exists()) {
          onAuth(userDoc.data() as UserType);
        } else {
          // إذا لم يوجد ملف في Firestore (حالة نادرة)
          const fallbackUser: UserType = {
            id: firebaseUser.uid,
            customId: Math.floor(10000 + Math.random() * 90000),
            name: email.split('@')[0],
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            level: UserLevel.SILVER,
            coins: 5000,
            wealth: 0, charm: 0, isVip: false, vipLevel: 0,
            bio: 'مرحباً بك مجدداً 🌹',
            stats: { likes: 0, visitors: 0, following: 0, followers: 0 },
            ownedItems: [], isFollowing: false, isMuted: false, isAdmin: email === ADMIN_EMAIL
          };
          onAuth(fallbackUser);
        }
      } else {
        // --- عملية إنشاء حساب جديد ---
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        const isAdmin = email.toLowerCase() === ADMIN_EMAIL;
        
        const newUser: UserType = {
          id: firebaseUser.uid,
          customId: isAdmin ? 1 : Math.floor(10000 + Math.random() * 90000),
          name: name,
          avatar: isAdmin 
            ? 'https://cdn-icons-png.flaticon.com/512/6024/6024190.png' 
            : `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
          level: isAdmin ? UserLevel.VIP : UserLevel.NEW,
          coins: isAdmin ? 100000000 : 1000,
          wealth: isAdmin ? 9999999 : 0,
          charm: isAdmin ? 9999999 : 0,
          isVip: isAdmin,
          vipLevel: isAdmin ? 12 : 0,
          frame: isAdmin ? 'https://cdn-icons-png.flaticon.com/512/2165/2165039.png' : '',
          nameStyle: isAdmin ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 font-black animate-pulse' : '',
          bio: isAdmin ? 'المدير العام والمؤسس 👑' : 'مستخدم جديد في صوت العرب',
          location: isAdmin ? 'المنامة، البحرين' : '',
          stats: { likes: 0, visitors: 0, following: 0, followers: 0 },
          ownedItems: [],
          isFollowing: false,
          isMuted: false,
          isAdmin: isAdmin,
          status: isAdmin ? 'owner' : 'user'
        };

        // حفظ البيانات في Firestore
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...newUser,
          createdAt: serverTimestamp()
        });

        onAuth(newUser);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') setError('المستخدم غير موجود');
      else if (err.code === 'auth/wrong-password') setError('كلمة المرور خاطئة');
      else if (err.code === 'auth/email-already-in-use') setError('البريد الإلكتروني مستخدم بالفعل');
      else if (err.code === 'auth/weak-password') setError('كلمة المرور ضعيفة جداً');
      else setError('حدث خطأ أثناء الاتصال بالقاعدة');
    } finally {
      setLoading(false);
    }
  };

  const isAdminTyping = email.toLowerCase() === ADMIN_EMAIL;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 relative overflow-hidden font-cairo">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full transition-colors duration-1000 ${isAdminTyping ? 'bg-red-500/20' : 'bg-amber-500/10'}`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full transition-colors duration-1000 ${isAdminTyping ? 'bg-yellow-500/20' : 'bg-blue-500/10'}`}></div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`w-full max-w-md bg-slate-900/60 backdrop-blur-2xl border rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative z-10 transition-all duration-500 ${isAdminTyping ? 'border-red-500/50 shadow-red-900/20' : 'border-white/10'}`}>
            
            <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 shadow-lg transition-all duration-500 ${isAdminTyping ? 'bg-gradient-to-br from-red-600 to-amber-600 shadow-red-600/40 scale-110' : 'bg-gradient-to-br from-amber-400 to-orange-600 shadow-orange-900/50'}`}>
                    {isAdminTyping ? <ShieldCheck size={40} className="text-white" /> : <Crown size={40} className="text-white" />}
                </div>
                <h1 className="text-3xl font-black text-white mb-2">صوت العرب</h1>
                <p className="text-slate-400 text-sm">أهلاً بك في عالم الدردشة الصوتية</p>
                
                {isAdminTyping && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center justify-center gap-1.5 text-red-500 font-black text-xs bg-red-500/10 py-2 rounded-xl border border-red-500/20">
                    <ShieldAlert size={14} /> تم التعرف على حساب المدير العام
                  </motion.div>
                )}
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
                {!isLogin && (
                    <div className="relative group">
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={20} />
                        <input type="text" placeholder="الاسم المستعار" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pr-12 pl-4 text-white focus:border-amber-500 outline-none transition-all shadow-inner" />
                    </div>
                )}
                <div className="relative group">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={20} />
                    <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pr-12 pl-4 text-white focus:border-amber-500 outline-none transition-all shadow-inner" />
                </div>
                <div className="relative group">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={20} />
                    <input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pr-12 pl-4 text-white focus:border-amber-500 outline-none transition-all shadow-inner" />
                </div>

                {error && <div className="text-red-400 text-xs bg-red-500/10 p-4 rounded-2xl border border-red-500/20 flex items-center gap-2 animate-shake">
                   <ShieldAlert size={16} /> {error}
                </div>}

                <button type="submit" disabled={loading} className={`w-full font-black py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg ${isAdminTyping ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-red-900/40' : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-orange-900/30'}`}>
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (isLogin ? (isAdminTyping ? 'دخول المدير' : 'تسجيل الدخول') : 'إنشاء حساب جديد')}
                </button>
            </form>

            <div className="mt-8 text-center">
                <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-slate-500 font-bold hover:text-amber-400 transition-colors text-xs">
                    {isLogin ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب بالفعل؟ تسجيل الدخول'}
                </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/5 text-center">
               <p className="text-[10px] text-slate-600 tracking-widest font-bold">صوت العرب © 2025 - النسخة الإدارية</p>
            </div>
        </motion.div>
    </div>
  );
};

export default AuthScreen;
