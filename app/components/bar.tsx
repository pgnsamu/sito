"use client";

const Navbar = () => {

  const sections: boolean = false;

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-transparent">
      <nav className="mx-auto flex items-center justify-between px-6 py-4">
        <h1 className="text-white text-xl font-semibold">Logo</h1>

        {
          sections && (
            <div className="flex gap-6 text-white">
              <a href="#">Home</a>
              <a href="#">About</a>
              <a href="#">Contact</a>
            </div>
          )
        }
        
      </nav>
    </header>
  );
}


export default Navbar

