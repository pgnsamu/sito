// app/[section]/page.tsx

//TODO: evitare di caricare tutti gli artisti insieme ma magari caricarli man mano / prevedere una paginazione
const sectionPage = async ({ params }: { params: Promise<{ section: string }> }) => {

  return (
    <section className="min-h-screen bg-white px-6 pb-20 pt-32 text-black md:px-12 lg:px-20">
      {/* SEARCH */}
      <div className="mb-16 flex justify-center">
        <div className="group flex h-12 w-[300px] items-center gap-3 rounded-full border border-neutral-300 bg-white-100 px-5 transition-all duration-300 ease-out hover:border-neutral-400 focus-within:w-[340px] focus-within:border-neutral-900 focus-within:bg-white">
          <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
            <span className="block h-3.5 w-3.5 rounded-full border border-neutral-500 transition-colors duration-300 group-focus-within:border-neutral-900" />
            <span className="absolute bottom-0.5 right-0.5 h-2 w-px rotate-[-45deg] rounded-full bg-white-500 transition-colors duration-300 group-focus-within:bg-white-900" />
          </div>

          <input
            type="text"
            placeholder="Search Artist"
            className="w-full bg-transparent text-base font-light tracking-wide text-neutral-900 outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-5">
        ciao
      </div>
    </section>
  );
}


export default sectionPage;