"use client";

import { LockSimple } from "@phosphor-icons/react/ssr";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { FormMessage, rateLimitMinutes } from "@/components/auth/FormFeedback";
import { FormField, isMissing } from "@/components/auth/FormField";
import {
  currentPasswordFormField,
  newPasswordFormField,
} from "@/components/auth/form-schemas";
import { authCopy } from "@/data/copy";
import { postAuth } from "@/lib/auth-api";
import { accountDataLink, forgotPasswordLink } from "@/lib/links";

const copy = authCopy.account.password;

// "Repetir a senha" é só da tela: o servidor recebe a senha atual e a nova.
const changePasswordFormSchema = z
  .object({
    currentPassword: currentPasswordFormField,
    newPassword: newPasswordFormField,
    confirmPassword: z.string().min(1, authCopy.confirmPasswordRequired),
  })
  .refine(
    ({ newPassword, confirmPassword }) => newPassword === confirmPassword,
    { message: authCopy.passwordsDontMatch, path: ["confirmPassword"] },
  );

type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

export function ChangePasswordForm() {
  const [done, setDone] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
  });
  const values = useWatch({ control });

  async function submit({
    currentPassword,
    newPassword,
  }: ChangePasswordFormValues) {
    setErrorText(null);
    const result = await postAuth("change-password", {
      currentPassword,
      newPassword,
    });
    if (result.ok) return setDone(true);

    if (result.code === "INVALID_CURRENT_PASSWORD") {
      return setError("currentPassword", { message: copy.invalidCurrent });
    }
    if (result.code === "PASSWORD_BREACHED") {
      return setError("newPassword", { message: authCopy.passwordBreached });
    }
    setErrorText(
      result.code === "PASSWORD_NOT_SET"
        ? copy.notSet
        : result.status === 429
          ? authCopy.rateLimited(rateLimitMinutes(result.retryAfterSeconds))
          : authCopy.genericError,
    );
  }

  if (done) {
    return (
      <div role="status" className="flex flex-col items-start gap-4">
        <div>
          <h2 className="text-lg font-bold">{copy.doneTitle}</h2>
          <p className="mt-1 text-ink-soft">{copy.doneText}</p>
        </div>
        <Link
          href={accountDataLink}
          className="button button-outline-ink rounded-[999px]"
        >
          {copy.backToData}
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      className="flex max-w-md flex-col gap-5"
    >
      {errorText && <FormMessage>{errorText}</FormMessage>}

      <div className="flex flex-col gap-2">
        <FormField
          label={copy.currentLabel}
          type="password"
          autoComplete="current-password"
          icon={LockSimple}
          placeholder={copy.currentPlaceholder}
          registration={register("currentPassword")}
          error={errors.currentPassword?.message}
          missing={isMissing(errors.currentPassword, values.currentPassword)}
        />
        <Link
          href={forgotPasswordLink}
          className="self-end text-sm text-ink-soft transition-colors duration-150 hover:text-ink"
        >
          {copy.forgotCurrent}
        </Link>
      </div>
      <FormField
        label={copy.newLabel}
        type="password"
        autoComplete="new-password"
        icon={LockSimple}
        placeholder={authCopy.newPasswordPlaceholder}
        registration={register("newPassword")}
        error={errors.newPassword?.message}
        missing={isMissing(errors.newPassword, values.newPassword)}
      />
      <FormField
        label={authCopy.confirmPasswordLabel}
        type="password"
        autoComplete="new-password"
        icon={LockSimple}
        placeholder={authCopy.confirmPasswordPlaceholder}
        registration={register("confirmPassword")}
        error={errors.confirmPassword?.message}
        missing={isMissing(errors.confirmPassword, values.confirmPassword)}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="button button-accent mt-1 w-full cursor-pointer rounded-[999px] disabled:cursor-wait disabled:opacity-70"
      >
        {isSubmitting ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}
