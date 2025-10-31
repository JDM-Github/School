import { useState } from "react";
import { Key } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { removeToast, showToast } from "../toast";

const AdviserPasswordManager = ({ role, user }: { role: string; user: any }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const resetFields = () => {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    const updatePassword = async () => {
        if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            showToast("All password fields are required.", "error");
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast("New passwords do not match.", "error");
            return;
        }
        if (newPassword.length < 6) {
            showToast("Password must be at least 6 characters.", "error");
            return;
        }

        const toastId = showToast("Updating password...", "loading");
        setLoading(true);

        try {
            const res = await RequestHandler.fetchData(
                "POST",
                "adviser/update-adviser-password",
                {
                    adviserId: user.id,
                    oldPassword,
                    newPassword,
                }
            );

            removeToast(toastId);

            if (res.success) {
                showToast("Password updated successfully.", "success");
                setIsModalOpen(false);
                resetFields();
            } else {
                showToast(res.message || "Error updating password.", "error");
            }
        } catch (err: unknown) {
            console.error(err);
            removeToast(toastId);
            showToast("Error updating password.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {role === "teacher" && (
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-2 bg-green-500 rounded-lg cursor-pointer hover:bg-green-300 transition"
                >
                    <Key size={20} />
                </button>
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-3 mt-2">
                        <label className="text-sm font-medium text-gray-700">Old Password</label>
                        <Input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder="Enter old password"
                        />

                        <label className="text-sm font-medium text-gray-700">New Password</label>
                        <Input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                        />

                        <label className="text-sm font-medium text-gray-700">
                            Confirm New Password
                        </label>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setIsModalOpen(false);
                                resetFields();
                            }}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button onClick={updatePassword} disabled={loading} variant="outline">
                            {loading ? "Updating..." : "Save"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AdviserPasswordManager;
