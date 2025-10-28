import { Button } from "./ui/button";

export default function Paginator({
	currentPage,
	setCurrentPage,
	totalPages,
	pageLength,
}: {
	currentPage: number;
	setCurrentPage: Function;
	totalPages: number;
	pageLength: number;
}) {
	return (
		<>
			<div className="flex justify-between items-center bg-gradient-to-r from-gray-900 to-green-900/50 p-3 mt-2 rounded-lg">
				<span className="text-gray-400">
					Page {currentPage} of {totalPages} | Showing {pageLength}{" "}
					items
				</span>
				<div className="flex space-x-2">
					<Button
						disabled={currentPage === 1}
						onClick={() => setCurrentPage(currentPage - 1)}
					>
						&lt;
					</Button>
					{[...Array(totalPages)].map((_, index) => (
						<Button
							key={index + 1}
							className={`text-green-300 hover:bg-green-700 ${
								currentPage === index + 1
									? "bg-green-700 text-green-300"
									: ""
							}`}
							onClick={() => setCurrentPage(index + 1)}
						>
							{index + 1}
						</Button>
					))}
					<Button
						disabled={currentPage === totalPages}
						onClick={() => setCurrentPage(currentPage + 1)}
					>
						&gt;
					</Button>
				</div>
			</div>
		</>
	);
}
