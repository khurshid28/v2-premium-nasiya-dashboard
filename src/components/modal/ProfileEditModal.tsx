import React from "react";
import DetailModal from "components/modal/DetailModalNew";
import PhoneInput from "components/PhoneInput";
import CustomFileInput from "components/input/CustomFileInput";
import { useUser, UserData } from "contexts/UserContext";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ProfileEditModal({ isOpen, onClose }: Props) {
  const { user, setUser } = useUser();
  const [form, setForm] = React.useState<Partial<UserData>>({});
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      // Initialize form from user data and format phone for editing
      const getTail9 = (v: string) => {
        const d = String(v ?? "").replace(/\D/g, "");
        return d ? (d.length > 9 ? d.slice(-9) : d) : "";
      };
      
      setForm({
        ...user,
        phone: getTail9(user.phone),
      });
    }
  }, [user]);

  const update = (key: string, value: any) => setForm((s: any) => ({ ...s, [key]: value }));

  const onFile = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files && ev.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => update("image", reader.result as string);
    reader.readAsDataURL(f);
  };

  const submit = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const payload = { ...form } as UserData;
      
      // Format phone back to full format
      if (payload.phone) {
        const p = String(payload.phone).replace(/\D/g, "").slice(-9);
        payload.phone = p ? `+998${p}` : user.phone;
      } else {
        payload.phone = user.phone;
      }

      // In a real app, you would make an API call here
      // await api.updateUserProfile(payload);
      
      // For demo, just update the context
      setUser(payload);
      onClose();
    } catch (error) {
      console.error("Failed to update profile:", error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DetailModal 
      title="Edit Profile" 
      isOpen={isOpen} 
      onClose={onClose}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full name</label>
          <input 
            value={form.fullname ?? ""} 
            onChange={(e) => update("fullname", e.target.value)} 
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" 
            placeholder="Enter your full name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <div className="mt-1">
            <PhoneInput 
              value={form.phone ?? ""} 
              onChange={(v) => update("phone", v)} 
              placeholder="901234567" 
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Profile Image</label>
          <div className="mt-1">
            <CustomFileInput
              onChange={onFile}
              accept="image/*"
              value={form.image}
              placeholder="Choose profile image"
            />
          </div>
          {form.image && (
            <div className="mt-2">
              <img 
                src={form.image} 
                alt="Preview" 
                className="h-20 w-20 rounded-full object-cover border-2 border-gray-300"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </DetailModal>
  );
}