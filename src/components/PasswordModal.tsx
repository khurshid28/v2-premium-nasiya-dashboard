import React from "react";
import DetailModal from "components/modal/DetailModalNew";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newPassword: string) => Promise<void> | void;
};

export default function PasswordModal({ isOpen, onClose, onSave }: Props) {
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!isOpen) {
      setPassword("");
      setConfirm("");
      setError("");
      setShow(false);
    }
  }, [isOpen]);

  const submit = async () => {
    setError("");
    if (!password) {
      setError("Password cannot be empty");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    await onSave(password);
    onClose();
  };

  return (
    <DetailModal title="Change password" isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600">New password</label>
          <div className="mt-1 flex">
            <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full rounded-l-md border px-3 py-2" />
            <button type="button" onClick={() => setShow((s) => !s)} className="rounded-r-md border px-3 py-2 bg-gray-50">{show ? "Hide" : "Show"}</button>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600">Confirm password</label>
          <input type={show ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" />
        </div>
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        <div className="flex justify-end gap-2">
          <button className="rounded bg-gray-200 px-4 py-2" onClick={onClose}>Cancel</button>
          <button className="rounded bg-blue-600 px-4 py-2 text-white" onClick={submit}>Save</button>
        </div>
      </div>
    </DetailModal>
  );
}
