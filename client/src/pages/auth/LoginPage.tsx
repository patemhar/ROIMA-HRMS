import { Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import { useAuth } from "@/store";
import type { components } from "@/types/api";
import { toast } from "react-toastify";

const STAFF_ROLES = new Set(["HR", "EMPLOYEE", "MANAGER"]);

const getDefaultRoute = (role?: string | null) => {
  return "/employee";
};

type Schemas = components["schemas"];
type LoginFormValues = Schemas["LoginRequestDto"];

export const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuth((state) => state.auth.setAuth);
  const isAuthenticated = useAuth((state) => state.auth.isAuthenticated);
  const role = useAuth((state) => state.auth.role);

  const [loginState, setLoginState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message?: string;
  }>({ status: "idle" });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // mutation for auth

  const mutation = useMutation({

    mutationFn: (payload: LoginFormValues) => authService.login(payload),

    onSuccess: (response) => {
      if (!response.data) {
        setLoginState({
          status: "error",
          message: "Invalid response from server.",
        });
        return;
      }

      const token = response.data.accessToken;
      const user = response.data.userDetailResponse;

      if (token && user) {
        setAuth(token, user, user.role ?? undefined);

        setLoginState({
          status: "success",
          message: response.message ?? "Sign in successful!",
        });

        setTimeout(() => {
          navigate(getDefaultRoute(user.role ?? undefined), { replace: true });
        }, 1000);

      } else {
        setLoginState({
          status: "error",
          message:
            response.errors ?? "Invalid response from server.",
        });
      }
    },

    onError: (error) => {
      const message = error.message;

      setLoginState({
        status: "error",
        message
      });
    },
  });

  const onSubmit = handleSubmit((values) => {
    setLoginState({ status: "loading" });
    mutation.mutate(values);
  });

  if (isAuthenticated) {
    return <Navigate to={getDefaultRoute(role)} replace />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">Welcome back</h2>
        <p className="text-sm text-muted-foreground">
          Sign in with your email and password
        </p>
      </div>

      {loginState.message === "Network Error" && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm">
          <p className="font-medium">Network Error</p>
          <p className="mt-1">Unable to connect to the server.</p>
        </div>
      )}

      {loginState.status === "success" && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <p className="font-medium">{loginState.message}</p>
          <p className="mt-1 text-xs opacity-75">Redirecting to dashboard...</p>
        </div>
      )}

      {loginState.status === "loading" && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Signing in...</span>
          </div>
        </div>
      )}

      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
          <div className="flex items-center text-sm justify-start">
              Forgot password? please contact HR for further support.
          </div>
        </div>

        <Button className="w-full" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}Contact HR.
      </p>
    </div>
  );
};
