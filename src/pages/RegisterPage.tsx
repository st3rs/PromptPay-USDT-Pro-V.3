import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { registerSchema, RegisterInput } from "@/src/lib/validation";
import { useAuth } from "@/src/context/AuthContext";
import { useI18n } from "@/src/context/I18nContext";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/src/components/ui/Card";
import { AlertCircle, ArrowLeft } from "lucide-react";

import { Logo } from "@/src/components/Logo";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);
    try {
      await registerUser(data);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Link to="/" className="mb-8 flex items-center gap-2 text-neutral-500 hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">{t("common.back")}</span>
        </Link>
      </motion.div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center mb-2"
          >
            <Logo textSize="2xl" />
          </motion.div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">{t("auth.register_title")}</CardTitle>
            <CardDescription className="text-center">{t("auth.register_subtitle")}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <motion.form 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit(onSubmit)} 
            className="space-y-4"
          >
            {error && (
              <motion.div 
                variants={itemVariants}
                className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg flex items-center gap-2 text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                {t(error)}
              </motion.div>
            )}
            <motion.div variants={itemVariants}>
              <Input
                label={t("auth.name")}
                type="text"
                placeholder="John Doe"
                error={errors.name?.message}
                {...register("name")}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Input
                label={t("auth.email")}
                type="email"
                placeholder="name@example.com"
                error={errors.email?.message}
                {...register("email")}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Input
                label={t("auth.password")}
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Input
                label={t("auth.confirm_password")}
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Button type="submit" className="w-full" isLoading={isLoading}>
                {t("common.register")}
              </Button>
            </motion.div>
          </motion.form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-center text-neutral-500"
          >
            {t("auth.has_account")}{" "}
            <Link to="/login" className="text-black font-semibold hover:underline">
              {t("common.login")}
            </Link>
          </motion.div>
        </CardFooter>
      </Card>
    </div>
  );
}
