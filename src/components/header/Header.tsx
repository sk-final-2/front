import Link from "next/link";

const Header = () => {
  // TODO: Login session 받아오는 로직 추가

  return (
    <header className="bg-white text-black p-4 shadow-xl fixed w-full">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Logo
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/login" className="hover:text-gray-300">
                Login
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-gray-300">
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
