"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth-actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <div className="card bg-white border border-pink-100 shadow-md">
        <div className="card-body gap-4">
          <h1 className="card-title justify-center text-pink-900 text-xl">
            🧸 Admin Login
          </h1>
          <form action={formAction} className="flex flex-col gap-3">
            <label className="form-control">
              <span className="label-text text-pink-700">Username</span>
              <input
                name="username"
                type="text"
                required
                autoComplete="username"
                className="input input-bordered bg-white"
              />
            </label>
            <label className="form-control">
              <span className="label-text text-pink-700">Password</span>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="input input-bordered bg-white"
              />
            </label>
            {state?.error && (
              <p className="text-error text-sm">{state.error}</p>
            )}
            <button
              type="submit"
              className="btn btn-primary rounded-full"
              disabled={pending}
            >
              {pending ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
