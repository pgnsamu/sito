import insertData from "@/components/insert";


const InsertGenre = async () => {
  
  
  return (
		<div className="relative flex h-screen w-full items-center justify-center">
			<h1 className="px-4">Genres</h1>

			<button onClick={insertData} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded px-4 py-2">
				Insert Genre
			</button>
		</div>
  );
}

export default InsertGenre;

