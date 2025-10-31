import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { removeToast, showToast } from "../toast";

export default function ChangePasswordModal({ adviser, onSuccess }: any) {
    const [open, setOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const updatePassword = async () => {
        if (!newPassword.trim()) return showToast("Password cannot be empty", "error");
        if (newPassword !== confirmPassword) return showToast("Passwords do not match", "error");

        const toastId = showToast("Updating password...", "loading");
        setLoading(true);
        try {
            const res = await RequestHandler.fetchData("POST", "adviser/update-adviser-password-admin", {
                adviserId: adviser.adviser_id,
                newPassword
            });

            removeToast(toastId);
            if (res.success) {
                showToast("Password updated successfully", "success");
                setOpen(false);
                setNewPassword("");
                setConfirmPassword("");
                onSuccess();
            } else showToast(res.message || "Error updating password", "error");
        } catch (err) {
            removeToast(toastId);
            showToast("Error updating password", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button size="sm" onClick={() => setOpen(true)} className="bg-green-500 hover:bg-green-600">
                Change Password
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Change Adviser Password</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-2 mt-2">
                        <Input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <Input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="destructive" onClick={() => setOpen(false)} disabled={loading}>
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
}
