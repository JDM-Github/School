import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { removeToast, showToast } from "../toast";

export default function EditAdviserModal({ adviser, onSuccess }: any) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        firstName: adviser.account.firstName || "",
        middleName: adviser.account.middleName || "",
        lastName: adviser.account.lastName || "",
        suffix: adviser.account.suffix || "",
        age: adviser.account.age || "",
        sex: adviser.account.sex || "",
        email: adviser.account.email || "",
    });
    const [loading, setLoading] = useState(false);

    const updateAdviser = async () => {
        const toastId = showToast("Updating adviser...", "loading");
        setLoading(true);
        try {
            const res = await RequestHandler.fetchData("POST", "adviser/update-adviser", {
                adviserId: adviser.adviser_id,
                ...form
            });
            removeToast(toastId);
            if (res.success) {
                showToast("Adviser updated successfully", "success");
                setOpen(false);
                onSuccess();
            } else showToast(res.message || "Error updating adviser", "error");
        } catch (err) {
            removeToast(toastId);
            showToast("Error updating adviser", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="mr-3">Edit</Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Adviser</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-2 mt-2">
                        {Object.keys(form).map((key) => (
                            <Input
                                key={key}
                                type={key === "age" ? "number" : "text"}
                                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                placeholder={key}
                            />
                        ))}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="destructive" onClick={() => setOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button onClick={updateAdviser} disabled={loading}>
                            {loading ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
