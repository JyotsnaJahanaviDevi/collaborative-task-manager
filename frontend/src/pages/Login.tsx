import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } catch (error: any) {
      const status = error?.response?.status;
      const serverMessage = error?.response?.data?.message as string | undefined;
      const isInvalidCredentials = serverMessage?.toLowerCase().includes('invalid');
      if (status === 401 || status === 404 || isInvalidCredentials) {
        toast.error("No account found yet—let's get you signed up!");
      } else {
        toast.error(serverMessage || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated gradient blobs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-pastel-peach/40 to-pastel-rose/40 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-gradient-to-br from-pastel-mint/40 to-pastel-lavender/40 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-pastel-sky/30 to-pastel-lilac/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="elevated-card p-10 rounded-3xl">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-pastel-mint to-pastel-lavender mb-6 shadow-xl"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold mb-3">
              <span className="bg-gradient-to-r from-pastel-mint via-pastel-lavender to-pastel-sky bg-clip-text text-transparent">
                Welcome Back
              </span>
            </h1>
            <p className="text-gray-600 text-lg">Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                icon={<Mail size={20} />}
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={<Lock size={20} />}
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              className="w-full mt-2" 
              isLoading={isLoading}
            >
              Sign In
              <ArrowRight size={20} />
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-pastel-mint hover:text-pastel-sky font-semibold transition-colors underline decoration-2 underline-offset-4">
              Sign up for free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
