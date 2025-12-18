// components/DeleteContestButton.tsx
'use client';

type DeleteContestButtonProps = {
  contestId: number;
  action: (formData: FormData) => void | Promise<void>;
  disabled?: boolean;
};

export function DeleteContestButton({
  contestId,
  action,
  disabled,
}: DeleteContestButtonProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const ok = window.confirm(
      'Are you sure you want to delete this contest?\nThis cannot be undone.'
    );
    if (!ok) {
      e.preventDefault();
    }
  };

  return (
    <form action={action} onSubmit={handleSubmit} className="inline">
      <input type="hidden" name="contestId" value={contestId} />
      <button
        type="submit"
        disabled={disabled}
        className="text-red-400 hover:text-red-300 font-semibold text-xs"
      >
        Delete
      </button>
    </form>
  );
}