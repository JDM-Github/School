export default function HighlightOverlay() {
    return (
        <div className="fixed inset-0 z-50 top-0 right-0">
            <div
                className="absolute top-0 right-0 h-[100%] w-[100%]
				bg-gradient-to-bl from-black via-black/50 to-transparent"
            />
        </div>
    );
}
