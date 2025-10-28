import { toast, ToastOptions, Id } from "react-toastify";
import { CheckCircle, XCircle, Info, LoaderCircle, HelpCircle } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

const baseStyle = {
	background: "#FFFFFF",
	color: "#1F2937",
	border: "1px solid #E5E7EB",
	borderRadius: "8px",
	padding: "12px",
	boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
};

const overlayId = "toast-loading-overlay";
const showOverlay = () => {
	if (document.getElementById(overlayId)) return;
	const overlay = document.createElement("div");
	overlay.id = overlayId;
	overlay.style.position = "fixed";
	overlay.style.top = "0";
	overlay.style.left = "0";
	overlay.style.width = "100vw";
	overlay.style.height = "100vh";
	overlay.style.background = "rgba(0, 0, 0, 0.4)";
	overlay.style.zIndex = "300";
	overlay.style.cursor = "not-allowed";
	document.body.appendChild(overlay);
};
const hideOverlay = () => {
	const overlay = document.getElementById(overlayId);
	if (overlay) overlay.remove();
};

export const showToast = (
	message: string,
	type: "success" | "error" | "info" | "loading" = "success",
	timeout: number = 2000
): Id => {
	if (type === "loading") showOverlay();
	else hideOverlay();

	const icon =
		type === "success" ? (
			<CheckCircle className="text-green-600" size={20} />
		) : type === "error" ? (
			<XCircle className="text-red-600" size={20} />
		) : type === "loading" ? (
			<LoaderCircle className="text-yellow-500 animate-spin" size={20} />
		) : (
			<Info className="text-blue-600" size={20} />
		);

	const toastOptions: ToastOptions = {
		position: "top-right",
		autoClose: type === "loading" ? false : timeout,
		hideProgressBar: true,
		closeOnClick: true,
		pauseOnHover: true,
		draggable: true,
		theme: "light",
		style: {
			...baseStyle,
			borderLeft:
				type === "success"
					? "4px solid #22C55E"
					: type === "error"
						? "4px solid #EF4444"
						: type === "info"
							? "4px solid #3B82F6"
							: "4px solid #FACC15",
		},
		onClose: () => {
			if (type === "loading") hideOverlay();
		},
	};

	return toast(
		<div className="flex items-center gap-2">
			{icon}
			<span>{message}</span>
		</div>,
		toastOptions
	);
};

export const removeToast = (id: Id) => {
	hideOverlay();
	toast.dismiss(id);
};

export const confirmToast = (
	message: string,
	onConfirm: () => void,
	onCancel?: () => void
): Id => {
	let confirmed = false;
	showOverlay();
	const toastId = toast(
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-2">
				<HelpCircle className="text-yellow-500" size={20} />
				<span>{message}</span>
			</div>

			<div className="flex justify-end gap-2">
				<button
					onClick={() => {
						toast.dismiss(toastId);
						hideOverlay(); 
					}}
					className="px-3 py-1 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
				>
					Cancel
				</button>

				<button
					onClick={() => {
						confirmed = true;
						toast.dismiss(toastId);
						hideOverlay(); 
						onConfirm();
					}}
					className="px-3 py-1 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
				>
					Confirm
				</button>
			</div>
		</div>,
		{
			position: "top-right",
			autoClose: false,
			closeOnClick: false,
			draggable: false,
			hideProgressBar: true,
			theme: "light",
			onClose: () => {
				hideOverlay();
				if (!confirmed) onCancel?.();
			},
			style: {
				...baseStyle,
				borderLeft: "4px solid #FACC15",
				zIndex: 400, 
			},
		}
	);

	return toastId;
};