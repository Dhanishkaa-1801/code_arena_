// app/login/google-sign-in-button.tsx
'use client';

import { useFormStatus } from 'react-dom';

export function GoogleSignInButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-[#DB4437] hover:bg-[#C33D2E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-[#DB4437] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        'Redirecting...'
      ) : (
        <>
          <svg className="w-5 h-5 mr-3" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8 0 120.3 109.8 11.8 244 11.8c70.3 0 129.8 28.7 173.4 71.9l-67.4 62c-23.7-22.5-54.8-36.3-91-36.3-70.3 0-128.3 57.5-128.3 128.3s58 128.3 128.3 128.3c76.3 0 103.8-54.8 108.8-82.5H244V261.8h244z"></path>
          </svg>
          Sign in with Google
        </>
      )}
    </button>
  );
}