interface SocialLoginButtonProps {
  provider: 'google' | 'apple' | 'facebook';
  icon: React.ReactNode;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export function SocialLoginButton({ 
  // provider, 
  icon, 
  onClick,
  children,
  disabled 
}: SocialLoginButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-md bg-[rgba(234,234,234,0.06)] border border-[rgba(234,234,234,0.2)] text-sm text-[#EAEAEA] hover:bg-[rgba(234,234,234,0.1)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {icon}
      {children}
    </button>
  );
}